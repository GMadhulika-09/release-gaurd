import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { RecommendedTest } from "@/data/demoScenarios";

interface RecommendedTestsCardProps {
  tests: RecommendedTest[];
}

const RecommendedTestsCard = ({ tests }: RecommendedTestsCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <h3>Recommended Tests</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tests.map((test) => (
          <div key={test.type} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium">{test.type}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{test.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecommendedTestsCard;