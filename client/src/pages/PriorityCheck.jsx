import React, { useState } from "react";
import axios from "axios";

function PriorityCheck() {
  const [result, setResult] = useState(null);

  const checkPriority = async () => {
    const response = await axios.post(
      "http://localhost:5000/api/ai/priority",
      {
        AQI: 80,
        PM2_5: 45,
        PM10: 70,
        BOD: 4,
        waste_tons_per_day: 200,
        green_cover_percent: 30,
        population_density: 5000
      }
    );
    setResult(response.data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Priority Check</h2>
      <button onClick={checkPriority}>Check Priority</button>

      {result && (
        <div>
          <p><b>Score:</b> {result.priority_score}</p>
          <p><b>Label:</b> {result.priority_label}</p>
        </div>
      )}
    </div>
  );
}

// export default PriorityCheck;
// export default function PriorityCheck() {
//   return (
//     <div className="min-h-screen bg-red-500 flex items-center justify-center">
//       <h1 className="text-white text-4xl font-bold">
//         Tailwind Test
//       </h1>
//     </div>
//   );
// }
