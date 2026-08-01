import { AppShell } from "@/src/ui/app-shell";

export function InfoPage({ eyebrow, title, summary, sections }: { eyebrow: string; title: string; summary: string; sections: Array<{ title: string; body: React.ReactNode }> }) {
  return <AppShell><article className="simple-page"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="lede">{summary}</p>{sections.map((section) => <section key={section.title}><h2>{section.title}</h2><div className="lede">{section.body}</div></section>)}</article></AppShell>;
}
