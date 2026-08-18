import type { FilterKey, Vec3 } from '@/lib/store';

/**
 * Biological content database.
 *
 * All positions are in world units; the cell membrane has radius 5.
 * Anchors are used for label placement and camera focus targets.
 *
 * ACCURACY NOTES (simplifications made for visualization):
 * - A real human cell contains ~1,000–2,000 mitochondria and millions of
 *   ribosomes; we show representative counts so every structure stays
 *   individually inspectable at 60 fps.
 * - Organelles are slightly enlarged relative to the membrane and spaced
 *   further apart than in vivo so they remain distinguishable.
 * - The phospholipid bilayer (~7 nm) is vastly exaggerated in thickness —
 *   at true scale it would be invisible next to a 20 µm cell.
 */

export interface OrganelleInfo {
  id: string;
  name: string;
  scientificName: string;
  filterKey: FilterKey;
  /** Accent color used by labels, UI chips and the selection halo. */
  color: string;
  /** World-space anchor for labels + camera look-at. */
  anchor: Vec3;
  /** Camera distance when this organelle is focused. */
  cameraDistance: number;
  tagline: string;
  description: string;
  function: string;
  structure: string;
  location: string;
  facts: string[];
  related: string[];
}

export const CELL_RADIUS = 5;

export const ORGANELLES: Record<string, OrganelleInfo> = {
  membrane: {
    id: 'membrane',
    name: 'Cell Membrane',
    scientificName: 'Plasma membrane · phospholipid bilayer',
    filterKey: 'membrane',
    color: '#f2a488',
    anchor: [0, CELL_RADIUS, 0],
    cameraDistance: 8.5,
    tagline: 'The cell’s selective, self-healing skin',
    description:
      'A fluid phospholipid bilayer just 7 nm thick that encloses every human cell. Hydrophilic heads face the watery environments inside and out, while hydrophobic tails hide between them, creating a flexible, self-sealing barrier studded with proteins.',
    function:
      'Controls what enters and leaves the cell, receives chemical signals through receptor proteins, and maintains the electrochemical gradients that power nerves and muscles.',
    structure:
      'Two leaflets of phospholipids plus cholesterol, transmembrane channels, ion pumps, glycoproteins and glycolipids that form the glycocalyx on the outer surface.',
    location: 'The outermost boundary of the cell.',
    facts: [
      'The membrane is fluid: individual lipids swap places with neighbors millions of times per second.',
      'Roughly 50% of membrane mass is protein, not lipid.',
      'Membrane lipids are constantly recycled — the entire surface is renewed every few days.',
    ],
    related: ['cytoplasm', 'vesicles', 'endosomes', 'actin-filaments'],
  },
  cytoplasm: {
    id: 'cytoplasm',
    name: 'Cytoplasm',
    scientificName: 'Cytosol + organelles',
    filterKey: 'cytoplasm',
    color: '#8fd3e8',
    anchor: [3.2, -1.4, 1.8],
    cameraDistance: 9,
    tagline: 'The crowded gel where life happens',
    description:
      'Far from empty fluid, the cytosol is a densely packed gel of proteins, ions, metabolites and RNA. Up to 30% of its volume is macromolecules, a crowding that shapes every reaction inside the cell.',
    function:
      'Hosts glycolysis and thousands of other metabolic reactions, cushions organelles, and transports vesicles along cytoskeletal tracks.',
    structure:
      'Water-based gel containing dissolved ions (K⁺, Na⁺, Ca²⁺), enzymes, free ribosomes, cytoskeletal fibers and small molecule metabolites.',
    location: 'Everything between the plasma membrane and the nucleus.',
    facts: [
      'Protein concentration in cytosol can exceed 200 mg/mL — thicker than egg white.',
      'A single enzyme can diffuse across a bacterial cell in milliseconds; in human cells the cytoskeleton actively directs traffic.',
      'Calcium sparks in the cytosol act as one of the cell’s main signaling codes.',
    ],
    related: ['membrane', 'ribosomes', 'microtubules', 'vesicles'],
  },
  nucleus: {
    id: 'nucleus',
    name: 'Nucleus',
    scientificName: 'Nucleus · karyon',
    filterKey: 'nucleus',
    color: '#b79cf0',
    anchor: [-0.95, 0.4, 0.35],
    cameraDistance: 5.2,
    tagline: 'The command center guarding the genome',
    description:
      'The largest organelle, usually 5–10 µm across, storing almost all of the cell’s DNA. Around 2 meters of DNA are folded inside a space one-tenth the width of a human hair.',
    function:
      'Stores and protects the genome, transcribes DNA into RNA, and coordinates growth, division and protein production.',
    structure:
      'A double-membraned envelope perforated by nuclear pores, enclosing chromatin fibers and one or more nucleoli.',
    location: 'Typically near the center of the cell.',
    facts: [
      'If uncoiled, the DNA from one nucleus would stretch about 2 meters.',
      'The nucleus is the reason eukaryotic cells can run complex genetic programs — transcription is physically separated from translation.',
      'Some cells, like red blood cells, eject their nucleus entirely to make room for cargo.',
    ],
    related: ['nuclear-envelope', 'nuclear-pores', 'chromatin', 'nucleolus', 'rer'],
  },
  'nuclear-envelope': {
    id: 'nuclear-envelope',
    name: 'Nuclear Envelope',
    scientificName: 'Karyotheca · double membrane',
    filterKey: 'nucleus',
    color: '#9d86e0',
    anchor: [0.27, 1.5, 0.95],
    cameraDistance: 4.2,
    tagline: 'A double wall with guarded gates',
    description:
      'Two concentric membranes — the outer one continuous with the rough ER — separated by a thin perinuclear space. It isolates the genome while still allowing intense molecular traffic.',
    function:
      'Separates transcription (inside) from translation (outside) and regulates every molecule crossing the nuclear boundary.',
    structure:
      'Inner and outer lipid bilayers joined at nuclear pore complexes, supported underneath by the nuclear lamina, a mesh of intermediate filaments.',
    location: 'Surrounding the nucleus.',
    facts: [
      'The envelope disassembles completely during cell division and rebuilds around each daughter nucleus.',
      'The outer nuclear membrane is literally part of the endoplasmic reticulum.',
      'Lamins that line the envelope are mutated in progeria, a disease of accelerated aging.',
    ],
    related: ['nucleus', 'nuclear-pores', 'rer', 'intermediate-filaments'],
  },
  'nuclear-pores': {
    id: 'nuclear-pores',
    name: 'Nuclear Pores',
    scientificName: 'Nuclear pore complex (NPC)',
    filterKey: 'nucleus',
    color: '#c9b6ff',
    anchor: [-1.95, 1.3, 1.55],
    cameraDistance: 3.2,
    tagline: 'The busiest border crossings in biology',
    description:
      'Massive ~120 MDa protein assemblies that punch through both nuclear membranes. Each pore is built from roughly 30 different proteins arranged with eight-fold symmetry.',
    function:
      'Selectively ferry proteins and RNA between nucleus and cytoplasm — up to 1,000 transport events per pore per second.',
    structure:
      'An eight-fold symmetric complex of ~30 nucleoporin proteins forming a central channel about 40 nm wide.',
    location: 'Embedded across the nuclear envelope, ~2,000–5,000 per nucleus.',
    facts: [
      'Each human nucleus carries thousands of pores — together they move millions of molecules per second.',
      'Viruses like HIV hijack nuclear pores to smuggle their genes into the nucleus.',
      'Small molecules diffuse freely, but anything larger than ~40 kDa needs a transport escort.',
    ],
    related: ['nuclear-envelope', 'nucleus', 'ribosomes'],
  },
  chromatin: {
    id: 'chromatin',
    name: 'Chromatin',
    scientificName: 'DNA–histone complex',
    filterKey: 'nucleus',
    color: '#a27ce8',
    anchor: [-1.45, -0.2, -0.35],
    cameraDistance: 3.6,
    tagline: 'Two meters of DNA, folded with intent',
    description:
      'DNA wound around histone proteins like thread around spools, forming nucleosomes that fold into higher-order fibers. Its folding decides which genes are readable.',
    function:
      'Packages the genome, regulates gene expression, and condenses into chromosomes during cell division.',
    structure:
      'Nucleosome “beads on a string” — 147 bp of DNA per histone octamer — folded into loops, domains and territories.',
    location: 'Filling the nucleoplasm inside the nuclear envelope.',
    facts: [
      'Each nucleosome is a spool of 8 histone proteins with DNA wrapped ~1.7 times around it.',
      'Loosely packed “euchromatin” is active; dense “heterochromatin” is silenced.',
      'During division chromatin condenses ~10,000-fold into visible chromosomes.',
    ],
    related: ['nucleus', 'nucleolus', 'nuclear-pores'],
  },
  nucleolus: {
    id: 'nucleolus',
    name: 'Nucleolus',
    scientificName: 'Nucleolus · “little nucleus”',
    filterKey: 'nucleus',
    color: '#8f6cd9',
    anchor: [-0.65, 0.2, 0.6],
    cameraDistance: 3.0,
    tagline: 'The ribosome factory inside the factory',
    description:
      'A dense, membrane-less droplet inside the nucleus where ribosomal RNA is transcribed and assembled with proteins into ribosomal subunits. It forms through liquid–liquid phase separation, like oil beading in water.',
    function:
      'Produces ribosomal RNA and assembles the small and large ribosomal subunits.',
    structure:
      'Three nested zones (fibrillar center, dense fibrillar component, granular component) with no surrounding membrane.',
    location: 'Inside the nucleus; cells under heavy protein demand grow extra nucleoli.',
    facts: [
      'A busy human cell can produce several thousand ribosomal subunits per minute here.',
      'The nucleolus disassembles during mitosis and reforms around “nucleolar organizer” DNA regions.',
      'Its size is a clinical marker — enlarged nucleoli often signal fast-dividing cancer cells.',
    ],
    related: ['nucleus', 'chromatin', 'ribosomes', 'rer'],
  },
  rer: {
    id: 'rer',
    name: 'Rough Endoplasmic Reticulum',
    scientificName: 'Rough ER · granular ER',
    filterKey: 'er',
    color: '#8fb7e8',
    anchor: [-3.1, -0.7, -0.6],
    cameraDistance: 4.6,
    tagline: 'A folded factory floor dusted with ribosomes',
    description:
      'A vast network of flattened membrane sacs (cisternae) continuous with the nuclear envelope, “rough” because its surface is studded with bound ribosomes that inject newly made proteins straight into its interior.',
    function:
      'Synthesizes, folds and quality-checks secreted and membrane proteins, then ships them to the Golgi in vesicles.',
    structure:
      'Stacked, flattened cisternae connected into one continuous compartment, coated with millions of docked ribosomes.',
    location: 'Radiating outward from the nuclear envelope.',
    facts: [
      'The ER is the largest single membrane system in the cell — its surface area can exceed the plasma membrane 25-fold.',
      'Misfolded proteins trigger the “unfolded protein response”, a stress alarm that can pause the whole cell.',
      'Antibodies pumped out by immune cells are folded and finished here.',
    ],
    related: ['nuclear-envelope', 'ribosomes', 'golgi', 'vesicles', 'ser'],
  },
  ser: {
    id: 'ser',
    name: 'Smooth Endoplasmic Reticulum',
    scientificName: 'Smooth ER · agranular ER',
    filterKey: 'er',
    color: '#e8a4c4',
    anchor: [2.5, -1.9, 1.1],
    cameraDistance: 4.2,
    tagline: 'Tubular workshops for lipids and detox',
    description:
      'A network of branching membrane tubules lacking ribosomes — hence “smooth”. It specializes in lipid synthesis, calcium storage and detoxifying drugs and poisons.',
    function:
      'Builds phospholipids and steroids, stores and releases Ca²⁺, and detoxifies harmful compounds via enzymes like cytochrome P450.',
    structure:
      'Interconnected smooth tubules, continuous with the rough ER but free of ribosomes.',
    location: 'Often adjacent to rough ER and the Golgi; abundant in liver and muscle cells.',
    facts: [
      'In muscle cells the smooth ER is renamed the sarcoplasmic reticulum and floods the cell with calcium to trigger contraction.',
      'Liver cells double their smooth ER when chronically exposed to alcohol or barbiturates.',
      'Every phospholipid in your membranes began life on an enzyme embedded here.',
    ],
    related: ['rer', 'golgi', 'membrane', 'vesicles'],
  },
  golgi: {
    id: 'golgi',
    name: 'Golgi Apparatus',
    scientificName: 'Golgi complex · dictyosome',
    filterKey: 'golgi',
    color: '#e8c47a',
    anchor: [1.9, 1.8, -0.9],
    cameraDistance: 4.4,
    tagline: 'The cell’s post office and finishing school',
    description:
      'A stack of curved, flattened cisternae that receives protein-filled vesicles from the ER, modifies their cargo with sugars, sorts it, and ships it to its final destination.',
    function:
      'Glycosylates proteins and lipids, tags cargo with molecular “address labels”, and buds off secretory, lysosomal and membrane vesicles.',
    structure:
      'Typically 4–8 curved cisternae with a receiving cis face and a shipping trans face, surrounded by budding vesicles.',
    location: 'Usually between the ER and the plasma membrane, near the nucleus.',
    facts: [
      'Discovered by Camillo Golgi in 1898 using a silver stain — scientists argued for 50 years whether it was real.',
      'Cargo moves through the stack in about 20–40 minutes.',
      'The sugar “glycosylation” patterns it adds act like shipping barcodes for proteins.',
    ],
    related: ['rer', 'vesicles', 'lysosomes', 'membrane', 'ser'],
  },
  mitochondria: {
    id: 'mitochondria',
    name: 'Mitochondria',
    scientificName: 'Mitochondrion · “thread granule”',
    filterKey: 'mitochondria',
    color: '#f0955c',
    anchor: [2.9, -0.4, -2.0],
    cameraDistance: 3.4,
    tagline: 'Ancient bacteria that power your life',
    description:
      'Double-membraned organelles descended from free-living bacteria engulfed ~1.5 billion years ago. Their inner membrane folds into cristae where the electron transport chain converts food and oxygen into ATP, the cell’s energy currency.',
    function:
      'Produce ~90% of cellular ATP through oxidative phosphorylation, buffer calcium, and trigger programmed cell death (apoptosis).',
    structure:
      'Smooth outer membrane; inner membrane folded into cristae enclosing the matrix, which holds its own circular DNA and ribosomes.',
    location: 'Scattered through the cytoplasm, clustered where energy demand is high.',
    facts: [
      'You inherit mitochondria almost entirely from your mother.',
      'A single cell can contain over 1,000 mitochondria; muscle cells pack thousands.',
      'They carry their own 16,569-letter circular genome — a fossil of their bacterial origin.',
      'Your body recycles its entire weight in ATP roughly every day.',
    ],
    related: ['cytoplasm', 'ribosomes', 'lysosomes', 'peroxisomes'],
  },
  lysosomes: {
    id: 'lysosomes',
    name: 'Lysosomes',
    scientificName: 'Lysosome · “loosening body”',
    filterKey: 'degradation',
    color: '#c4e05c',
    anchor: [-1.9, -2.9, 1.6],
    cameraDistance: 3.6,
    tagline: 'Acid vats that recycle everything',
    description:
      'Membrane-bound spheres holding ~60 digestive enzymes in an acidic bath (pH ~4.8). They digest worn-out organelles, engulfed bacteria and macromolecules, then release the raw materials for reuse.',
    function:
      'Intracellular digestion, autophagy (recycling damaged parts), and defense against pathogens.',
    structure:
      'Single membrane packed with proton pumps that keep the interior ~100× more acidic than the cytosol, plus acid hydrolase enzymes.',
    location: 'Floating throughout the cytoplasm.',
    facts: [
      'If a lysosome bursts, its acid can digest the cell from inside — a controlled version of this kills cells cleanly in apoptosis.',
      'Tay-Sachs and over 40 other “lysosomal storage diseases” come from a single missing enzyme.',
      'Lysosomes can fuse with the membrane to patch wounds in it.',
    ],
    related: ['golgi', 'vesicles', 'endosomes', 'peroxisomes'],
  },
  peroxisomes: {
    id: 'peroxisomes',
    name: 'Peroxisomes',
    scientificName: 'Peroxisome · microbody',
    filterKey: 'degradation',
    color: '#5ce0d4',
    anchor: [3.1, 0.9, 1.9],
    cameraDistance: 3.4,
    tagline: 'Tiny reactors taming reactive oxygen',
    description:
      'Small single-membrane organelles that oxidize fatty acids and neutralize toxic hydrogen peroxide using the enzyme catalase. They are the cell’s chemical safety officers.',
    function:
      'Break down very-long-chain fatty acids, detoxify hydrogen peroxide, and synthesize plasmalogens (key lipids in myelin).',
    structure:
      'Single membrane enclosing a dense oxidative matrix, often with a crystalline catalase core.',
    location: 'Throughout the cytoplasm, often near mitochondria and the ER.',
    facts: [
      'Catalase inside peroxisomes is one of the fastest enzymes known: ~40 million reactions per second.',
      'In the liver they detoxify about half of the ethanol a person drinks.',
      'Zellweger syndrome, a failure to build peroxisomes, is fatal in infancy — proof of how vital they are.',
    ],
    related: ['lysosomes', 'mitochondria', 'ser'],
  },
  centrioles: {
    id: 'centrioles',
    name: 'Centrioles',
    scientificName: 'Centrosome · diplosome',
    filterKey: 'cytoskeleton',
    color: '#7ad1e0',
    anchor: [1.0, 1.3, 1.6],
    cameraDistance: 2.8,
    tagline: 'Nine-fold symmetric anchors of the skeleton',
    description:
      'A pair of barrel-shaped structures, each built from nine triplets of microtubules, sitting at right angles to each other. Together with surrounding material they form the centrosome, the cell’s main microtubule-organizing center.',
    function:
      'Organize the microtubule cytoskeleton and build the mitotic spindle during cell division; also template cilia and flagella.',
    structure:
      'Two perpendicular barrels (~500 nm long) of nine microtubule triplets embedded in pericentriolar material.',
    location: 'Next to the nucleus, at the heart of the centrosome.',
    facts: [
      'Centrioles duplicate once per cell cycle so each daughter cell inherits exactly one pair.',
      'They convert into basal bodies that anchor motile cilia — like the ones clearing your airways.',
      'Cells with too many centrioles divide chaotically, a hallmark of cancer.',
    ],
    related: ['microtubules', 'nucleus', 'actin-filaments'],
  },
  ribosomes: {
    id: 'ribosomes',
    name: 'Ribosomes',
    scientificName: '80S ribosome · ribonucleoprotein',
    filterKey: 'ribosomes',
    color: '#e8d29a',
    anchor: [-2.4, 1.9, 1.4],
    cameraDistance: 3.0,
    tagline: 'Two-million-strong protein printers',
    description:
      'Molecular machines built of RNA and protein that read messenger RNA and link amino acids into proteins. Free ribosomes float in the cytosol; bound ribosomes stud the rough ER.',
    function:
      'Translate mRNA into protein — a human cell’s millions of ribosomes together add trillions of amino acids per second.',
    structure:
      'A large (60S) and small (40S) subunit, both mostly ribosomal RNA, clamping mRNA between them.',
    location: 'Free in the cytosol or docked on the rough ER and nuclear envelope.',
    facts: [
      'A single human cell holds several million ribosomes.',
      'Ribosomes are made of RNA that *catalyzes* the chemistry — evidence life began in an “RNA world”.',
      'Many antibiotics work by jamming bacterial ribosomes while leaving ours alone.',
    ],
    related: ['nucleolus', 'rer', 'nuclear-pores', 'cytoplasm'],
  },
  vesicles: {
    id: 'vesicles',
    name: 'Transport Vesicles',
    scientificName: 'COPI / COPII / clathrin vesicles',
    filterKey: 'vesicles',
    color: '#f0b08a',
    anchor: [0.4, 1.2, -1.6],
    cameraDistance: 3.2,
    tagline: 'Bubble couriers of the secretory highway',
    description:
      'Small membrane spheres that pinch off one compartment and fuse with another, carrying proteins and lipids between the ER, Golgi, lysosomes and the cell surface.',
    function:
      'Ship cargo along the secretory pathway: ER → Golgi → membrane, and retrieve escaped proteins back again.',
    structure:
      'Lipid bilayer spheres 50–100 nm wide, coated in proteins (clathrin, COPI, COPII) that shape the bud and select cargo.',
    location: 'Constantly budding and fusing along the ER–Golgi–membrane axis.',
    facts: [
      'The 2013 Nobel Prize honored the discovery of how vesicles find the right address.',
      'Vesicles ride motor proteins along microtubules like trucks on a highway.',
      'Neurotransmitters are released by vesicles fusing at the synapse — thought itself runs on vesicles.',
    ],
    related: ['rer', 'golgi', 'membrane', 'endosomes', 'lysosomes'],
  },
  endosomes: {
    id: 'endosomes',
    name: 'Endosomes',
    scientificName: 'Early / late endosome',
    filterKey: 'vesicles',
    color: '#e89aa2',
    anchor: [3.6, -1.2, -0.6],
    cameraDistance: 3.2,
    tagline: 'Sorting hubs for incoming cargo',
    description:
      'Membrane compartments formed after endocytosis that sort internalized material: nutrients go to the cell, pathogens and debris are routed onward to lysosomes for destruction.',
    function:
      'Receive, sort and route endocytosed cargo; recycle receptors back to the surface or condemn them to lysosomes.',
    structure:
      'Tubulovesicular compartments that mature from early (mildly acidic) to late (more acidic) forms before fusing with lysosomes.',
    location: 'Between the plasma membrane and lysosomes.',
    facts: [
      'The LDL receptor is recycled through endosomes ~100 times in its lifetime.',
      'Many viruses — including influenza and SARS-CoV-2 — exploit endosomes as their entry route.',
      'Endosomes acidify as they mature, which triggers cargo to release its receptors.',
    ],
    related: ['membrane', 'lysosomes', 'vesicles', 'golgi'],
  },
  microtubules: {
    id: 'microtubules',
    name: 'Microtubules',
    scientificName: 'Tubulin polymers · 25 nm',
    filterKey: 'cytoskeleton',
    color: '#6fc7d1',
    anchor: [1.6, 0.6, 2.2],
    cameraDistance: 5.0,
    tagline: 'Rigid highways that shape the cell',
    description:
      'Hollow tubes of tubulin protein radiating from the centrosome. They grow and shrink explosively — “dynamic instability” — constantly rebuilding the cell’s internal map.',
    function:
      'Maintain cell shape, position organelles, carry vesicle traffic via kinesin/dynein motors, and form the mitotic spindle.',
    structure:
      '13 protofilaments of α/β-tubulin dimers curled into a hollow 25 nm tube with a fast-growing plus end.',
    location: 'Radiating from the centrosome toward the cell periphery.',
    facts: [
      'Microtubules can grow 2 µm per minute and then catastrophically collapse in seconds.',
      'The chemotherapy drug paclitaxel freezes microtubules, stopping cancer cells mid-division.',
      'Neurons extend microtubule bundles meters long — from spine to toe.',
    ],
    related: ['centrioles', 'actin-filaments', 'intermediate-filaments', 'vesicles'],
  },
  'actin-filaments': {
    id: 'actin-filaments',
    name: 'Actin Filaments',
    scientificName: 'Microfilaments · F-actin · 7 nm',
    filterKey: 'cytoskeleton',
    color: '#e58bb0',
    anchor: [-1.6, 3.4, -1.8],
    cameraDistance: 5.4,
    tagline: 'Muscles of the cytoskeleton',
    description:
      'The thinnest cytoskeletal fibers — two twisted strands of actin — densest just beneath the membrane where they form the cell cortex. They power crawling, shape changes and cytokinesis.',
    function:
      'Generate force for movement, support microvilli, pinch dividing cells in two, and contract muscle fibers.',
    structure:
      'Helical double-stranded polymers of globular actin (G-actin), organized by crosslinkers into bundles and networks.',
    location: 'Concentrated in the cortex under the membrane; also stress fibers across the cell.',
    facts: [
      'Actin is the most abundant protein in most cells — up to 10% of all protein.',
      'The same actin–myosin machinery powers both a crawling cell and a beating heart.',
      'White blood cells chase bacteria by explosively polymerizing actin at their front edge.',
    ],
    related: ['microtubules', 'intermediate-filaments', 'membrane'],
  },
  'intermediate-filaments': {
    id: 'intermediate-filaments',
    name: 'Intermediate Filaments',
    scientificName: 'Keratin / vimentin / lamin · 10 nm',
    filterKey: 'cytoskeleton',
    color: '#b7a3e0',
    anchor: [-2.2, 1.2, -1.9],
    cameraDistance: 5.2,
    tagline: 'The cell’s rope-like safety net',
    description:
      'Tough, rope-like fibers — keratin, vimentin, lamins — that resist stretching and give cells mechanical strength. Unlike microtubules and actin, they are remarkably stable.',
    function:
      'Provide tensile strength, anchor the nucleus and organelles, and form the nuclear lamina beneath the envelope.',
    structure:
      'Fibrous proteins twisted into coiled-coil ropes ~10 nm wide, in tissue-specific varieties (keratin in skin, neurofilaments in neurons).',
    location: 'A cage around the nucleus and a web through the cytoplasm.',
    facts: [
      'Your hair and nails are almost pure intermediate filament (keratin).',
      'Mutations in keratin cause skin to blister from gentle touch (epidermolysis bullosa).',
      'Lamin filaments line the nucleus and help decide which genes are switched off.',
    ],
    related: ['microtubules', 'actin-filaments', 'nuclear-envelope'],
  },
  vacuoles: {
    id: 'vacuoles',
    name: 'Vacuoles',
    scientificName: 'Storage vacuole',
    filterKey: 'vesicles',
    color: '#9adbe8',
    anchor: [-3.3, 1.6, 0.8],
    cameraDistance: 3.4,
    tagline: 'Small storage bubbles',
    description:
      'Membrane-bound sacs that store water, ions and nutrients. Animal cells keep them small and temporary — unlike the giant central vacuole that presses plant cells firm.',
    function:
      'Temporary storage of water, ions and metabolites; assist in waste isolation and osmotic balance.',
    structure: 'A single membrane (tonoplast) enclosing cell sap.',
    location: 'Scattered in the cytoplasm; small and transient in human cells.',
    facts: [
      'Plant vacuoles can fill 90% of the cell; ours stay tiny by comparison.',
      'Contractile vacuoles in freshwater protozoa pump out water so the cell doesn’t burst.',
      'Fat cells are essentially one enormous storage vacuole wrapped in a thin rim of cytoplasm.',
    ],
    related: ['cytoplasm', 'vesicles', 'lysosomes'],
  },
};

export const ORGANELLE_LIST = Object.values(ORGANELLES);

export const FILTER_LABELS: Record<FilterKey, string> = {
  nucleus: 'Nucleus & DNA',
  mitochondria: 'Mitochondria',
  er: 'Endoplasmic Reticulum',
  golgi: 'Golgi Apparatus',
  ribosomes: 'Ribosomes',
  membrane: 'Cell Membrane',
  cytoskeleton: 'Cytoskeleton',
  vesicles: 'Vesicles & Vacuoles',
  degradation: 'Lysosomes & Peroxisomes',
  cytoplasm: 'Cytoplasm',
};
