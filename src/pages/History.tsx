import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { 
  Trash2, 
  RefreshCw, 
  Clock, 
  ShieldCheck,
  GitCompare,
  Archive
} from "lucide-react";
import { showSuccess } from "@/utils/toast";
import { ComparisonHistoryEntry, getComparisonHistory, clearComparisonHistory, deleteComparisonEntry } from "@/utils/comparisonHistory";
import ComparisonHistoryEntryComponent from "@/components/ComparisonHistoryEntry";

const History = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [comparisonHistory, setComparisonHistory] = useState<ComparisonHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analyses");

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      try {
        // Load analysis history
        const saved = localStorage.getItem("releaseGuardHistory");
        const parsed = saved ? JSON.parse(saved) : [];
        // Sort by timestamp descending (newest first)
        parsed.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setHistory(parsed);

        // Load comparison history
        const comparisons = getComparisonHistory();
        setComparisonHistory(comparisons);
      } catch (e) {
        console.error("Failed to load history:", e);
        setHistory([]);
        setComparisonHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const clearAnalysisHistory = () => {
    if (window.confirm("Are you sure you want to delete all analysis history?")) {
      localStorage.removeItem("releaseGuardHistory");
      setHistory([]);
      showSuccess("Analysis history cleared");
    }
  };

  const clearComparisonHistory = () => {
    if (window.confirm("Are you sure you want to delete all comparison history?")) {
      clearComparisonHistory();
      setComparisonHistory([]);
      showSuccess("Comparison history cleared");
    }
  };

  const deleteComparisonEntry = (id: string) => {
    deleteComparisonEntry(id);
    setComparisonHistory(getComparisonHistory());
    showSuccess("Comparison entry removed");
  };

  const retryAnalysis = (item: any) => {
    showSuccess(`Would navigate to analyze with: ${item.name}`);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full border-4 border-primary/20 border-primary w-12 h-12"></div>
        <p className="mt-4 text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="analyses" className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Analyses</span>
          </TabsTrigger>
          <TabsTrigger value="comparisons" className="flex items-center space-x-2">
            <GitCompare className="h-4 w-4" />
            <span>Comparisons</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyses" className="space-y-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl text-muted-foreground mb-4">📭</div>
              <h3 className="text-lg font-medium text-muted-foreground">No analyses yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Analyze a code change to see it appear here.
              </p>
              <Button 
                variant="default"
                asChild
              >
                <Link to="/analyze">Analyze First Release</Link>
              </Button>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <h3>Analysis History</h3>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const saved = localStorage.getItem("releaseGuardHistory");
                        const parsed = saved ? JSON.parse(saved) : [];
                        parsed.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        setHistory(parsed);
                        showSuccess("History refreshed");
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={clearAnalysisHistory}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Showing {history.length} {history.length === 1 ? "analysis" : "analyses"}
                </p>
                
                {history.map((item: any) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <div className={`flex items-center space-x-1
                          ${item.riskLevel === "LOW" ? "text-success" : ""}
                          ${item.riskLevel === "MEDIUM" ? "text-warning" : ""}
                          ${item.riskLevel === "HIGH" || item.riskLevel === "CRITICAL" ? "text-destructive" : ""}
                        `}>
                          <ShieldCheck className="h-4 w-4" />
                          <span>{item.riskLevel}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="text-sm">
                        <span className="font-medium">Risk Score:</span>
                        <span className="font-mono">{item.riskScore}/100</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Findings:</span>
                        <span className="font-mono">{item.findings.length}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Decision:</span>
                        <span className={`font-mono 
                          ${item.riskLevel === "LOW" ? "text-success" : ""}
                          ${item.riskLevel === "MEDIUM" ? "text-warning" : ""}
                          ${item.riskLevel === "HIGH" || item.riskLevel === "CRITICAL" ? "text-destructive" : ""}
                        `}>
                          {item.releaseDecision}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Language:</span>
                        <span className="font-mono">{item.language}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end space-x-2">
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => retryAnalysis(item)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const updated = history.filter((h: any) => h.id !== item.id);
                          setHistory(updated);
                          localStorage.setItem("releaseGuardHistory", JSON.stringify(updated));
                          showSuccess("Analysis removed from history");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-6">
          {comparisonHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl text-muted-foreground mb-4">📭</div>
              <h3 className="text-lg font-medium text-muted-foreground">No comparisons yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Compare two releases to see it appear here.
              </p>
              <Button 
                variant="default"
                asChild
              >
                <Link to="/analyze">Compare Releases</Link>
              </Button>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <GitCompare className="h-4 w-4" />
                    <h3>Release Comparisons</h3>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setComparisonHistory(getComparisonHistory());
                        showSuccess("Comparison history refreshed");
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={clearComparisonHistory}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Showing {comparisonHistory.length} {comparisonHistory.length === 1 ? "comparison" : "comparisons"}
                </p>
                
                {comparisonHistory.map((entry) => (
                  <ComparisonHistoryEntryComponent
                    key={entry.id}
                    entry={entry}
                    onDelete={deleteComparisonEntry}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;