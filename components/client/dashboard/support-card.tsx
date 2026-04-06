import Link from "next/link";
import { LifeBuoy, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/core/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";

type SupportCardProps = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export function SupportCard({
  title,
  description,
  ctaLabel,
  ctaHref,
}: SupportCardProps) {
  return (
    <Card className="h-full hover:border-border-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LifeBuoy className="h-5 w-5 text-accent" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-secondary">{description}</p>
        <Button asChild className="w-full">
          <Link href={ctaHref}>
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {ctaLabel}
            </span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
