export interface ComparisonHistoryEntry {
  id: string;
  date: string;
  previousReleaseName: string;
  currentReleaseName: string;
  previousRiskScore: number;
  currentRiskScore: number;
  riskChange: number;
  filesAdded: number;
  filesModified: number;
  filesDeleted: number;
  releaseStatus: string;
}

const HISTORY_KEY = "releaseComparisonHistory";
const MAX_HISTORY_ENTRIES = 50;

export function saveComparisonToHistory(entry: Omit<ComparisonHistoryEntry, "id" | "date">) {
  try {
    const history = getComparisonHistory();
    const newEntry: ComparisonHistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    
    // Add to beginning (newest first)
    history.unshift(newEntry);
    
    // Limit to max entries
    if (history.length > MAX_HISTORY_ENTRIES) {
      history.pop();
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error("Failed to save comparison to history:", error);
    return false;
  }
}

export function getComparisonHistory(): ComparisonHistoryEntry[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load comparison history:", error);
    return [];
  }
}

export function clearComparisonHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear comparison history:", error);
    return false;
  }
}

export function deleteComparisonEntry(id: string) {
  try {
    const history = getComparisonHistory();
    const filtered = history.filter(entry => entry.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to delete comparison entry:", error);
    return false;
  }
}