import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, BarChart3, Zap, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Release Guard</h1>
        <p className="text-muted-foreground mt-2">AI-Powered Release Risk Intelligence</p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground">Releases Analyzed</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">0</p>
          </CardContent>
          <CardFooter className="pt-4">
            <p className="text-xs text-muted-foreground">Total releases analyzed</p>
          </CardFooter>
        </Card>
        
        <Card className="h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-destructive" />
              <h3 className="text-sm font-medium text-muted-foreground">High Risk Releases</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">0</p>
          </CardContent>
          <CardFooter className="pt-4">
            <p className="text-xs text-muted-foreground">Releases with HIGH/CRITICAL risk</p>
          </CardFooter>
        </Card>
        
        <Card className="h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-medium text-muted-foreground">Average Risk Score</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">0</p>
          </CardContent>
          <CardFooter className="pt-4">
            <p className="text-xs text-muted-foreground">Average score across all analyses</p>
          </CardFooter>
        </Card>
        
        <Card className="h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <Search className="h-5 w-5 text-secondary" />
              <h3 className="text-sm font-medium text-muted-foreground">Test Gaps Found</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">0</p>
          </CardContent>
          <CardFooter className="pt-4">
            <p className="text-xs text-muted-foreground">Potential test coverage gaps identified</p>
          </CardFooter>
        </Card>
      </div>
      
      <div className="text-center">
        <Button 
          variant="default"
          className="w-full max-w-xs mx-auto py-3 text-lg"
          asChild
        >
          <Link to="/analyze">
            Analyze New Release
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;