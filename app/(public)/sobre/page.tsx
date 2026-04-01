import { Container } from "@/components/ui/core/container";
import { AboutHero } from "@/components/marketing/about-hero";
import { AboutMetrics } from "@/components/marketing/about-metrics";
import { AboutDifferentials } from "@/components/marketing/about-differentials";
import { AboutCta } from "@/components/marketing/about-cta";

export const metadata = {
  title: "Sobre | Verde Vale Connect",
};

export default function SobrePage() {
  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        <AboutHero />
        <AboutMetrics />
        <AboutDifferentials />
        <AboutCta />
      </div>
    </Container>
  );
}


