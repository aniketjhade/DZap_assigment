import React from "react";
import Disperse from "./Components/Disperse";

function App() {
  return (
    <div className="App bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4 p-4 bg-white rounded-lg shadow-md">
        Disperse Component
      </h1>
      <Disperse />
    </div>
  );
}

export default App;
