import {
  computeBandStructure,
  computeRealSpacePotential,
  computeWavefunctionField,
  freeElectronEnergies,
  xPointGap,
} from "./solver.js";

const controls = {
  potentialType: document.querySelector("#potentialType"),
  latticeType: document.querySelector("#latticeType"),
  basisType: document.querySelector("#basisType"),
  wellDepth: document.querySelector("#wellDepth"),
  sigma: document.querySelector("#sigma"),
  radius: document.querySelector("#radius"),
  latticeConstant: document.querySelector("#latticeConstant"),
  fillFraction: document.querySelector("#fillFraction"),
  nMax: document.querySelector("#nMax"),
  autoConverge: document.querySelector("#autoConverge"),
  pointsPerSegment: document.querySelector("#pointsPerSegment"),
  bandsToPlot: document.querySelector("#bandsToPlot"),
  showFree: document.querySelector("#showFree"),
  emergenceLambda: document.querySelector("#emergenceLambda"),
  emergencePlay: document.querySelector("#emergencePlay"),
  presetNearlyFree: document.querySelector("#presetNearlyFree"),
  presetGapOpening: document.querySelector("#presetGapOpening"),
  presetStrongLocalization: document.querySelector("#presetStrongLocalization"),
  graphenePreset: document.querySelector("#graphenePreset"),
  resetDefaults: document.querySelector("#resetDefaults"),
  inspectBoundaryLower: document.querySelector("#inspectBoundaryLower"),
  inspectBoundaryUpper: document.querySelector("#inspectBoundaryUpper"),
  showPotentialView: document.querySelector("#showPotentialView"),
  showWavefunctionView: document.querySelector("#showWavefunctionView"),
  mobileTabBands: document.querySelector("#mobileTabBands"),
  mobileTabRealSpace: document.querySelector("#mobileTabRealSpace"),
  mobileTabNotes: document.querySelector("#mobileTabNotes"),
  mobileStateClose: document.querySelector("#mobileStateClose"),
  mobileStatePotential: document.querySelector("#mobileStatePotential"),
  mobileStateWavefunction: document.querySelector("#mobileStateWavefunction"),
  mobileStateDensity: document.querySelector("#mobileStateDensity"),
  mobileStateReal: document.querySelector("#mobileStateReal"),
  mobileStatePhase: document.querySelector("#mobileStatePhase"),
  waveModeDensity: document.querySelector("#waveModeDensity"),
  waveModeReal: document.querySelector("#waveModeReal"),
  waveModePhase: document.querySelector("#waveModePhase"),
  guideStepPreset: document.querySelector("#guideStepPreset"),
  guideStepInspect: document.querySelector("#guideStepInspect"),
  guideStepSelect: document.querySelector("#guideStepSelect"),
  guideStepCompare: document.querySelector("#guideStepCompare"),
};

const potentialPanels = {
  fill: document.querySelector("#fillControl"),
  sigma: document.querySelector("#sigmaControl"),
  radius: document.querySelector("#radiusControl"),
};

const latticePanels = {
  basisType: document.querySelector("#basisTypeControl"),
};

const readouts = {
  potentialType: document.querySelector("[data-readout='potentialType']"),
  latticeType: document.querySelector("[data-readout='latticeType']"),
  basisType: document.querySelector("[data-readout='basisType']"),
  wellDepth: document.querySelector("[data-readout='wellDepth']"),
  sigma: document.querySelector("[data-readout='sigma']"),
  radius: document.querySelector("[data-readout='radius']"),
  latticeConstant: document.querySelector("[data-readout='latticeConstant']"),
  fillFraction: document.querySelector("[data-readout='fillFraction']"),
  nMax: document.querySelector("[data-readout='nMax']"),
  pointsPerSegment: document.querySelector("[data-readout='pointsPerSegment']"),
  bandsToPlot: document.querySelector("[data-readout='bandsToPlot']"),
  lambda: document.querySelector("[data-readout='lambda']"),
  gap: document.querySelector("#gapReadout"),
  gapCaption: document.querySelector("#gapCaption"),
  matrix: document.querySelector("#matrixReadout"),
  status: document.querySelector("#statusReadout"),
  hover: document.querySelector("#hoverReadout"),
  gapDetail: document.querySelector("#gapDetailReadout"),
  lowestBandMin: document.querySelector("#lowestBandMinReadout"),
  bandwidth: document.querySelector("#bandwidthReadout"),
  explanation: document.querySelector("#dynamicExplanation"),
  explanationDetail: document.querySelector("#dynamicExplanationDetail"),
  explanationTryNext: document.querySelector("#dynamicTryNext"),
  teachingStateBanner: document.querySelector("#teachingStateBanner"),
  convergenceWarning: document.querySelector("#convergenceWarning"),
  autoConvergenceStatus: document.querySelector("#autoConvergenceStatus"),
  autoConvergenceDelta: document.querySelector("#autoConvergenceDelta"),
  autoConvergenceTolerance: document.querySelector("#autoConvergenceTolerance"),
  autoConvergenceResult: document.querySelector("#autoConvergenceResult"),
  potentialCaption: document.querySelector("#potentialCaption"),
  realSpaceTitle: document.querySelector("#realSpaceTitle"),
  selectionLabel: document.querySelector("#realSpaceSelectionLabel"),
  gapLabel: document.querySelector("#gapLabel"),
  gapDetailLabel: document.querySelector("#gapDetailLabel"),
  kPathHint: document.querySelector("#kPathHint"),
  pathSegmentLabel0: document.querySelector("#pathSegmentLabel0"),
  pathSegmentLabel1: document.querySelector("#pathSegmentLabel1"),
  pathSegmentLabel2: document.querySelector("#pathSegmentLabel2"),
  pathSegmentDescription0: document.querySelector("#pathSegmentDescription0"),
  pathSegmentDescription1: document.querySelector("#pathSegmentDescription1"),
  pathSegmentDescription2: document.querySelector("#pathSegmentDescription2"),
  selectedStateSummary: document.querySelector("#selectedStateSummary"),
  inspectionTitle: document.querySelector("#inspectionTitle"),
  inspectionMode: document.querySelector("#inspectionMode"),
  inspectionSegment: document.querySelector("#inspectionSegment"),
  inspectionKPoint: document.querySelector("#inspectionKPoint"),
  inspectionEnergy: document.querySelector("#inspectionEnergy"),
  inspectionView: document.querySelector("#inspectionView"),
  inspectionPrompt: document.querySelector("#inspectionPrompt"),
  boundaryZoomLabel: document.querySelector("#boundaryZoomLabel"),
  boundaryZoomCaption: document.querySelector("#boundaryZoomCaption"),
  boundaryStateReadout: document.querySelector("#boundaryStateReadout"),
  boundaryStateNote: document.querySelector("#boundaryStateNote"),
  mobileGap: document.querySelector("#mobileGapReadout"),
  mobileNMax: document.querySelector("#mobileNMaxReadout"),
  mobileDelta: document.querySelector("#mobileDeltaReadout"),
  mobileStatus: document.querySelector("#mobileStatusReadout"),
  mobileStatePanel: document.querySelector("#mobileStatePanel"),
  mobileStateTitle: document.querySelector("#mobileStateTitle"),
  mobileStateSummary: document.querySelector("#mobileStateSummary"),
  guideStatus: document.querySelector("#guideStatus"),
  guideExplanation: document.querySelector("#guideExplanation"),
};

const bandCanvas = document.querySelector("#bandCanvas");
const potentialCanvas = document.querySelector("#potentialCanvas");
const boundaryZoomCanvas = document.querySelector("#boundaryZoomCanvas");
const bandPanel = document.querySelector("#bandPanel");
const realSpacePanel = document.querySelector("#realSpacePanel");
const notesPanel = document.querySelector("#notesPanel");
const inspectionCard = document.querySelector(".inspection-card");
const mobilePanels = {
  bands: bandPanel,
  realSpace: realSpacePanel,
  notes: notesPanel,
};
const bandTooltip = document.querySelector("#bandTooltip");
const bandContext = bandCanvas.getContext("2d");
const potentialContext = potentialCanvas.getContext("2d");
const boundaryZoomContext = boundaryZoomCanvas.getContext("2d");

const defaults = {
  potentialType: "square",
  latticeType: "square",
  basisType: "single",
  wellDepth: 2,
  sigma: 0.18,
  radius: 0.22,
  latticeConstant: 1,
  fillFraction: 0.5,
  nMax: 2,
  autoConverge: false,
  pointsPerSegment: 32,
  bandsToPlot: 8,
  showFree: true,
};

const CONVERGENCE_RELATIVE_THRESHOLD = 0.05;
const AUTO_CONVERGENCE_TOLERANCE = 1e-3;
const AUTO_CONVERGENCE_MAX_NMAX = 10;
let lastBandPlot = null;
let emergenceFrame = null;
let lastRenderResult = null;
let selectedBandState = null;
let realSpaceMode = "potential";
let wavefunctionMode = "density";
let mobileActiveTab = "bands";
let wavefunctionCache = new Map();
let lastWavefunctionCacheKey = "";
let autoConvergenceCache = new Map();
let activePreset = null;

function currentConfig() {
  const lambda = Number(controls.emergenceLambda.value);
  const latticeType = controls.latticeType.value;
  const basisType = latticeType === "hexagonal" ? controls.basisType.value : "single";
  return {
    type: controls.potentialType.value,
    latticeType,
    basisType,
    wellDepth: Number(controls.wellDepth.value) * lambda,
    targetWellDepth: Number(controls.wellDepth.value),
    sigma: Number(controls.sigma.value),
    radius: Number(controls.radius.value),
    lambda,
    latticeConstant: Number(controls.latticeConstant.value),
    fillFraction: Number(controls.fillFraction.value),
    nMax: Number(controls.nMax.value),
    pointsPerSegment: Number(controls.pointsPerSegment.value),
  };
}

function zoneBoundaryLabel(config) {
  return config.latticeType === "hexagonal" ? "K" : "X";
}

function pathGuideContent(config) {
  if (config.latticeType === "hexagonal") {
    return [
      ["Γ → K", "Move toward the hexagonal zone corner where Dirac-like features would emerge with a multi-site basis."],
      ["K → M", "Travel along the hexagonal boundary while the boundary splitting persists."],
      ["M → Γ", "Return to the zone center where symmetry is restored."],
    ];
  }
  return [
    ["Γ → X", "Approach the Brillouin-zone boundary."],
    ["X → M", "Stay on the boundary while band splitting persists."],
    ["M → Γ", "Return to the zone center where the gap closes."],
  ];
}

function updatePathGuide(config) {
  const content = pathGuideContent(config);
  readouts.pathSegmentLabel0.textContent = content[0][0];
  readouts.pathSegmentLabel1.textContent = content[1][0];
  readouts.pathSegmentLabel2.textContent = content[2][0];
  readouts.pathSegmentDescription0.textContent = content[0][1];
  readouts.pathSegmentDescription1.textContent = content[1][1];
  readouts.pathSegmentDescription2.textContent = content[2][1];
  readouts.kPathHint.textContent =
    config.latticeType === "hexagonal" ? "Sampling along Γ → K → M → Γ." : "Sampling along Γ → X → M → Γ.";
}

function setPanelVisibility(element, isVisible) {
  element.hidden = !isVisible;
  element.setAttribute("aria-hidden", String(!isVisible));
  element.style.display = isVisible ? "" : "none";
}

function updatePotentialPanelVisibility(potentialType) {
  setPanelVisibility(potentialPanels.fill, potentialType === "square");
  setPanelVisibility(potentialPanels.sigma, potentialType === "gaussian");
  setPanelVisibility(potentialPanels.radius, potentialType === "muffin-tin");
}

function updateBasisControl(config) {
  const showBasis = config.latticeType === "hexagonal";
  setPanelVisibility(latticePanels.basisType, showBasis);
  if (!showBasis && controls.basisType.value !== "single") {
    controls.basisType.value = "single";
  }
}

function updateReadouts(config) {
  readouts.potentialType.textContent = config.type;
  readouts.latticeType.textContent = config.latticeType;
  readouts.basisType.textContent = config.basisType === "graphene" ? "graphene-like two-site" : "single-site";
  readouts.wellDepth.textContent = Number(controls.wellDepth.value).toFixed(2);
  readouts.sigma.textContent = Number(controls.sigma.value).toFixed(2);
  readouts.radius.textContent = Number(controls.radius.value).toFixed(2);
  readouts.latticeConstant.textContent = config.latticeConstant.toFixed(2);
  readouts.fillFraction.textContent = config.fillFraction.toFixed(2);
  readouts.nMax.textContent = String(config.nMax);
  readouts.pointsPerSegment.textContent = String(config.pointsPerSegment);
  readouts.bandsToPlot.textContent = String(controls.bandsToPlot.value);
  readouts.lambda.textContent = config.lambda.toFixed(2);
  readouts.matrix.textContent = `${(2 * config.nMax + 1) ** 2} × ${(2 * config.nMax + 1) ** 2}`;
  controls.nMax.disabled = controls.autoConverge.checked;
  updatePotentialPanelVisibility(config.type);
  updateBasisControl(config);
  updatePathGuide(config);
  const boundaryLabel = zoneBoundaryLabel(config);
  readouts.gapLabel.textContent = `${boundaryLabel}-point gap`;
  readouts.gapDetailLabel.textContent = `${boundaryLabel}-point gap`;
  readouts.gapCaption.textContent =
    config.latticeType === "hexagonal" && config.basisType === "graphene"
      ? `${boundaryLabel}-point splitting in the graphene-like two-site basis.`
      : `${boundaryLabel}-point gap from Bragg splitting in the periodic potential.`;
  readouts.potentialCaption.textContent =
    config.type === "gaussian"
      ? `${config.basisType === "graphene" ? "Two Gaussian wells" : "Centered Gaussian well"} in one ${config.latticeType} unit-cell window.`
      : config.type === "muffin-tin"
        ? `${config.basisType === "graphene" ? "Two circular wells" : "Centered circular well"} in one ${config.latticeType} unit-cell window.`
        : `${config.basisType === "graphene" ? "Two square wells" : "Centered square well"} in one ${config.latticeType} unit-cell window.`;
  readouts.autoConvergenceStatus.textContent = `n_max = ${config.nMax} (size = ${basisSizeFromNMax(config.nMax)})`;
  readouts.autoConvergenceTolerance.textContent = `tol = ${formatConvergenceValue(AUTO_CONVERGENCE_TOLERANCE)}`;
  readouts.autoConvergenceResult.textContent = controls.autoConverge.checked ? "Converging..." : "Manual mode";
}

function derivedQuantities(result, gap) {
  const firstBand = result.eigenvalues.map((row) => row[0]);
  const lowest = Math.min(...firstBand);
  const highest = Math.max(...firstBand);
  return {
    xGap: gap,
    lowestBandMinimum: lowest,
    firstBandBandwidth: highest - lowest,
  };
}

function computeGapConvergence(config, currentGap) {
  const refinedGap = xPointGap({ ...config, nMax: config.nMax + 1 });
  const scale = Math.max(Math.abs(refinedGap), 1e-6);
  return {
    currentGap,
    refinedGap,
    delta: Math.abs(refinedGap - currentGap),
    relativeDifference: Math.abs(refinedGap - currentGap) / scale,
  };
}

function superscriptDigits(value) {
  const map = {
    "-": "⁻",
    0: "⁰",
    1: "¹",
    2: "²",
    3: "³",
    4: "⁴",
    5: "⁵",
    6: "⁶",
    7: "⁷",
    8: "⁸",
    9: "⁹",
  };
  return String(value)
    .split("")
    .map((char) => map[char] ?? char)
    .join("");
}

function formatDeltaGap(delta) {
  if (!Number.isFinite(delta)) return "--";
  if (delta === 0) return "0";
  if (delta < 1e-3) {
    const exponent = Math.floor(Math.log10(delta));
    const mantissa = delta / 10 ** exponent;
    return `${mantissa.toFixed(1)}×10${superscriptDigits(exponent)}`;
  }
  return delta.toFixed(4);
}

function formatConvergenceValue(value) {
  return formatDeltaGap(value);
}

function basisSizeFromNMax(nMax) {
  return (2 * nMax + 1) ** 2;
}

const PRESET_GUIDES = {
  nearlyFree: {
    label: "Nearly Free",
    explanation:
      "Look for bands that stay close to the free-electron overlay. Then raise the potential strength to see where a real boundary gap begins.",
  },
  gapOpening: {
    label: "Gap Opening",
    explanation:
      "Watch the X-point zoom and compare the exact boundary states. This preset is the cleanest regime for seeing Bragg splitting open a gap.",
  },
  strongLocalization: {
    label: "Strong Localization",
    explanation:
      "After selecting a low band, inspect the real-space panel. Deeper wells should localize density more strongly and flatten the lowest bands.",
  },
  grapheneNearDirac: {
    label: "Graphene near-Dirac",
    explanation:
      "Focus on the K-point zoom and the two exact K states. This preset is tuned to make the graphene-like near-touching pair easy to inspect.",
  },
};

function autoConvergenceKey(config) {
  return JSON.stringify({
    type: config.type,
    latticeType: config.latticeType,
    basisType: config.basisType,
    wellDepth: Number(config.wellDepth.toFixed(6)),
    latticeConstant: Number(config.latticeConstant.toFixed(6)),
    fillFraction: Number(config.fillFraction.toFixed(6)),
    sigma: Number(config.sigma.toFixed(6)),
    radius: Number(config.radius.toFixed(6)),
    startNMax: config.nMax,
  });
}

function findAutoConvergedBasis(config) {
  const key = autoConvergenceKey(config);
  if (autoConvergenceCache.has(key)) {
    return autoConvergenceCache.get(key);
  }

  let previousGap = null;
  let currentNMax = config.nMax;
  let currentGap = xPointGap({ ...config, nMax: currentNMax });
  let converged = false;

  while (currentNMax < AUTO_CONVERGENCE_MAX_NMAX) {
    const nextNMax = currentNMax + 1;
    const nextGap = xPointGap({ ...config, nMax: nextNMax });
    if (Math.abs(nextGap - currentGap) < AUTO_CONVERGENCE_TOLERANCE) {
      currentNMax = nextNMax;
      currentGap = nextGap;
      converged = true;
      break;
    }
    previousGap = currentGap;
    currentNMax = nextNMax;
    currentGap = nextGap;
  }

  const result = {
    nMax: currentNMax,
    gap: currentGap,
    converged,
    previousGap,
    delta: previousGap === null ? 0 : Math.abs(currentGap - previousGap),
  };
  autoConvergenceCache.set(key, result);
  return result;
}

function updatePhysicsExplanation(config, quantities, convergence) {
  if (config.latticeType === "hexagonal" && config.basisType === "graphene") {
    if (config.lambda < 0.02) {
      readouts.explanation.textContent = "With the graphene-like two-site basis turned off by λ = 0, the spectrum is still folded free-electron motion.";
      readouts.explanationDetail.textContent =
        "As λ grows, the A/B basis phase begins to matter at K and can drive the lowest bands toward a near-touching cone.";
      readouts.explanationTryNext.textContent =
        "Play the emergence slider or use Graphene near-Dirac, then inspect the two exact K states to see the lowest pair start to split.";
    } else if (quantities.xGap < 0.05) {
      readouts.explanation.textContent = "The two-site hexagonal basis is producing a small K-point gap, close to graphene-like cone formation.";
      readouts.explanationDetail.textContent =
        "In the ideal honeycomb limit the K-point gap closes exactly; here the finite potential and truncated basis leave a small residual splitting.";
      readouts.explanationTryNext.textContent =
        selectedBandState
          ? "Keep the selected state pinned, then compare the lower and upper exact K states and switch between |u_k|², Re(u_k), and arg(u_k)."
          : "Click one of the two lowest K-region bands or use the exact K-state buttons to compare the near-Dirac pair directly.";
    } else {
      readouts.explanation.textContent = "The graphene-like two-site basis now mixes A/B sublattice phases and reshapes the K-point bands.";
      readouts.explanationDetail.textContent =
        "Reducing V0 or narrowing the wells usually pushes the two lowest bands closer together at K and makes the cone more graphene-like.";
      readouts.explanationTryNext.textContent =
        "Lower the well depth or narrow the Gaussian width, then watch the K-point zoom to see whether the two lowest bands move closer together.";
    }
  } else if (config.lambda < 0.02) {
    readouts.explanation.textContent = "λ = 0 gives the free-electron limit: folded E = k² bands with no zone-boundary gap.";
    readouts.explanationDetail.textContent =
      "At the zone boundary there is no periodic scattering yet, so the crossing states remain degenerate.";
    readouts.explanationTryNext.textContent =
      "Raise λ or choose Gap Opening so the periodic potential can start mixing the boundary states.";
  } else if (config.wellDepth > 0.05 && quantities.xGap > 1e-4) {
    readouts.explanation.textContent =
      config.type === "gaussian"
        ? "A smooth periodic Gaussian still opens a zone-boundary gap by coupling Bloch states."
        : config.type === "muffin-tin"
          ? "A circular muffin-tin well opens a zone-boundary gap by scattering Bloch waves."
          : "Band gap opens due to Bragg reflection at the Brillouin-zone boundary.";
    readouts.explanationDetail.textContent =
      `At ${zoneBoundaryLabel(config)}, states that differ by one reciprocal-lattice vector mix strongly, so one combination shifts up and the other shifts down.`;
    readouts.explanationTryNext.textContent =
      selectedBandState
        ? `Use the exact ${zoneBoundaryLabel(config)} comparison and inspect the selected wavefunction to see how the split standing-wave pattern changes across the gap.`
        : `Use Gap Opening or click one of the two lowest ${zoneBoundaryLabel(config)} states to compare the split pair directly.`;
  } else {
    readouts.explanation.textContent = "At V0 = 0, bands follow folded free-electron E = k² curves.";
    readouts.explanationDetail.textContent =
      "The periodic potential is too weak to split the boundary crossing appreciably, so the spectrum still looks nearly free-electron.";
    readouts.explanationTryNext.textContent =
      "Start with Nearly Free, then increase V0 slightly and watch for the first visible opening at the boundary.";
  }
  if (controls.autoConverge.checked) {
    return;
  }
  const showWarning =
    convergence.delta > AUTO_CONVERGENCE_TOLERANCE &&
    convergence.relativeDifference > CONVERGENCE_RELATIVE_THRESHOLD &&
    config.nMax < AUTO_CONVERGENCE_MAX_NMAX;
  readouts.convergenceWarning.hidden = !showWarning;
  readouts.convergenceWarning.textContent =
    `Warning: basis convergence may be insufficient. ` +
    `Relative gap change is ${(100 * convergence.relativeDifference).toFixed(2)}% at n_max = ${config.nMax}.`;
}

function resizeCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return rect;
}

function boundaryZoomData(result, config) {
  const boundaryLabel = zoneBoundaryLabel(config);
  const boundaryPoint = result.labels.find(([label]) => label === boundaryLabel);
  if (!boundaryPoint) return null;

  const centerIndex = result.distances.reduce(
    (best, distance, index) =>
      Math.abs(distance - boundaryPoint[1]) < Math.abs(result.distances[best] - boundaryPoint[1]) ? index : best,
    0,
  );
  const radius = Math.max(3, Math.min(8, Math.floor(config.pointsPerSegment / 3)));
  return {
    boundaryLabel,
    centerIndex,
    startIndex: Math.max(0, centerIndex - radius),
    endIndex: Math.min(result.kPoints.length - 1, centerIndex + radius),
  };
}

function inspectBoundaryState(bandIndex) {
  const config = currentConfig();
  const result = lastRenderResult;
  if (!result) return;
  const zoom = boundaryZoomData(result, config);
  if (!zoom || bandIndex < 0 || bandIndex > 1) return;
  selectedBandState = { kIndex: zoom.centerIndex, bandIndex, gridSize: 64 };
  wavefunctionCache.delete(`${zoom.centerIndex}:${bandIndex}:64`);
  realSpaceMode = "wavefunction";
  setMobileTab("realSpace");
  render();
}

function heatmapColor(value, minValue, maxValue) {
  const t = maxValue === minValue ? 0 : (value - minValue) / (maxValue - minValue);
  const r = Math.round(233 - t * 225);
  const g = Math.round(216 - t * 155);
  const b = Math.round(166 - t * 47);
  return `rgb(${r}, ${g}, ${b})`;
}

function densityColor(value, minValue, maxValue) {
  const span = Math.max(maxValue - minValue, 1e-12);
  const normalized = (value - minValue) / span;
  const clamped = Math.max(0, Math.min(1, normalized));
  const r = Math.round(18 + clamped * 235);
  const g = Math.round(54 + clamped * 193);
  const b = Math.round(122 - clamped * 60);
  return `rgb(${r}, ${g}, ${b})`;
}

function divergingRealColor(value, minValue, maxValue) {
  const scale = Math.max(Math.abs(minValue), Math.abs(maxValue), 1e-9);
  const t = Math.max(-1, Math.min(1, value / scale));
  if (t >= 0) {
    const mix = t;
    return `rgb(${Math.round(248 - mix * 34)}, ${Math.round(242 - mix * 167)}, ${Math.round(236 - mix * 182)})`;
  }
  const mix = -t;
  return `rgb(${Math.round(235 - mix * 206)}, ${Math.round(241 - mix * 128)}, ${Math.round(247 - mix * 38)})`;
}

function cyclicPhaseColor(value) {
  const hue = (((value + Math.PI) / (2 * Math.PI)) * 360) % 360;
  return `hsl(${hue}, 72%, 56%)`;
}

function drawGridHeatmap(grid, caption, sublabel, options = {}) {
  const rect = resizeCanvas(potentialCanvas);
  const width = rect.width;
  const height = rect.height;
  const size = grid.length;
  const cell = Math.min(width, height) * 0.78;
  const x0 = (width - cell) / 2;
  const y0 = (height - cell) / 2;
  const pixel = cell / size;
  const minValue = Math.min(...grid.flat());
  const maxValue = Math.max(...grid.flat());

  potentialContext.clearRect(0, 0, width, height);
  potentialContext.fillStyle = "#fbf7ee";
  potentialContext.fillRect(0, 0, width, height);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      potentialContext.fillStyle = options.colorFn
        ? options.colorFn(grid[y][x], minValue, maxValue)
        : heatmapColor(grid[y][x], minValue, maxValue);
      potentialContext.fillRect(x0 + x * pixel, y0 + y * pixel, pixel + 0.3, pixel + 0.3);
    }
  }

  potentialContext.strokeStyle = "#2d2926";
  potentialContext.lineWidth = 1.2;
  potentialContext.strokeRect(x0, y0, cell, cell);
  potentialContext.fillStyle = "#2d2926";
  potentialContext.font = "13px Georgia, serif";
  potentialContext.textAlign = "center";
  potentialContext.fillText(caption, width / 2, y0 + cell + 26);
  potentialContext.fillText(sublabel, width / 2, y0 - 14);

  if (options.colorbarLabel) {
    const barWidth = Math.min(180, cell * 0.46);
    const barHeight = 10;
    const barX = width / 2 - barWidth / 2;
    const barY = y0 + cell + 44;
    const gradient = potentialContext.createLinearGradient(barX, 0, barX + barWidth, 0);
    for (let stop = 0; stop <= 12; stop += 1) {
      const t = stop / 12;
      const value = (options.colorbarMin ?? 0) + t * ((options.colorbarMax ?? 1) - (options.colorbarMin ?? 0));
      gradient.addColorStop(
        t,
        options.colorFn
          ? options.colorFn(value, options.colorbarMin ?? 0, options.colorbarMax ?? 1)
          : heatmapColor(value, options.colorbarMin ?? 0, options.colorbarMax ?? 1),
      );
    }
    potentialContext.fillStyle = gradient;
    potentialContext.fillRect(barX, barY, barWidth, barHeight);
    potentialContext.strokeStyle = "#2d2926";
    potentialContext.lineWidth = 0.8;
    potentialContext.strokeRect(barX, barY, barWidth, barHeight);
    potentialContext.fillStyle = "#2d2926";
    potentialContext.font = "11px Trebuchet MS, sans-serif";
    potentialContext.textAlign = "left";
    potentialContext.fillText(options.colorbarStartLabel ?? "0", barX, barY + 26);
    potentialContext.textAlign = "right";
    potentialContext.fillText(options.colorbarEndLabel ?? "1", barX + barWidth, barY + 26);
    potentialContext.textAlign = "center";
    potentialContext.fillText(options.colorbarLabel, width / 2, barY + 26);
  }
}


function drawBandPlot(result, config) {
  const rect = resizeCanvas(bandCanvas);
  const width = rect.width;
  const height = rect.height;
  const margin = { left: 58, right: 18, top: 22, bottom: 46 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const bandsToPlot = Math.min(Number(controls.bandsToPlot.value), result.eigenvalues[0].length);

  const plotted = result.eigenvalues.flatMap((row) => row.slice(0, bandsToPlot));
  if (controls.showFree.checked) {
    plotted.push(...result.kPoints.flatMap((kPoint) => freeElectronEnergies(config, kPoint).slice(0, bandsToPlot)));
  }
  const yMin = Math.min(...plotted);
  const yMax = Math.max(...plotted);
  const padding = Math.max(0.5, (yMax - yMin) * 0.08);
  const domainMin = yMin - padding;
  const domainMax = yMax + padding;
  const xMax = result.distances[result.distances.length - 1];

  const xScale = (x) => margin.left + (x / xMax) * plotWidth;
  const yScale = (y) => margin.top + ((domainMax - y) / (domainMax - domainMin)) * plotHeight;
  const boundaryLabel = zoneBoundaryLabel(config);
  const xPointLabel = result.labels.find(([label]) => label === boundaryLabel);
  const mPointLabel = result.labels.find(([label]) => label === "M");
  const xPointIndex = xPointLabel
    ? result.distances.reduce(
        (best, distance, index) =>
          Math.abs(distance - xPointLabel[1]) < Math.abs(result.distances[best] - xPointLabel[1]) ? index : best,
        0,
      )
    : -1;
  bandContext.clearRect(0, 0, width, height);
  bandContext.fillStyle = "#fbf7ee";
  bandContext.fillRect(0, 0, width, height);

  const segmentOverlays = [
    { start: result.labels[0]?.[1] ?? 0, end: xPointLabel?.[1] ?? 0, color: "rgba(8, 61, 119, 0.05)" },
    { start: xPointLabel?.[1] ?? 0, end: mPointLabel?.[1] ?? 0, color: "rgba(217, 93, 57, 0.05)" },
    { start: mPointLabel?.[1] ?? 0, end: result.labels[result.labels.length - 1]?.[1] ?? xMax, color: "rgba(4, 114, 77, 0.05)" },
  ];

  for (const segment of segmentOverlays) {
    const startX = xScale(segment.start);
    const endX = xScale(segment.end);
    bandContext.fillStyle = segment.color;
    bandContext.fillRect(startX, margin.top, endX - startX, plotHeight);
  }

  if (xPointIndex >= 0 && result.eigenvalues[xPointIndex].length > 1) {
    const x = xScale(result.distances[xPointIndex]);
    const yTop = yScale(result.eigenvalues[xPointIndex][1]);
    const yBottom = yScale(result.eigenvalues[xPointIndex][0]);
    bandContext.fillStyle = "rgba(217, 93, 57, 0.16)";
    bandContext.fillRect(x - 9, Math.min(yTop, yBottom), 18, Math.abs(yBottom - yTop));
    bandContext.strokeStyle = "rgba(217, 93, 57, 0.82)";
    bandContext.lineWidth = 2.2;
    bandContext.beginPath();
    bandContext.moveTo(x, margin.top);
    bandContext.lineTo(x, margin.top + plotHeight);
    bandContext.stroke();
  }

  bandContext.strokeStyle = "#d8cbb5";
  bandContext.lineWidth = 1;
  for (const [, position] of result.labels) {
    const x = xScale(position);
    bandContext.beginPath();
    bandContext.moveTo(x, margin.top);
    bandContext.lineTo(x, margin.top + plotHeight);
    bandContext.stroke();
  }

  bandContext.strokeStyle = "#ebdfca";
  for (let i = 0; i <= 4; i += 1) {
    const y = margin.top + (i / 4) * plotHeight;
    bandContext.beginPath();
    bandContext.moveTo(margin.left, y);
    bandContext.lineTo(margin.left + plotWidth, y);
    bandContext.stroke();
  }

  if (controls.showFree.checked) {
    bandContext.setLineDash([5, 5]);
    bandContext.strokeStyle = "rgba(78, 92, 107, 0.45)";
    for (let band = 0; band < bandsToPlot; band += 1) {
      bandContext.beginPath();
      result.kPoints.forEach((kPoint, index) => {
        const value = freeElectronEnergies(config, kPoint)[band];
        const x = xScale(result.distances[index]);
        const y = yScale(value);
        if (index === 0) bandContext.moveTo(x, y);
        else bandContext.lineTo(x, y);
      });
      bandContext.stroke();
    }
    bandContext.setLineDash([]);
  }

  const palette = ["#083d77", "#d95d39", "#04724d", "#7a306c", "#0f7c8a", "#a35d00", "#5d5f71", "#0b6e4f"];
  for (let band = 0; band < bandsToPlot; band += 1) {
    bandContext.strokeStyle = palette[band % palette.length];
    bandContext.lineWidth = 1.8;
    bandContext.beginPath();
    result.eigenvalues.forEach((row, index) => {
      const x = xScale(result.distances[index]);
      const y = yScale(row[band]);
      if (index === 0) bandContext.moveTo(x, y);
      else bandContext.lineTo(x, y);
    });
    bandContext.stroke();
  }

  if (
    selectedBandState &&
    selectedBandState.kIndex < result.distances.length &&
    selectedBandState.bandIndex < bandsToPlot
  ) {
    const selectedX = xScale(result.distances[selectedBandState.kIndex]);
    const selectedY = yScale(result.eigenvalues[selectedBandState.kIndex][selectedBandState.bandIndex]);
    bandContext.fillStyle = "rgba(255, 250, 240, 0.96)";
    bandContext.strokeStyle = "#2d2926";
    bandContext.lineWidth = 2.4;
    bandContext.beginPath();
    bandContext.arc(selectedX, selectedY, 5.5, 0, 2 * Math.PI);
    bandContext.fill();
    bandContext.stroke();
    bandContext.fillStyle = "#d95d39";
    bandContext.beginPath();
    bandContext.arc(selectedX, selectedY, 2.5, 0, 2 * Math.PI);
    bandContext.fill();
  }

  bandContext.fillStyle = "#2d2926";
  bandContext.font = "13px Georgia, serif";
  bandContext.textAlign = "center";
  for (const [label, position] of result.labels) {
    bandContext.fillText(label, xScale(position), height - 18);
  }

  bandContext.font = "11px Trebuchet MS, sans-serif";
  bandContext.fillStyle = "#6f655c";
  if (xPointLabel) {
    bandContext.fillText("zone boundary begins", xScale((0 + xPointLabel[1]) / 2), margin.top + 14);
  }
  if (xPointLabel && mPointLabel) {
    bandContext.fillText(
      "boundary segment",
      xScale((xPointLabel[1] + mPointLabel[1]) / 2),
      margin.top + 14,
    );
  }
  if (mPointLabel) {
    bandContext.fillText("return to Γ", xScale((mPointLabel[1] + xMax) / 2), margin.top + 14);
  }

  if (xPointIndex >= 0) {
    const x = xScale(result.distances[xPointIndex]);
    bandContext.fillStyle = "#d95d39";
    bandContext.font = "700 12px Trebuchet MS, sans-serif";
    bandContext.fillText(`${boundaryLabel} gap`, x, margin.top + 30);
  }

  bandContext.save();
  bandContext.translate(18, margin.top + plotHeight / 2);
  bandContext.rotate(-Math.PI / 2);
  bandContext.textAlign = "center";
  bandContext.fillText("Energy (scaled units)", 0, 0);
  bandContext.restore();

  lastBandPlot = {
    result,
    bandsToPlot,
    xScale,
    yScale,
    margin,
    plotWidth,
    plotHeight,
    domainMin,
    domainMax,
  };
}

function drawBoundaryZoom(result, config) {
  const zoom = boundaryZoomData(result, config);
  const rect = resizeCanvas(boundaryZoomCanvas);
  const width = rect.width;
  const height = rect.height;
  const margin = { left: 42, right: 14, top: 18, bottom: 28 };

  boundaryZoomContext.clearRect(0, 0, width, height);
  boundaryZoomContext.fillStyle = "#fbf7ee";
  boundaryZoomContext.fillRect(0, 0, width, height);

  if (!zoom) {
    readouts.boundaryZoomLabel.textContent = "Zone-boundary zoom";
    readouts.boundaryZoomCaption.textContent = "Boundary-point view unavailable for this path.";
    readouts.boundaryStateReadout.textContent = "Exact boundary-point comparison unavailable for this path.";
    readouts.boundaryStateNote.textContent =
      "Compare the two lowest boundary states to see how periodic scattering splits them.";
    controls.inspectBoundaryLower.disabled = true;
    controls.inspectBoundaryUpper.disabled = true;
    return;
  }

  const { boundaryLabel, centerIndex, startIndex, endIndex } = zoom;
  const indices = Array.from({ length: endIndex - startIndex + 1 }, (_, offset) => startIndex + offset);
  const distances = indices.map((index) => result.distances[index]);
  const firstTwoBands = indices.flatMap((index) => result.eigenvalues[index].slice(0, 2));
  const minDistance = distances[0];
  const maxDistance = distances[distances.length - 1];
  const xSpan = Math.max(maxDistance - minDistance, 1e-9);
  const yMin = Math.min(...firstTwoBands);
  const yMax = Math.max(...firstTwoBands);
  const padding = Math.max(0.05, (yMax - yMin) * 0.15);
  const domainMin = yMin - padding;
  const domainMax = yMax + padding;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xScale = (distance) => margin.left + ((distance - minDistance) / xSpan) * plotWidth;
  const yScale = (energy) => margin.top + ((domainMax - energy) / (domainMax - domainMin)) * plotHeight;

  boundaryZoomContext.strokeStyle = "#ebdfca";
  boundaryZoomContext.lineWidth = 1;
  for (let row = 0; row <= 3; row += 1) {
    const y = margin.top + (row / 3) * plotHeight;
    boundaryZoomContext.beginPath();
    boundaryZoomContext.moveTo(margin.left, y);
    boundaryZoomContext.lineTo(width - margin.right, y);
    boundaryZoomContext.stroke();
  }

  const centerX = xScale(result.distances[centerIndex]);
  boundaryZoomContext.fillStyle = "rgba(217, 93, 57, 0.12)";
  boundaryZoomContext.fillRect(centerX - 10, margin.top, 20, plotHeight);
  boundaryZoomContext.strokeStyle = "rgba(217, 93, 57, 0.82)";
  boundaryZoomContext.lineWidth = 1.8;
  boundaryZoomContext.beginPath();
  boundaryZoomContext.moveTo(centerX, margin.top);
  boundaryZoomContext.lineTo(centerX, margin.top + plotHeight);
  boundaryZoomContext.stroke();

  const palette = ["#083d77", "#d95d39"];
  for (let band = 0; band < 2; band += 1) {
    boundaryZoomContext.strokeStyle = palette[band];
    boundaryZoomContext.lineWidth = 2;
    boundaryZoomContext.beginPath();
    indices.forEach((index, pointOffset) => {
      const x = xScale(result.distances[index]);
      const y = yScale(result.eigenvalues[index][band]);
      if (pointOffset === 0) boundaryZoomContext.moveTo(x, y);
      else boundaryZoomContext.lineTo(x, y);
    });
    boundaryZoomContext.stroke();
  }

  if (
    selectedBandState &&
    selectedBandState.bandIndex < 2 &&
    selectedBandState.kIndex >= startIndex &&
    selectedBandState.kIndex <= endIndex
  ) {
    const x = xScale(result.distances[selectedBandState.kIndex]);
    const y = yScale(result.eigenvalues[selectedBandState.kIndex][selectedBandState.bandIndex]);
    boundaryZoomContext.fillStyle = "rgba(255, 250, 240, 0.96)";
    boundaryZoomContext.strokeStyle = "#2d2926";
    boundaryZoomContext.lineWidth = 2;
    boundaryZoomContext.beginPath();
    boundaryZoomContext.arc(x, y, 5, 0, 2 * Math.PI);
    boundaryZoomContext.fill();
    boundaryZoomContext.stroke();
    boundaryZoomContext.fillStyle = "#d95d39";
    boundaryZoomContext.beginPath();
    boundaryZoomContext.arc(x, y, 2.3, 0, 2 * Math.PI);
    boundaryZoomContext.fill();
  }

  boundaryZoomContext.fillStyle = "#083d77";
  boundaryZoomContext.font = '11px "Trebuchet MS", sans-serif';
  boundaryZoomContext.textAlign = "left";
  boundaryZoomContext.fillText("band 1", margin.left, margin.top - 4);
  boundaryZoomContext.textAlign = "right";
  boundaryZoomContext.fillStyle = "#d95d39";
  boundaryZoomContext.fillText("band 2", width - margin.right, margin.top - 4);

  readouts.boundaryZoomLabel.textContent = `${boundaryLabel}-point zoom`;
  readouts.boundaryZoomCaption.textContent =
    `Lowest two bands near ${boundaryLabel}. This is the local view where ${config.latticeType === "hexagonal" ? "graphene-like" : "gap-opening"} behavior is easiest to inspect.`;
  const lowerEnergy = result.eigenvalues[centerIndex][0];
  const upperEnergy = result.eigenvalues[centerIndex][1];
  const delta = upperEnergy - lowerEnergy;
  readouts.boundaryStateReadout.textContent =
    `Exact ${boundaryLabel} comparison: band 1 = ${lowerEnergy.toFixed(5)}, band 2 = ${upperEnergy.toFixed(5)}, ΔE(${boundaryLabel}) = ${delta.toExponential(3)}.`;
  readouts.boundaryStateNote.textContent =
    config.latticeType === "hexagonal" && config.basisType === "graphene"
      ? `These two lowest states at ${boundaryLabel} show the near-Dirac splitting directly. Compare their periodic wavefunctions to see how the two-site basis mixes sublattice character.`
      : `These two lowest states at ${boundaryLabel} show the zone-boundary splitting directly. Compare their periodic wavefunctions to see how Bragg reflection separates the standing-wave patterns.`;
  controls.inspectBoundaryLower.disabled = false;
  controls.inspectBoundaryUpper.disabled = false;
}

function drawPotential(config) {
  const potential = computeRealSpacePotential(config, 90);
  const potentialLabel =
    config.type === "gaussian"
      ? `${config.basisType === "graphene" ? "two-site Gaussian basis" : "gaussian peak"}: V = -${config.wellDepth.toFixed(2)}, σ = ${config.sigma.toFixed(2)}`
      : config.type === "muffin-tin"
        ? `${config.basisType === "graphene" ? "two-site muffin-tin basis" : "circle interior"}: V = -${config.wellDepth.toFixed(2)}, R = ${config.radius.toFixed(2)}`
        : `${config.basisType === "graphene" ? "two-site square basis" : "inside well"}: V = -${config.wellDepth.toFixed(2)}`;
  drawGridHeatmap(potential, `one ${config.latticeType} unit-cell window`, potentialLabel);
}

function wavefunctionCacheKey(config) {
  return JSON.stringify({
    type: config.type,
    latticeType: config.latticeType,
    basisType: config.basisType,
    wellDepth: Number(config.wellDepth.toFixed(6)),
    latticeConstant: Number(config.latticeConstant.toFixed(6)),
    fillFraction: Number(config.fillFraction.toFixed(6)),
    sigma: Number(config.sigma.toFixed(6)),
    radius: Number(config.radius.toFixed(6)),
    nMax: config.nMax,
    pointsPerSegment: config.pointsPerSegment,
  });
}

function getWavefunctionFieldData(config, result, selection) {
  const key = `${selection.kIndex}:${selection.bandIndex}:${selection.gridSize || 64}`;
  if (!wavefunctionCache.has(key)) {
    wavefunctionCache.set(
      key,
      computeWavefunctionField(
        config,
        result.kPoints[selection.kIndex],
        result.eigenvectors[selection.kIndex][selection.bandIndex],
        selection.gridSize || 64,
      ),
    );
  }
  return wavefunctionCache.get(key);
}

function normalizeSymmetricGrid(grid) {
  const scale = Math.max(...grid.flat().map((value) => Math.abs(value)), 1e-9);
  return grid.map((row) => row.map((value) => value / scale));
}

function formatDensityLegendValue(value) {
  if (!Number.isFinite(value)) return "--";
  if (Math.abs(value) >= 0.1) return value.toFixed(2);
  if (Math.abs(value) >= 0.01) return value.toFixed(3);
  return value.toExponential(1).replace("e", "×10^");
}

function selectedSegmentLabel(result, kIndex) {
  if (!result?.labels?.length || kIndex < 0 || kIndex >= result.distances.length) return "--";
  const distance = result.distances[kIndex];
  for (let index = 0; index < result.labels.length - 1; index += 1) {
    const [startLabel, startDistance] = result.labels[index];
    const [endLabel, endDistance] = result.labels[index + 1];
    if (distance >= startDistance - 1e-9 && distance <= endDistance + 1e-9) {
      return `${startLabel} → ${endLabel}`;
    }
  }
  return result.labels[result.labels.length - 1]?.[0] ?? "--";
}

function describeInspectionMode(config) {
  if (realSpaceMode === "potential") return "Potential";
  if (wavefunctionMode === "real") return "Re(u_k)";
  if (wavefunctionMode === "phase") return "arg(u_k)";
  return config.basisType === "graphene" ? "|u_k|²" : "|u_k|²";
}

function updateSelectedStateSummary(config, result) {
  if (!selectedBandState || !result) {
    readouts.selectedStateSummary.textContent = "Click a band to pin a state and inspect its wavefunction.";
    readouts.inspectionTitle.textContent = "No state selected";
    readouts.inspectionMode.textContent = "Potential view";
    readouts.inspectionSegment.textContent = "--";
    readouts.inspectionKPoint.textContent = "--";
    readouts.inspectionEnergy.textContent = "--";
    readouts.inspectionView.textContent = "Potential";
    readouts.inspectionPrompt.textContent =
      "Click a band to pin a state, then inspect its periodic wavefunction or compare the exact X/K states.";
    readouts.teachingStateBanner.textContent =
      "No band is pinned yet. Start with a preset, then click a band to connect the band plot, real-space panel, and exact X/K comparison.";
    return;
  }

  const { kIndex, bandIndex } = selectedBandState;
  const [kx, ky] = result.kPoints[kIndex];
  const energy = result.eigenvalues[kIndex][bandIndex];
  const basisLabel = config.basisType === "graphene" ? "graphene-like two-site" : "single-site";
  const segment = selectedSegmentLabel(result, kIndex);
  const modeLabel = describeInspectionMode(config);
  readouts.selectedStateSummary.textContent =
    `Selected band ${bandIndex + 1} on ${segment} | ` +
    `k-index ${kIndex} | k=(${kx.toFixed(3)}, ${ky.toFixed(3)}) | ` +
    `E=${energy.toFixed(4)} | ${config.latticeType} lattice, ${basisLabel} basis`;
  readouts.inspectionTitle.textContent = `Band ${bandIndex + 1} at k-index ${kIndex}`;
  readouts.inspectionMode.textContent = realSpaceMode === "wavefunction" ? "Wavefunction view" : "Potential view";
  readouts.inspectionSegment.textContent = segment;
  readouts.inspectionKPoint.textContent = `(${kx.toFixed(3)}, ${ky.toFixed(3)})`;
  readouts.inspectionEnergy.textContent = energy.toFixed(4);
  readouts.inspectionView.textContent = modeLabel;
  readouts.inspectionPrompt.textContent =
    realSpaceMode === "wavefunction"
      ? `Inspect ${modeLabel} for this state, then compare the lower and upper exact ${zoneBoundaryLabel(config)} states to see how the split pair differs.`
      : `Switch to Show Wavefunction to inspect ${modeLabel} for this selected state.`;
  readouts.teachingStateBanner.textContent =
    `Pinned state: band ${bandIndex + 1} on ${segment} at k = (${kx.toFixed(3)}, ${ky.toFixed(3)}), E = ${energy.toFixed(4)}. ` +
    `${realSpaceMode === "wavefunction" ? `You are viewing ${modeLabel}.` : "Switch to Wavefunction to connect this band to its periodic real-space structure."}`;
}

function updateSelectionEmphasis() {
  const hasSelection = Boolean(selectedBandState);
  inspectionCard.classList.toggle("is-selected", hasSelection);
  inspectionCard.classList.toggle("is-awaiting", !hasSelection);
  bandPanel.classList.toggle("has-selection", hasSelection);
  realSpacePanel.classList.toggle("has-selection", hasSelection);
  notesPanel.classList.toggle("has-selection", hasSelection);
}

function updatePresetCards() {
  controls.presetNearlyFree.classList.toggle("is-active", activePreset === "nearlyFree");
  controls.presetGapOpening.classList.toggle("is-active", activePreset === "gapOpening");
  controls.presetStrongLocalization.classList.toggle("is-active", activePreset === "strongLocalization");
  controls.graphenePreset.classList.toggle("is-active", activePreset === "grapheneNearDirac");
}

function updateGuideStrip(config) {
  const boundaryLabel = zoneBoundaryLabel(config);
  let step = 1;
  let status = "Step 1 of 4: choose a preset.";
  let explanation = "Use a preset first. The fastest path is: preset → hover → click a band → compare the exact X/K states.";

  if (activePreset) {
    step = 2;
    const preset = PRESET_GUIDES[activePreset];
    status = `Step 2 of 4: inspect the ${preset.label} band plot.`;
    explanation = preset.explanation;
  }

  if (selectedBandState && lastRenderResult) {
    step = 3;
    const [kx, ky] = lastRenderResult.kPoints[selectedBandState.kIndex];
    status = `Step 3 of 4: band ${selectedBandState.bandIndex + 1} is pinned at k = (${kx.toFixed(3)}, ${ky.toFixed(3)}).`;
    explanation =
      `Use ${realSpaceMode === "wavefunction" ? "the wavefunction panel" : "Show Wavefunction"} to inspect the periodic part u_k(x,y), then compare the exact ${boundaryLabel} states below the plot.`;
  }

  if (selectedBandState && realSpaceMode === "wavefunction") {
    step = 4;
    status = `Step 4 of 4: compare the exact ${boundaryLabel} states with the current wavefunction view.`;
    explanation =
      `Now compare the lower and upper exact ${boundaryLabel} states. Use |u_k|², Re(u_k), and arg(u_k) to see how the periodic part changes across the split pair.`;
  }

  readouts.guideStatus.textContent = status;
  readouts.guideExplanation.textContent = explanation;
  controls.guideStepPreset.classList.toggle("is-active", step === 1);
  controls.guideStepInspect.classList.toggle("is-active", step === 2);
  controls.guideStepSelect.classList.toggle("is-active", step === 3);
  controls.guideStepCompare.classList.toggle("is-active", step === 4);
}

function setMobileTab(tab) {
  mobileActiveTab = tab;
  controls.mobileTabBands.classList.toggle("is-active", tab === "bands");
  controls.mobileTabRealSpace.classList.toggle("is-active", tab === "realSpace");
  controls.mobileTabNotes.classList.toggle("is-active", tab === "notes");
  mobilePanels.bands.classList.toggle("is-mobile-hidden", tab !== "bands");
  mobilePanels.realSpace.classList.toggle("is-mobile-hidden", tab !== "realSpace");
  mobilePanels.notes.classList.toggle("is-mobile-hidden", tab !== "notes");
}

function updateMobileStatePanel(config, result) {
  if (!selectedBandState || !result) {
    readouts.mobileStatePanel.hidden = true;
    return;
  }

  const { kIndex, bandIndex } = selectedBandState;
  const [kx, ky] = result.kPoints[kIndex];
  const energy = result.eigenvalues[kIndex][bandIndex];
  const boundaryLabel = zoneBoundaryLabel(config);
  const basisLabel = config.basisType === "graphene" ? "graphene-like two-site" : "single-site";

  readouts.mobileStatePanel.hidden = false;
  readouts.mobileStateTitle.textContent = `Band ${bandIndex + 1} at k-point ${kIndex}`;
  readouts.mobileStateSummary.textContent =
    `k=(${kx.toFixed(3)}, ${ky.toFixed(3)}) | E=${energy.toFixed(4)} | ` +
    `${config.latticeType} lattice, ${basisLabel} basis. Use Wavefunction to inspect ${boundaryLabel}-point structure.`;

  controls.mobileStatePotential.classList.toggle("is-active", realSpaceMode === "potential");
  controls.mobileStateWavefunction.classList.toggle("is-active", realSpaceMode === "wavefunction");
  controls.mobileStateDensity.classList.toggle("is-active", wavefunctionMode === "density");
  controls.mobileStateReal.classList.toggle("is-active", wavefunctionMode === "real");
  controls.mobileStatePhase.classList.toggle("is-active", wavefunctionMode === "phase");
}

function drawRealSpaceView(config, result) {
  if (realSpaceMode === "wavefunction" && selectedBandState) {
    const field = getWavefunctionFieldData(config, result, selectedBandState);
    const bandNumber = selectedBandState.bandIndex + 1;
    const pointIndex = selectedBandState.kIndex;
    const [kx, ky] = result.kPoints[selectedBandState.kIndex];
    if (wavefunctionMode === "real") {
      readouts.realSpaceTitle.textContent = `Re(u_k) for band ${bandNumber} at k = (${kx.toFixed(3)}, ${ky.toFixed(3)})`;
      drawGridHeatmap(normalizeSymmetricGrid(field.real), `one ${config.latticeType} unit-cell window`, "Real part Re(u_k)", {
        colorFn: divergingRealColor,
        colorbarLabel: "Real part Re(u_k)",
        colorbarMin: -1,
        colorbarMax: 1,
        colorbarStartLabel: "-1",
        colorbarEndLabel: "1",
      });
      readouts.selectionLabel.textContent = `Selected band: ${bandNumber}. Re(u_k) at k-point index ${pointIndex}.`;
      readouts.potentialCaption.textContent = "Periodic-part real component with the Bloch phase removed.";
    } else if (wavefunctionMode === "phase") {
      readouts.realSpaceTitle.textContent = `arg(u_k) for band ${bandNumber} at k = (${kx.toFixed(3)}, ${ky.toFixed(3)})`;
      drawGridHeatmap(field.phase, `one ${config.latticeType} unit-cell window`, "Phase arg(u_k)", {
        colorFn: cyclicPhaseColor,
        colorbarLabel: "Phase arg(u_k)",
        colorbarMin: -Math.PI,
        colorbarMax: Math.PI,
        colorbarStartLabel: "-π",
        colorbarEndLabel: "π",
      });
      readouts.selectionLabel.textContent = `Selected band: ${bandNumber}. arg(u_k) at k-point index ${pointIndex}.`;
      readouts.potentialCaption.textContent = "Periodic-part phase, which highlights lattice symmetry without plane-wave stripes.";
    } else {
      readouts.realSpaceTitle.textContent = `|u_k|² for band ${bandNumber} at k = (${kx.toFixed(3)}, ${ky.toFixed(3)})`;
      const densityMin = Math.min(...field.density.flat());
      const densityMax = Math.max(...field.density.flat());
      drawGridHeatmap(field.density, `one ${config.latticeType} unit-cell window`, "Probability density |u_k|²", {
        colorFn: densityColor,
        colorbarLabel: "Probability density |u_k|²",
        colorbarMin: densityMin,
        colorbarMax: densityMax,
        colorbarStartLabel: formatDensityLegendValue(densityMin),
        colorbarEndLabel: formatDensityLegendValue(densityMax),
      });
      readouts.selectionLabel.textContent = `Selected band: ${bandNumber}. |u_k(x,y)|² at k-point index ${pointIndex}.`;
      readouts.potentialCaption.textContent = "Periodic-part probability density with the Bloch phase removed.";
    }
  } else {
    readouts.realSpaceTitle.textContent = "Real-space potential";
    drawPotential(config);
    readouts.selectionLabel.textContent = selectedBandState
      ? `Selected band: ${selectedBandState.bandIndex + 1}. k-point index ${selectedBandState.kIndex}.`
      : "Click a band to inspect the periodic part u_k(x,y).";
  }
  controls.showPotentialView.classList.toggle("is-active", realSpaceMode === "potential");
  controls.showWavefunctionView.classList.toggle("is-active", realSpaceMode === "wavefunction");
  controls.waveModeDensity?.classList.toggle("is-active", wavefunctionMode === "density");
  controls.waveModeReal?.classList.toggle("is-active", wavefunctionMode === "real");
  controls.waveModePhase?.classList.toggle("is-active", wavefunctionMode === "phase");
}

function render() {
  const start = performance.now();
  const baseConfig = currentConfig();
  const autoResult = controls.autoConverge.checked ? findAutoConvergedBasis(baseConfig) : null;
  const config = autoResult ? { ...baseConfig, nMax: autoResult.nMax } : baseConfig;
  const cacheKey = wavefunctionCacheKey(config);
  if (cacheKey !== lastWavefunctionCacheKey) {
    wavefunctionCache = new Map();
    lastWavefunctionCacheKey = cacheKey;
  }
  updateReadouts(config);
  updatePresetCards();
  updateGuideStrip(config);
  const result = computeBandStructure(config);
  lastRenderResult = result;
  if (selectedBandState) {
    const bandLimit = result.eigenvalues[0]?.length ?? 0;
    if (selectedBandState.kIndex >= result.kPoints.length || selectedBandState.bandIndex >= bandLimit) {
      selectedBandState = null;
      realSpaceMode = "potential";
    }
  }
  drawBandPlot(result, config);
  drawBoundaryZoom(result, config);
  updateSelectedStateSummary(config, result);
  updateSelectionEmphasis();
  updateMobileStatePanel(config, result);
  drawRealSpaceView(config, result);
  updateGuideStrip(config);
  const gap = autoResult ? autoResult.gap : xPointGap(config);
  const quantities = derivedQuantities(result, gap);
  const convergence = computeGapConvergence(config, gap);
  readouts.gap.textContent = quantities.xGap.toFixed(5);
  readouts.gapDetail.textContent = quantities.xGap.toFixed(5);
  readouts.mobileGap.textContent = quantities.xGap.toFixed(5);
  readouts.lowestBandMin.textContent = quantities.lowestBandMinimum.toFixed(5);
  readouts.bandwidth.textContent = quantities.firstBandBandwidth.toFixed(5);
  updatePhysicsExplanation(config, quantities, convergence);
  if (autoResult) {
    readouts.autoConvergenceStatus.textContent = `n_max = ${autoResult.nMax} (size = ${basisSizeFromNMax(autoResult.nMax)})`;
    readouts.autoConvergenceDelta.textContent = `Δgap = ${formatDeltaGap(autoResult.delta)}`;
    readouts.autoConvergenceTolerance.textContent = `tol = ${formatConvergenceValue(AUTO_CONVERGENCE_TOLERANCE)}`;
    readouts.autoConvergenceResult.textContent = autoResult.converged ? "✓ Converged" : "Not converged yet";
    readouts.mobileNMax.textContent = String(autoResult.nMax);
    readouts.mobileDelta.textContent = formatDeltaGap(autoResult.delta);
    readouts.mobileStatus.textContent = autoResult.converged ? "Converged" : "Solving";
    readouts.convergenceWarning.hidden = autoResult.converged;
    readouts.convergenceWarning.textContent = autoResult.converged
      ? "Converged (Δgap < 1e-3)."
      : "Not converged yet. Increase limit or keep manual mode.";
  } else {
    readouts.autoConvergenceDelta.textContent = `Δgap = ${formatDeltaGap(convergence.delta)}`;
    readouts.autoConvergenceTolerance.textContent = `tol = ${formatConvergenceValue(AUTO_CONVERGENCE_TOLERANCE)}`;
    readouts.autoConvergenceResult.textContent = "Manual mode";
    readouts.mobileNMax.textContent = String(config.nMax);
    readouts.mobileDelta.textContent = formatDeltaGap(convergence.delta);
    readouts.mobileStatus.textContent = "Manual";
  }
  readouts.status.textContent = `Updated in ${Math.round(performance.now() - start)} ms`;
}

function resetDefaults() {
  if (emergenceFrame) cancelAnimationFrame(emergenceFrame);
  emergenceFrame = null;
  controls.emergenceLambda.value = "1";
  controls.emergencePlay.textContent = "Play";
  controls.potentialType.value = defaults.potentialType;
  controls.latticeType.value = defaults.latticeType;
  controls.basisType.value = defaults.basisType;
  controls.wellDepth.value = defaults.wellDepth;
  controls.sigma.value = defaults.sigma;
  controls.radius.value = defaults.radius;
  controls.latticeConstant.value = defaults.latticeConstant;
  controls.fillFraction.value = defaults.fillFraction;
  controls.nMax.value = defaults.nMax;
  controls.autoConverge.checked = defaults.autoConverge;
  controls.pointsPerSegment.value = defaults.pointsPerSegment;
  controls.bandsToPlot.value = defaults.bandsToPlot;
  controls.showFree.checked = defaults.showFree;
  selectedBandState = null;
  realSpaceMode = "potential";
  wavefunctionMode = "density";
  setMobileTab("bands");
  wavefunctionCache = new Map();
  lastWavefunctionCacheKey = "";
  autoConvergenceCache = new Map();
  activePreset = null;
  hideBandTooltip();
  render();
}

function resetInteractiveState() {
  if (emergenceFrame) cancelAnimationFrame(emergenceFrame);
  emergenceFrame = null;
  controls.emergencePlay.textContent = "Play";
  controls.emergenceLambda.value = "1";
  selectedBandState = null;
  realSpaceMode = "potential";
  wavefunctionMode = "density";
  setMobileTab("bands");
  wavefunctionCache = new Map();
  lastWavefunctionCacheKey = "";
  autoConvergenceCache = new Map();
  hideBandTooltip();
}

function applyPreset(name, values) {
  resetInteractiveState();
  activePreset = name;
  controls.potentialType.value = values.potentialType;
  controls.latticeType.value = values.latticeType;
  controls.basisType.value = values.basisType ?? "single";
  controls.wellDepth.value = String(values.wellDepth);
  controls.sigma.value = String(values.sigma ?? defaults.sigma);
  controls.radius.value = String(values.radius ?? defaults.radius);
  controls.latticeConstant.value = String(values.latticeConstant ?? defaults.latticeConstant);
  controls.fillFraction.value = String(values.fillFraction ?? defaults.fillFraction);
  controls.nMax.value = String(values.nMax);
  controls.autoConverge.checked = false;
  controls.pointsPerSegment.value = String(values.pointsPerSegment);
  controls.bandsToPlot.value = String(values.bandsToPlot);
  controls.showFree.checked = values.showFree;
  render();
}

function applyNearlyFreePreset() {
  applyPreset("nearlyFree", {
    potentialType: "square",
    latticeType: "square",
    basisType: "single",
    wellDepth: 0.15,
    fillFraction: 0.5,
    latticeConstant: 1,
    nMax: 2,
    pointsPerSegment: 32,
    bandsToPlot: 6,
    showFree: true,
  });
}

function applyGapOpeningPreset() {
  applyPreset("gapOpening", {
    potentialType: "square",
    latticeType: "square",
    basisType: "single",
    wellDepth: 2.0,
    fillFraction: 0.5,
    latticeConstant: 1,
    nMax: 3,
    pointsPerSegment: 36,
    bandsToPlot: 6,
    showFree: true,
  });
}

function applyStrongLocalizationPreset() {
  applyPreset("strongLocalization", {
    potentialType: "muffin-tin",
    latticeType: "square",
    basisType: "single",
    wellDepth: 4.5,
    radius: 0.22,
    latticeConstant: 1,
    nMax: 3,
    pointsPerSegment: 32,
    bandsToPlot: 6,
    showFree: false,
  });
}

function applyGrapheneNearDiracPreset() {
  applyPreset("grapheneNearDirac", {
    potentialType: "gaussian",
    latticeType: "hexagonal",
    basisType: "graphene",
    wellDepth: 0.4,
    sigma: 0.1,
    latticeConstant: 1,
    nMax: 3,
    pointsPerSegment: 48,
    bandsToPlot: 6,
    showFree: false,
  });
}

function toggleEmergencePlayback() {
  if (emergenceFrame) {
    cancelAnimationFrame(emergenceFrame);
    emergenceFrame = null;
    controls.emergencePlay.textContent = "Play";
    return;
  }

  const startLambda = Number(controls.emergenceLambda.value);
  const durationMs = Math.max(600, (1 - startLambda) * 1800);
  const start = performance.now();
  controls.emergencePlay.textContent = "Pause";

  const step = (now) => {
    const progress = Math.min(1, (now - start) / durationMs);
    const eased = 1 - (1 - progress) * (1 - progress);
    const lambda = startLambda + (1 - startLambda) * eased;
    controls.emergenceLambda.value = lambda.toFixed(2);
    render();
    if (progress < 1) {
      emergenceFrame = requestAnimationFrame(step);
    } else {
      emergenceFrame = null;
      controls.emergencePlay.textContent = "Play";
      controls.emergenceLambda.value = "1";
      render();
    }
  };

  emergenceFrame = requestAnimationFrame(step);
}

function hideBandTooltip() {
  bandTooltip.hidden = true;
  readouts.hover.textContent = "Hover over a band to inspect k and energy.";
}

function handleBandHover(event) {
  if (!lastRenderResult) return;
  const selection = pickNearestBandState(event);
  if (!selection) {
    hideBandTooltip();
    return;
  }

  const kPoint = lastRenderResult.kPoints[selection.kIndex];
  const energy = lastRenderResult.eigenvalues[selection.kIndex][selection.bandIndex];
  bandTooltip.hidden = false;
  bandTooltip.innerHTML =
    `band ${selection.bandIndex + 1}<br>` +
    `k=(${kPoint[0].toFixed(3)}, ${kPoint[1].toFixed(3)})<br>` +
    `E=${energy.toFixed(4)}`;

  const container = bandCanvas.parentElement;
  const containerRect = container.getBoundingClientRect();
  const tooltipWidth = bandTooltip.offsetWidth;
  const tooltipHeight = bandTooltip.offsetHeight;
  const margin = 8;
  const offsetX = 15;
  const offsetY = 16;
  const mouseX = event.clientX - containerRect.left;
  const mouseY = event.clientY - containerRect.top;
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  let left = mouseX + offsetX;
  let top = mouseY - tooltipHeight - offsetY;

  if (left + tooltipWidth > containerWidth - margin) {
    left = mouseX - tooltipWidth - offsetX;
  }
  if (top < margin) {
    top = mouseY + offsetY;
  }

  left = Math.max(margin, Math.min(left, containerWidth - tooltipWidth - margin));
  top = Math.max(margin, Math.min(top, containerHeight - tooltipHeight - margin));

  bandTooltip.style.left = `${left}px`;
  bandTooltip.style.top = `${top}px`;
  readouts.hover.textContent = `Band ${selection.bandIndex + 1} | k=(${kPoint[0].toFixed(3)}, ${kPoint[1].toFixed(3)}) | E=${energy.toFixed(4)}`;
}

function pickNearestBandState(event) {
  if (!lastBandPlot) return null;
  const rect = bandCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const { result, bandsToPlot, xScale, yScale, margin, plotWidth, plotHeight } = lastBandPlot;

  if (x < margin.left || x > margin.left + plotWidth || y < margin.top || y > margin.top + plotHeight) {
    return null;
  }

  let nearest = null;
  for (let pointIndex = 0; pointIndex < result.distances.length; pointIndex += 1) {
    const px = xScale(result.distances[pointIndex]);
    if (Math.abs(px - x) > 18) continue;
    for (let band = 0; band < bandsToPlot; band += 1) {
      const energy = result.eigenvalues[pointIndex][band];
      const py = yScale(energy);
      const distance = Math.hypot(px - x, py - y);
      if (!nearest || distance < nearest.distance) {
        nearest = { distance, kIndex: pointIndex, bandIndex: band };
      }
    }
  }

  return nearest && nearest.distance <= 20 ? nearest : null;
}

function handleBandClick(event) {
  const selection = pickNearestBandState(event);
  if (!selection || !lastRenderResult) return;
  selectedBandState = { ...selection, gridSize: 64 };
  wavefunctionCache.delete(`${selection.kIndex}:${selection.bandIndex}:64`);
  realSpaceMode = "wavefunction";
  setMobileTab("realSpace");
  render();
}

function showPotentialView() {
  realSpaceMode = "potential";
  setMobileTab("realSpace");
  render();
}

function showWavefunctionView() {
  if (!selectedBandState) {
    readouts.selectionLabel.textContent = "Click a band first to inspect the periodic part u_k(x,y).";
    return;
  }
  realSpaceMode = "wavefunction";
  setMobileTab("realSpace");
  render();
}

function setWavefunctionMode(mode) {
  wavefunctionMode = mode;
  if (realSpaceMode === "wavefunction" && selectedBandState) {
    render();
  }
}

function closeMobileStatePanel() {
  selectedBandState = null;
  realSpaceMode = "potential";
  hideBandTooltip();
  setMobileTab("bands");
  render();
}

function debounce(fn, delay = 40) {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}

const debouncedRender = debounce(render);
for (const control of Object.values(controls)) {
  if (control !== controls.resetDefaults && control !== controls.emergencePlay) {
    control.addEventListener("input", () => {
      if (
        control !== controls.presetNearlyFree &&
        control !== controls.presetGapOpening &&
        control !== controls.presetStrongLocalization &&
        control !== controls.graphenePreset
      ) {
        activePreset = null;
      }
      if (emergenceFrame && control !== controls.emergenceLambda) {
        cancelAnimationFrame(emergenceFrame);
        emergenceFrame = null;
        controls.emergencePlay.textContent = "Play";
      }
      debouncedRender();
    });
  }
}
controls.emergencePlay.addEventListener("click", toggleEmergencePlayback);
controls.presetNearlyFree.addEventListener("click", applyNearlyFreePreset);
controls.presetGapOpening.addEventListener("click", applyGapOpeningPreset);
controls.presetStrongLocalization.addEventListener("click", applyStrongLocalizationPreset);
controls.graphenePreset.addEventListener("click", applyGrapheneNearDiracPreset);
controls.resetDefaults.addEventListener("click", resetDefaults);
controls.inspectBoundaryLower.addEventListener("click", () => inspectBoundaryState(0));
controls.inspectBoundaryUpper.addEventListener("click", () => inspectBoundaryState(1));
controls.showPotentialView.addEventListener("click", showPotentialView);
controls.showWavefunctionView.addEventListener("click", showWavefunctionView);
controls.mobileTabBands.addEventListener("click", () => setMobileTab("bands"));
controls.mobileTabRealSpace.addEventListener("click", () => setMobileTab("realSpace"));
controls.mobileTabNotes.addEventListener("click", () => setMobileTab("notes"));
controls.mobileStateClose.addEventListener("click", closeMobileStatePanel);
controls.mobileStatePotential.addEventListener("click", showPotentialView);
controls.mobileStateWavefunction.addEventListener("click", showWavefunctionView);
controls.mobileStateDensity.addEventListener("click", () => setWavefunctionMode("density"));
controls.mobileStateReal.addEventListener("click", () => setWavefunctionMode("real"));
controls.mobileStatePhase.addEventListener("click", () => setWavefunctionMode("phase"));
controls.waveModeDensity?.addEventListener("click", () => setWavefunctionMode("density"));
controls.waveModeReal?.addEventListener("click", () => setWavefunctionMode("real"));
controls.waveModePhase?.addEventListener("click", () => setWavefunctionMode("phase"));
bandCanvas.addEventListener("mousemove", handleBandHover);
bandCanvas.addEventListener("click", handleBandClick);
bandCanvas.addEventListener("mouseleave", hideBandTooltip);
window.addEventListener("resize", debouncedRender);
setMobileTab("bands");
render();
