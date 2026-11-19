/*import Plot from "react-plotly.js";
import { useState, useEffect } from "react";

function Graphique({ data }) {

const { constraints, z1, z2, type } = data;

const [offset,setOffset]=useState(0);
const [showTable,setShowTable]=useState(false);

// ===============================
// RANGE AUTOMATIQUE
// ===============================

let maxC=Math.max(...constraints.map(c=>Math.abs(c.c)))*1.5;
if(!maxC || maxC<10) maxC=10;

const xVals=[];
for(let i=0;i<=maxC;i+=maxC/100){
xVals.push(i);
}

// ===============================
// DROITES CONTRAINTES
// ===============================

const traces=constraints.map((con,index)=>{

if(con.b===0){

let x=con.c/con.a;

return{
x:[x,x],
y:[0,maxC],
type:"scatter",
mode:"lines",
name:`C${index+1}`,
line:{width:3}
};

}

return{

x:xVals,
y:xVals.map(x=>(con.c-con.a*x)/con.b),
type:"scatter",
mode:"lines",
name:`C${index+1}`,
line:{width:3}

};

});

// ===============================
// INTERSECTIONS
// ===============================

let points=[];

for(let i=0;i<constraints.length;i++){

for(let j=i+1;j<constraints.length;j++){

let c1=constraints[i];
let c2=constraints[j];

let det=c1.a*c2.b-c2.a*c1.b;

if(det!==0){

let x=(c1.c*c2.b-c2.c*c1.b)/det;
let y=(c1.a*c2.c-c2.a*c1.c)/det;

points.push({x,y,label:`C${i+1} ∩ C${j+1}`});

}

}

}

points.push({x:0,y:0,label:"Origine"});

// ===============================
// VERIFIER CONTRAINTES
// ===============================

const isValid=(p)=>{

return constraints.every(con=>{

let value=con.a*p.x+con.b*p.y;

if(con.sign==="<=") return value<=con.c+1e-6;
if(con.sign===">=") return value>=con.c-1e-6;
if(con.sign==="=") return Math.abs(value-con.c)<1e-6;

return false;

});

};

let validPoints=points.filter(p=>p.x>=0 && p.y>=0 && isValid(p));

if(validPoints.length===0)
return <h3 style={{color:"red"}}>Aucune solution réalisable</h3>;

// ===============================
// TRI POLYGONE
// ===============================

const center={
x:validPoints.reduce((s,p)=>s+p.x,0)/validPoints.length,
y:validPoints.reduce((s,p)=>s+p.y,0)/validPoints.length
};

validPoints.sort((a,b)=>

Math.atan2(a.y-center.y,a.x-center.x)-
Math.atan2(b.y-center.y,b.x-center.x)

);

// ===============================
// CALCUL Z
// ===============================

validPoints.forEach(p=>p.Z=z1*p.x+z2*p.y);

let optimal=validPoints[0];

validPoints.forEach(p=>{

if(type==="max"){
if(p.Z>optimal.Z) optimal=p;
}else{
if(p.Z<optimal.Z) optimal=p;
}

});

// ===============================
// ANIMATION DROITE OBJECTIF
// ===============================

useEffect(()=>{

let start= type==="max" ? 0 : optimal.Z*2;

setOffset(start);

const interval=setInterval(()=>{

setOffset(prev=>{

if(type==="max"){

if(prev>=optimal.Z) return prev;
return prev + optimal.Z/100;

}

if(type==="min"){

if(prev<=optimal.Z) return prev;
return prev - optimal.Z/100;

}

return prev;

});

},50);

return ()=>clearInterval(interval);

},[optimal.Z,type]);

// ===============================
// ZONE REALISABLE
// ===============================

const zoneTrace={

x:validPoints.map(p=>p.x),
y:validPoints.map(p=>p.y),

fill:"toself",
type:"scatter",
mode:"lines",

fillcolor:"rgba(255,0,0,0.25)",
line:{color:"red",width:3},

name:"Zone réalisable"

};

// ===============================
// SOMMETS
// ===============================

const pointsTrace={

x:validPoints.map(p=>p.x),
y:validPoints.map(p=>p.y),

type:"scatter",
mode:"markers",

marker:{size:10,color:"black"},

name:"Sommets"

};

// ===============================
// DROITE OBJECTIF
// ===============================

const objTrace={

x:xVals,

y:xVals.map(x=>
z2!==0 ? (offset - z1*x)/z2 : 0
),

type:"scatter",
mode:"lines",

line:{color:"blue",width:3,dash:"dash"},

name:"Droite objectif"

};

// ===============================
// POINT OPTIMAL
// ===============================

const optimalTrace={

x:[optimal.x],
y:[optimal.y],

mode:"markers+text",

text:[`Optimum (${optimal.x.toFixed(2)}, ${optimal.y.toFixed(2)})`],

textposition:"top center",

marker:{size:14,color:"green"},

name:"Solution optimale"

};

// ===============================
// AFFICHAGE
// ===============================

return(

<div className="mt-4">

<Plot

data={[
...traces,
zoneTrace,
pointsTrace,
objTrace,
optimalTrace
]}

layout={{

width:900,
height:600,

title:"Méthode Graphique",

xaxis:{
title:"x₁",
range:[0,maxC],
showgrid:true
},

yaxis:{
title:"x₂",
range:[0,maxC],
showgrid:true
},

}}

/>

<h4 className="mt-3">

Solution optimale :

x1 = {optimal.x.toFixed(2)} ,
x2 = {optimal.y.toFixed(2)} ,
Z = {optimal.Z.toFixed(2)}

</h4>

<br/>

</div>

);

}

export default Graphique;*/
import Plot from "react-plotly.js";
import { useState, useEffect } from "react";

function Graphique({ data }) {
  const { constraints, z1, z2, type } = data;
  const [offset, setOffset] = useState(0);

  // ===============================
  // 1. KAJY NY RANGE (ZOOM AUTOMATIQUE)
  // ===============================
  let maxC = Math.max(
    ...constraints.map(c => (c.a !== 0 ? Math.abs(c.c / c.a) : 0)),
    ...constraints.map(c => (c.b !== 0 ? Math.abs(c.c / c.b) : 0)),
    10 
  ) * 1.3;

  const xVals = [];
  for (let i = 0; i <= maxC; i += maxC / 100) xVals.push(i);

  // ===============================
  // 2. NY DROITES REHETRA (CONTRAINTES)
  // ===============================
  const traces = constraints.map((con, index) => {
    let xArr, yArr;
    if (con.b === 0) {
      xArr = [con.c / con.a, con.c / con.a];
      yArr = [0, maxC];
    } else {
      xArr = xVals;
      yArr = xVals.map(x => (con.c - con.a * x) / con.b);
    }
    return {
      x: xArr, y: yArr,
      type: "scatter", mode: "lines",
      name: `C${index + 1}`,
      line: { width: 2.5 },
      hovertemplate: `C${index + 1}: ${con.a}x₁ + ${con.b}x₂ ${con.sign} ${con.c}<extra></extra>`
    };
  });

  // ===============================
  // 3. FITADIAVANA NY SOMMETS (INTERSECTIONS)
  // ===============================
  let points = [{ x: 0, y: 0 }];
  constraints.forEach((c1, i) => {
    if (c1.a !== 0) points.push({ x: c1.c / c1.a, y: 0 });
    if (c1.b !== 0) points.push({ x: 0, y: c1.c / c1.b });
    constraints.slice(i + 1).forEach(c2 => {
      let det = c1.a * c2.b - c2.a * c1.b;
      if (det !== 0) {
        points.push({
          x: (c1.c * c2.b - c2.c * c1.b) / det,
          y: (c1.a * c2.c - c2.a * c1.c) / det
        });
      }
    });
  });

  const isValid = (p) => {
    if (p.x < -1e-6 || p.y < -1e-6) return false;
    return constraints.every(con => {
      let val = con.a * p.x + con.b * p.y;
      if (con.sign === "<=") return val <= con.c + 1e-6;
      if (con.sign === ">=") return val >= con.c - 1e-6;
      return Math.abs(val - con.c) < 1e-6;
    });
  };

  let validPoints = points.filter(isValid);

  if (validPoints.length === 0) {
    return <div className="alert alert-danger shadow mt-4">Aucune solution réalisable (Domaine vide).</div>;
  }

  const center = {
    x: validPoints.reduce((s, p) => s + p.x, 0) / validPoints.length,
    y: validPoints.reduce((s, p) => s + p.y, 0) / validPoints.length
  };
  validPoints.sort((a, b) => Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x));

  validPoints.forEach(p => p.Z = z1 * p.x + z2 * p.y);
  let optimal = validPoints.reduce((prev, curr) => 
    type === "max" ? (curr.Z > prev.Z ? curr : prev) : (curr.Z < prev.Z ? curr : prev)
  );

  // ===============================
  // 4. ANIMATION DROITE OBJECTIF
  // ===============================
  useEffect(() => {
    const startVal = type === "max" ? 0 : maxC * (Math.abs(z1) + Math.abs(z2));
    setOffset(startVal);

    const duration = 1500; 
    const fps = 30;
    const totalSteps = (duration / 1000) * fps;
    const stepValue = (optimal.Z - startVal) / totalSteps;

    const interval = setInterval(() => {
      setOffset(prev => {
        const next = prev + stepValue;
        if ((type === "max" && next >= optimal.Z) || (type === "min" && next <= optimal.Z)) {
          clearInterval(interval);
          return optimal.Z;
        }
        return next;
      });
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [optimal.Z, type, maxC, z1, z2]);

  // ===============================
  // 5. TRACES SY LAYOUT (FANITSIANA ECHELLE SY LABELS)
  // ===============================
  const zoneTrace = {
    x: [...validPoints.map(p => p.x), validPoints[0].x],
    y: [...validPoints.map(p => p.y), validPoints[0].y],
    fill: "toself",
    fillcolor: "rgba(0, 123, 255, 0.2)",
    line: { color: "blue", width: 1 },
    name: "Zone réalisable",
    type: "scatter"
  };

  const objTrace = {
    x: xVals,
    y: xVals.map(x => z2 !== 0 ? (offset - z1 * x) / z2 : 0),
    line: { color: "red", dash: "dash", width: 3 },
    name: `Objectif Z = ${offset.toFixed(1)}`,
    type: "scatter"
  };

  const layout = {
    width: 750, 
    height: 700, 
    title: { text: `<b>Méthode Graphique : ${type.toUpperCase()}</b>`, font: { size: 20 } },
    xaxis: { 
      // Nesorina ny title axis mahazatra fa soloina annotation
      title: "", 
      range: [0, maxC], 
      gridcolor: "#eee", 
      zeroline: true, zerolinecolor: "black", zerolinewidth: 3,
      constrain: "domain" 
    },
    yaxis: { 
      title: "", 
      range: [0, maxC], 
      gridcolor: "#eee", 
      zeroline: true, zerolinecolor: "black", zerolinewidth: 3,
      scaleanchor: "x", 
      scaleratio: 1 
    },
    annotations: [
      { // Label x1 eo amin'ny faran'ny axe X
        x: maxC * 0.98, y: 0, text: "<b>x₁</b>",
        showarrow: false, yshift: -20, font: { size: 18, color: "black" }
      },
      { // Label x2 eo amin'ny faran'ny axe Y
        x: 0, y: maxC * 0.98, text: "<b>x₂</b>",
        showarrow: false, xshift: -20, font: { size: 18, color: "black" }
      },
      { 
        x: optimal.x, y: optimal.y, text: "<b>S</b>",
        showarrow: true, arrowhead: 2, ax: 35, ay: -35,
        font: { size: 24, color: "red" }, bgcolor: "white", bordercolor: "red"
      }
    ],
    legend: { orientation: "h", y: -0.2 }
  };

  return (
    <div className="card shadow border-0 p-3 bg-white mt-4">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Plot
          data={[...traces, zoneTrace, objTrace, {
            x: [optimal.x], y: [optimal.y],
            mode: "markers", marker: { size: 12, color: "red" }, name: "Solution S"
          }]}
          layout={layout}
          config={{ responsive: true }}
        />
      </div>
      <div className="alert alert-primary mt-3 text-center py-3 shadow-sm">
        <h4 className="mb-0">
          📍 Solution Optimale <span className="badge bg-danger">S</span> : 
          <span className="ms-3 text-dark">x₁ = <b>{optimal.x.toFixed(2)}</b></span>
          <span className="ms-3 text-dark">x₂ = <b>{optimal.y.toFixed(2)}</b></span>
          <span className="ms-3 text-success">Z = <b>{optimal.Z.toFixed(2)}</b></span>
        </h4>
      </div>
    </div>
  );
}

export default Graphique;