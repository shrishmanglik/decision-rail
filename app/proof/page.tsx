import { InfoPage } from "@/src/ui/info-page";

export default function ProofPage() {
  return <InfoPage eyebrow="Reproducible proof" title="Checks answer the exact question." summary="The repository carries known-bad, clean-control, repeatability, detector-mutation, recovery, security, accessibility, build, and browser proof." sections={[
    { title: "Local gate", body: <code>npm run typecheck · npm run lint · npm run test · npm run build · npm run test:e2e</code> },
    { title: "Adjacent-check defence", body: <>Each bad fixture must reject with its named issue code; each clean fixture must pass; a second run must produce the same digest; removing each detector must break acceptance.</> },
    { title: "Truth boundary", body: <>Local proof does not establish provider configuration, production deployment, customers, demand, revenue, or commercial outcomes.</> },
  ]} />;
}
