import { state, notify } from "./store";

type Fn = (on: boolean) => void;
const subs = new Set<Fn>();

export function isPrescient(): boolean {
  return state.prescience;
}

export function setPrescience(on: boolean): void {
  if (state.prescience === on) return;
  state.prescience = on;
  if (typeof document !== "undefined") {
    if (on) document.documentElement.setAttribute("data-prescience", "on");
    else document.documentElement.removeAttribute("data-prescience");
  }
  for (const fn of subs) fn(on);
  notify();
}

export function onPrescience(fn: Fn): () => void {
  subs.add(fn);
  return () => subs.delete(fn);
}
