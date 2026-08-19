...
<div className="grid gap-6 lg:grid-cols-2">
  <FindingsCard findings={findings} />
  <RecommendedTestsCard tests={recommendedTests} />
</div>

<div className="grid gap-6 lg:grid-cols-2">
  <BlastRadius 
    blastRadius={blastRadius} 
    dependencyData={dependencyData} 
    explanation={explanation} 
  />
  <TestCoverageRecommendations 
    findings={findings} 
    testCoverageData={testCoverageData} 
  />
</div>
...