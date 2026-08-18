<Select value={language} onValueChange={onLanguageChange}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select language" />
    </SelectTrigger>
    <SelectContent>
      {/* ...existing options... */}
    </SelectContent>
  </Select>