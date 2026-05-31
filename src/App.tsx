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
  cardio?: string;
  completed: boolean;
  missed: boolean;
};

type WeightEntry = {
  date: string;
  weight: number;
  week: number;
};

type ExerciseHistory = {
  exercise: string;
  week: number;
  weight: number;
};

const STORAGE = {
  plan: "fitness_week_plan_v4",
  weight: "fitness_weight_v4",
  history: "fitness_weight_history_v4",
  exerciseHistory: "fitness_exercise_history_v4",
  week: "fitness_week_v4",
};

// --------------------
// GYM
// --------------------
const gym = {
  chest: ["Chest Press", "Pec Fly", "Incline Sit Ups"],
  back: ["Lat Pulldown", "Seated Row", "Assisted Pull Up"],
  legs: ["Leg Press", "Leg Curl", "Leg Extension"],
  shoulders: ["Shoulder Press", "Lat Raises", "Reverse Pec Fly"],
  arms: [
    "Bicep Curl",
    "Tricep Pushdown",
    "Tricep Extension",
    "Assisted Dip Machine",
  ],
  core: ["Sit-ups", "Bicycle Crunches", "Flutter Kicks", "Mountain Climbers"],
  legsExtras: ["Hip Abductor", "Hip Adductor", "Calf Raises"],
  full: ["Chest Press", "Lat Pulldown", "Leg Press", "Shoulder Press"],
};

// --------------------
// HOTEL
// --------------------
const hotel = {
  chest: ["Push-ups", "Incline Push-ups", "Diamond Push-ups"],
  back: ["Supermans", "Plank", "Mountain Climbers"],
  legs: ["Squats", "Lunges", "Wall Sit"],
  shoulders: ["Pike Push-ups", "Arm Circles"],
  arms: ["Chair Dips", "Push-ups"],
  core: ["Sit-ups", "Flutter Kicks", "Bicycle Crunches", "Mountain Climbers"],
  full: ["Burpees", "Push-ups", "Squats", "Lunges", "Chair Dips"],
};

// --------------------
const baseWeek = [
  { day: "Monday", focus: "Chest + Shoulders", muscleGroup: "chest_shoulders" },
  { day: "Tuesday", focus: "Back + Arms", muscleGroup: "back_arms" },
  { day: "Wednesday", focus: "Legs + Core", muscleGroup: "legs" },
  { day: "Thursday", focus: "Chest + Arms", muscleGroup: "chest_arms" },
  { day: "Friday", focus: "Full Body", muscleGroup: "full" },
  { day: "Saturday", focus: "Core + Cardio", muscleGroup: "core_day" },
  { day: "Sunday", focus: "Rest", muscleGroup: "rest" },
];

// --------------------
function makeExercise(name: string, muscle: string): Exercise {
  return {
    name,
    sets: 3,
    reps: 10,
    weight: 0,
    muscle,
  };
}

// --------------------
function buildPlan(mode: Mode): DayPlan[] {
  const pool = mode === "gym" ? gym : hotel;

  return baseWeek.map((d) => {
    let exercises: Exercise[] = [];
    let cardio = "";

    switch (d.muscleGroup) {
      case "chest_shoulders":
        exercises = [
          ...pool.chest.map((n) => makeExercise(n, "Chest")),
          ...pool.shoulders.map((n) => makeExercise(n, "Shoulders")),
        ];
        cardio = "Optional: 10–15 min incline walk";
        break;

      case "back_arms":
        exercises = [
          ...pool.back.map((n) => makeExercise(n, "Back")),
          ...pool.arms.map((n) => makeExercise(n, "Arms")),
        ];
        cardio = "Optional: 10 min cardio";
        break;

      case "legs":
        exercises = [
          ...pool.legs.map((n) => makeExercise(n, "Legs")),
          ...(mode === "gym"
            ? gym.legsExtras.map((n) => makeExercise(n, "Legs"))
            : []),
        ];
        break;

      case "chest_arms":
        exercises = [
          ...pool.chest.map((n) => makeExercise(n, "Chest")),
          ...pool.arms.map((n) => makeExercise(n, "Arms")),
        ];
        cardio = "10 min incline walk";
        break;

      case "full":
        exercises = pool.full.map((n) => makeExercise(n, "Full Body"));
        cardio = "15–20 min cardio";
        break;

      case "core_day":
        exercises = pool.core.map((n) => makeExercise(n, "Core"));
        cardio = "Optional HIIT 10 min";
        break;
    }

    return {
      day: d.day,
      focus: d.focus,
      muscleGroup: d.muscleGroup,
      exercises,
      cardio,
      completed: false,
      missed: false,
    };
  });
}

// --------------------
export default function App() {
  const [mode, setMode] = useState<Mode>("gym");
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [week, setWeek] = useState(1);

  const [weight, setWeight] = useState(175);
  const [weeklyWeight, setWeeklyWeight] = useState(175);

  const [history, setHistory] = useState<WeightEntry[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory[]>([]);

  // LOAD
  useEffect(() => {
    const savedPlan = localStorage.getItem(STORAGE.plan);
    const savedWeight = localStorage.getItem(STORAGE.weight);
    const savedHistory = localStorage.getItem(STORAGE.history);
    const savedEx = localStorage.getItem(STORAGE.exerciseHistory);
    const savedWeek = localStorage.getItem(STORAGE.week);

    setPlan(savedPlan ? JSON.parse(savedPlan) : buildPlan(mode));

    if (savedWeight) {
      setWeight(JSON.parse(savedWeight));
      setWeeklyWeight(JSON.parse(savedWeight));
    }

    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedEx) setExerciseHistory(JSON.parse(savedEx));
    if (savedWeek) setWeek(JSON.parse(savedWeek));
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

  useEffect(() => {
    localStorage.setItem(STORAGE.exerciseHistory, JSON.stringify(exerciseHistory));
  }, [exerciseHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE.week, JSON.stringify(week));
  }, [week]);

  // MODE
  const switchMode = (m: Mode) => {
    setMode(m);
    setPlan(buildPlan(m));
  };

  // SAVE EXERCISE WEIGHT
  const saveExerciseWeight = (exercise: string, value: number) => {
    setExerciseHistory([
      ...exerciseHistory,
      { exercise, week, weight: value },
    ]);
  };

  const getLastWeekWeight = (name: string) => {
    const last = exerciseHistory
      .filter((e) => e.exercise === name && e.week === week - 1)
      .slice(-1)[0];

    return last?.weight ?? 0;
  };

  const getRecommendedWeight = (name: string) => {
    const last = getLastWeekWeight(name);
    if (!last) return 10;
    return Math.round(last * 1.025);
  };

  // UPDATE EXERCISE WEIGHT
  const updateWeight = (dayIndex: number, exIndex: number, value: number) => {
    const updated = [...plan];
    updated[dayIndex].exercises[exIndex].weight = value;
    setPlan(updated);
  };

  // MARK DAY
  const mark = (i: number, type: "done" | "miss") => {
    const updated = [...plan];
    updated[i].completed = type === "done";
    updated[i].missed = type === "miss";

    if (type === "done") {
      updated[i].exercises.forEach((e) => {
        saveExerciseWeight(e.name, e.weight);
      });
    }

    setPlan(updated);
  };

  // WEIGHT TRACK
  const submitWeight = () => {
    const entry: WeightEntry = {
      date: new Date().toLocaleDateString(),
      weight: weeklyWeight,
      week,
    };

    setHistory([entry, ...history]);
    setWeight(weeklyWeight);
    setWeek(week + 1);
  };

  // TREND
  const trend = useMemo(() => {
    if (history.length < 2) return "Start tracking";

    const diff = history[0].weight - history[1].weight;

    if (diff < 0) return "Fat loss trending 👍";
    if (diff === 0) return "Stable";
    return "Adjust diet / add cardio";
  }, [history]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 900 }}>
      <h1>Adaptive Fitness Planner</h1>

      <p>Week: {week}</p>

      <button onClick={() => switchMode("gym")}>Gym</button>
      <button onClick={() => switchMode("hotel")} style={{ marginLeft: 10 }}>
        Hotel
      </button>

      <h2>Weight</h2>
      <p>Current: {weight} lbs</p>

      <input
        type="number"
        value={weeklyWeight}
        onChange={(e) => setWeeklyWeight(Number(e.target.value))}
      />

      <button onClick={submitWeight}>Submit Weekly Weight</button>

      <p><strong>Coach:</strong> {trend}</p>

      <h2>Workout Plan</h2>

      {plan.map((d, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <strong>{d.day} — {d.focus}</strong>

          {d.exercises.map((e, j) => (
            <div key={j}>
              <div>
                {e.name} — {e.sets}x{e.reps}
              </div>

              <div style={{ fontSize: 12 }}>
                Last week: {getLastWeekWeight(e.name)} lbs |
                Recommended: {getRecommendedWeight(e.name)} lbs
              </div>

              <input
                type="number"
                value={e.weight}
                onChange={(ev) =>
                  updateWeight(i, j, Number(ev.target.value))
                }
                style={{ width: 70 }}
              />
            </div>
          ))}

          <button onClick={() => mark(i, "done")}>Done</button>
          <button onClick={() => mark(i, "miss")} style={{ marginLeft: 10 }}>
            Missed
          </button>
        </div>
      ))}
    </div>
  );
}