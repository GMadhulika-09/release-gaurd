export interface Finding {
  id: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  file: string;
  problem: string;
  whyItMatters: string;
  potentialImpact: string;
}

export interface RecommendedTest {
  type: string;
  description: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  language: string;
  code: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  riskBreakdown: {
    complexity: number;
    impact: number;
    reachability: number;
    testCoverage: number;
  };
  findings: Finding[];
  recommendedTests: RecommendedTest[];
  releaseDecision: string;
}

const demoScenarios: DemoScenario[] = [
  {
    id: "low",
    name: "Low Risk",
    description: "Small UI/text change",
    language: "JavaScript",
    code: `// Button text update
const Button = ({ children, onClick }) => {
  return (
    <button onClick={onClick} className="btn-primary">
      {children}
    </button>
  );
};

// Before: Submit
// After: Save Changes`,
    riskScore: 25,
    riskLevel: "LOW",
    riskBreakdown: {
      complexity: 20,
      impact: 30,
      reachability: 25,
      testCoverage: 25
    },
    findings: [
      {
        id: 1,
        severity: "LOW",
        file: "Button.js",
        problem: "Minor text change in button label",
        whyItMatters: "UI consistency - ensures users understand button action",
        potentialImpact: "Users might be confused if button text doesn't match action"
      }
    ],
    recommendedTests: [
      {
        type: "Unit Test",
        description: "Verify button renders with correct text and calls onClick handler"
      },
      {
        type: "Visual Regression Test",
        description: "Ensure button styling remains consistent across browsers"
      }
    ],
    releaseDecision: "SAFE TO RELEASE"
  },
  {
    id: "medium",
    name: "Medium Risk",
    description: "Authentication-related change",
    language: "TypeScript",
    code: `// Password reset token validation
interface ResetTokenPayload {
  token: string;
  expiresAt: Date;
}

export const validateResetToken = async (
  token: string,
  payload: ResetTokenPayload
): Promise<boolean> => {
  // Check if token exists in database
  const storedToken = await db.tokens.findUnique({
    where: { token }
  });
  
  if (!storedToken) {
    return false;
  }
  
  // Check expiration
  const isExpired = new Date() > new Date(payload.expiresAt);
  if (isExpired) {
    // Delete expired token
    await db.tokens.delete({ where: { token } });
    return false;
  }
  
  // Additional security: check token format
  if (!/^[a-zA-Z0-9\\-_]+$/.test(token)) {
    return false;
  }
  
  return true;
};`,
    riskScore: 55,
    riskLevel: "MEDIUM",
    riskBreakdown: {
      complexity: 50,
      impact: 70,
      reachability: 60,
      testCoverage: 40
    },
    findings: [
      {
        id: 1,
        severity: "MEDIUM",
        file: "auth.ts",
        problem: "Missing rate limiting on token validation endpoint",
        whyItMatters: "Could allow brute force attacks on reset tokens",
        potentialImpact: "Attackers could try many tokens to gain unauthorized access"
      },
      {
        id: 2,
        severity: "LOW",
        file: "auth.ts",
        problem: "No logging for failed token validations",
        whyItMatters: "Difficult to detect and investigate attack attempts",
        potentialImpact: "Security incidents might go unnoticed"
      }
    ],
    recommendedTests: [
      {
        type: "Unit Test",
        description: "Test token validation with valid, expired, and malformed tokens"
      },
      {
        type: "Integration Test",
        description: "Test full password reset flow with email service and database"
      },
      {
        type: "Security Test",
        description: "Attempt brute force attacks to verify rate limiting effectiveness"
      }
    ],
    releaseDecision: "REVIEW RECOMMENDED"
  },
  {
    id: "high",
    name: "High Risk",
    description: "Payment-processing change",
    language: "Java",
    code: `// Payment processing service
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
  
  private boolean validateRequest(PaymentRequest request) {
    return request != null && 
           request.getAmount() > 0 && 
           request.getCardToken() != null;
  }
}`,
    riskScore: 85,
    riskLevel: "HIGH",
    riskBreakdown: {
      complexity: 80,
      impact: 95,
      reachability: 90,
      testCoverage: 30
    },
    findings: [
      {
        id: 1,
        severity: "HIGH",
        file: "PaymentService.java",
        problem: "New ML-based fraud detection lacks fallback to rule-based system",
        whyItMatters: "If ML model fails or returns unexpected values, payments could be incorrectly blocked or allowed",
        potentialImpact: "Revenue loss from false declines or fraud losses from false approvals"
      },
      {
        id: 2,
        severity: "MEDIUM",
        file: "PaymentService.java",
        problem: "No circuit breaker pattern for payment gateway calls",
        whyItMatters: "Gateway failures could cascade and exhaust application resources",
        potentialImpact: "System-wide outage during gateway issues"
      },
      {
        id: 3,
        severity: "LOW",
        file: "PaymentService.java",
        problem: "Missing idempotency key for payment requests",
        whyItMatters: "Network retries could cause duplicate charges",
        potentialImpact: "Customers being charged multiple times for same transaction"
      }
    ],
    recommendedTests: [
      {
        type: "Unit Test",
        description: "Test fraud score boundaries and edge cases (0.0, 0.8, 1.0)"
      },
      {
        type: "Integration Test",
        description: "Test end-to-end payment flow with mocked gateway and fraud service"
      },
      {
        type: "Chaos Test",
        description: "Simulate ML service failures and gateway timeouts"
      },
      {
        type: "Security Test",
        description: "Attempt adversarial attacks on ML fraud detection model"
      }
    ],
    releaseDecision: "REVIEW REQUIRED"
  }
];

export default demoScenarios;