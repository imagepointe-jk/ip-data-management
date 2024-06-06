import { getCurrentHubSpotSyncProgress } from "@/db/access/hubspot";
import HubspotSyncForm from "./HubspotSyncForm";

export default async function Hubspot() {
  const currentSyncProgress = await getCurrentHubSpotSyncProgress();

  return (
    <HubspotSyncForm
      progress={currentSyncProgress || 0}
      syncInProgress={currentSyncProgress !== null}
    />
  );
}
