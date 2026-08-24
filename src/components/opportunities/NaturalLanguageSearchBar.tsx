"use client";

import React from "react";
import DiscoverySearchBar from "./DiscoverySearchBar";

export interface NaturalLanguageSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

/**
 * Consolidated compatibility wrapper for DiscoverySearchBar
 */
export default function NaturalLanguageSearchBar({
  value,
  onChange,
  onClear,
}: NaturalLanguageSearchBarProps) {
  return (
    <DiscoverySearchBar
      value={value}
      onChange={(q) => onChange(q)}
      onClear={onClear}
    />
  );
}
