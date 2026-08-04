import { InfoPage } from "@/src/ui/info-page";

export default function ConnectionsPage() {
  return <InfoPage eyebrow="Integration authority" title="Connectors begin powerless." summary="This build performs no production write and needs no credentials." sections={[
    { title: "Research repository", body: <>READ_ONLY — proposed adapter; provider and client authority UNKNOWN.</> },
    { title: "Prototype manifest", body: <>SANDBOX — static signed bundle fallback; no production mutation.</> },
    { title: "Delivery tracker", body: <>PRODUCTION_GATED — signed manual handoff only until a separate authority packet exists.</> },
    { title: "Analytics", body: <>READ_ONLY — exact cohort and schema contract proposed; provider connection not implemented.</> },
  ]} />;
}
