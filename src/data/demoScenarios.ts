export interface Finding {
    id: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    file: string;
    problem: string;
    whyItMatters: string;
    potentialImpact: string;
  }

  export interface RecommendedTest {
    type: string;
    description: string;
  }

  export interface TestCoverageData {
    status: "GOOD" | "PARTIAL";
    changedComponents: number;
    relevantTests: number;
    componentsWithTests: number;
    componentsWithoutTests: number;
    gaps: {
      component: string;
      severity: "LOW" | "MEDIUM" | "HIGH";
      missing: string;
      why: string;
      suggestedTestType: string;
    }[];
  }