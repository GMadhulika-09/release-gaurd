import { useState } from "react";
  import type { ComparisonHistoryEntry } from "@/utils/comparisonHistory";
  import { getRiskLevel, getRiskColor, getReleaseDecision } from "@/utils/riskScoring";