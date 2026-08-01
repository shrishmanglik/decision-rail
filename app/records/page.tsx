import { InfoPage } from "@/src/ui/info-page";

export default function RecordsPage() {
  return <InfoPage eyebrow="Synthetic record index" title="Records with a claim ceiling." summary="The reference build exposes record shapes without pretending local fixtures are customer evidence." sections={[
    { title: "CustomerEvidence.v1", body: <>Source class, pseudonym, capture time, consent scope, digest, redaction, tenant, and lifecycle state.</> },
    { title: "OpportunityContract.v1", body: <>Segment, bounded problem, current workaround, evidence links, baseline or UNKNOWN, owner, non-goals, expiry, and decision state.</> },
    { title: "ExperimentRun.v1", body: <>Exact opportunity, prototype, fixture, cohort, metric, guardrail, decision-rule, and stop-condition identities.</> },
  ]} />;
}
