export interface RiskComponents {
  businessImpact: number; // 0-100
  reachability: number; // 0-100
  changeComplexity: number; // 0-100
  testCoverage: number; // 0-100 (inverse - higher means better coverage, lower risk)
  componentSensitivity: number; // 0-100
}

export interface RiskScoreResult {
  overall: number;
  components: RiskComponents;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  explanation: string;
}

// High-impact keywords for component sensitivity
const HIGH_IMPACT_KEYWORDS = [
  "payment",
  "checkout",
  "authentication",
  "auth",
  "security",
  "admin",
  "database",
  "migration",
  "user",
  "permissions",
  "billing",
  "invoice",
  "credit",
  "card",
  "token",
  "session",
  "credential",
  "password",
  "permission",
  "role",
  "privilege",
];

// Core files that increase reachability
const CORE_FILE_PATTERNS = [
  /service/i,
  /api/i,
  /controller/i,
  /handler/i,
  /gateway/i,
  /middleware/i,
  /router/i,
  /route/i,
  /store/i,
  /repository/i,
  /manager/i,
  /core/i,
  /lib/i,
  /util/i,
  /config/i,
  /settings/i,
  /main/i,
  /app/i,
  /index/i,
  /server/i,
  /client/i,
];

export function calculateRiskScore(params: {
  changedFiles: string[];
  addedFiles: string[];
  deletedFiles: string[];
  modifiedFiles: string[];
  totalLinesChanged?: number;
  hasTestFiles: boolean;
  testFileCount: number;
  codeFileCount: number;
  previousRiskScore?: number;
}): RiskScoreResult {
  const {
    changedFiles,
    addedFiles,
    deletedFiles,
    modifiedFiles,
    totalLinesChanged = 0,
    hasTestFiles,
    testFileCount,
    codeFileCount,
    previousRiskScore = 50,
  } = params;

  // 1. Business Impact (30% weight)
  // Based on sensitivity of changed files and previous risk
  const sensitivityScores = changedFiles.map(file => getComponentSensitivity(file));
  const maxSensitivity = Math.max(...sensitivityScores, 0);
  const avgSensitivity = sensitivityScores.reduce((a, b) => a + b, 0) / Math.max(sensitivityScores.length, 1);
  
  // Business impact combines sensitivity with previous risk
  const businessImpact = Math.round(
    (maxSensitivity * 0.6 + avgSensitivity * 0.2 + previousRiskScore * 0.2)
  );
  const clampedBusinessImpact = Math.max(0, Math.min(100, businessImpact));

  // 2. Reachability (25% weight)
  // Based on how many core files are changed and how files relate
  const coreFilesChanged = changedFiles.filter(file => isCoreFile(file)).length;
  const coreFileRatio = coreFilesChanged / Math.max(changedFiles.length, 1);
  
  // Files that are referenced by others (heuristic: files with common import names)
  const reachabilityBase = Math.round(coreFileRatio * 80);
  const reachabilityBonus = changedFiles.length > 5 ? 10 : 0;
  const reachability = Math.min(100, reachabilityBase + reachabilityBonus);
  const clampedReachability = Math.max(0, Math.min(100, reachability));

  // 3. Change Complexity (20% weight)
  // Based on number of files, lines, and types of changes
  const fileCountScore = Math.min(50, changedFiles.length * 5);
  const lineScore = Math.min(30, (totalLinesChanged || 0) / 10);
  const changeTypeScore = (addedFiles.length > 0 ? 10 : 0) + 
                          (deletedFiles.length > 0 ? 10 : 0) + 
                          (modifiedFiles.length > 0 ? 5 : 0);
  const complexity = Math.min(100, fileCountScore + lineScore + changeTypeScore);
  const clampedComplexity = Math.max(0, Math.min(100, complexity));

  // 4. Test Coverage (15% weight) - inverse
  // More test files = lower risk
  const testRatio = testFileCount / Math.max(codeFileCount, 1);
  let testCoverageScore: number;
  if (testRatio >= 0.5) {
    testCoverageScore = 20; // Good coverage
  } else if (testRatio >= 0.25) {
    testCoverageScore = 40; // Moderate coverage
  } else if (testRatio >= 0.1) {
    testCoverageScore = 60; // Low coverage
  } else if (testFileCount > 0) {
    testCoverageScore = 75; // Very low coverage
  } else {
    testCoverageScore = 85; // No test files
  }
  
  // Adjust based on sensitivity - high sensitivity needs more tests
  const sensitivityMultiplier = maxSensitivity > 70 ? 1.3 : maxSensitivity > 40 ? 1.1 : 1.0;
  const testCoverage = Math.min(100, testCoverageScore * sensitivityMultiplier);
  const clampedTestCoverage = Math.max(0, Math.min(100, testCoverage));

  // 5. Component Sensitivity (10% weight)
  const componentSensitivity = Math.round(
    maxSensitivity * 0.7 + avgSensitivity * 0.3
  );
  const clampedComponentSensitivity = Math.max(0, Math.min(100, componentSensitivity));

  // Calculate overall weighted score
  const overall = Math.round(
    clampedBusinessImpact * 0.30 +
    clampedReachability * 0.25 +
    clampedComplexity * 0.20 +
    clampedTestCoverage * 0.15 +
    clampedComponentSensitivity * 0.10
  );

  // Determine risk level
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  if (overall >= 81) riskLevel = "CRITICAL";
  else if (overall >= 61) riskLevel = "HIGH";
  else if (overall >= 31) riskLevel = "MEDIUM";
  else riskLevel = "LOW";

  // Generate explanation
  const explanation = generateExplanation({
    overall,
    riskLevel,
    businessImpact: clampedBusinessImpact,
    reachability: clampedReachability,
    complexity: clampedComplexity,
    testCoverage: clampedTestCoverage,
    componentSensitivity: clampedComponentSensitivity,
    changedFiles,
    hasTestFiles,
    testFileCount,
  });

  return {
    overall,
    components: {
      businessImpact: clampedBusinessImpact,
      reachability: clampedReachability,
      changeComplexity: clampedComplexity,
      testCoverage: clampedTestCoverage,
      componentSensitivity: clampedComponentSensitivity,
    },
    riskLevel,
    explanation,
  };
}

function getComponentSensitivity(filePath: string): number {
  const lowerPath = filePath.toLowerCase();
  let score = 20; // Base sensitivity
  
  // Check for high-impact keywords
  for (const keyword of HIGH_IMPACT_KEYWORDS) {
    if (lowerPath.includes(keyword)) {
      score = Math.max(score, 85);
      break;
    }
  }
  
  // Check for core file patterns
  for (const pattern of CORE_FILE_PATTERNS) {
    if (pattern.test(lowerPath)) {
      score = Math.max(score, 60);
      break;
    }
  }
  
  // Check for test files (lower sensitivity)
  if (/test|spec|__tests__/.test(lowerPath)) {
    score = Math.min(score, 30);
  }
  
  // Check for config files (medium sensitivity)
  if (/config|settings|env|\.ya?ml|\.json/.test(lowerPath)) {
    score = Math.max(score, 50);
  }
  
  return score;
}

function isCoreFile(filePath: string): boolean {
  const lowerPath = filePath.toLowerCase();
  return CORE_FILE_PATTERNS.some(pattern => pattern.test(lowerPath));
}

function generateExplanation(params: {
  overall: number;
  riskLevel: string;
  businessImpact: number;
  reachability: number;
  complexity: number;
  testCoverage: number;
  componentSensitivity: number;
  changedFiles: string[];
  hasTestFiles: boolean;
  testFileCount: number;
}): string {
  const {
    overall,
    riskLevel,
    businessImpact,
    reachability,
    complexity,
    testCoverage,
    componentSensitivity,
    changedFiles,
    hasTestFiles,
    testFileCount,
  } = params;

  const parts: string[] = [];
  
  // Business impact explanation
  if (businessImpact > 70) {
    parts.push("High business impact detected due to sensitive component changes.");
  } else if (businessImpact > 40) {
    parts.push("Moderate business impact from changed components.");
  } else {
    parts.push("Low business impact - changes are in less sensitive areas.");
  }
  
  // Reachability explanation
  if (reachability > 70) {
    parts.push("High reachability - changes affect core/system files.");
  } else if (reachability > 40) {
    parts.push("Moderate reachability - changes affect some interconnected files.");
  } else {
    parts.push("Low reachability - changes are relatively isolated.");
  }
  
  // Complexity explanation
  if (complexity > 70) {
    parts.push("High change complexity with many files/lines affected.");
  } else if (complexity > 40) {
    parts.push("Moderate change complexity.");
  } else {
    parts.push("Low change complexity - small, focused changes.");
  }
  
  // Test coverage explanation
  if (testCoverage > 70) {
    parts.push("Limited test coverage increases risk.");
  } else if (testCoverage > 40) {
    parts.push("Some test coverage exists but may be insufficient.");
  } else {
    parts.push("Adequate test coverage helps mitigate risk.");
  }
  
  // Component sensitivity explanation
  if (componentSensitivity > 70) {
    parts.push("High component sensitivity - changes affect critical functionality.");
  } else if (componentSensitivity > 40) {
    parts.push("Moderate component sensitivity.");
  } else {
    parts.push("Low component sensitivity - changes are in less critical areas.");
  }
  
  // Noise-aware principle
  parts.push("Release Guard prioritizes potential production impact instead of simply counting findings.");
  
  return parts.join(" ");
}

export function getRiskColor(score: number): string {
  if (score <= 30) return "text-success";
  if (score <= 70) return "text-warning";
  if (score <= 85) return "text-destructive";
  return "text-destructive";
}

export function getRiskBadgeVariant(score: number): "default" | "secondary" | "destructive" {
  if (score <= 30) return "default";
  if (score <= 70) return "secondary";
  return "destructive";
}

export function getRiskLevel(score: number): string {
  if (score <= 30) return "LOW";
  if (score <= 70) return "MEDIUM";
  if (score <= 85) return "HIGH";
  return "CRITICAL";
}

export function getReleaseDecision(score: number): string {
  if (score <= 30) return "SAFE TO RELEASE";
  if (score <= 70) return "REVIEW RECOMMENDED";
  if (score <= 85) return "REVIEW REQUIRED";
  return "HIGH RISK — RELEASE BLOCKED";
}