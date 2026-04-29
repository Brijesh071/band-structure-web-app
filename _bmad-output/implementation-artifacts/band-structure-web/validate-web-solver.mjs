import {
  basisSites,
  buildHamiltonian,
  computeBandStructure,
  computeRealSpacePotential,
  computeWavefunctionField,
  computeWavefunctionDensity,
  directLatticeVectors,
  freeElectronEnergies,
  gaussianFourierCoefficient,
  hexagonalLatticeHighSymmetryPoints,
  muffinTinFourierCoefficient,
  planeWaveIndices,
  reciprocalFromDirect,
  solveSingleKEigensystem,
  solveSingleK,
  squareLatticeHighSymmetryPoints,
  structureFactor,
  squareWellFourierCoefficient,
  xPointGap,
} from "./solver.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function maxAbs(values) {
  return Math.max(...values.map((value) => Math.abs(value)));
}

function testBasisSize() {
  assert(planeWaveIndices(0).length === 1, "nMax=0 basis size");
  assert(planeWaveIndices(1).length === 9, "nMax=1 basis size");
  assert(planeWaveIndices(2).length === 25, "nMax=2 basis size");
}

function testFreeElectronLimit() {
  const config = { type: "square", latticeConstant: 1, wellDepth: 0, fillFraction: 0.5, sigma: 0.18, nMax: 1, pointsPerSegment: 6 };
  const kPoint = [0.37, 0.21];
  const actual = solveSingleK(config, kPoint);
  const expected = freeElectronEnergies(config, kPoint);
  assert(maxAbs(actual.map((value, index) => value - expected[index])) < 1e-8, "free-electron single-k");
}

function testBandStructureShape() {
  const config = { type: "square", latticeConstant: 1, wellDepth: 1, fillFraction: 0.5, sigma: 0.18, nMax: 1, pointsPerSegment: 5 };
  const result = computeBandStructure(config);
  assert(result.kPoints.length === 13, "k-path point count");
  assert(result.eigenvalues.length === 13, "eigenvalue row count");
  assert(result.eigenvalues[0].length === 9, "eigenvalue column count");
  assert(result.eigenvectors.length === 13, "eigenvector row count");
  assert(result.eigenvectors[0].length === 9, "band eigenvector count");
  assert(result.eigenvectors[0][0].length === 9, "basis coefficient count");
}

function testGapOpening() {
  const free = { type: "square", latticeConstant: 1, wellDepth: 0, fillFraction: 0.5, sigma: 0.18, nMax: 2, pointsPerSegment: 6 };
  const finite = { ...free, wellDepth: 2 };
  assert(Math.abs(xPointGap(free)) < 1e-8, "free X gap");
  assert(xPointGap(finite) > 0.5, "finite X gap");
}

function testPotentialFourierCoefficients() {
  const square = { type: "square", latticeConstant: 1, wellDepth: 2, fillFraction: 0.5, sigma: 0.18, nMax: 1, pointsPerSegment: 6 };
  const gaussian = { type: "gaussian", latticeConstant: 1, wellDepth: 2, fillFraction: 0.5, sigma: 0.2, nMax: 1, pointsPerSegment: 6 };
  const muffin = { type: "muffin-tin", latticeConstant: 1, wellDepth: 2, fillFraction: 0.5, sigma: 0.18, radius: 0.2, nMax: 1, pointsPerSegment: 6 };
  const squareZero = squareWellFourierCoefficient([0, 0], square);
  const gaussianZero = gaussianFourierCoefficient([0, 0], gaussian);
  const muffinZero = muffinTinFourierCoefficient([0, 0], muffin);
  assert(Math.abs(squareZero + 0.5) < 1e-10, "square G=0 coefficient");
  assert(Math.abs(gaussianZero + 2 * (2 * Math.PI * 0.2 * 0.2)) < 1e-10, "gaussian G=0 coefficient");
  assert(Math.abs(muffinZero + 2 * Math.PI * 0.04) < 1e-10, "muffin G=0 coefficient");
}

function testGrapheneStructureFactor() {
  const config = {
    type: "gaussian",
    latticeType: "hexagonal",
    basisType: "graphene",
    latticeConstant: 1,
    wellDepth: 1,
    fillFraction: 0.5,
    sigma: 0.18,
    radius: 0.2,
    nMax: 1,
    pointsPerSegment: 5,
  };
  const factor = structureFactor(hexagonalLatticeHighSymmetryPoints(1).M, config);
  assert(Math.abs(factor.re) <= 2.000001, "structure factor bounded");
  assert(Math.abs(factor.im) > 1e-6, "graphene structure factor is complex away from G=0");
}

function testGaussianBandStructureShape() {
  const config = { type: "gaussian", latticeConstant: 1, wellDepth: 1.5, fillFraction: 0.5, sigma: 0.18, nMax: 1, pointsPerSegment: 5 };
  const result = computeBandStructure(config);
  assert(result.kPoints.length === 13, "gaussian k-path point count");
  assert(result.eigenvalues[0].length === 9, "gaussian eigenvalue count");
}

function testMuffinTinBandStructureShape() {
  const config = { type: "muffin-tin", latticeConstant: 1, wellDepth: 1.5, fillFraction: 0.5, sigma: 0.18, radius: 0.2, nMax: 1, pointsPerSegment: 5 };
  const result = computeBandStructure(config);
  assert(result.kPoints.length === 13, "muffin k-path point count");
  assert(result.eigenvalues[0].length === 9, "muffin eigenvalue count");
}

function testHighSymmetryPoints() {
  const points = squareLatticeHighSymmetryPoints(2);
  assert(Math.abs(points.X[0] - Math.PI / 2) < 1e-12, "X coordinate");
  assert(Math.abs(points.M[1] - Math.PI / 2) < 1e-12, "M coordinate");
}

function testHexagonalReciprocalDuality() {
  const { a1, a2 } = directLatticeVectors(2, "hexagonal");
  const { b1, b2 } = reciprocalFromDirect(a1, a2);
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
  assert(Math.abs(dot(a1, b1) - 2 * Math.PI) < 1e-10, "a1·b1 = 2π");
  assert(Math.abs(dot(a2, b2) - 2 * Math.PI) < 1e-10, "a2·b2 = 2π");
  assert(Math.abs(dot(a1, b2)) < 1e-10, "a1·b2 = 0");
  assert(Math.abs(dot(a2, b1)) < 1e-10, "a2·b1 = 0");
}

function testHexagonalPathAndBands() {
  const config = {
    type: "gaussian",
    latticeType: "hexagonal",
    basisType: "single",
    latticeConstant: 1,
    wellDepth: 1.5,
    fillFraction: 0.5,
    sigma: 0.18,
    radius: 0.2,
    nMax: 1,
    pointsPerSegment: 5,
  };
  const result = computeBandStructure(config);
  assert(result.kPoints.length === 13, "hexagonal k-path point count");
  assert(result.labels.map(([label]) => label).join(",") === "Γ,K,M,Γ", "hexagonal labels");
  assert(result.eigenvalues[0].length === 9, "hexagonal eigenvalue count");
  assert(xPointGap(config) >= 0, "hexagonal zone-boundary gap is finite");
}

function testHermitianHamiltonian() {
  const config = {
    type: "gaussian",
    latticeType: "hexagonal",
    basisType: "graphene",
    latticeConstant: 1,
    wellDepth: 1.3,
    fillFraction: 0.5,
    sigma: 0.16,
    radius: 0.2,
    nMax: 1,
    pointsPerSegment: 5,
  };
  const matrix = buildHamiltonian(config, hexagonalLatticeHighSymmetryPoints(1).K);
  let maxMismatch = 0;
  for (let i = 0; i < matrix.length; i += 1) {
    for (let j = 0; j < matrix.length; j += 1) {
      const left = matrix[i][j];
      const right = matrix[j][i];
      maxMismatch = Math.max(
        maxMismatch,
        Math.abs(left.re - right.re),
        Math.abs(left.im + right.im),
      );
    }
  }
  assert(maxMismatch < 1e-8, "graphene Hamiltonian is Hermitian");
}

function testHexagonalHighSymmetryPoints() {
  const points = hexagonalLatticeHighSymmetryPoints(1);
  assert(points.K[0] > 0, "K x-coordinate positive");
  assert(points.M[1] > 0, "M y-coordinate positive");
}

function coordinateToIndex(coordinate, latticeConstant, gridSize) {
  const normalized = (coordinate + latticeConstant / 2) / latticeConstant;
  return Math.max(0, Math.min(gridSize - 1, Math.round(normalized * gridSize)));
}

function testGrapheneBasisSites() {
  const config = {
    type: "gaussian",
    latticeType: "hexagonal",
    basisType: "graphene",
    latticeConstant: 1,
    wellDepth: 1,
    fillFraction: 0.5,
    sigma: 0.18,
    radius: 0.2,
    nMax: 1,
    pointsPerSegment: 5,
  };
  const sites = basisSites(config);
  assert(sites.length === 2, "graphene basis has two sites");
  assert(Math.abs(sites[0][0]) < 1e-12 && Math.abs(sites[0][1]) < 1e-12, "A site at origin");
}

function testGrapheneRealSpacePotential() {
  const config = {
    type: "gaussian",
    latticeType: "hexagonal",
    basisType: "graphene",
    latticeConstant: 1,
    wellDepth: 2,
    fillFraction: 0.5,
    sigma: 0.12,
    radius: 0.2,
    nMax: 1,
    pointsPerSegment: 5,
  };
  const gridSize = 81;
  const potential = computeRealSpacePotential(config, gridSize);
  const [siteA, siteB] = basisSites(config);
  const siteAValue = potential[coordinateToIndex(siteA[1], config.latticeConstant, gridSize)][
    coordinateToIndex(siteA[0], config.latticeConstant, gridSize)
  ];
  const siteBValue = potential[coordinateToIndex(siteB[1], config.latticeConstant, gridSize)][
    coordinateToIndex(siteB[0], config.latticeConstant, gridSize)
  ];
  const farValue = potential[coordinateToIndex(-0.45, config.latticeConstant, gridSize)][
    coordinateToIndex(0.35, config.latticeConstant, gridSize)
  ];
  assert(siteAValue < farValue, "graphene basis well at A site");
  assert(siteBValue < farValue, "graphene basis well at B site");
}

function testSingleKEigensystem() {
  const config = { type: "square", latticeConstant: 1, wellDepth: 1.2, fillFraction: 0.5, sigma: 0.18, nMax: 1, pointsPerSegment: 5 };
  const eigensystem = solveSingleKEigensystem(config, [0.1, 0.2]);
  assert(eigensystem.values.length === 9, "eigensystem eigenvalue count");
  assert(eigensystem.vectors.length === 9, "eigensystem vector count");
  const norm = eigensystem.vectors[0].reduce((sum, value) => sum + value.re * value.re + value.im * value.im, 0);
  assert(Math.abs(norm - 1) < 1e-6, "eigenvector normalization");
}

function testWavefunctionUniformAtFreeLimit() {
  const config = { type: "square", latticeConstant: 1, wellDepth: 0, fillFraction: 0.5, sigma: 0.18, nMax: 0, pointsPerSegment: 5 };
  const eigensystem = solveSingleKEigensystem(config, [0.17, 0.12]);
  const density = computeWavefunctionDensity(config, [0.17, 0.12], eigensystem.vectors[0], 24);
  const flattened = density.flat();
  const spread = Math.max(...flattened) - Math.min(...flattened);
  const dx = config.latticeConstant / 24;
  const integral = flattened.reduce((sum, value) => sum + value * dx * dx, 0);
  assert(spread < 1e-8, "free-limit density is uniform");
  assert(Math.abs(integral - 1) < 1e-8, "free-limit density is normalized");
}

function testWavefunctionLocalizationAtFinitePotential() {
  const config = { type: "square", latticeConstant: 1, wellDepth: 2, fillFraction: 0.5, sigma: 0.18, nMax: 2, pointsPerSegment: 5 };
  const eigensystem = solveSingleKEigensystem(config, [0, 0]);
  const density = computeWavefunctionDensity(config, [0, 0], eigensystem.vectors[0], 40);
  const center = density[Math.floor(density.length / 2)][Math.floor(density.length / 2)];
  const corner = density[0][0];
  assert(center > corner, "finite-potential density localizes toward the well");
}

function testWavefunctionFieldComponents() {
  const config = { type: "square", latticeConstant: 1, wellDepth: 2, fillFraction: 0.5, sigma: 0.18, nMax: 2, pointsPerSegment: 5 };
  const eigensystem = solveSingleKEigensystem(config, [Math.PI, 0]);
  const field = computeWavefunctionField(config, [Math.PI, 0], eigensystem.vectors[0], 24);
  assert(field.real.length === 24, "field real grid height");
  assert(field.real[0].length === 24, "field real grid width");
  assert(field.phase.length === 24, "field phase grid height");
  assert(Number.isFinite(field.phase[0][0]), "field phase is finite");
}

function testWavefunctionSquareSymmetry() {
  const config = { type: "square", latticeConstant: 1, wellDepth: 2, fillFraction: 0.5, sigma: 0.18, nMax: 2, pointsPerSegment: 5 };
  const eigensystem = solveSingleKEigensystem(config, [0, 0]);
  const density = computeWavefunctionDensity(config, [0, 0], eigensystem.vectors[0], 28);
  let maxAsymmetry = 0;
  for (let y = 0; y < density.length; y += 1) {
    for (let x = 0; x < density.length; x += 1) {
      maxAsymmetry = Math.max(maxAsymmetry, Math.abs(density[y][x] - density[x][y]));
    }
  }
  assert(maxAsymmetry < 5e-4, "square-lattice density respects x↔y symmetry");
}

function testNearDiracPresetPhysics() {
  const config = {
    type: "gaussian",
    latticeType: "hexagonal",
    basisType: "graphene",
    latticeConstant: 1,
    wellDepth: 0.4,
    fillFraction: 0.5,
    sigma: 0.1,
    radius: 0.22,
    nMax: 3,
    pointsPerSegment: 48,
  };
  const kGap = xPointGap(config);
  assert(kGap < 1e-4, "near-Dirac preset keeps a very small K-point gap");
}

testBasisSize();
testHighSymmetryPoints();
testHexagonalHighSymmetryPoints();
testHexagonalReciprocalDuality();
testGrapheneBasisSites();
testGrapheneRealSpacePotential();
testSingleKEigensystem();
testFreeElectronLimit();
testBandStructureShape();
testHexagonalPathAndBands();
testHermitianHamiltonian();
testGapOpening();
testPotentialFourierCoefficients();
testGrapheneStructureFactor();
testGaussianBandStructureShape();
testMuffinTinBandStructureShape();
testWavefunctionUniformAtFreeLimit();
testWavefunctionLocalizationAtFinitePotential();
testWavefunctionSquareSymmetry();
testWavefunctionFieldComponents();
testNearDiracPresetPhysics();
console.log("Web solver validation passed.");
