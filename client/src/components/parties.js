import React, { useEffect, useState } from "react";

function Parties({ setPromises }) {
  const [parties, setParties] = useState([]);
  const [politicians, setPoliticians] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/parties")
      .then(res => res.json())
      .then(data => setParties(data));
  }, []);

  const loadPoliticians = (partyId) => {
    fetch(`http://localhost:3000/politicians/${partyId}`)
      .then(res => res.json())
      .then(data => setPoliticians(data));
  };

  return (
    <div>
      <h2>Parties</h2>

      {parties.map(p => (
        <button key={p.id} onClick={() => loadPoliticians(p.id)}>
          {p.name}
        </button>
      ))}

      <h2>Politicians</h2>

      {politicians.map(pol => (
        <button key={pol.id} onClick={() => setPromises(pol.id)}>
          {pol.name}
        </button>
      ))}
    </div>
  );
}

export default Parties;