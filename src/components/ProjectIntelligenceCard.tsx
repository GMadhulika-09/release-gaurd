import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProjectIntelligenceCardProps {
  items: {
    score: number;
    label: string;
    color: string;
    icon: React.ElementType;
  }[];
}

const ProjectIntelligenceCard = ({ items }: ProjectIntelligenceCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Project Intelligence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 text-xs rounded ${item.color} border`}>
                  <Icon className="h-4 w-4" />
                  <span className="ml-1">{item.label}</span>
                </span>
              </div>
              <Progress value={item.score} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ProjectIntelligenceCard;