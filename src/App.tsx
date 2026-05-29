import { useState } from "react";

export default function App() {
  const [workouts, setWorkouts] = useState(0);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Fitness Tracker</h1>

      <p>Workouts completed: {workouts}</p>

      <button onClick={() => setWorkouts(workouts + 1)}>
        Add Workout
      </button>
    </div>
  );
}