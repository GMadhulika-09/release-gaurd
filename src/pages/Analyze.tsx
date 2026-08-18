import { CardFooter } from "@/components/ui/card"; // Add missing import

  // Fix RiskComponents structure
  const riskBreakdown: RiskComponents = {
    businessImpact: result.riskBreakdown.impact,
    reachability: result.riskBreakdown.reachability,
    changeComplexity: result.riskBreakdown.complexity,
    testCoverage: result.riskBreakdown.testCoverage,
    componentSensitivity: result.riskBreakdown.sensitivity
  };

  // Use existing fields instead of explanation
  const riskExplanation = `Risk level: ${result.riskLevel} (${result.riskScore}/100)`;