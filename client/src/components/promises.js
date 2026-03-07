import React, { useState } from "react";

function Promises() {
  const [promises, setPromises] = useState([]);

  const loadPromises = (politicianId) => {
    fetch(`http://localhost:3000/promises/${politicianId}`)
      .then(res => res.json())
      .then(data => setPromises(data));
  };

  return (
    <div>
      <h2>Promises</h2>

      {promises.map(p => (
        <div key={p.id}>
          {p.promise}
        </div>
      ))}
    </div>
  );
}

export default Promises;