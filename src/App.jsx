/*mport { useState } from "react";
import Formulaire from "./components/Formulaire";
import Graphique from "./components/Graphique";

function App() {
  const [data, setData] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Programmation Linéaire - Méthode Graphique</h2>
      <Formulaire setData={setData} />
      {data && <Graphique data={data} />}
    </div>
  );
}

export default App;*/
import { useState } from "react";
import Formulaire from "./components/Formulaire";
import Graphique from "./components/Graphique";
import "./App.css"; // tokony hametrahana CSS

function App() {
  const [data, setData] = useState(null);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Formulaire setData={setData} />
      {data && <Graphique data={data} />}
    </div>
  );
}

export default App;