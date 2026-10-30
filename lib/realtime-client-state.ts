"use client";

import { useSyncExternalStore } from "react";

/**
 * Estado de diagnóstico do tempo real e do emblema do ícone, partilhado entre o sino
 * (que faz a ligação) e o cartão "Estado" da página de notificações.
 */
export type ChannelStatus = "idle" | "ok" | "error";

export interface RealtimeDiag {
  keyPresent: boolean;
  connection: string;
  shared: ChannelStatus;
  sharedError?: string;
  mine: ChannelStatus;
  mineError?: string;
  lastEventAt: number | null;
  lastEventReason?: string;
  badge: {
    supported: boolean;
    lastResult: "none" | "ok" | "error";
    lastCount?: number;
    error?: string;
  };
}

const initial: RealtimeDiag = {
  keyPresent: false,
  connection: "inactivo",
  shared: "idle",
  mine: "idle",
  lastEventAt: null,
  badge: { supported: false, lastResult: "none" },
};

let state: RealtimeDiag = initial;
const listeners = new Set<() => void>();

export function patchRealtimeDiag(patch: Partial<RealtimeDiag>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function patchBadgeDiag(patch: Partial<RealtimeDiag["badge"]>) {
  state = { ...state, badge: { ...state.badge, ...patch } };
  listeners.forEach((l) => l());
}

export function getRealtimeDiag() {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useRealtimeDiag(): RealtimeDiag {
  return useSyncExternalStore(subscribe, getRealtimeDiag, () => initial);
}
