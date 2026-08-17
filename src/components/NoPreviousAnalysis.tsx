import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const NoPreviousAnalysis = () => {
  return (
    <Card className="border-muted bg-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <span>Previous Analysis Context</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          No previous analysis available.
        </p>
      </CardContent>
    </Card>
  );
};

export default NoPreviousAnalysis;