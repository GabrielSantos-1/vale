import { Hero } from "@/components/marketing/hero";
import { COMPANY_PROFILE } from "@/lib/constants/company";
import { PUBLIC_CONTACT_ACTIONS } from "@/lib/constants/contact";

export function AboutHero() {
  return (
    <Hero
      eyebrow={COMPANY_PROFILE.heroEyebrow}
      badge={COMPANY_PROFILE.heroBadge}
      title={COMPANY_PROFILE.heroTitle}
      description={COMPANY_PROFILE.heroDescription}
      primaryCta={{
        label: PUBLIC_CONTACT_ACTIONS.coverage.label,
        href: PUBLIC_CONTACT_ACTIONS.coverage.href,
      }}
      secondaryCta={{
        label: PUBLIC_CONTACT_ACTIONS.support.label,
        href: PUBLIC_CONTACT_ACTIONS.support.href,
      }}
      note={COMPANY_PROFILE.summary}
      stats={COMPANY_PROFILE.metrics.map((metric) => ({
        label: metric.label,
        value: metric.value,
        description: metric.helper,
      }))}
    />
  );
}

export default AboutHero;
