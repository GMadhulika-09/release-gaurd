import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { ChevronDown, Code } from "lucide-react";
import { DemoScenario } from "@/data/demoScenarios";

interface CodeInputCardProps {
  language: string;
  code: string;
  selectedScenario: DemoScenario;
  scenarios: DemoScenario[];
  onLanguageChange: (language: string) => void;
  onCodeChange: (code: string) => void;
  onScenarioSelect: (scenario: DemoScenario) => void;
  onAnalyze: () => void;
  onReset: () => void;
  isAnalyzing: boolean;
}

const CodeInputCard = ({
  language,
  code,
  selectedScenario,
  scenarios,
  onLanguageChange,
  onCodeChange,
  onScenarioSelect,
  onAnalyze,
  onReset,
  isAnalyzing,
}: CodeInputCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Code className="h-4 w-4" />
          <h3>Analyze Code Change</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            Programming Language
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
          </Label>
          <Select value={language} onValueChange={onLanguageChange} className="w-full">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="Java">Java</SelectItem>
              <SelectItem value="JavaScript">JavaScript</SelectItem>
              <SelectItem value="TypeScript">TypeScript</SelectItem>
              <SelectItem value="C++">C++</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="Go">Go</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center space-x-2">Demo Scenarios</Label>
          <div className="flex flex-wrap gap-2">
            {scenarios.map((scenario) => (
              <Button
                key={scenario.id}
                variant={selectedScenario.id === scenario.id? "default" : "outline"}
                onClick={() => onScenarioSelect(scenario)}
                className="text-sm px-3 py-1.5"
              >
                {scenario.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center space-x-2">Code / Diff</Label>
          <Textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder="Paste your code change or diff here..."
            className="min-h-[200px]"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onReset} disabled={isAnalyzing}>
          Reset to Demo
        </Button>
        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing ||!code.trim()}
        >
          {isAnalyzing? "Analyzing..." : "Analyze Release"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CodeInputCard;