import { create } from 'zustand';

export type Vec3 = [number, number, number];

export type LabelMode = 'none' | 'basic' | 'detailed';

/** Filter categories shown in the "Isolate structure" menu. */
export type FilterKey =
  | 'nucleus'
  | 'mitochondria'
  | 'er'
  | 'golgi'
  | 'ribosomes'
  | 'membrane'
  | 'cytoskeleton'
  | 'vesicles'
  | 'degradation'
  | 'cytoplasm';

export interface FlightRequest {
  position: Vec3;
  lookAt: Vec3;
  /** Incremented per request so identical targets still retrigger a flight. */
  key: number;
}

interface CellState {
  hoveredId: string | null;
  selectedId: string | null;
  /** Single-category isolation filter (null = show everything). */
  filter: FilterKey | null;
  labelMode: LabelMode;
  xray: boolean;
  wireframe: boolean;
  exploded: boolean;
  autoRotate: boolean;
  animationsPaused: boolean;
  sliceEnabled: boolean;
  /** World-space X position of the slicing plane (-CELL_R-1 .. CELL_R+1). */
  slicePosition: number;
  tourActive: boolean;
  tourStep: number;
  flight: FlightRequest | null;
  /** Debug values driven by the Leva panel. */
  debug: { bloom: number; breathing: number; particleDensity: number };

  setHovered: (id: string | null) => void;
  select: (id: string | null) => void;
  setFilter: (f: FilterKey | null) => void;
  cycleLabelMode: () => void;
  toggleXray: () => void;
  toggleWireframe: () => void;
  toggleExploded: () => void;
  toggleAutoRotate: () => void;
  toggleAnimationsPaused: () => void;
  setSliceEnabled: (v: boolean) => void;
  setSlicePosition: (v: number) => void;
  requestFlight: (position: Vec3, lookAt: Vec3) => void;
  clearFlight: () => void;
  startTour: () => void;
  endTour: () => void;
  setTourStep: (step: number) => void;
  setDebug: (patch: Partial<CellState['debug']>) => void;
  resetView: () => void;
}

/** Home camera framing — also used by the reset button. */
export const HOME_POSITION: Vec3 = [0, 2.1, 12.4];
export const HOME_TARGET: Vec3 = [0, 0, 0];

let flightKey = 0;

export const useCellStore = create<CellState>((set, get) => ({
  hoveredId: null,
  selectedId: null,
  filter: null,
  labelMode: 'basic',
  xray: false,
  wireframe: false,
  exploded: false,
  autoRotate: true,
  animationsPaused: false,
  sliceEnabled: false,
  slicePosition: 0,
  tourActive: false,
  tourStep: 0,
  flight: null,
  debug: { bloom: 1.0, breathing: 1.0, particleDensity: 1.0 },

  setHovered: (id) => set({ hoveredId: id }),
  select: (id) => set({ selectedId: id }),
  setFilter: (filter) => set({ filter }),
  cycleLabelMode: () =>
    set((s) => ({
      labelMode: s.labelMode === 'none' ? 'basic' : s.labelMode === 'basic' ? 'detailed' : 'none',
    })),
  toggleXray: () => set((s) => ({ xray: !s.xray })),
  toggleWireframe: () => set((s) => ({ wireframe: !s.wireframe })),
  toggleExploded: () => set((s) => ({ exploded: !s.exploded })),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  toggleAnimationsPaused: () => set((s) => ({ animationsPaused: !s.animationsPaused })),
  setSliceEnabled: (v) => set({ sliceEnabled: v }),
  setSlicePosition: (v) => set({ slicePosition: v }),
  requestFlight: (position, lookAt) =>
    set({ flight: { position, lookAt, key: ++flightKey }, autoRotate: false }),
  clearFlight: () => set({ flight: null }),
  startTour: () => set({ tourActive: true, tourStep: 0, autoRotate: false }),
  endTour: () => set({ tourActive: false }),
  setTourStep: (step) => set({ tourStep: step }),
  setDebug: (patch) => set((s) => ({ debug: { ...s.debug, ...patch } })),
  resetView: () => {
    get().requestFlight(HOME_POSITION, HOME_TARGET);
    set({ selectedId: null });
  },
}));
