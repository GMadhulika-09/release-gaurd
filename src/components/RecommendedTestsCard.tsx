"use client";

import type { RecommendedTest } from "@/data/demoScenarios";

interface RecommendedTestsCardProps {
  tests: RecommendedTest[];
}

const RecommendedTestsCard = ({ tests }: RecommendedTestsCardProps) => {
  return (
    <div className="space-y-4">
      {tests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recommended tests found.</p>
      ) : (
        <div className="space-y-2">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium">{test.type}</span>
              <span className="text-sm text-muted-foreground">{test.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedTestsCard;