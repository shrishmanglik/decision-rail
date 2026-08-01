import { InfoPage } from "@/src/ui/info-page";

export default function SettingsPage() {
  return <InfoPage eyebrow="Local configuration" title="Privacy defaults fail closed." summary="Settings are documentation in this reference build; no account or provider configuration is mutated." sections={[
    { title: "Data mode", body: <>Synthetic fixtures only. Raw interview data, secrets, and unrestricted client content are prohibited.</> },
    { title: "Retention proposal", body: <>Decision metadata: seven-year hypothesis. Raw evidence: 365 days or stricter client policy. Neither is applied to a provider.</> },
    { title: "Export", body: <>Disabled until tenant scope, redaction, exact digests, expiry, and receiving authority pass.</> },
  ]} />;
}
