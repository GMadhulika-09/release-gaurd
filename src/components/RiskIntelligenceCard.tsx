import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RiskIntelligenceCardProps {
  items: {
    score: number;
    label: string;
  }[];
}

const RiskIntelligenceCard = ({ items }: RiskIntelligenceCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Risk Intelligence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => {
          return (
            <div key={index} className="space-y-2">
              <Progress value={item.score} className="h-2" />
              <span className="text-sm">{item.label}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RiskIntelligenceCard;