
import Plot from "react-plotly.js";
import { useState, useEffect } from "react";

function Graphique({ data }) {

  const { constraints, z1, z2, type } = data;
  const [offset, setOffset] = useState(0);

  // ==========================================
  // 1. CALCUL AUTOMATIQUE DU RANGE
  // ==========================================

  const intercepts = constraints.flatMap(con => {
    const values = [];

    if (con.a !== 0) values.push(Math.abs(con.c / con.a));
    if (con.b !== 0) values.push(Math.abs(con.c / con.b));

    return values;
  });

  const maxC = Math.max(10, ...intercepts) * 1.3;

  // Affichage dans les quatre quadrants
  const graphMin = -maxC;
  const graphMax = maxC;

  // ==========================================
  // 2. TRACER LES DROITES DES CONTRAINTES
  // ==========================================

  const traces = constraints.map((con, index) => {

    if (con.a === 0 && con.b === 0) return null;

    let xArr = [];
    let yArr = [];

    if (con.b === 0) {

      // Droite verticale : x = c/a

      const x = con.c / con.a;

      xArr = [x, x];
      yArr = [graphMin, graphMax];

    } else if (con.a === 0) {

      // Droite horizontale : y = c/b

      const y = con.c / con.b;

      xArr = [graphMin, graphMax];
      yArr = [y, y];

    } else {

      // Droite oblique : ax + by = c

      // Prolongement sur toute la largeur du graphique

      xArr = [graphMin, graphMax];

      yArr = xArr.map(x =>
        (con.c - con.a * x) / con.b
      );

    }

    return {
      x: xArr,
      y: yArr,

      type: "scatter",
      mode: "lines",

      name: `C${index + 1}`,

      line: {
        width: 2.5
      },

      hovertemplate:
        `C${index + 1}: ${con.a}x₁ + ${con.b}x₂ ${con.sign} ${con.c}<extra></extra>`
    };

  }).filter(Boolean);

  // ==========================================
  // 3. CALCUL DES INTERSECTIONS
  // ==========================================

  let points = [{ x: 0, y: 0 }];

  constraints.forEach((c1, i) => {

    // Intersection avec axe X

    if (c1.a !== 0) {
      points.push({
        x: c1.c / c1.a,
        y: 0
      });
    }

    // Intersection avec axe Y

    if (c1.b !== 0) {
      points.push({
        x: 0,
        y: c1.c / c1.b
      });
    }

    // Intersection entre deux contraintes

    constraints.slice(i + 1).forEach(c2 => {

      const det = c1.a * c2.b - c2.a * c1.b;

      if (Math.abs(det) > 1e-10) {

        const x =
          (c1.c * c2.b - c2.c * c1.b) / det;

        const y =
          (c1.a * c2.c - c2.a * c1.c) / det;

        points.push({ x, y });

      }

    });

  });

  // ==========================================
  // 4. VERIFIER LES CONTRAINTES
  // ==========================================

  const isValid = p => {

    if (p.x < -1e-6 || p.y < -1e-6) return false;

    return constraints.every(con => {

      const val = con.a * p.x + con.b * p.y;

      if (con.sign === "<=") {
        return val <= con.c + 1e-6;
      }

      if (con.sign === ">=") {
        return val >= con.c - 1e-6;
      }

      if (con.sign === "=") {
        return Math.abs(val - con.c) < 1e-6;
      }

      return false;

    });

  };

  // Supprimer les points invalides et les doublons

  let validPoints = points
    .filter(isValid)
    .filter((p, index, arr) =>
      arr.findIndex(q =>
        Math.abs(q.x - p.x) < 1e-6 &&
        Math.abs(q.y - p.y) < 1e-6
      ) === index
    );

  if (validPoints.length === 0) {

    return (
      <div className="alert alert-danger shadow mt-4">
        Aucune solution réalisable (domaine vide).
      </div>
    );

  }

  // ==========================================
  // 5. TRI DES SOMMETS
  // ==========================================

  const center = {
    x: validPoints.reduce((s, p) => s + p.x, 0) / validPoints.length,
    y: validPoints.reduce((s, p) => s + p.y, 0) / validPoints.length
  };

  validPoints.sort((a, b) =>
    Math.atan2(a.y - center.y, a.x - center.x) -
    Math.atan2(b.y - center.y, b.x - center.x)
  );

  // ==========================================
  // 6. CALCUL DE LA FONCTION OBJECTIF
  // ==========================================

  validPoints.forEach(p => {
    p.Z = z1 * p.x + z2 * p.y;
  });

  const optimal = validPoints.reduce((prev, curr) =>
    type === "max"
      ? (curr.Z > prev.Z ? curr : prev)
      : (curr.Z < prev.Z ? curr : prev)
  );

  // ==========================================
  // 7. ANIMATION DE LA DROITE OBJECTIF
  // ==========================================

  useEffect(() => {

    const startVal = type === "max"
      ? Math.min(0, optimal.Z)
      : Math.max(0, optimal.Z);

    setOffset(startVal);

    const duration = 1500;
    const fps = 30;
    const totalSteps = duration / 1000 * fps;

    let step = 0;

    const interval = setInterval(() => {

      step++;

      const progress = Math.min(step / totalSteps, 1);

      setOffset(
        startVal + (optimal.Z - startVal) * progress
      );

      if (progress >= 1) {
        clearInterval(interval);
      }

    }, 1000 / fps);

    return () => clearInterval(interval);

  }, [optimal.Z, type]);

  // ==========================================
  // 8. ZONE REALISABLE
  // ==========================================

  const zoneTrace = {

    x: [
      ...validPoints.map(p => p.x),
      validPoints[0].x
    ],

    y: [
      ...validPoints.map(p => p.y),
      validPoints[0].y
    ],

    fill: "toself",

    fillcolor: "rgba(0, 123, 255, 0.2)",

    line: {
      color: "blue",
      width: 1
    },

    name: "Zone réalisable",

    type: "scatter",
    mode: "lines"

  };

  // ==========================================
  // 9. DROITE OBJECTIF
  // ==========================================

  const objCandidates = [];

  if (Math.abs(z2) > 1e-10) {

    [graphMin, graphMax].forEach(x => {

      const y = (offset - z1 * x) / z2;

      if (y >= graphMin && y <= graphMax) {
        objCandidates.push({ x, y });
      }

    });

    if (Math.abs(z1) > 1e-10) {

      [graphMin, graphMax].forEach(y => {

        const x = (offset - z2 * y) / z1;

        if (x >= graphMin && x <= graphMax) {
          objCandidates.push({ x, y });
        }

      });

    }

  } else if (Math.abs(z1) > 1e-10) {

    const x = offset / z1;

    objCandidates.push(
      { x, y: graphMin },
      { x, y: graphMax }
    );

  }

  const objTrace = {

    x: objCandidates.map(p => p.x),
    y: objCandidates.map(p => p.y),

    type: "scatter",
    mode: "lines",

    line: {
      color: "red",
      dash: "dash",
      width: 3
    },

    name: `Objectif Z = ${offset.toFixed(2)}`

  };

  // ==========================================
  // 10. POINT OPTIMAL
  // ==========================================

  const optimalTrace = {

    x: [optimal.x],
    y: [optimal.y],

    type: "scatter",
    mode: "markers+text",

    marker: {
      size: 14,
      color: "red"
    },

    text: ["S"],
    textposition: "top right",

    name: "Solution optimale"

  };

  // ==========================================
  // 11. CONFIGURATION DU GRAPHIQUE
  // ==========================================

  const layout = {

    autosize: true,
    height: 700,

    title: {
      text: `<b>Méthode Graphique : ${type.toUpperCase()}</b>`,
      font: { size: 20 }
    },

    xaxis: {

      title: {
        text: "<b>x₁</b>",
        standoff: 15
      },

      range: [graphMin, graphMax],

      showgrid: true,
      gridcolor: "#eeeeee",

      zeroline: true,
      zerolinecolor: "black",
      zerolinewidth: 2,

      showline: true,
      linecolor: "black"

    },

    yaxis: {

      title: {
        text: "<b>x₂</b>",
        standoff: 15
      },

      range: [graphMin, graphMax],

      showgrid: true,
      gridcolor: "#eeeeee",

      zeroline: true,
      zerolinecolor: "black",
      zerolinewidth: 2,

      showline: true,
      linecolor: "black",

      scaleanchor: "x",
      scaleratio: 1

    },

    legend: {
      orientation: "h",
      y: -0.2
    },

    margin: {
      l: 75,
      r: 40,
      t: 80,
      b: 100
    },

    hovermode: "closest"

  };

  // ==========================================
  // 12. AFFICHAGE FINAL
  // ==========================================

  return (

    <div className="card shadow border-0 p-3 bg-white mt-4">

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%"
        }}
      >

        <Plot

          data={[
            ...traces,
            zoneTrace,
            objTrace,
            optimalTrace
          ]}

          layout={layout}

          config={{
            responsive: true,
            displaylogo: false
          }}

          style={{
            width: "100%",
            maxWidth: "900px"
          }}

          useResizeHandler={true}

        />

      </div>

      {/* RESULTAT OPTIMAL */}

      <div className="alert alert-primary mt-3 text-center py-3 shadow-sm">

        <h4 className="mb-3">

          📍 Solution Optimale

          <span className="badge bg-danger ms-2">
            S
          </span>

        </h4>

        <div className="d-flex justify-content-center flex-wrap gap-4">

          <span className="text-dark">
            x₁ = <b>{optimal.x.toFixed(2)}</b>
          </span>

          <span className="text-dark">
            x₂ = <b>{optimal.y.toFixed(2)}</b>
          </span>

          <span className="text-success">
            Z = <b>{optimal.Z.toFixed(2)}</b>
          </span>

        </div>

      </div>

    </div>

  );

}

export default Graphique;
