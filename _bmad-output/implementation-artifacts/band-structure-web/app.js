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
  resetDefaults: document.querySelector("#resetDefaults"),
  showPotentialView: document.querySelector("#showPotentialView"),
  showWavefunctionView: document.querySelector("#showWavefunctionView"),
  waveModeDensity: document.querySelector("#waveModeDensity"),
  waveModeReal: document.querySelector("#waveModeReal"),
  waveModePhase: document.querySelector("#waveModePhase"),
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
  matrix: document.querySelector("#matrixReadout"),
  status: document.querySelector("#statusReadout"),
  hover: document.querySelector("#hoverReadout"),
  gapDetail: document.querySelector("#gapDetailReadout"),
  lowestBandMin: document.querySelector("#lowestBandMinReadout"),
  bandwidth: document.querySelector("#bandwidthReadout"),
  explanation: document.querySelector("#dynamicExplanation"),
  explanationDetail: document.querySelector("#dynamicExplanationDetail"),
  convergenceWarning: document.querySelector("#convergenceWarning"),
  autoConvergenceStatus: document.querySelector("#autoConvergenceStatus"),
  autoConvergenceDelta: document.querySelector("#autoConvergenceDelta"),
  autoConvergenceTolerance: document.querySelector("#autoConvergenceTolerance"),
  autoConvergenceResult: document.querySelector("#autoConvergenceResult"),
  potentialCaption: document.querySelector("#potentialCaption"),
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
};

const bandCanvas = document.querySelector("#bandCanvas");
const potentialCanvas = document.querySelector("#potentialCanvas");
const bandTooltip = document.querySelector("#bandTooltip");
const bandContext = bandCanvas.getContext("2d");
const potentialContext = potentialCanvas.getContext("2d");

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
let wavefunctionCache = new Map();
let lastWavefunctionCacheKey = "";
let autoConvergenceCache = new Map();

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
    } else if (quantities.xGap < 0.05) {
      readouts.explanation.textContent = "The two-site hexagonal basis is producing a small K-point gap, close to graphene-like cone formation.";
      readouts.explanationDetail.textContent =
        "In the ideal honeycomb limit the K-point gap closes exactly; here the finite potential and truncated basis leave a small residual splitting.";
    } else {
      readouts.explanation.textContent = "The graphene-like two-site basis now mixes A/B sublattice phases and reshapes the K-point bands.";
      readouts.explanationDetail.textContent =
        "Reducing V0 or narrowing the wells usually pushes the two lowest bands closer together at K and makes the cone more graphene-like.";
    }
  } else if (config.lambda < 0.02) {
    readouts.explanation.textContent = "λ = 0 gives the free-electron limit: folded E = k² bands with no zone-boundary gap.";
    readouts.explanationDetail.textContent =
      "At the zone boundary there is no periodic scattering yet, so the crossing states remain degenerate.";
  } else if (config.wellDepth > 0.05 && quantities.xGap > 1e-4) {
    readouts.explanation.textContent =
      config.type === "gaussian"
        ? "A smooth periodic Gaussian still opens a zone-boundary gap by coupling Bloch states."
        : config.type === "muffin-tin"
          ? "A circular muffin-tin well opens a zone-boundary gap by scattering Bloch waves."
          : "Band gap opens due to Bragg reflection at the Brillouin-zone boundary.";
    readouts.explanationDetail.textContent =
      `At ${zoneBoundaryLabel(config)}, states that differ by one reciprocal-lattice vector mix strongly, so one combination shifts up and the other shifts down.`;
  } else {
    readouts.explanation.textContent = "At V0 = 0, bands follow folded free-electron E = k² curves.";
    readouts.explanationDetail.textContent =
      "The periodic potential is too weak to split the boundary crossing appreciably, so the spectrum still looks nearly free-electron.";
  }
  if (controls.autoConverge.checked) {
    return;
  }
  const showWarning =
    convergence.relativeDifference > AUTO_CONVERGENCE_TOLERANCE && config.nMax < AUTO_CONVERGENCE_MAX_NMAX;
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
  bandContext.fillText("Energy (dimensionless)", 0, 0);
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

function drawRealSpaceView(config, result) {
  if (realSpaceMode === "wavefunction" && selectedBandState) {
    const field = getWavefunctionFieldData(config, result, selectedBandState);
    const bandNumber = selectedBandState.bandIndex + 1;
    const pointIndex = selectedBandState.kIndex;
    if (wavefunctionMode === "real") {
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
  drawRealSpaceView(config, result);
  const gap = autoResult ? autoResult.gap : xPointGap(config);
  const quantities = derivedQuantities(result, gap);
  const convergence = computeGapConvergence(config, gap);
  readouts.gap.textContent = quantities.xGap.toFixed(5);
  readouts.gapDetail.textContent = quantities.xGap.toFixed(5);
  readouts.lowestBandMin.textContent = quantities.lowestBandMinimum.toFixed(5);
  readouts.bandwidth.textContent = quantities.firstBandBandwidth.toFixed(5);
  updatePhysicsExplanation(config, quantities, convergence);
  if (autoResult) {
    readouts.autoConvergenceStatus.textContent = `n_max = ${autoResult.nMax} (size = ${basisSizeFromNMax(autoResult.nMax)})`;
    readouts.autoConvergenceDelta.textContent = `Δgap = ${formatDeltaGap(autoResult.delta)}`;
  readouts.autoConvergenceTolerance.textContent = `tol = ${formatConvergenceValue(AUTO_CONVERGENCE_TOLERANCE)}`;
    readouts.autoConvergenceResult.textContent = autoResult.converged ? "✓ Converged" : "Not converged yet";
    readouts.convergenceWarning.hidden = autoResult.converged;
    readouts.convergenceWarning.textContent = autoResult.converged
      ? "Converged (Δgap < 1e-3)."
      : "Not converged yet. Increase limit or keep manual mode.";
  } else {
    readouts.autoConvergenceDelta.textContent = `Δgap = ${formatDeltaGap(convergence.delta)}`;
    readouts.autoConvergenceTolerance.textContent = `tol = ${formatConvergenceValue(AUTO_CONVERGENCE_TOLERANCE)}`;
    readouts.autoConvergenceResult.textContent = "Manual mode";
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
  wavefunctionCache = new Map();
  lastWavefunctionCacheKey = "";
  autoConvergenceCache = new Map();
  hideBandTooltip();
  render();
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
  render();
}

function showPotentialView() {
  realSpaceMode = "potential";
  render();
}

function showWavefunctionView() {
  if (!selectedBandState) {
    readouts.selectionLabel.textContent = "Click a band first to inspect the periodic part u_k(x,y).";
    return;
  }
  realSpaceMode = "wavefunction";
  render();
}

function setWavefunctionMode(mode) {
  wavefunctionMode = mode;
  if (realSpaceMode === "wavefunction" && selectedBandState) {
    render();
  }
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
controls.resetDefaults.addEventListener("click", resetDefaults);
controls.showPotentialView.addEventListener("click", showPotentialView);
controls.showWavefunctionView.addEventListener("click", showWavefunctionView);
controls.waveModeDensity?.addEventListener("click", () => setWavefunctionMode("density"));
controls.waveModeReal?.addEventListener("click", () => setWavefunctionMode("real"));
controls.waveModePhase?.addEventListener("click", () => setWavefunctionMode("phase"));
bandCanvas.addEventListener("mousemove", handleBandHover);
bandCanvas.addEventListener("click", handleBandClick);
bandCanvas.addEventListener("mouseleave", hideBandTooltip);
window.addEventListener("resize", debouncedRender);
render();
