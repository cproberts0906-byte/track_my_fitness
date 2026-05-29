import { useEffect, useState } from "react";

type Mode = "gym" | "hotel";

type SetLog = {
  weight: string;
  reps: string;
};

type ExerciseLog = {
  sets: SetLog[];
};

type WorkoutLog = Record<string, Record<string, ExerciseLog>>;

const workouts = [
  {
    day: "Monday - Chest + Shoulders",
    gym: [
      "Chest Press Machine",
      "Incline Press Machine",
      "Pec Deck Fly",
      "Shoulder Press Machine",
      "Lateral Raise Machine",
      "Triceps Pushdown"
    ],
    hotel: [
      "Decline Push-ups",
      "Standard Push-ups",
      "Pike Push-ups",
      "Diamond Push-ups",
      "Chair Dips",
      "Plank"
    ]
  },
  {
    day: "Tuesday - Back + Arms",
    gym: [
      "Lat Pulldown",
      "Seated Row Machine",
      "Assisted Pull-up",
      "Reverse Pec Deck",
      "Bicep Curl Machine",
      "Triceps Pushdown"
    ],
    hotel: [
      "Pull-ups / Towel Rows",
      "Superman Hold",
      "Reverse Snow Angels",
      "Chair Rows",
      "Bicep Towel Curls",
      "Plank Row Hold"
    ]
  },
  {
    day: "Wednesday - Legs + Core",
    gym: [
      "Leg Press",
      "Leg Curl",
      "Leg Extension",
      "Calf Raise Machine",
      "Ab Crunch Machine",
      "Plank"
    ],
    hotel: [
      "Bodyweight Squats",
      "Walking Lunges",
      "Wall Sit",
      "Glute Bridges",
      "Calf Raises",
      "Plank"
    ]
  },
  {
    day: "Thursday - Chest + Arms Pump",
    gym: [
      "Incline Press Machine",
      "Pec Deck Fly",
      "Rear Delt Fly",
      "Bicep Curl Machine",
      "Triceps Pushdown",
      "Lateral Raise Machine"
    ],
    hotel: [
      "Push-ups",
      "Diamond Push-ups",
      "Pike Push-ups",
      "Chair Dips",
      "Plank Shoulder Taps",
      "Burpees"
    ]
  },
  {
    day: "Friday - Full Body",
    gym: [
      "Chest Press Machine",
      "Seated Row Machine",
      "Leg Press",
      "Walking Lunges",
      "Leg Curl",
      "Ab Crunch Machine"
    ],
    hotel: [
      "Push-ups",
      "Squats",
      "Lunges",
      "Chair Rows",
      "Plank",
      "Burpees"
    ]
  }
];

export default function App() {
  const [mode, setMode] = useState<Mode>("gym");

  const [logs, setLogs] = useState<WorkoutLog>(() =>
    JSON.parse(localStorage.getItem("logs") || "{}")
  );

  const [rest, setRest] = useState(0);

  useEffect(() => {
    localStorage.setItem("logs", JSON.stringify(logs));
  }, [logs]);

  const updateSet = (
    day: string,
    ex: string,
    field: keyof SetLog,
    value: string
  ) => {
    setLogs((prev) => {
      const dayLog = prev[day] || {};
      const exLog = dayLog[ex] || {
        sets: [{ weight: "", reps: "" }]
      };

      return {
        ...prev,
        [day]: {
          ...dayLog,
          [ex]: {
            sets: [{ ...exLog.sets[0], [field]: value }]
          }
        }
      };
    });
  };

  const startRest = (sec: number) => {
    setRest(sec);

    const interval = setInterval(() => {
      setRest((r) => {
        if (r <= 1) {
          clearInterval(interval);
          return 0;
        }

        return r - 1;
      });
    }, 1000);
  };

  const getAdvice = (reps: string) => {
    const r = Number(reps || 0);

    if (r >= 12) return "⬆️ Increase weight next time (+5 lb)";
    if (r >= 8) return "✅ Good range";
    if (r > 0) return "⬇️ Too heavy - reduce weight";

    return "";
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>💪 Military Fitness Tracker</h1>

      <button
        onClick={() => setMode(mode === "gym" ? "hotel" : "gym")}
        style={{
          marginBottom: 10,
          padding: 10,
          cursor: "pointer"
        }}
      >
        Switch to {mode === "gym" ? "Hotel" : "Gym"} Mode
      </button>

      <h3>Current Mode: {mode.toUpperCase()}</h3>

      <div style={{ marginBottom: 20 }}>
        <h2>Rest Timer: {rest}s</h2>

        <button onClick={() => startRest(60)}>60s</button>
        <button onClick={() => startRest(90)}>90s</button>
        <button onClick={() => startRest(120)}>120s</button>
      </div>

      {workouts.map((w) => (
        <div
          key={w.day}
          style={{
            marginBottom: 40,
            borderBottom: "1px solid gray",
            paddingBottom: 20
          }}
        >
          <h2>{w.day}</h2>

          {(mode === "gym" ? w.gym : w.hotel).map((ex) => {
            const reps =
              logs?.[w.day]?.[ex]?.sets?.[0]?.reps || "";

            return (
              <div
                key={ex}
                style={{
                  marginBottom: 15
                }}
              >
                <b>{ex}</b>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 5
                  }}
                >
                  <input
                    placeholder="weight"
                    onChange={(e) =>
                      updateSet(
                        w.day,
                        ex,
                        "weight",
                        e.target.value
                      )
                    }
                  />

                  <input
                    placeholder="reps"
                    onChange={(e) =>
                      updateSet(
                        w.day,
                        ex,
                        "reps",
                        e.target.value
                      )
                    }
                  />

                  <button onClick={() => startRest(60)}>
                    Rest
                  </button>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "gray",
                    marginTop: 4
                  }}
                >
                  {getAdvice(reps)}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}