interface ComparisonHistoryEntryProps {
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
    onSelect?: (entry: ComparisonHistoryEntry) => void; // Add optional prop
  }

  // In component usage:
  <ComparisonHistoryEntry 
    key={entry.id} 
    entry={entry} 
    onDelete={handleDeleteComparisonEntry}
    onSelect={handleSelectEntry} // Now valid
  />