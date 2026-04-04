"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  type PanInfo,
  useReducedMotion,
} from "framer-motion";

import { Button } from "@/components/ui/core/button";
import { Card } from "@/components/ui/core/card";
import { cn } from "@/lib/cn";

type HeroPanelStat = {
  label: string;
  value: string;
};

type HeroSlideTheme = {
  ambientClassName: string;
  shellClassName: string;
  footerGlowClassName: string;
  panelGlowClassName?: string;
  overlayClassName?: string;
};

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: string;
  contentAlignment?: "left" | "center";
  panel?: {
    eyebrow: string;
    title: string;
    description: string;
    stats: HeroPanelStat[];
    note: string;
    noteClassName?: string;
  };
  theme: HeroSlideTheme;
};

const AUTOPLAY_MS = 5500;
const SWIPE_THRESHOLD = 60;

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "fiber-transparency",
    eyebrow: "Fibra Ã³ptica â€¢ cobertura â€¢ status em tempo real",
    title: "Internet fibra com transparÃªncia, estabilidade e gestÃ£o moderna",
    description:
      "Consulte planos, verifique cobertura, acompanhe o status da rede e entre em contato com rapidez em uma experiÃªncia clara e confiÃ¡vel.",
    primaryCta: {
      label: "Ver planos",
      href: "/planos",
    },
    secondaryCta: {
      label: "Entrar em contato",
      href: "/contato",
    },
    panel: {
      eyebrow: "Cobertura",
      title: "Planos e disponibilidade com clareza",
      description:
        "Mostre velocidade, disponibilidade e contato em uma vitrine mais confiÃ¡vel e objetiva.",
      stats: [
        { label: "Cobertura", value: "Consulta rÃ¡pida" },
        { label: "Jornada", value: "Sem atrito" },
      ],
      note: "Planos, cobertura e contato em uma experiÃªncia mais clara para conversÃ£o.",
      noteClassName: "border-emerald-200 bg-emerald-50/80 text-emerald-700",
    },
    theme: {
      ambientClassName:
        "bg-[radial-gradient(circle_at_10%_14%,rgba(47,158,68,0.18),transparent_18%),radial-gradient(circle_at_88%_8%,rgba(16,185,129,0.12),transparent_22%),radial-gradient(circle_at_60%_82%,rgba(29,78,216,0.06),transparent_20%)]",
      shellClassName:
        "bg-[linear-gradient(135deg,rgba(255,255,255,0.80),rgba(248,252,255,0.96)),radial-gradient(circle_at_top_right,rgba(47,158,68,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_24%)]",
      footerGlowClassName:
        "bg-[linear-gradient(to_top,rgba(255,255,255,0.35),rgba(255,255,255,0)),radial-gradient(circle_at_50%_100%,rgba(148,163,184,0.06),transparent_35%)]",
      panelGlowClassName:
        "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.42),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(47,158,68,0.06),transparent_34%)]",
    },
  },
  {
    id: "network-visibility",
    eyebrow: "OperaÃ§Ã£o â€¢ status da rede â€¢ comunicaÃ§Ã£o clara",
    title: "Acompanhe a operaÃ§Ã£o da rede com visibilidade e resposta rÃ¡pida",
    description:
      "Mantenha seus clientes informados com uma vitrine moderna para avisos de manutenÃ§Ã£o, incidentes e normalizaÃ§Ã£o da rede.",
    primaryCta: {
      label: "Ver status",
      href: "/status",
    },
    secondaryCta: {
      label: "Consultar cobertura",
      href: "/cobertura",
    },
    panel: {
      eyebrow: "OperaÃ§Ã£o",
      title: "Status da rede em destaque",
      description:
        "Comunique incidentes, manutenÃ§Ã£o e normalizaÃ§Ã£o com mais confianÃ§a e leitura imediata.",
      stats: [
        { label: "Resposta", value: "Tempo real" },
        { label: "ConfianÃ§a", value: "Mais visÃ­vel" },
      ],
      note: "O fundo reage ao contexto do slide para reforÃ§ar operaÃ§Ã£o e transparÃªncia.",
      noteClassName: "border-sky-200 bg-sky-50/80 text-sky-700",
    },
    theme: {
      ambientClassName:
        "bg-[radial-gradient(circle_at_12%_14%,rgba(29,78,216,0.16),transparent_18%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.14),transparent_22%),radial-gradient(circle_at_60%_82%,rgba(47,158,68,0.05),transparent_20%)]",
      shellClassName:
        "bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(248,252,255,0.95)),radial-gradient(circle_at_top_right,rgba(29,78,216,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_24%)]",
      footerGlowClassName:
        "bg-[linear-gradient(to_top,rgba(255,255,255,0.35),rgba(255,255,255,0)),radial-gradient(circle_at_50%_100%,rgba(148,163,184,0.06),transparent_35%)]",
      panelGlowClassName:
        "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.42),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(29,78,216,0.07),transparent_34%)]",
    },
  },
  {
    id: "campaign-image-slide",
    eyebrow: "Atendimento premium â€¢ experiÃªncia clara â€¢ contrataÃ§Ã£o rÃ¡pida",
    title: "Conecte tecnologia, confianÃ§a e uma jornada visual mais forte",
    description:
      "Use slides visuais para destacar campanhas, atendimento, planos e diferenciais com clareza, profundidade e melhor percepÃ§Ã£o de produto.",
    primaryCta: {
      label: "Contratar agora",
      href: "/contratar",
    },
    secondaryCta: {
      label: "Conhecer a empresa",
      href: "/sobre",
    },
    imageSrc: "/images/fiber-residential-valley.png",
    imageAlt:
      "Profissional trabalhando em ambiente externo com notebook, representando atendimento premium e experiÃªncia moderna.",
    imagePosition: "object-center",
    contentAlignment: "left",
    theme: {
      ambientClassName:
        "bg-[radial-gradient(circle_at_10%_20%,rgba(34,197,94,0.16),transparent_20%),radial-gradient(circle_at_85%_12%,rgba(59,130,246,0.12),transparent_22%),radial-gradient(circle_at_50%_85%,rgba(255,255,255,0.08),transparent_22%)]",
      shellClassName:
        "bg-[linear-gradient(135deg,rgba(255,255,255,0.20),rgba(255,255,255,0.08))]",
      footerGlowClassName:
        "bg-[linear-gradient(to_top,rgba(255,255,255,0.22),rgba(255,255,255,0)),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.08),transparent_35%)]",
      overlayClassName:
        "bg-[linear-gradient(90deg,rgba(15,23,42,0.44)_0%,rgba(15,23,42,0.22)_36%,rgba(15,23,42,0.09)_60%,transparent_100%)]",
    },
  },
];

const FALLBACK_HERO_SLIDE = DEFAULT_HERO_SLIDES[0];

function clampIndex(value: number, total: number) {
  if (value < 0) return total - 1;
  if (value >= total) return 0;
  return value;
}

function isImageSlide(slide: HeroSlide) {
  return Boolean(slide.imageSrc);
}

type HeroSliderProps = {
  slides?: HeroSlide[];
};

export default function HeroSlider({ slides }: HeroSliderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const safeSlides = useMemo(() => {
    const source =
      slides && slides.length > 0 ? slides.slice(0, 3) : DEFAULT_HERO_SLIDES.slice(0, 3);

    return source.length > 0 ? source : [FALLBACK_HERO_SLIDE];
  }, [slides]);

  const normalizedActiveIndex = clampIndex(activeIndex, safeSlides.length);
  const activeSlide = safeSlides[normalizedActiveIndex];
  const imageMode = isImageSlide(activeSlide);

  const slideTransition = useMemo(
    () => (shouldReduceMotion ? { duration: 0.2 } : { duration: 0.45 }),
    [shouldReduceMotion]
  );

  const slideInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 18 };

  const slideAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0 };

  const slideExit = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: -18 };

  const panelInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.985, y: 8 };

  const panelAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, y: 0 };

  const panelExit = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 1.01, y: -8 };

  useEffect(() => {
    if (isPaused || safeSlides.length <= 1) return;

    autoplayRef.current = setInterval(() => {
      setActiveIndex((current) => clampIndex(current + 1, safeSlides.length));
    }, AUTOPLAY_MS);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isPaused, safeSlides.length]);

  function goToSlide(index: number) {
    setActiveIndex(clampIndex(index, safeSlides.length));
  }

  function goToNext() {
    setActiveIndex((current) => clampIndex(current + 1, safeSlides.length));
  }

  function goToPrevious() {
    setActiveIndex((current) => clampIndex(current - 1, safeSlides.length));
  }

  function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) {
    if (Math.abs(info.offset.x) < SWIPE_THRESHOLD) return;

    if (info.offset.x < 0) {
      goToNext();
      return;
    }

    goToPrevious();
  }

  const titleClassName = imageMode
    ? "text-3xl font-bold leading-[1.06] tracking-[-0.03em] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)] sm:text-[2.5rem] md:text-5xl md:leading-[1.02]"
    : "text-3xl font-bold leading-[1.06] tracking-[-0.03em] text-primary sm:text-[2.5rem] md:text-5xl md:leading-[1.02]";

  const descriptionClassName = imageMode
    ? "mt-4 max-w-2xl text-[15px] leading-7 text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)] sm:text-base md:text-lg"
    : "mt-4 max-w-2xl text-[15px] leading-7 text-secondary sm:text-base md:text-lg";

  const secondaryButtonClassName = imageMode
    ? "w-full border-white/30 bg-white/[0.14] text-white shadow-[0_10px_26px_rgba(2,6,23,0.18)] backdrop-blur-md hover:bg-white/[0.2] sm:w-auto"
    : "w-full sm:w-auto";

  return (
    <section
      aria-label="Destaques principais"
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[32px] transition-all duration-700",
          activeSlide.theme.ambientClassName
        )}
      />

      <motion.div
        drag={shouldReduceMotion ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        className="relative"
      >
        <Card className="relative overflow-hidden rounded-[34px] border border-white/55 bg-transparent shadow-soft-lg">
          <div className="absolute inset-0 rounded-[34px] bg-white/[0.14] backdrop-blur-[32px]" />

          {imageMode && activeSlide.imageSrc ? (
            <>
              <div className="absolute inset-0 scale-[1.08] overflow-hidden rounded-[34px]">
                <Image
                  src={activeSlide.imageSrc}
                  alt=""
                  fill
                  priority={normalizedActiveIndex === 0}
                  className={cn(
                    "object-cover blur-3xl scale-110 opacity-60 saturate-110",
                    activeSlide.imagePosition ?? "object-center"
                  )}
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>

              <div className="absolute inset-[10px] overflow-hidden rounded-[30px]">
                <Image
                  src={activeSlide.imageSrc}
                  alt={activeSlide.imageAlt ?? activeSlide.title}
                  fill
                  priority={normalizedActiveIndex === 0}
                  className={cn(
                    "object-cover",
                    activeSlide.imagePosition ?? "object-center"
                  )}
                />
                <div
                  className={cn(
                    "absolute inset-0",
                    activeSlide.theme.overlayClassName ??
                      "bg-[linear-gradient(90deg,rgba(15,23,42,0.44)_0%,rgba(15,23,42,0.22)_36%,rgba(15,23,42,0.09)_60%,transparent_100%)]"
                  )}
                />
              </div>
            </>
          ) : (
            <>
              <div
                aria-hidden="true"
                className={cn(
                  "absolute inset-[10px] rounded-[30px] transition-all duration-700",
                  activeSlide.theme.shellClassName
                )}
              />
              <div
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-x-[10px] bottom-[10px] h-24 rounded-b-[30px] transition-all duration-700",
                  activeSlide.theme.footerGlowClassName
                )}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[10px] bottom-[10px] h-16 rounded-b-[30px] bg-white/[0.1] blur-xl"
              />
            </>
          )}

          <div className="relative z-10 px-[10px] py-[10px]">
            <div
              className={cn(
                "grid min-h-[360px] items-center gap-6 rounded-[30px] px-5 py-6 sm:min-h-[400px] sm:px-6 sm:py-8 md:min-h-[470px] md:px-8 md:py-10 lg:min-h-[520px] lg:gap-10 lg:px-10 lg:py-12",
                imageMode ? "lg:grid-cols-1" : "lg:grid-cols-[1.1fr_0.82fr]"
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  initial={slideInitial}
                  animate={slideAnimate}
                  exit={slideExit}
                  transition={slideTransition}
                  className={cn(
                    "min-w-0",
                    imageMode ? "max-w-2xl" : "max-w-3xl",
                    activeSlide.contentAlignment === "center" &&
                      "mx-auto text-center"
                  )}
                >
                  <p
                    className={cn(
                      "mb-4 text-xs font-semibold uppercase tracking-[0.22em] sm:text-sm",
                      imageMode ? "text-white/85" : "text-accent"
                    )}
                  >
                    {activeSlide.eyebrow}
                  </p>

                  <h1 className={titleClassName}>{activeSlide.title}</h1>

                  <p className={descriptionClassName}>
                    {activeSlide.description}
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <Link href={activeSlide.primaryCta.href}>
                        {activeSlide.primaryCta.label}
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className={secondaryButtonClassName}
                    >
                      <Link href={activeSlide.secondaryCta.href}>
                        {activeSlide.secondaryCta.label}
                      </Link>
                    </Button>
                  </div>

                  {!imageMode && activeSlide.panel ? (
                    <div className="mt-5 lg:hidden">
                      <div className="rounded-[24px] border border-white/24 bg-white/[0.14] p-4 shadow-[0_14px_34px_rgba(2,6,23,0.16)] backdrop-blur-lg">
                        <div className="space-y-3">
                          <div className="rounded-2xl border border-white/20 bg-white/[0.12] p-4 backdrop-blur-sm">
                            <p className="text-sm font-medium text-muted">
                              {activeSlide.panel.eyebrow}
                            </p>
                            <p className="mt-2 text-xl font-semibold leading-tight tracking-tight text-primary">
                              {activeSlide.panel.title}
                            </p>
                            <p className="mt-3 text-sm leading-6 text-secondary">
                              {activeSlide.panel.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {activeSlide.panel.stats.map((stat) => (
                              <div
                                key={`${activeSlide.id}-${stat.label}-mobile`}
                                className="rounded-2xl border border-white/20 bg-white/[0.12] p-3 backdrop-blur-sm"
                              >
                                <p className="text-[11px] uppercase tracking-wide text-muted">
                                  {stat.label}
                                </p>
                                <p className="mt-2 text-sm font-semibold text-primary">
                                  {stat.value}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div
                            className={cn(
                              "rounded-2xl border p-3 text-sm font-medium leading-6",
                              activeSlide.panel.noteClassName ??
                                "border-border bg-surface-secondary text-secondary"
                            )}
                          >
                            {activeSlide.panel.note}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              {!imageMode && activeSlide.panel ? (
                <div className="hidden lg:flex lg:justify-end">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${activeSlide.id}-panel`}
                      initial={panelInitial}
                      animate={panelAnimate}
                      exit={panelExit}
                      transition={slideTransition}
                      className="relative w-full max-w-[390px]"
                    >
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 rounded-[28px] blur-3xl",
                          activeSlide.theme.panelGlowClassName ??
                            "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_38%)]"
                        )}
                      />

                      <div className="relative rounded-[28px] border border-white/24 bg-white/[0.14] p-6 shadow-[0_18px_44px_rgba(2,6,23,0.2)] backdrop-blur-lg">
                        <div className="grid gap-4">
                          <div className="rounded-2xl border border-white/20 bg-white/[0.12] p-4 backdrop-blur-sm">
                            <p className="text-sm font-medium text-muted">
                              {activeSlide.panel.eyebrow}
                            </p>
                            <p className="mt-2 text-[1.85rem] font-semibold leading-tight tracking-tight text-primary">
                              {activeSlide.panel.title}
                            </p>
                            <p className="mt-3 text-sm leading-6 text-secondary">
                              {activeSlide.panel.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {activeSlide.panel.stats.map((stat) => (
                              <div
                                key={`${activeSlide.id}-${stat.label}`}
                                className="rounded-2xl border border-white/20 bg-white/[0.1] p-4 backdrop-blur-sm"
                              >
                                <p className="text-xs uppercase tracking-wide text-muted">
                                  {stat.label}
                                </p>
                                <p className="mt-2 text-lg font-semibold text-primary">
                                  {stat.value}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div
                            className={cn(
                              "rounded-2xl border p-4 text-sm font-medium leading-6",
                              activeSlide.panel.noteClassName ??
                                "border-border bg-surface-secondary text-secondary"
                            )}
                          >
                            {activeSlide.panel.note}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {safeSlides.map((slide, index) => {
          const isActive = index === normalizedActiveIndex;

          return (
            <button
              key={slide.id}
              type="button"
              aria-label={`Ir para slide ${index + 1}`}
              aria-current={isActive ? "true" : "false"}
              onClick={() => goToSlide(index)}
              className={cn(
                "rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                isActive
                  ? "h-2.5 w-7 bg-accent"
                  : "h-2 w-2 bg-slate-300 hover:bg-slate-400"
              )}
            />
          );
        })}
      </div>
    </section>
  );
}

