import { useState } from "react";

function Formulaire({ setData }) {
  const [constraints, setConstraints] = useState([
    { a: 4, b: -3, sign: "<=", c: 2 },
    { a: -2, b: 1, sign: "<=", c: 1 },
    { a: -6, b: 14, sign: "<=", c: 35 }
  ]);

  const [z1, setZ1] = useState("1");
  const [z2, setZ2] = useState("2");
  const [type, setType] = useState("max");

  // --- LOGIC ---
  const handleChange = (index, field, value) => {
    const newConstraints = [...constraints];
    newConstraints[index][field] = value;
    setConstraints(newConstraints);
  };

  const addConstraint = () => {
    if (constraints.length < 5)
      setConstraints([...constraints, { a: "1", b: "1", sign: "<=", c: "5" }]);
  };

  const removeConstraint = (index) => {
    const newConstraints = constraints.filter((_, i) => i !== index);
    setConstraints(newConstraints);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setData({
      constraints: constraints.map(c => ({ a: Number(c.a), b: Number(c.b), sign: c.sign, c: Number(c.c) })),
      z1: Number(z1), z2: Number(z2), type
    });
  };

  // --- RENDER PREVIEW (Ilay eo ankavia) ---
  const renderMathPreview = () => {
    const formatVar = (coef, varName, isFirst = false) => {
      const val = Number(coef);
      if (val === 0) return ""; 
      
      let sign = "";
      if (!isFirst) {
        sign = val > 0 ? " + " : " - ";
      } else if (val < 0) {
        sign = "-";
      }

      const absoluteVal = Math.abs(val);
      const displayVal = absoluteVal === 1 ? "" : absoluteVal;
      
      return `${sign}${displayVal}${varName}`;
    };

    const formatSign = (s) => {
      if (s === "<=") return "≤";
      if (s === ">=") return "≥";
      return s;
    };

    return (
      <div className="p-4 border rounded bg-white shadow-sm d-flex flex-column justify-content-center h-100" 
           style={{ fontFamily: "'Times New Roman', serif" }}>
        
        <div className="d-flex align-items-center justify-content-center">
          {/* Akolada lehibe */}
          <div style={{ 
            fontSize: `${Math.max(constraints.length * 2, 3)}rem`, 
            lineHeight: 1,
            marginTop: "-5px",
            fontWeight: "100",
            color: "#333"
          }}>
            &#123;
          </div>

          {/* Lisitry ny Contraintes nodiovina */}
          <div className="ms-3" style={{ fontSize: "1.3rem" }}>
            {constraints.map((con, i) => {
              const part1 = formatVar(con.a, "x₁", true);
              const part2 = formatVar(con.b, "x₂", part1 === "");
              
              return (
                <div key={i} className="mb-2 text-nowrap">
                  {part1 === "" && part2 === "" ? "0" : `${part1}${part2}`} {formatSign(con.sign)} {con.c}
                </div>
              );
            })}
          </div>
        </div>

        {/* Fonction Objectif nodiovina */}
        <div className="mt-4 pt-3 border-top text-center fw-bold" style={{ fontSize: "1.5rem" }}>
          <span className="text-primary">{type.toUpperCase()}</span> ({formatVar(z1, "x₁", true)}{formatVar(z2, "x₂", Number(z1) === 0)})
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4 mb-5">
      {/* 1. HEADER */}
      <div className="border border-secondary p-2 bg-white shadow-sm mb-3">
        <div className="d-flex justify-content-between align-items-center bg-white p-1">
          <div className="bg-success text-white px-3 py-2 fw-bold text-center" style={{ minWidth: "150px", fontSize: "0.8rem" }}>
            RECHERCHE<br />OPERATIONNELLE
          </div>
          <div className="text-center">
            <h2 className="text-danger mb-0" style={{ fontFamily: "'Times New Roman', serif" }}>Résolution graphique </h2>
            <h5 className="animate-h5">Programmation Linéaire - Méthode Graphique</h5>
          </div>
          <div className="bg-success text-white px-3 py-2 fw-bold text-center" style={{ minWidth: "150px", fontSize: "0.8rem" }}>
            Prog. Lin<br />Graphique
          </div>
        </div>

        {/* 2. BODY */}
        <div className="row g-3 p-3 bg-light mt-2 border-top">
          {/* ANKAVIA: Math Display */}
          <div className="col-md-5">
            {renderMathPreview()}
          </div>

          {/* ANKAVANANA: Ny Formulaire */}
          <div className="col-md-7">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-dark text-white text-center py-2">
                <span className="fw-bold">Paramètres du Problème</span>
              </div>
              
              <form onSubmit={handleSubmit} className="card-body p-3">
                {/* Section Fonction Objectif */}
                <div className="p-3 rounded mb-3" style={{ backgroundColor: "#f0f7ff", borderLeft: "4px solid #007bff" }}>
                  <h6 className="text-center text-primary fw-bold small mb-3">1. FONCTION OBJECTIF (Z)</h6>
                  <div className="row g-2">
                    <div className="col-4">
                      <select className="form-select form-select-sm" value={type} onChange={e => setType(e.target.value)}>
                        <option value="max">Maximiser (Z)</option>
                        <option value="min">Minimiser (Z)</option>
                      </select>
                    </div>
                    <div className="col-4">
                      <div className="input-group input-group-sm">
                        <input className="form-control text-center" type="number" value={z1} onChange={e => setZ1(e.target.value)} />
                        <span className="input-group-text">x₁</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="input-group input-group-sm">
                        <input className="form-control text-center" type="number" value={z2} onChange={e => setZ2(e.target.value)} />
                        <span className="input-group-text">x₂</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Contraintes */}
                <div>
                  <div className="d-flex justify-content-between mb-2">
                    <h6 className="fw-bold text-secondary small">2. CONTRAINTES</h6>
                    <button type="button" className="btn btn-sm btn-outline-success py-0 px-2" onClick={addConstraint}>+ Ajouter</button>
                  </div>
                  <div style={{maxHeight: "250px", overflowY: "auto", overflowX: "hidden"}}>
                    {constraints.map((con, index) => (
                      <div key={index} className="row g-2 mb-2 align-items-center p-2 bg-white rounded border mx-0">
                        
                        {/* Champ pour x1 avec son badge d'indice */}
                        <div className="col-3">
                          <div className="input-group input-group-sm">
                            <input className="form-control text-center" type="number" value={con.a} onChange={e => handleChange(index, "a", e.target.value)} />
                            <span className="input-group-text">x₁</span>
                          </div>
                        </div>
                        
                        <div className="col-auto small text-muted">+</div >
                        
                        {/* Champ pour x2 avec son badge d'indice */}
                        <div className="col-3">
                          <div className="input-group input-group-sm">
                            <input className="form-control text-center" type="number" value={con.b} onChange={e => handleChange(index, "b", e.target.value)} />
                            <span className="input-group-text">x₂</span>
                          </div>
                        </div>

                        {/* Sélecteur de signe */}
                        <div className="col-2 px-1">
                          <select className="form-select form-select-sm px-1" value={con.sign} onChange={e => handleChange(index, "sign", e.target.value)}>
                            <option value="<=">&le;</option>
                            <option value=">=">&ge;</option>
                            <option value="=">=</option>
                          </select>
                        </div>

                        {/* Valeur de droite (RHS) */}
                        <div className="col-2">
                          <input className="form-control form-control-sm text-center px-1" type="number" value={con.c} onChange={e => handleChange(index, "c", e.target.value)} />
                        </div>

                        {/* Bouton de suppression */}
                        <div className="col-auto">
                          <button type="button" className="btn btn-sm text-danger p-0 fw-bold" style={{fontSize: "1.2rem", lineHeight: 1}} onClick={() => removeConstraint(index)} disabled={constraints.length <= 1}>×</button>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton de soumission */}
                <div className="text-center mt-3">
                  <button className="btn btn-primary btn-sm px-5 py-2 fw-bold shadow-sm rounded-pill">
                    Calculer la solution
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Formulaire;