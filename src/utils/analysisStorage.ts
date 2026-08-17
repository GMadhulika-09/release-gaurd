export interface StoredAnalysis {
  releaseName: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  findingsCount: number;
  recommendedTestsCount: number;
  releaseDecision: string;
  timestamp: string;
}

const ANALYSIS_STORAGE_KEY = "releaseAnalyses";

export function saveAnalysis(analysis: Omit<StoredAnalysis, "timestamp">) {
  try {
    const analyses = getStoredAnalyses();
    // Remove existing entry for same release name
    const filtered = analyses.filter(a => a.releaseName !== analysis.releaseName);
    filtered.unshift({
      ...analysis,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to save analysis:", error);
    return false;
  }
}

export function getStoredAnalyses(): StoredAnalysis[] {
  try {
    const stored = localStorage.getItem(ANALYSIS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load analyses:", error);
    return [];
  }
}

export function getAnalysisByReleaseName(releaseName: string): StoredAnalysis | null {
  const analyses = getStoredAnalyses();
  return analyses.find(a => a.releaseName === releaseName) || null;
}

export function clearStoredAnalyses() {
  try {
    localStorage.removeItem(ANALYSIS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear analyses:", error);
    return false;
  }
}