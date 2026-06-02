import { useEffect, useState } from "react";

type Mode = "gym" | "hotel";

type Exercise = {
  name: string;
  sets: number;
  reps: number;
  weight?: number; // gym only
  repsCompleted?: number; // hotel only
  muscle: string;
  weighted: boolean;
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
  value: number; // weight OR reps depending on mode
  mode: Mode;
};

const STORAGE = {
  plan: "fitness_week_plan_v5",
  weight: "fitness_weight_v5",
  history: "fitness_weight_history_v5",
  exerciseHistory: "fitness_exercise_history_v5",
  week: "fitness_week_v5",
};

// --------------------
// GYM
// --------------------
const gym = {
  chest: ["Chest Press", "Pec Fly", "Incline Sit Ups"],
  back: ["Lat Pulldown", "Seated Row", "Assisted Pull Up"],
  legs: ["Leg Press", "Leg Curl", "Leg Extension"],
  shoulders: ["Shoulder Press", "Lat Raises", "Reverse Pec Fly"],
  arms: ["Bicep Curl", "Tricep Pushdown", "Tricep Extension", "Assisted Dip Machine"],
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
function isWeighted(name: string) {
  const weightedList = [
    "Chest Press",
    "Pec Fly",
    "Lat Pulldown",
    "Seated Row",
    "Leg Press",
    "Leg Curl",
    "Leg Extension",
    "Shoulder Press",
    "Bicep Curl",
    "Tricep Pushdown",
    "Tricep Extension",
    "Assisted Dip Machine",
  ];
  return weightedList.includes(name);
}

// --------------------
function makeExercise(name: string, muscle: string, weighted: boolean): Exercise {
  return {
    name,
    sets: 3,
    muscle,
    weighted,
    weight: weighted ? 0 : undefined,
    repsCompleted: !weighted ? 0 : undefined,
  };
}

// --------------------
function buildPlan(mode: Mode): DayPlan[] {
  const pool = mode === "gym" ? gym : hotel;

  return baseWeek.map((d) => {
    let exercises: Exercise[] = [];
    let cardio = "";

    const add = (arr: string[], muscle: string) =>
      arr.map((n) => makeExercise(n, muscle, mode === "gym" ? isWeighted(n) : false));

    switch (d.muscleGroup) {
      case "chest_shoulders":
        exercises = [
          ...add(pool.chest, "Chest"),
          ...add(pool.shoulders, "Shoulders"),
        ];
        cardio = "Optional incline walk";
        break;

      case "back_arms":
        exercises = [
          ...add(pool.back, "Back"),
          ...add(pool.arms, "Arms"),
        ];
        break;

      case "legs":
        exercises = [
          ...add(pool.legs, "Legs"),
          ...(mode === "gym"
            ? gym.legsExtras.map((n) => makeExercise(n, "Legs", true))
            : []),
        ];
        break;

      case "chest_arms":
        exercises = [
          ...add(pool.chest, "Chest"),
          ...add(pool.arms, "Arms"),
        ];
        break;

      case "full":
        exercises = pool.full.map((n) =>
          makeExercise(n, "Full Body", mode === "gym" ? isWeighted(n) : false)
        );
        break;

      case "core_day":
        exercises = pool.core.map((n) =>
          makeExercise(n, "Core", false)
        );
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
    const saved = {
      plan: localStorage.getItem(STORAGE.plan),
      weight: localStorage.getItem(STORAGE.weight),
      history: localStorage.getItem(STORAGE.history),
      ex: localStorage.getItem(STORAGE.exerciseHistory),
      week: localStorage.getItem(STORAGE.week),
    };

    setPlan(saved.plan ? JSON.parse(saved.plan) : buildPlan(mode));
    if (saved.weight) setWeight(JSON.parse(saved.weight));
    if (saved.history) setHistory(JSON.parse(saved.history));
    if (saved.ex) setExerciseHistory(JSON.parse(saved.ex));
    if (saved.week) setWeek(JSON.parse(saved.week));
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

  // SAVE PERFORMANCE
  const savePerformance = (ex: Exercise) => {
    setExerciseHistory([
      ...exerciseHistory,
      {
        exercise: ex.name,
        week,
        value: mode === "gym" ? ex.weight || 0 : ex.repsCompleted || 0,
        mode,
      },
    ]);
  };

  const getLast = (name: string) => {
    const last = exerciseHistory
      .filter((e) => e.exercise === name && e.week === week - 1)
      .slice(-1)[0];

    return last?.value ?? 0;
  };

  const getRecommended = (ex: Exercise) => {
    const last = getLast(ex.name);

    if (mode === "gym") return Math.round(last * 1.025) || 10;
    return last ? Math.min(last + 1, 20) : 8; // rep progression
  };

  // UPDATE EXERCISE
  const update = (di: number, ei: number, val: number) => {
    const copy = [...plan];
    const ex = copy[di].exercises[ei];

    if (mode === "gym") ex.weight = val;
    else ex.repsCompleted = val;

    setPlan(copy);
  };

  // MARK DAY
  const mark = (i: number, type: "done" | "miss") => {
    const copy = [...plan];
    copy[i].completed = type === "done";

    if (type === "done") {
      copy[i].exercises.forEach(savePerformance);
    }

    setPlan(copy);
  };

  // WEIGHT TRACK
  const submitWeight = () => {
    setHistory([
      {
        date: new Date().toLocaleDateString(),
        weight: weeklyWeight,
        week,
      },
      ...history,
    ]);

    setWeight(weeklyWeight);
    setWeek(week + 1);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 900 }}>
      <h1>Adaptive Fitness Planner</h1>

      <p>Week: {week}</p>

      <button onClick={() => switchMode("gym")}>Gym</button>
      <button onClick={() => switchMode("hotel")} style={{ marginLeft: 10 }}>
        Hotel
      </button>

      <h2>Weight</h2>
      <p>{weight} lbs</p>

      <input
        type="number"
        value={weeklyWeight}
        onChange={(e) => setWeeklyWeight(Number(e.target.value))}
      />

      <button onClick={submitWeight}>Submit Week</button>

      <h2>Workout</h2>

      {plan.map((d, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <strong>{d.day} — {d.focus}</strong>

          {d.exercises.map((e, j) => (
            <div key={j} style={{ marginBottom: 8 }}>
              <div>
                {e.name} — {e.sets}x{e.reps}
              </div>

              <div style={{ fontSize: 12 }}>
                Last: {getLast(e.name)} |
                Rec: {getRecommended(e)}
              </div>

              <input
                type="number"
                value={mode === "gym" ? e.weight || 0 : e.repsCompleted || 0}
                onChange={(ev) => update(i, j, Number(ev.target.value))}
                style={{ width: 70 }}
              />
            </div>
          ))}

          <button onClick={() => mark(i, "done")}>Done</button>
        </div>
      ))}
    </div>
  );
}