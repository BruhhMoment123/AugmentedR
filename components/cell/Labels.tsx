'use client';

import { useMemo } from 'react';
import { Vector3 } from 'three';
import { Html, Line } from '@react-three/drei';
import { ORGANELLE_LIST, type OrganelleInfo } from '@/data/organelles';
import { useCellStore } from '@/lib/store';

/**
 * Annotation layer. Every organelle gets a leader line + floating glass
 * label anchored to its database position. Three density modes:
 * none / basic (name) / detailed (name + tagline + scientific name).
 *
 * Labels are HTML overlays (crisp text, zero texture memory) with pointer
 * events disabled so orbiting works straight through them.
 */
export function Labels() {
  const labelMode = useCellStore((s) => s.labelMode);
  if (labelMode === 'none') return null;
  return (
    <>
      {ORGANELLE_LIST.map((info) => (
        <OrganelleLabel key={info.id} info={info} detailed={labelMode === 'detailed'} />
      ))}
    </>
  );
}

function OrganelleLabel({ info, detailed }: { info: OrganelleInfo; detailed: boolean }) {
  const filter = useCellStore((s) => s.filter);
  const selected = useCellStore((s) => s.selectedId === info.id);
  const hovered = useCellStore((s) => s.hoveredId === info.id);
  const select = useCellStore((s) => s.select);

  const { anchor, labelPos } = useMemo(() => {
    const anchor = new Vector3(...info.anchor);
    const dir = anchor.clone().normalize();
    // Keep near-center labels (nucleolus etc.) readable: push them outward
    // along their anchor direction, minimum length to avoid the nucleus.
    const labelPos = anchor.clone().addScaledVector(dir, 1.55);
    if (labelPos.length() < 3.2) labelPos.setLength(3.2);
    return { anchor, labelPos };
  }, [info]);

  if (filter !== null && info.filterKey !== filter) return null;

  const active = selected || hovered;

  return (
    <group>
      {/* Anchor dot on the organelle surface */}
      <mesh position={anchor}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color={info.color} transparent opacity={active ? 1 : 0.7} depthWrite={false} />
      </mesh>
      {/* Leader line */}
      <Line
        points={[anchor, labelPos]}
        color={info.color}
        transparent
        opacity={active ? 0.9 : 0.35}
        lineWidth={active ? 1.6 : 1}
        depthWrite={false}
      />
      {/* Floating label chip (clickable — selects the organelle) */}
      <Html
        position={labelPos}
        center
        distanceFactor={9}
        zIndexRange={[30, 0]}
        style={{ pointerEvents: 'none', transition: 'opacity 0.3s' }}
      >
        <div
          className={`cell-label ${active ? 'cell-label--active' : ''}`}
          style={{ ['--label-color' as string]: info.color, pointerEvents: 'auto', cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          title={`Explore ${info.name}`}
          onClick={(e) => {
            e.stopPropagation();
            select(info.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              select(info.id);
            }
          }}
        >
          <span className="cell-label__dot" />
          <div className="cell-label__body">
            <span className="cell-label__name">{info.name}</span>
            {detailed && (
              <>
                <span className="cell-label__sci">{info.scientificName}</span>
                <span className="cell-label__tag">{info.tagline}</span>
              </>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}
