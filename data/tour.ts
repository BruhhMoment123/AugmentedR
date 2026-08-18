import type { Vec3 } from '@/lib/store';

/**
 * Guided tour script. Each stop flies the camera to an organelle and shows
 * a narration card. Written so a voice-over track can be attached later
 * (each step carries a `narration` string of spoken-style text).
 */
export interface TourStep {
  organelleId: string | null;
  title: string;
  narration: string;
  cameraPosition: Vec3;
  lookAt: Vec3;
}

export const TOUR_STEPS: TourStep[] = [
  {
    organelleId: null,
    title: 'Welcome inside a human cell',
    narration:
      'You are looking at a living human cell, magnified roughly ten thousand times. Every structure you see is procedurally modeled from real cell biology. Let’s take a tour.',
    cameraPosition: [0, 2.1, 12.4],
    lookAt: [0, 0, 0],
  },
  {
    organelleId: 'membrane',
    title: 'The plasma membrane',
    narration:
      'We begin at the surface: a fluid bilayer of phospholipids, studded with channels, pumps and receptors. It is only seven nanometers thick, yet it decides everything that enters or leaves.',
    cameraPosition: [0, 6.8, 6.2],
    lookAt: [0, 3.4, 0],
  },
  {
    organelleId: 'cytoplasm',
    title: 'The crowded cytoplasm',
    narration:
      'Inside, the cytosol is a gel packed with proteins, ions and RNA. Watch the particles drift — real cytoplasm is constantly stirred by Brownian motion.',
    cameraPosition: [5.6, -1.6, 6.4],
    lookAt: [2.4, -1.0, 1.4],
  },
  {
    organelleId: 'nucleus',
    title: 'The nucleus',
    narration:
      'At the heart of the cell sits the nucleus, guardian of two meters of DNA. Its double envelope is pierced by thousands of nuclear pores — the busiest gates in biology.',
    cameraPosition: [-2.6, 1.9, 5.4],
    lookAt: [-0.95, 0.4, 0.35],
  },
  {
    organelleId: 'chromatin',
    title: 'Chromatin and the nucleolus',
    narration:
      'Within the nucleus, DNA winds around histone spools as chromatin. The dense core you see is the nucleolus, where ribosomes are born.',
    cameraPosition: [-0.4, 0.2, 4.4],
    lookAt: [-1.1, 0.1, 0.1],
  },
  {
    organelleId: 'rer',
    title: 'The rough endoplasmic reticulum',
    narration:
      'Hugging the nucleus, these folded sheets are dusted with ribosomes — that is what makes them “rough”. New proteins are threaded straight into the ER to be folded and checked.',
    cameraPosition: [-4.6, 0.8, 3.4],
    lookAt: [-3.1, -0.7, -0.6],
  },
  {
    organelleId: 'golgi',
    title: 'The Golgi apparatus',
    narration:
      'Vesicles carry those proteins to the Golgi stack — the cell’s post office. Here cargo is sugar-coated, barcoded and shipped to its final address.',
    cameraPosition: [4.4, 3.6, 2.6],
    lookAt: [1.9, 1.8, -0.9],
  },
  {
    organelleId: 'mitochondria',
    title: 'The mitochondria',
    narration:
      'These amber powerhouses were once free-living bacteria. Zoom close: inside, folded cristae membranes host the electron transport chain that mints ATP, glowing as energy flows.',
    cameraPosition: [4.6, 0.6, -0.2],
    lookAt: [2.9, -0.4, -2.0],
  },
  {
    organelleId: 'lysosomes',
    title: 'Lysosomes and peroxisomes',
    narration:
      'The recycling crew. Acidic lysosomes digest worn-out parts, while peroxisomes neutralize dangerous reactive oxygen with some of the fastest enzymes known.',
    cameraPosition: [-1.4, -3.4, 5.2],
    lookAt: [-1.9, -2.9, 1.6],
  },
  {
    organelleId: 'microtubules',
    title: 'The cytoskeleton',
    narration:
      'Finally, notice the scaffolding: microtubules radiate from the centrioles, actin weaves a cortex under the membrane, and intermediate filaments rope everything together.',
    cameraPosition: [3.2, 2.4, 6.8],
    lookAt: [0.8, 0.8, 1.4],
  },
  {
    organelleId: null,
    title: 'Explore freely',
    narration:
      'The tour is over, but the cell is alive. Slice it open, explode it, zoom into a mitochondrion, or click anything that glows. Enjoy exploring.',
    cameraPosition: [0, 2.1, 12.4],
    lookAt: [0, 0, 0],
  },
];
