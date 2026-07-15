// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Dumbbell, Flame, Trophy, CheckCircle2, Circle, Activity, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBMI, saveWorkoutToDB, getWorkoutsFromDB } from '../services/api';

const exerciseDatabase = [
  { id: 1, name: "Barbell Squats", target: "Gain Mass", sets: "4 sets", reps: "8-10 reps", desc: "Heavy compound movement for leg growth." },
  { id: 2, name: "Deadlifts", target: "Gain Mass", sets: "3 sets", reps: "5-8 reps", desc: "Builds overall posterior chain mass." },
  { id: 3, name: "Bench Press", target: "Gain Mass", sets: "4 sets", reps: "8-12 reps", desc: "Primary chest mass builder." },
  { id: 4, name: "Pull-ups", target: "Gain Mass", sets: "3 sets", reps: "To failure", desc: "Excellent for back width and bicep growth." },
  { id: 5, name: "Overhead Press", target: "Gain Mass", sets: "3 sets", reps: "8-10 reps", desc: "Builds shoulder and tricep mass." },
  { id: 6, name: "HIIT Sprint Intervals", target: "Lose Weight", sets: "1 set", reps: "15 mins", desc: "Maximum calorie burn in minimum time." },
  { id: 7, name: "Burpees", target: "Lose Weight", sets: "4 sets", reps: "15 reps", desc: "Full body explosive movement." },
  { id: 8, name: "Jump Rope", target: "Lose Weight", sets: "5 sets", reps: "2 mins", desc: "High intensity cardiovascular conditioning." },
  { id: 9, name: "Mountain Climbers", target: "Lose Weight", sets: "4 sets", reps: "45 seconds", desc: "Core and cardio combined." },
  { id: 10, name: "Cycling", target: "Lose Weight", sets: "1 set", reps: "30 mins", desc: "Low-impact sustained calorie burning." },
  { id: 11, name: "Yoga Flow", target: "Maintain", sets: "1 set", reps: "20 mins", desc: "Improves flexibility and core strength." },
  { id: 12, name: "Plank Hold", target: "Maintain", sets: "3 sets", reps: "60 seconds", desc: "Core stability and endurance." },
  { id: 13, name: "Walking Lunges", target: "Maintain", sets: "3 sets", reps: "12 reps/leg", desc: "Tones legs and improves balance." },
  { id: 14, name: "Push-ups", target: "Maintain", sets: "3 sets", reps: "15-20 reps", desc: "Maintains upper body strength." },
  { id: 15, name: "Brisk Walking", target: "Maintain", sets: "1 set", reps: "45 mins", desc: "Steady state cardio for heart health." }
];

const Exercises = () => {
  const [loading, setLoading] = useState(true);
  
  
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user')) || {};
  const userId = user.id;

  const [currentCalculatedGoal, setCurrentCalculatedGoal] = useState("Maintain");
  const [recommendedPlan, setRecommendedPlan] = useState([]);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [currentMonthView, setCurrentMonthView] = useState(new Date());
  
  const [dailyLogs, setDailyLogs] = useState({}); 
  const [dailyGoals, setDailyGoals] = useState({});
  const [streak, setStreak] = useState(0);

  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchUserData();
    // eslint-disable-next-line react-hooks/immutability
    if (userId) fetchDatabaseWorkouts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

 
  useEffect(() => {
    let activeGoal = dailyGoals[selectedDate] || currentCalculatedGoal;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecommendedPlan(exerciseDatabase.filter(ex => ex.target === activeGoal));
  }, [selectedDate, dailyGoals, currentCalculatedGoal]);

  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    if (recommendedPlan.length > 0) calculateStreak(dailyLogs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyLogs, dailyGoals]);

  const fetchUserData = async () => {
    try {
      const res = await getBMI();
      const records = res.data.data || [];
      if (records.length > 0) {
        const sorted = records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const currentBmi = sorted[0].bmi;
        let goal = "Maintain";
        if (currentBmi < 18.5) goal = "Gain Mass";
        else if (currentBmi >= 25) goal = "Lose Weight";
        setCurrentCalculatedGoal(goal);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.error("Failed to fetch BMI");
    } finally {
      setLoading(false);
    }
  };


  const fetchDatabaseWorkouts = async () => {
    try {
      const res = await getWorkoutsFromDB(userId);
      const dbLogs = {};
      const dbGoals = {};
      
      if (res.data.data) {
        res.data.data.forEach(workout => {
          dbLogs[workout.dateString] = workout.completedExercises;
          if (workout.dailyGoal) dbGoals[workout.dateString] = workout.dailyGoal;
        });
      }
      
      setDailyLogs(dbLogs);
      setDailyGoals(dbGoals);
    } catch (error) {
      console.error("Error fetching workouts from DB", error);
    }
  };

  const calculateStreak = (logs) => {
    let currentStreak = 0;
    const d = new Date();
    
    const checkDay = (dateStr) => {
      const goalForDay = dailyGoals[dateStr] || currentCalculatedGoal;
      const targetExercises = exerciseDatabase.filter(ex => ex.target === goalForDay).length;
      return logs[dateStr]?.length === targetExercises && targetExercises > 0;
    };
    
    if (checkDay(d.toDateString())) currentStreak++;
    
    d.setDate(d.getDate() - 1);
    while (checkDay(d.toDateString())) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    }
    
    setStreak(currentStreak);
  };

  const handleToggleExercise = async (exerciseId) => {
    if (new Date(selectedDate).setHours(0,0,0,0) > new Date().setHours(0,0,0,0)) {
      return toast.error("You cannot log workouts in the future!");
    }

    const currentDayLogs = dailyLogs[selectedDate] || [];
    if (currentDayLogs.includes(exerciseId)) return; 

    const newDayLogs = [...currentDayLogs, exerciseId];
    const newGoal = dailyGoals[selectedDate] || recommendedPlan[0].target;

    
    setDailyLogs(prev => ({ ...prev, [selectedDate]: newDayLogs }));
    setDailyGoals(prev => ({ ...prev, [selectedDate]: newGoal }));

    if (newDayLogs.length === recommendedPlan.length) {
      toast.success("Day Complete! Streak locked in! 🔥", { icon: '🏆' });
    }

    
    try {
      await saveWorkoutToDB({
        userId: userId,
        dateString: selectedDate,
        completedExercises: newDayLogs,
        dailyGoal: newGoal
      });
    } catch (error) {
      console.error("Failed to save to database", error);
      toast.error("Warning: Failed to sync with server.");
    }
  };


  const prevMonth = () => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 1));

  const renderCalendarDays = () => {
    const year = currentMonthView.getFullYear();
    const month = currentMonthView.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const blanks = Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} className="w-8 h-8 sm:w-10 sm:h-10"></div>);
    
    const days = Array.from({ length: daysInMonth }).map((_, i) => {
      const dateNum = i + 1;
      const d = new Date(year, month, dateNum);
      const dateString = d.toDateString();
      const isToday = dateString === new Date().toDateString();
      const isSelected = dateString === selectedDate;
      const isFuture = d.setHours(0,0,0,0) > new Date().setHours(0,0,0,0);
      
      const targetGoal = dailyGoals[dateString] || currentCalculatedGoal;
      const totalExForDay = exerciseDatabase.filter(ex => ex.target === targetGoal).length;
      const isFullyCompleted = dailyLogs[dateString]?.length === totalExForDay && totalExForDay > 0;
      
      return (
        <button 
          key={dateNum}
          onClick={() => setSelectedDate(dateString)}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all duration-300 mx-auto text-sm ${
            isSelected ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-900' : ''
          } ${
            isFullyCompleted 
              ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]' 
              : isToday
                ? 'bg-gray-800 border-dashed border-orange-500 text-orange-400 font-bold'
                : isFuture
                  ? 'bg-gray-800/50 border-gray-800 text-gray-600 cursor-not-allowed hover:bg-gray-800'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
          }`}
        >
          {isFullyCompleted ? <CheckCircle2 strokeWidth={3} size={16} /> : dateNum}
        </button>
      );
    });

    return [...blanks, ...days];
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-orange-500"><Activity className="animate-spin w-12 h-12" /></div>;

  const currentDayProgress = dailyLogs[selectedDate]?.length || 0;
  const totalExercises = recommendedPlan.length;
  const isSelectedDayComplete = currentDayProgress === totalExercises && totalExercises > 0;
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
          <Dumbbell size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Training Hub</h1>
          <p className="text-gray-500 font-medium mt-1">Select a date below to view or log your workouts.</p>
        </div>
      </div>

    
      <div className="bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col lg:flex-row gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        
       
        <div className="flex flex-col justify-center items-center p-6 bg-gray-800/50 rounded-2xl border border-gray-700 lg:w-1/3 z-10">
          <Flame className={`${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-500'}`} size={56} />
          <h2 className="text-6xl font-black text-white mt-4">{streak}</h2>
          <p className="text-orange-400 font-bold tracking-wide uppercase text-sm mt-1">Day Streak</p>
        </div>

      
        <div className="flex-1 z-10">
          <div className="flex justify-between items-center mb-4 px-2">
            <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-colors"><ChevronLeft size={20}/></button>
            <h3 className="text-white font-bold text-lg">{monthNames[currentMonthView.getMonth()]} {currentMonthView.getFullYear()}</h3>
            <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-colors"><ChevronRight size={20}/></button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 sm:gap-4">
            {renderCalendarDays()}
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <Trophy className={`size-8 ${isSelectedDayComplete ? 'text-orange-500' : 'text-blue-500'}`}/>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedDate === new Date().toDateString() ? "Today's Plan" : selectedDate.slice(0, 10)}
              </h2>
              <p className="text-gray-500 font-medium text-sm mt-1 flex items-center gap-1">
                {dailyGoals[selectedDate] ? <><Lock size={14} className="text-orange-500"/> Goal Locked:</> : "Current Goal:"} <span className="text-gray-900 font-bold">{recommendedPlan[0]?.target || "Maintain"}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
             <div className="text-right">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Progress</span>
               <span className="font-black text-gray-900">{currentDayProgress} <span className="text-gray-400 font-medium">/ {totalExercises}</span></span>
             </div>
             <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200" />
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 16}`} 
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - (currentDayProgress / (totalExercises || 1)))}`} 
                  className={`transition-all duration-500 ease-out ${isSelectedDayComplete ? 'text-orange-500' : 'text-blue-500'}`} />
             </svg>
          </div>
        </div>

      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedPlan.map((ex) => {
            const isDone = dailyLogs[selectedDate]?.includes(ex.id);
            
            return (
              <div 
                key={ex.id} 
                onClick={() => !isDone && handleToggleExercise(ex.id)}
                className={`p-4 border rounded-xl transition-all flex items-center justify-between ${
                  isDone 
                    ? 'bg-orange-50 border-orange-200 shadow-sm cursor-default'
                    : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-blue-200 cursor-pointer group'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {isDone ? <CheckCircle2 className="text-orange-500" size={24} /> : <Circle className="text-gray-300 group-hover:text-blue-400 transition-colors" size={24} />}
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-white border rounded-md mb-2 inline-block flex items-center w-max gap-1 ${isDone ? 'border-orange-200 text-orange-600' : 'border-gray-200 text-gray-500'}`}>
                      {ex.target} {isDone && <Lock size={10} />}
                    </span>
                    <h3 className={`font-bold text-lg ${isDone ? 'text-orange-900 line-through opacity-80' : 'text-gray-900'}`}>{ex.name}</h3>
                    <p className={`text-sm font-medium mt-1 ${isDone ? 'text-orange-700/70' : 'text-gray-500'}`}>{ex.sets} • {ex.reps}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Exercises;