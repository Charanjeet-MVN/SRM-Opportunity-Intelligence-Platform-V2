import React from "react";
import { getSavedOpportunitiesAction, getRegisteredOpportunitiesAction } from "@/lib/engagement/actions";
import MyOpportunitiesWorkspaceClient from "@/components/opportunities/MyOpportunitiesWorkspaceClient";

export default async function StudentRegistrationsPage() {
  const { savedOpportunities } = await getSavedOpportunitiesAction();
  const { registeredOpportunities } = await getRegisteredOpportunitiesAction();

  return (
    <MyOpportunitiesWorkspaceClient
      initialSaved={savedOpportunities || []}
      initialRegistered={registeredOpportunities || []}
      initialTab="applied"
    />
  );
}
