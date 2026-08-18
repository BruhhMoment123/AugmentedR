import type { ThreeEvent } from '@react-three/fiber';
import { useCellStore } from './store';

/**
 * Selection priority logic.
 *
 * The cell membrane and cytoplasm are transparent shells that surround
 * every organelle, so a click aimed at the nucleus actually intersects
 * membrane -> cytoplasm -> nucleus. R3F delivers events to *all*
 * intersected objects (nearest first), which lets each object decide:
 *
 * - "Container" shells (membrane, cytoplasm) only select themselves when
 *   no real organelle sits further down the same ray.
 * - Organelles select themselves only when they are the nearest
 *   organelle on the ray (so two aligned organelles resolve correctly).
 */

/** Ids that behave as transparent "containers" rather than pickable targets. */
const CONTAINERS = new Set(['membrane', 'cytoplasm']);

function organelleIdOf(obj: { userData?: Record<string, unknown> }): string | null {
  const id = obj.userData?.organelleId;
  return typeof id === 'string' ? id : null;
}

/** Returns the id that should win the pick for this event, given the caller's id. */
export function resolvePick(e: ThreeEvent<PointerEvent | MouseEvent>, myId: string): string | null {
  const hits = e.intersections ?? [];
  if (!hits.length) return null;
  // Organelles always beat container shells; among containers the nearest
  // wins. Every object on the ray computes the same winner, so exactly one
  // handler fires its action.
  const firstOrganelle = hits.find((h) => {
    const id = organelleIdOf(h.object);
    return id !== null && !CONTAINERS.has(id);
  });
  const winner = firstOrganelle
    ? organelleIdOf(firstOrganelle.object)
    : organelleIdOf(hits[0].object);
  return winner === myId ? myId : null;
}

/** Standard click handler for any organelle mesh/group. */
export function handleOrganelleClick(e: ThreeEvent<MouseEvent>, myId: string) {
  e.stopPropagation();
  const winner = resolvePick(e, myId);
  if (winner === myId) {
    useCellStore.getState().select(myId);
  }
}

/** Standard hover handler — only the winning object sets the hover state. */
export function handleOrganelleHover(e: ThreeEvent<PointerEvent>, myId: string, entering: boolean) {
  e.stopPropagation();
  const store = useCellStore.getState();
  if (!entering) {
    if (store.hoveredId === myId) store.setHovered(null);
    return;
  }
  const winner = resolvePick(e, myId);
  if (winner === myId) store.setHovered(myId);
}

/** Convenience: spreads userData + handlers onto any R3F element. */
export function pickable(id: string) {
  return {
    userData: { organelleId: id },
    onClick: (e: ThreeEvent<MouseEvent>) => handleOrganelleClick(e, id),
    onPointerOver: (e: ThreeEvent<PointerEvent>) => handleOrganelleHover(e, id, true),
    onPointerOut: (e: ThreeEvent<PointerEvent>) => handleOrganelleHover(e, id, false),
  };
}
