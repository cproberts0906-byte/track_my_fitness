import { useEffect, useMemo, useState } from "react";

type Mode = "gym" | "hotel";

type Exercise = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  muscle: string;
};

type DayPlan = {
  day: string;
  focus: string;
  muscleGroup: string;
  exercises: Exercise[];
  completed: boolean;
  missed: boolean;
};

type WeightEntry = {
  date: string;
  weight: number;
};

const STORAGE = {
  plan: "fitness_week_plan_v2",
  weight: "fitness_weight_v2",
  history: "fitness_history_v2",
};

// --------------------
// EXERCISE POOLS
// --------------------
const gym = {
  chest: ["Chest Press", "Pec Fly", "Incline Sit Ups"],
  back: ["Lat Pulldown", "Seated Row", "Assisted Pull Up"],
  legs: ["Leg Press", "Leg Curl", "Leg Extension"],
  shoulders: ["Shoulder Press", "Lat Raises", "Reverse Pec Fly"],
  arms: ["Bicep Curl", "Tricep Pushdown", "Tricep Extension"],
  full: ["Chest Press", "Lat Pulldown", "Leg Press", "Shoulder Press"],
};

const hotel = {
  chest: ["Push-ups", "Incline Push-ups", "Diamond Push-ups"],
  back: ["Supermans", "Plank", "Burpees"],
  legs: ["Squats", "Lunges", "Wall Sit"],
  shoulders: ["Pike Push-ups", "Arm Circles", "Push-ups"],
  arms: ["Chair Dips", "Push-ups", "Plank"],
  full: ["Burpees", "Push-ups", "Squats", "Lunges"],
};

const baseWeek = [
  { day: "Monday", focus: "Chest + Shoulders", muscleGroup: "chest_shoulders" },
  { day: "Tuesday", focus: "Back + Arms", muscleGroup: "back_arms" },
  { day: "Wednesday", focus: "Legs + Core", muscleGroup: "legs" },
  { day: "Thursday", focus: "Chest + Arms", muscleGroup: "chest_arms" },
  { day: "Friday", focus: "Full Body", muscleGroup: "full" },
  { day: "Saturday", focus: "Rest", muscleGroup: "rest" },
  { day: "Sunday", focus: "Rest", muscleGroup: "rest" },
];

// --------------------
// HELPERS
// --------------------
function pick(pool: string[], muscle: string): Exercise[] {
  return pool.map((name) => ({
    name,
    sets: 3,
    reps: 10,
    weight: 0,
    muscle,
  }));
}

function buildPlan(mode: Mode, history: DayPlan[] = []): DayPlan[] {
  const pool = mode === "gym" ? gym : hotel;

  const usageCount: Record<string, number> = {};

  const lastMuscle = history[0]?.muscleGroup;

  return baseWeek.map((d, i) => {
    if (d.muscleGroup === "rest") {
      return {
        ...d,
        exercises: [],
        completed: false,
        missed: false,
      };
    }

    // prevent same muscle back-to-back
    if (lastMuscle === d.muscleGroup) {
      d = { ...d, muscleGroup: "rest", focus: "Recovery (Auto-adjusted)" };
    }

    usageCount[d.muscleGroup] = (usageCount[d.muscleGroup] || 0) + 1;

    // limit max 2x/week
    if (usageCount[d.muscleGroup] > 2) {
      d = { ...d, muscleGroup: "rest", focus: "Recovery (Overuse Protection)" };
    }

    let exercises: Exercise[] = [];

    switch (d.muscleGroup) {
      case "chest_shoulders":
        exercises = [
          ...pick(pool.chest, "Chest"),
          ...pick(pool.shoulders, "Shoulders"),
        ];
        break;

      case "back_arms":
        exercises = [
          ...pick(pool.back, "Back"),
          ...pick(pool.arms, "Arms"),
        ];
        break;

      case "legs":
        exercises = pick(pool.legs, "Legs");
        break;

      case "chest_arms":
        exercises = [
          ...pick(pool.chest, "Chest"),
          ...pick(pool.arms, "Arms"),
        ];
        break;

      case "full":
        exercises = pick(pool.full, "Full Body");
        break;
    }

    return {
      day: d.day,
      focus: d.focus,
      muscleGroup: d.muscleGroup,
      exercises,
      completed: false,
      missed: false,
    };
  });
}

// --------------------
// APP
// --------------------
export default function App() {
  const [mode, setMode] = useState<Mode>("gym");
  const [plan, setPlan] = useState<DayPlan[]>([]);

  const [weight, setWeight] = useState(175);
  const [weeklyWeight, setWeeklyWeight] = useState(175);
  const [history, setHistory] = useState<WeightEntry[]>([]);

  // LOAD
  useEffect(() => {
    const savedPlan = localStorage.getItem(STORAGE.plan);
    const savedWeight = localStorage.getItem(STORAGE.weight);
    const savedHistory = localStorage.getItem(STORAGE.history);

    const parsedPlan = savedPlan ? JSON.parse(savedPlan) : buildPlan(mode);

    setPlan(parsedPlan);

    if (savedWeight) {
      setWeight(JSON.parse(savedWeight));
      setWeeklyWeight(JSON.parse(savedWeight));
    }

    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // SAVE
  useEffect(() => {
    localStorage.setItem(STORAGE.plan, JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    localStorage.setItem(STORAGE.weight, JSON.stringify(weight));
  }, [weight]);

  useEffect(() => {
    localStorage.setItem(STORAGE.history, JSON.stringify(history));
  }, [history]);

  // MODE SWITCH
  const switchMode = (m: Mode) => {
    setMode(m);
    setPlan(buildPlan(m, plan));
  };

  // MARK DAY + AUTO ADJUSTMENT
  const mark = (index: number, type: "done" | "miss") => {
    const updated = [...plan];

    updated[index].completed = type === "done";
    updated[index].missed = type === "miss";

    // AUTO SHIFT RULE:
    if (type === "miss") {
      for (let i = index + 1; i < updated.length; i++) {
        if (updated[i].muscleGroup !== "rest") {
          updated[i].focus += " (Adjusted)";
          break;
        }
      }
    }

    setPlan(updated);
  };

  // WEIGHT TRACKING (MONDAY)
  const submitWeight = () => {
    const entry: WeightEntry = {
      date: new Date().toLocaleDateString(),
      weight: weeklyWeight,
    };

    setHistory([entry, ...history]);
    setWeight(weeklyWeight);
  };

  // PROGRESS SUGGESTION
  const suggestion = useMemo(() => {
    if (history.length < 2) return "Keep training consistently";

    const diff = history[0].weight - history[1].weight;

    if (diff < 0) return "Good progress — maintain intensity";
    if (diff === 0) return "Stable — increase weight slightly";
    return "Weight up — tighten diet or increase cardio";
  }, [history]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 800 }}>
      <h1>Adaptive Fitness Planner</h1>

      {/* MODE */}
      <div>
        <button onClick={() => switchMode("gym")}>Gym Mode</button>
        <button onClick={() => switchMode("hotel")} style={{ marginLeft: 10 }}>
          Hotel Mode
        </button>
      </div>

      <p><strong>Mode:</strong> {mode}</p>

      {/* WEIGHT */}
      <h2>Weight Tracker</h2>

      <p>Current: {weight} lbs</p>

      <input
        type="number"
        value={weeklyWeight}
        onChange={(e) => setWeeklyWeight(Number(e.target.value))}
      />

      <button onClick={submitWeight} style={{ marginLeft: 10 }}>
        Submit Weekly Weight
      </button>

      <p><strong>Coach:</strong> {suggestion}</p>

      {/* PLAN */}
      <h2>Weekly Plan (Auto-Adjusted)</h2>

      {plan.map((d, i) => (
        <div key={i} style={{ marginBottom: 15 }}>
          <strong>
            {d.day} — {d.focus}
          </strong>

          {d.exercises.length === 0 ? (
            <p>Rest / Recovery</p>
          ) : (
            <ul>
              {d.exercises.map((e, j) => (
                <li key={j}>
                  {e.name} — {e.sets}x{e.reps}
                </li>
              ))}
            </ul>
          )}

          <button onClick={() => mark(i, "done")}>Done</button>
          <button onClick={() => mark(i, "miss")} style={{ marginLeft: 10 }}>
            Missed
          </button>
        </div>
      ))}
    </div>
  );
}