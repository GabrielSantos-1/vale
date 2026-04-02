'use client';

export const PUBLIC_EVENT_NAMES = [
  'cta_click',
  'coverage_check_submitted',
  'coverage_check_result',
  'contact_submit',
  'plan_interest',
] as const;

export type PublicEventName = (typeof PUBLIC_EVENT_NAMES)[number];

export const PUBLIC_EVENT_STATUSES = [
  'click',
  'submitted',
  'success',
  'error',
  'available',
  'unavailable',
] as const;

export type PublicEventStatus = (typeof PUBLIC_EVENT_STATUSES)[number];

type PublicEventPayload = {
  eventName: PublicEventName;
  page: string;
  component: string;
  target?: string;
  status?: PublicEventStatus;
};

const EVENTS_ENDPOINT = '/api/events';

function sendWithFetch(body: string) {
  void fetch(EVENTS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
    cache: 'no-store',
    credentials: 'omit',
  }).catch(() => {
    // No-op: telemetry must never break user flows.
  });
}

export function trackPublicEvent(payload: PublicEventPayload) {
  if (typeof window === 'undefined') return;

  const body = JSON.stringify(payload);

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'application/json' });
    const queued = navigator.sendBeacon(EVENTS_ENDPOINT, blob);

    if (queued) return;
  }

  sendWithFetch(body);
}

