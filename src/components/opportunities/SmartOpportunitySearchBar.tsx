"use client";

import React from "react";
import DiscoverySearchBar, { DiscoverySearchBarProps } from "./DiscoverySearchBar";

export type SmartOpportunitySearchBarProps = DiscoverySearchBarProps;

/**
 * Consolidated compatibility wrapper for DiscoverySearchBar
 */
export default function SmartOpportunitySearchBar(props: DiscoverySearchBarProps) {
  return <DiscoverySearchBar {...props} />;
}
