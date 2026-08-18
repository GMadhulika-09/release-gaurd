import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle, Code, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { Finding } from "@/data/demoScenarios";
import { showSuccess } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FixSuggestion {
  proposedFix: string;
  whyExplanation: string;
  beforeCode: string;
}

const fixSuggestions: Record<string, FixSuggestion> = {
  "Minor text change in button label": {
    proposedFix: `// Ensure button text matches the action
const Button = ({ children, onClick }) => {
  return (
    <button onClick={onClick} className="btn-primary">
      {children}
    </button>
  );
};`,
    whyExplanation: "Changing the button text to 'Save Changes' makes it clear what action will occur when clicked.",
    beforeCode: `// Button component with unclear action
const Button = ({ children, onClick }) => {
  return (
    <button onClick={onClick} className="btn-primary">
      Submit
    </button>
  );
};`
  },
  "Missing rate limiting on token validation endpoint": {
    proposedFix: `// Add rate limiting middleware
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

app.post('/validate-token', rateLimiter, (req, res) => {
  // Validate token
});`,
    whyExplanation: "Rate limiting prevents brute force attacks by limiting the number of requests from a single IP.",
    beforeCode: `// Token validation endpoint without rate limiting
app.post('/validate-token', (req, res) => {
  const { token } = req.body;
  
  // Check if token exists in database
  const storedToken = await db.tokens.findUnique({
    where: { token }
  });
  
  if (!storedToken) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Check expiration
  const isExpired = new Date() > new Date(storedToken.expiresAt);
  if (isExpired) {
    await db.tokens.delete({ where: { token } });
    return res.status(401).json({ error: 'Token expired' });
  }
  
  return res.json({ valid: true });
});`
  },
  "New ML-based fraud detection lacks fallback to rule-based system": {
    proposedFix: `// Add fallback to rule-based system
try {
  const fraudScore = await mlModel.analyze(request);
  if (fraudScore > 0.8) {
    return decline();
  }
} catch (error) {
  // Fallback to rule-based
  if (ruleBasedCheck(request)) {
    return decline();
  }
}`,
    whyExplanation: "A fallback ensures that if the ML model fails, the system can still detect fraud using rules.",
    beforeCode: `// Payment processing service without fallback
@Service
public class PaymentService {
  
  @Autowired
  private PaymentGateway gateway;
  
  @Autowired
  private FraudDetectionService fraudService;
  
  public PaymentResponse processPayment(PaymentRequest request) {
    // Step 1: Validate request
    if (!validateRequest(request)) {
      throw new InvalidRequestException("Invalid payment request");
    }
    
    // Step 2: Fraud check (NEW: added machine learning model)
    FraudScore fraudScore = fraudService.analyzeWithMLModel(request);
    
    // Step 3: Check if fraud score exceeds threshold
    if (fraudScore.getScore() > 0.8) {
      logWarning("High fraud score detected: " + fraudScore.getScore());
      return PaymentResponse.declined(FraudDeclinedReason.HIGH_RISK);
    }
    
    // Step 4: Process payment
    try {
      PaymentResponse response = gateway.charge(request.getAmount(), request.getCardToken());
      
      // Step 5: Record transaction
      transactionRepository.save(new Transaction(request, response));
      
      return response;
    } catch (GatewayException e) {
      // Step 6: Handle gateway errors
      logError("Payment gateway failed: " + e.getMessage());
      return PaymentResponse.declined(DeclinedReason.GATEWAY_ERROR);
    }
  }
}` 
  }
};

const getFixSuggestion = (finding: Finding): FixSuggestion => {
  return fixSuggestions[finding.problem] || {
    proposedFix: `// Review and fix the issue in ${finding.file}
// This is a deterministic example based on the finding.`,
    whyExplanation: `This fix addresses the ${finding.severity} severity issue.`,
    beforeCode: `// Current code in ${finding.file}
// This represents the existing implementation that needs improvement.`
  };
};

interface FindingItemProps {
  finding: Finding;
}

const FindingItem = ({ finding }: FindingItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fixState, setFixState] = useState({
    showFixControls: false,
    showProposedFix: false,
    showBeforeAfterComparison: false,
    fixApproved: false,
    keepCurrentCode: false
  });

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "LOW": return "bg-success/20 text-success";
      case "MEDIUM": return "bg-warning/20 text-warning";
      case "HIGH": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const toggleExplanation = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setFixState(prev => ({ ...prev, showFixControls: false, showProposedFix: false, showBeforeAfterComparison: false, fixApproved: false, keepCurrentCode: false }));
    }
  };

  const handleReviewProposedFix = () => {
    setFixState(prev => ({
      ...prev,
      showFixControls: false,
      showProposedFix: false,
      showBeforeAfterComparison: true,
      fixApproved: false,
      keepCurrentCode: false
    }));
  };

  const handleKeepCurrentCode = () => {
    setFixState(prev => ({
      ...prev,
      showFixControls: false,
      showProposedFix: false,
      showBeforeAfterComparison: false,
      keepCurrentCode: true
    }));
    showSuccess("No changes made.");
  };

  const handleApproveFix = () => {
    setFixState(prev => ({
      ...prev,
      showProposedFix: false,
      showBeforeAfterComparison: false,
      fixApproved: true
    }));
    showSuccess("Fix approved for review. No source files were modified.");
  };

  const handleCancelFix = () => {
    setFixState(prev => ({
      ...prev,
      showProposedFix: false,
      showBeforeAfterComparison: false
    }));
  };

  const suggestion = getFixSuggestion(finding);

  return (
    <div key={finding.id} className="border rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium">{finding.file}</h4>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 text-xs rounded ${getSeverityStyles(finding.severity)}`}>
            {finding.severity}
          </span>
          <button
            onClick={toggleExplanation}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? "Hide" : "Explain"}
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{finding.problem}</p>

      {isExpanded && (
        <div className="mt-4 border-t border-muted pt-3 space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-1">Why was this flagged?</h4>
            <p className="text-sm text-muted-foreground">{finding.problem}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Potential impact:</h4>
            <p className="text-sm text-muted-foreground">{finding.potentialImpact}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Why risky?</h4>
            <p className="text-sm text-muted-foreground">
              The {finding.severity} severity issue in {finding.file} could impact critical functionality
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Recommended action:</h4>
            <p className="text-sm text-muted-foreground">
              Review the {finding.severity} severity issue in {finding.file}
            </p>
          </div>

          {/* Fix-on-Confirm Section */}
          <div className="pt-3 border-t border-muted">
            {!fixState.showFixControls && !fixState.showProposedFix && !fixState.showBeforeAfterComparison && !fixState.fixApproved && !fixState.keepCurrentCode && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Would you like to fix this finding?</p>
                <div className="flex space-x-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleReviewProposedFix}
                  >
                    Review Proposed Fix
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleKeepCurrentCode}
                  >
                    Keep Current Code
                  </Button>
                </div>
              </div>
            )}

            {fixState.keepCurrentCode && (
              <div className="flex items-center space-x-2 text-success">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">No changes made.</span>
              </div>
            )}

            {fixState.fixApproved && (
              <div className="flex items-center space-x-2 text-success">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Fix approved for review. No source files were modified.</span>
              </div>
            )}

            {fixState.showBeforeAfterComparison && (
              <div className="space-y-4 p-3 bg-muted/30 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BEFORE Section */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <h4 className="text-sm font-medium">Current Code</h4>
                    </div>
                    <div className="border rounded-lg bg-background">
                      <div className="bg-muted/50 px-3 py-2 border-b rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-muted-foreground">{finding.file}</span>
                          <Badge variant="secondary" className="text-xs">BEFORE</Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <pre className="text-xs overflow-x-auto">
                          <code>{suggestion.beforeCode}</code>
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* AFTER Section */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-medium">Proposed Fix</h4>
                    </div>
                    <div className="border rounded-lg bg-background">
                      <div className="bg-primary/10 px-3 py-2 border-b rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-primary">{finding.file}</span>
                          <Badge variant="default" className="text-xs">AFTER</Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <pre className="text-xs overflow-x-auto">
                          <code>{suggestion.proposedFix}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why this change? */}
                <div className="pt-3 border-t border-muted">
                  <h4 className="text-sm font-medium mb-2">Why this change?</h4>
                  <p className="text-sm text-muted-foreground">{suggestion.whyExplanation}</p>
                </div>

                {/* Approval */}
                <div className="pt-3 border-t border-muted">
                  <p className="text-sm font-medium mb-2">Developer approval</p>
                  <p className="text-sm text-muted-foreground mb-2">Apply this fix?</p>
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleApproveFix}
                    >
                      Approve Fix
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelFix}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface FindingsCardProps {
  findings: Finding[];
}

const FindingsCard = ({ findings }: FindingsCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4" />
          <h3>Key Findings</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {findings.map((finding) => (
          <FindingItem key={finding.id} finding={finding} />
        ))}
      </CardContent>
    </Card>
  );
};

export default FindingsCard;