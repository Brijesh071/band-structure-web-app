const TWO_PI = 2 * Math.PI;

function complex(re = 0, im = 0) {
  return { re, im };
}

function isComplex(value) {
  return typeof value === "object" && value !== null && "re" in value && "im" in value;
}

function asComplex(value) {
  return isComplex(value) ? value : complex(value, 0);
}

function complexAdd(left, right) {
  const a = asComplex(left);
  const b = asComplex(right);
  return complex(a.re + b.re, a.im + b.im);
}

function complexScale(value, scalar) {
  const z = asComplex(value);
  return complex(z.re * scalar, z.im * scalar);
}

function complexMultiply(left, right) {
  const a = asComplex(left);
  const b = asComplex(right);
  return complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
}

function complexConjugate(value) {
  const z = asComplex(value);
  return complex(z.re, -z.im);
}

function complexAbsSquared(value) {
  const z = asComplex(value);
  return z.re * z.re + z.im * z.im;
}

function complexExpMinusI(phase) {
  return complex(Math.cos(phase), -Math.sin(phase));
}

export function validateConfig(config) {
  if (!["square", "gaussian", "muffin-tin"].includes(config.type || "square")) {
    throw new Error("type must be 'square', 'gaussian', or 'muffin-tin'");
  }
  if (!["square", "hexagonal"].includes(config.latticeType || "square")) {
    throw new Error("latticeType must be 'square' or 'hexagonal'");
  }
  if (!["single", "graphene"].includes(config.basisType || "single")) {
    throw new Error("basisType must be 'single' or 'graphene'");
  }
  if ((config.basisType || "single") === "graphene" && (config.latticeType || "square") !== "hexagonal") {
    throw new Error("graphene basis requires latticeType 'hexagonal'");
  }
  if (config.latticeConstant <= 0) throw new Error("latticeConstant must be positive");
  if (config.wellDepth < 0) throw new Error("wellDepth must be non-negative");
  if (config.fillFraction <= 0 || config.fillFraction > 1) {
    throw new Error("fillFraction must be in (0, 1]");
  }
  if ((config.type || "square") === "gaussian" && !(config.sigma > 0)) {
    throw new Error("sigma must be positive for gaussian potential");
  }
  if ((config.type || "square") === "muffin-tin" && !(config.radius > 0)) {
    throw new Error("radius must be positive for muffin-tin potential");
  }
  if (config.nMax < 0) throw new Error("nMax must be non-negative");
  if (config.pointsPerSegment < 2) throw new Error("pointsPerSegment must be at least 2");
}

export function planeWaveIndices(nMax) {
  if (nMax < 0) throw new Error("nMax must be non-negative");
  const indices = [];
  for (let nx = -nMax; nx <= nMax; nx += 1) {
    for (let ny = -nMax; ny <= nMax; ny += 1) {
      indices.push([nx, ny]);
    }
  }
  return indices;
}

export function directLatticeVectors(latticeConstant, latticeType = "square") {
  if (latticeType === "hexagonal") {
    return {
      a1: [latticeConstant, 0],
      a2: [latticeConstant / 2, (Math.sqrt(3) * latticeConstant) / 2],
    };
  }
  return {
    a1: [latticeConstant, 0],
    a2: [0, latticeConstant],
  };
}

export function reciprocalFromDirect(a1, a2) {
  const area = a1[0] * a2[1] - a1[1] * a2[0];
  return {
    b1: [(TWO_PI * a2[1]) / area, (-TWO_PI * a2[0]) / area],
    b2: [(-TWO_PI * a1[1]) / area, (TWO_PI * a1[0]) / area],
  };
}

export function reciprocalLatticeVectors(latticeConstant, latticeType = "square") {
  const { a1, a2 } = directLatticeVectors(latticeConstant, latticeType);
  return reciprocalFromDirect(a1, a2);
}

export function reciprocalVectors(indices, latticeConstant, latticeType = "square") {
  const { b1, b2 } = reciprocalLatticeVectors(latticeConstant, latticeType);
  return indices.map(([nx, ny]) => [nx * b1[0] + ny * b2[0], nx * b1[1] + ny * b2[1]]);
}

export function basisSites(config) {
  validateConfig(config);
  if ((config.basisType || "single") !== "graphene") {
    return [[0, 0]];
  }
  const { a1, a2 } = directLatticeVectors(config.latticeConstant, config.latticeType || "square");
  return [
    [0, 0],
    [(-2 * a1[0] + a2[0]) / 3, (-2 * a1[1] + a2[1]) / 3],
  ];
}

export function structureFactor(deltaG, config) {
  const sites = basisSites(config);
  return sites.reduce((sum, [x, y]) => {
    const phase = deltaG[0] * x + deltaG[1] * y;
    return complexAdd(sum, complexExpMinusI(phase));
  }, complex(0, 0));
}

function sincUnnormalized(x) {
  return Math.abs(x) <= 1e-14 ? 1 : Math.sin(x) / x;
}

function besselJ1(x) {
  const ax = Math.abs(x);
  if (ax < 8) {
    const y = x * x;
    const numerator =
      x *
      (72362614232 +
        y *
          (-7895059235 +
            y * (242396853.1 + y * (-2972611.439 + y * (15704.4826 + y * -30.16036606)))));
    const denominator =
      144725228442 +
      y * (2300535178 + y * (18583304.74 + y * (99447.43394 + y * (376.9991397 + y))));
    return numerator / denominator;
  }
  const z = 8 / ax;
  const y = z * z;
  const xx = ax - 2.356194491;
  const ans1 =
    1 +
    y * (0.183105e-2 + y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * -0.240337019e-6)));
  const ans2 =
    0.04687499995 +
    y * (-0.2002690873e-3 + y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)));
  const result = Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * ans1 - z * Math.sin(xx) * ans2);
  return x < 0 ? -result : result;
}

export function squareWellFourierCoefficient(deltaG, config) {
  validateConfig(config);
  const [qx, qy] = deltaG;
  const width = config.fillFraction * config.latticeConstant;
  return (
    -config.wellDepth *
    config.fillFraction ** 2 *
    sincUnnormalized((qx * width) / 2) *
    sincUnnormalized((qy * width) / 2)
  );
}

export function gaussianFourierCoefficient(deltaG, config) {
  validateConfig({ ...config, type: "gaussian" });
  const [qx, qy] = deltaG;
  const gSquared = qx * qx + qy * qy;
  return (
    -config.wellDepth *
    (2 * Math.PI * config.sigma * config.sigma) *
    Math.exp(-(config.sigma * config.sigma * gSquared) / 2)
  );
}

export function muffinTinFourierCoefficient(deltaG, config) {
  validateConfig({ ...config, type: "muffin-tin" });
  const [qx, qy] = deltaG;
  const gMagnitude = Math.hypot(qx, qy);
  if (gMagnitude <= 1e-14) {
    return -config.wellDepth * Math.PI * config.radius * config.radius / (config.latticeConstant * config.latticeConstant);
  }
  return (
    -config.wellDepth *
    ((2 * Math.PI * config.radius) / (config.latticeConstant * config.latticeConstant)) *
    (besselJ1(gMagnitude * config.radius) / gMagnitude)
  );
}

export function potentialFourierCoefficient(deltaG, config) {
  const singleSiteCoefficient =
    (config.type || "square") === "gaussian"
      ? gaussianFourierCoefficient(deltaG, config)
      : (config.type || "square") === "muffin-tin"
        ? muffinTinFourierCoefficient(deltaG, config)
        : squareWellFourierCoefficient(deltaG, config);
  return complexScale(structureFactor(deltaG, config), singleSiteCoefficient);
}

export function buildHamiltonian(config, kPoint) {
  validateConfig(config);
  const indices = planeWaveIndices(config.nMax);
  const gVectors = reciprocalVectors(indices, config.latticeConstant, config.latticeType || "square");
  const size = indices.length;
  const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => complex(0, 0)));

  for (let row = 0; row < size; row += 1) {
    const [gxRow, gyRow] = gVectors[row];
    const kx = kPoint[0] + gxRow;
    const ky = kPoint[1] + gyRow;
    matrix[row][row] = complex(kx * kx + ky * ky, 0);

    for (let col = 0; col < size; col += 1) {
      const [gxCol, gyCol] = gVectors[col];
      matrix[row][col] = complexAdd(matrix[row][col], potentialFourierCoefficient([gxRow - gxCol, gyRow - gyCol], config));
    }
  }

  return matrix;
}

export function hermitianToRealBlock(hermitianMatrix) {
  const size = hermitianMatrix.length;
  const block = Array.from({ length: 2 * size }, () => Array(2 * size).fill(0));
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const value = asComplex(hermitianMatrix[row][col]);
      block[row][col] = value.re;
      block[row][col + size] = -value.im;
      block[row + size][col] = value.im;
      block[row + size][col + size] = value.re;
    }
  }
  return block;
}

export function jacobiEigenvalues(symmetricMatrix, tolerance = 1e-10, maxSweeps = 80) {
  return jacobiEigensystem(symmetricMatrix, tolerance, maxSweeps).values;
}

export function jacobiEigensystem(symmetricMatrix, tolerance = 1e-10, maxSweeps = 80) {
  const n = symmetricMatrix.length;
  const matrix = symmetricMatrix.map((row) => row.slice());
  const eigenvectors = Array.from({ length: n }, (_, row) =>
    Array.from({ length: n }, (_, col) => (row === col ? 1 : 0)),
  );

  for (let sweep = 0; sweep < maxSweeps; sweep += 1) {
    let p = 0;
    let q = 1;
    let maxOffDiagonal = 0;

    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        const value = Math.abs(matrix[i][j]);
        if (value > maxOffDiagonal) {
          maxOffDiagonal = value;
          p = i;
          q = j;
        }
      }
    }

    if (maxOffDiagonal < tolerance) break;

    const app = matrix[p][p];
    const aqq = matrix[q][q];
    const apq = matrix[p][q];
    const theta = (aqq - app) / (2 * apq);
    const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
    const c = 1 / Math.sqrt(t * t + 1);
    const s = t * c;

    for (let i = 0; i < n; i += 1) {
      const vip = eigenvectors[i][p];
      const viq = eigenvectors[i][q];
      eigenvectors[i][p] = c * vip - s * viq;
      eigenvectors[i][q] = s * vip + c * viq;
    }

    for (let i = 0; i < n; i += 1) {
      if (i !== p && i !== q) {
        const aip = matrix[i][p];
        const aiq = matrix[i][q];
        matrix[i][p] = c * aip - s * aiq;
        matrix[p][i] = matrix[i][p];
        matrix[i][q] = s * aip + c * aiq;
        matrix[q][i] = matrix[i][q];
      }
    }

    matrix[p][p] = c * c * app - 2 * s * c * apq + s * s * aqq;
    matrix[q][q] = s * s * app + 2 * s * c * apq + c * c * aqq;
    matrix[p][q] = 0;
    matrix[q][p] = 0;
  }

  return matrix
    .map((row, index) => ({
      value: row[index],
      vector: eigenvectors.map((eigenvectorRow) => eigenvectorRow[index]),
    }))
    .sort((left, right) => left.value - right.value)
    .reduce(
      (acc, pair) => {
        acc.values.push(pair.value);
        acc.vectors.push(pair.vector);
        return acc;
      },
      { values: [], vectors: [] },
    );
}

export function solveSingleK(config, kPoint) {
  return solveSingleKEigensystem(config, kPoint).values;
}

export function solveSingleKEigensystem(config, kPoint) {
  const hermitian = buildHamiltonian(config, kPoint);
  const size = hermitian.length;
  const blockEigensystem = jacobiEigensystem(hermitianToRealBlock(hermitian));
  const values = [];
  const vectors = [];

  for (let index = 0; index < blockEigensystem.values.length && values.length < size; index += 2) {
    values.push(blockEigensystem.values[index]);
    const realVector = blockEigensystem.vectors[index];
    vectors.push(
      Array.from({ length: size }, (_, basisIndex) => complex(realVector[basisIndex], realVector[basisIndex + size])),
    );
  }

  return { values, vectors };
}

export function freeElectronEnergies(config, kPoint) {
  const gVectors = reciprocalVectors(
    planeWaveIndices(config.nMax),
    config.latticeConstant,
    config.latticeType || "square",
  );
  return gVectors
    .map(([gx, gy]) => {
      const kx = kPoint[0] + gx;
      const ky = kPoint[1] + gy;
      return kx * kx + ky * ky;
    })
    .sort((a, b) => a - b);
}

export function squareLatticeHighSymmetryPoints(latticeConstant) {
  const boundary = Math.PI / latticeConstant;
  return {
    Gamma: [0, 0],
    X: [boundary, 0],
    M: [boundary, boundary],
  };
}

export function hexagonalLatticeHighSymmetryPoints(latticeConstant) {
  const { b1, b2 } = reciprocalLatticeVectors(latticeConstant, "hexagonal");
  return {
    Gamma: [0, 0],
    K: [(b1[0] + 2 * b2[0]) / 3, (b1[1] + 2 * b2[1]) / 3],
    M: [(b1[0] + b2[0]) / 2, (b1[1] + b2[1]) / 2],
  };
}

export function latticeHighSymmetryPoints(config) {
  return (config.latticeType || "square") === "hexagonal"
    ? hexagonalLatticeHighSymmetryPoints(config.latticeConstant)
    : squareLatticeHighSymmetryPoints(config.latticeConstant);
}

export function interpolateKPath(pathPoints, pointsPerSegment) {
  if (pointsPerSegment < 2) throw new Error("pointsPerSegment must be at least 2");
  const kPoints = [];
  const distances = [];
  const labels = [];
  let cumulativeDistance = 0;

  for (let segmentIndex = 0; segmentIndex < pathPoints.length - 1; segmentIndex += 1) {
    const [startLabel, start] = pathPoints[segmentIndex];
    const [endLabel, end] = pathPoints[segmentIndex + 1];
    if (segmentIndex === 0) labels.push([startLabel, cumulativeDistance]);
    const startStep = segmentIndex === 0 ? 0 : 1;

    for (let step = startStep; step < pointsPerSegment; step += 1) {
      const fraction = step / (pointsPerSegment - 1);
      const current = [
        start[0] + fraction * (end[0] - start[0]),
        start[1] + fraction * (end[1] - start[1]),
      ];
      if (kPoints.length > 0) {
        const previous = kPoints[kPoints.length - 1];
        cumulativeDistance += Math.hypot(current[0] - previous[0], current[1] - previous[1]);
      }
      kPoints.push(current);
      distances.push(cumulativeDistance);
    }

    labels.push([endLabel, cumulativeDistance]);
  }

  return { kPoints, distances, labels };
}

export function squareLatticeKPath(config) {
  const points = squareLatticeHighSymmetryPoints(config.latticeConstant);
  return interpolateKPath(
    [
      ["Γ", points.Gamma],
      ["X", points.X],
      ["M", points.M],
      ["Γ", points.Gamma],
    ],
    config.pointsPerSegment,
  );
}

export function hexagonalLatticeKPath(config) {
  const points = hexagonalLatticeHighSymmetryPoints(config.latticeConstant);
  return interpolateKPath(
    [
      ["Γ", points.Gamma],
      ["K", points.K],
      ["M", points.M],
      ["Γ", points.Gamma],
    ],
    config.pointsPerSegment,
  );
}

export function latticeKPath(config) {
  return (config.latticeType || "square") === "hexagonal"
    ? hexagonalLatticeKPath(config)
    : squareLatticeKPath(config);
}

export function computeBandStructure(config) {
  validateConfig(config);
  const path = latticeKPath(config);
  const eigensystems = path.kPoints.map((kPoint) => solveSingleKEigensystem(config, kPoint));
  return {
    ...path,
    basisIndices: planeWaveIndices(config.nMax),
    eigenvalues: eigensystems.map((eigensystem) => eigensystem.values),
    eigenvectors: eigensystems.map((eigensystem) => eigensystem.vectors),
  };
}

export function computeRealSpacePotential(config, gridSize = 90) {
  validateConfig(config);
  const halfCell = config.latticeConstant / 2;
  const sites = basisSites(config);
  const values = [];

  for (let yIndex = 0; yIndex < gridSize; yIndex += 1) {
    const y = -halfCell + (yIndex / gridSize) * config.latticeConstant;
    const row = [];
    for (let xIndex = 0; xIndex < gridSize; xIndex += 1) {
      const x = -halfCell + (xIndex / gridSize) * config.latticeConstant;
      let value = 0;
      for (const [siteX, siteY] of sites) {
        const dx = x - siteX;
        const dy = y - siteY;
        if ((config.type || "square") === "gaussian") {
          value += -config.wellDepth * Math.exp(-(dx * dx + dy * dy) / (2 * config.sigma * config.sigma));
        } else if ((config.type || "square") === "muffin-tin") {
          if (dx * dx + dy * dy <= config.radius * config.radius) {
            value += -config.wellDepth;
          }
        } else {
          const halfWell = (config.fillFraction * config.latticeConstant) / 2;
          if (Math.abs(dx) < halfWell && Math.abs(dy) < halfWell) {
            value += -config.wellDepth;
          }
        }
      }
      row.push(value);
    }
    values.push(row);
  }

  return values;
}

export function xPointGap(config) {
  const points = latticeHighSymmetryPoints(config);
  const boundaryPoint = (config.latticeType || "square") === "hexagonal" ? points.K : points.X;
  const values = solveSingleK(config, boundaryPoint);
  return values[1] - values[0];
}

export function computeWavefunctionField(config, kPoint, eigenvector, gridSize = 64) {
  validateConfig(config);
  const basisIndices = planeWaveIndices(config.nMax);
  const gVectors = reciprocalVectors(basisIndices, config.latticeConstant, config.latticeType || "square");
  const halfCell = config.latticeConstant / 2;
  const dx = config.latticeConstant / gridSize;
  const dy = config.latticeConstant / gridSize;
  const real = [];
  const imag = [];
  const density = [];
  const phase = [];

  const coefficients = basisIndices.map((_, index) => {
    const coefficient = asComplex(eigenvector[index] ?? complex(0, 0));
    return coefficient;
  });

  let normIntegral = 0;
  for (let yIndex = 0; yIndex < gridSize; yIndex += 1) {
    const y = -halfCell + (yIndex / gridSize) * config.latticeConstant;
    const realRow = [];
    const imagRow = [];
    const densityRow = [];
    const phaseRow = [];
    for (let xIndex = 0; xIndex < gridSize; xIndex += 1) {
      const x = -halfCell + (xIndex / gridSize) * config.latticeConstant;
      let periodicReal = 0;
      let periodicImag = 0;

      // Build the Bloch periodic part directly from the plane-wave coefficients:
      // u_k(x,y) = Σ_G c_G exp(i G·r), using the same G ordering as the Hamiltonian basis.
      for (let basisIndex = 0; basisIndex < gVectors.length; basisIndex += 1) {
        const [gx, gy] = gVectors[basisIndex];
        const coefficient = coefficients[basisIndex];
        const argument = gx * x + gy * y;
        const cosine = Math.cos(argument);
        const sine = Math.sin(argument);
        periodicReal += coefficient.re * cosine - coefficient.im * sine;
        periodicImag += coefficient.re * sine + coefficient.im * cosine;
      }

      const value = periodicReal * periodicReal + periodicImag * periodicImag;
      normIntegral += value * dx * dy;
      realRow.push(periodicReal);
      imagRow.push(periodicImag);
      densityRow.push(value);
      phaseRow.push(Math.atan2(periodicImag, periodicReal));
    }
    real.push(realRow);
    imag.push(imagRow);
    density.push(densityRow);
    phase.push(phaseRow);
  }

  if (normIntegral <= 0 || !Number.isFinite(normIntegral)) return { real, imag, density, phase };

  const amplitudeScale = Math.sqrt(normIntegral);
  return {
    real: real.map((row) => row.map((value) => value / amplitudeScale)),
    imag: imag.map((row) => row.map((value) => value / amplitudeScale)),
    density: density.map((row) => row.map((value) => value / normIntegral)),
    phase,
  };
}

export function computeWavefunctionDensity(config, kPoint, eigenvector, gridSize = 64) {
  return computeWavefunctionField(config, kPoint, eigenvector, gridSize).density;
}
