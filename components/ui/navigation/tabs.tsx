"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  ...props
}: TabsProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <div
        className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-border bg-surface p-1"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-surface-secondary text-primary shadow-sm"
                  : "text-secondary hover:text-primary"
              )}
            >
              {tab.label}
              {tab.count !== undefined ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs",
                    isActive
                      ? "bg-surface-tertiary text-secondary"
                      : "text-muted"
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
