// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { addBMI, getBMI, deleteBMI, updateBMIInDB, addMeal, getMeals, deleteMeal, updateMealInDB, getMyBadgesFromDB } from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Activity, Flame, Scale, Dumbbell, Trash2, Edit2, Plus, Clock, Target, Award, Star, Trophy, X } from 'lucide-react';


const calculateCalories = (p, c, f) => (p * 4) + (c * 4) + (f * 9);

const getBMICategory = (bmi) => {
  const b = parseFloat(bmi);
  if (b < 18.5) return 'Underweight';
  if (b >= 18.5 && b < 25) return 'Normal';
  if (b >= 25 && b < 30) return 'Overweight';
  return 'Obese';
};

const getExerciseRecommendations = (category) => {
  const plans = {
    'Underweight': [
      { name: 'Strength Training', time: '45-60 min', diff: 'Moderate', desc: 'Compound exercises (squats, deadlifts) to build muscle mass.' },
      { name: 'Resistance Bands', time: '30-40 min', diff: 'Easy', desc: 'Progressive resistance training for gradual strength.' }
    ],
    'Normal': [
      { name: 'Cardio & Strength', time: '45 min', diff: 'Moderate', desc: 'Balanced 20 min cardio with 25 min strength training.' },
      { name: 'HIIT / Running', time: '30-40 min', diff: 'Hard', desc: 'Maintain cardiovascular health and stamina.' }
    ],
    'Overweight': [
      { name: 'Low-Impact HIIT', time: '25-30 min', diff: 'Hard', desc: 'High intervals to maximize calorie burn without joint stress.' },
      { name: 'Cycling / Swimming', time: '45 min', diff: 'Moderate', desc: 'Full-body workout with minimal joint stress.' }
    ],
    'Obese': [
      { name: 'Brisk Walking', time: '30-45 min', diff: 'Easy', desc: 'Low-impact activity perfect for starting safely.' },
      { name: 'Water Aerobics', time: '30-40 min', diff: 'Easy', desc: 'Joint-friendly exercise providing resistance without impact.' }
    ]
  };
  return plans[category] || plans['Normal'];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  

  const [bmiRecords, setBmiRecords] = useState([]);
  const [latestBMI, setLatestBMI] = useState(null);
  const [bmiForm, setBmiForm] = useState({ height: '', weight: '' });
  const [editingBmiId, setEditingBmiId] = useState(null); 
  
  
  const [meals, setMeals] = useState([]);
  const [mealForm, setMealForm] = useState({ type: '', protein: '', carbs: '', fats: '' });
  const [editingMealId, setEditingMealId] = useState(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const CALORIE_GOAL = 2000;

  const [exercises, setExercises] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (!token) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (userData) setUser(JSON.parse(userData));
    // eslint-disable-next-line react-hooks/immutability
    fetchAllData();
    // eslint-disable-next-line react-hooks/immutability
    fetchBadges();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (latestBMI) setExercises(getExerciseRecommendations(getBMICategory(latestBMI.bmi)));
  }, [latestBMI]);

 
  useEffect(() => {
    const today = new Date();
    
    const todaysMeals = meals.filter((m) => {
      const mealDate = new Date(m.createdAt);
      return (
        mealDate.getDate() === today.getDate() &&
        mealDate.getMonth() === today.getMonth() &&
        mealDate.getFullYear() === today.getFullYear()
      );
    });

    const total = todaysMeals.reduce((sum, m) => sum + calculateCalories(m.protein||0, m.carbs||0, m.fats||0), 0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotalCalories(Math.round(total));
  }, [meals]);

  const fetchAllData = async () => {
    try {
      const [bmiRes, mealRes] = await Promise.all([getBMI(), getMeals()]);
      const fetchedBmi = bmiRes.data.data || [];
      setBmiRecords(fetchedBmi);
      if (fetchedBmi.length > 0) setLatestBMI(fetchedBmi[0]);
      setMeals(mealRes.data.data || []);
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired');
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await getMyBadgesFromDB();
      if (response.data.success) setBadges(response.data.data);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoadingBadges(false);
    }
  };

  
  const handleBMISubmit = async (e) => {
    e.preventDefault();
    if (!bmiForm.height || !bmiForm.weight) return toast.error('Enter height and weight');
    
    try {
      const payload = { height: parseFloat(bmiForm.height), weight: parseFloat(bmiForm.weight) };
      
      if (editingBmiId) {
        await updateBMIInDB(editingBmiId, payload);
        toast.success('Record Updated!');
        setEditingBmiId(null);
      } else {
        await addBMI(payload);
        toast.success('BMI Logged!');
      }
      
      setBmiForm({ height: '', weight: '' });
      fetchAllData();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { toast.error(editingBmiId ? 'Failed to update record' : 'Failed to add BMI'); }
  };

  const handleEditBmiClick = (record) => {
    setEditingBmiId(record.id);
    setBmiForm({ height: record.height, weight: record.weight });
  };

  const cancelBmiEdit = () => {
    setEditingBmiId(null);
    setBmiForm({ height: '', weight: '' });
  };

  const handleDeleteBMI = async (id) => {
    try {
      await deleteBMI(id);
      toast.success('Record deleted');
      if (editingBmiId === id) cancelBmiEdit();
      fetchAllData();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { toast.error('Failed to delete'); }
  };

  
  const handleMealSubmit = async (e) => {
    e.preventDefault();
    if (!mealForm.type) return toast.error('Enter meal name');
    
    try {
      const payload = {
        type: mealForm.type,
        protein: parseInt(mealForm.protein) || 0,
        carbs: parseInt(mealForm.carbs) || 0,
        fats: parseInt(mealForm.fats) || 0
      };

      if (editingMealId) {
        await updateMealInDB(editingMealId, payload);
        toast.success('Meal Updated!');
        setEditingMealId(null);
      } else {
        await addMeal(payload);
        toast.success('Meal Logged!');
      }

      setMealForm({ type: '', protein: '', carbs: '', fats: '' });
      fetchAllData();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { toast.error(editingMealId ? 'Failed to update meal' : 'Failed to add meal'); }
  };

  const handleEditMealClick = (meal) => {
    setEditingMealId(meal.id);
    setMealForm({ type: meal.type, protein: meal.protein || '', carbs: meal.carbs || '', fats: meal.fats || '' });
  };

  const cancelMealEdit = () => {
    setEditingMealId(null);
    setMealForm({ type: '', protein: '', carbs: '', fats: '' });
  };

  const handleDeleteMeal = async (id) => {
    try {
      await deleteMeal(id);
      toast.success('Meal deleted');
      if (editingMealId === id) cancelMealEdit(); 
      fetchAllData();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { toast.error('Failed to delete'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-orange-500">
      <Activity className="animate-spin w-12 h-12" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
          <Trophy className="absolute -right-8 -top-8 text-orange-50/50 w-48 h-48 -rotate-12" />
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Award className="text-orange-500" size={28} /> Your Trophy Case
            </h2>
            {loadingBadges ? (
              <div className="flex gap-4 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="w-24 h-24 bg-gray-100 rounded-2xl" />)}
              </div>
            ) : badges.length === 0 ? (
              <div className="bg-orange-50/50 border border-dashed border-orange-200 rounded-2xl p-8 text-center">
                <p className="text-orange-600 font-medium">No badges yet. Keep training to impress your trainer! 🔥</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-6">
                {badges.map((badge) => (
                  <div key={badge.id} className="group relative flex flex-col items-center bg-white p-4 rounded-2xl border-2 border-gray-50 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10 transition-all cursor-default">
                    <div className="text-5xl mb-3 filter drop-shadow-md group-hover:scale-110 transition-transform">{badge.icon}</div>
                    <h3 className="text-sm font-black text-gray-900 text-center leading-tight">{badge.title}</h3>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <Star size={10} className="fill-orange-400 text-orange-400" /> {badge.trainerName}
                    </p>
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
                      {badge.description || "Achievement Unlocked!"}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-orange-100 font-medium mb-1">Current BMI</p>
                <h2 className="text-4xl font-bold">{latestBMI ? latestBMI.bmi : '--'}</h2>
                <p className="text-sm mt-2 opacity-90">{latestBMI ? getBMICategory(latestBMI.bmi) : 'Log your first weight!'}</p>
              </div>
              <Scale size={32} className="opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 font-medium">Daily Calories</span>
              <Flame className="text-orange-500" size={24} />
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-bold text-gray-900">{totalCalories}</span>
              <span className="text-gray-400 mb-1 font-medium">/ {CALORIE_GOAL} kcal</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${totalCalories > CALORIE_GOAL ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min((totalCalories / CALORIE_GOAL) * 100, 100)}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 font-medium">Current Weight</span>
              <Target className="text-blue-500" size={24} />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">{latestBMI ? `${latestBMI.weight} kg` : '--'}</h2>
            <p className="text-gray-400 text-sm mt-2">Keep pushing towards your goal!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Scale className="text-orange-500" size={24}/>
              <h2 className="text-xl font-bold text-gray-900">Body Metrics</h2>
            </div>
            
            <form onSubmit={handleBMISubmit} className="bg-gray-50 p-4 rounded-xl mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Height (cm)</label>
                  <input type="number" value={bmiForm.height} onChange={(e) => setBmiForm({...bmiForm, height: e.target.value})} className="mt-1 w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none" placeholder="175" step="0.1" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Weight (kg)</label>
                  <input type="number" value={bmiForm.weight} onChange={(e) => setBmiForm({...bmiForm, weight: e.target.value})} className="mt-1 w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none" placeholder="70" step="0.1" required />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-orange-600 transition-colors flex justify-center items-center gap-2">
                  {editingBmiId ? <Edit2 size={18}/> : <Plus size={18}/>} 
                  {editingBmiId ? 'Update Record' : 'Log Measurement'}
                </button>
                {editingBmiId && (
                  <button type="button" onClick={cancelBmiEdit} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors" title="Cancel Edit">
                    <X size={20} />
                  </button>
                )}
              </div>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 max-h-[300px] space-y-3 custom-scrollbar">
              {bmiRecords.map((r) => (
                <div key={r.id} className={`flex justify-between items-center p-4 border rounded-xl bg-white transition-all ${editingBmiId === r.id ? 'border-orange-400 shadow-md shadow-orange-100' : 'border-gray-100 hover:border-orange-200'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-900">{r.bmi} BMI</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">{getBMICategory(r.bmi)}</span>
                    </div>
                    <span className="text-sm text-gray-400">{r.weight}kg | {new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditBmiClick(r)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit Record">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteBMI(r.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Record">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="text-orange-500" size={24}/>
              <h2 className="text-xl font-bold text-gray-900">Nutrition Log</h2>
            </div>
            
            <form onSubmit={handleMealSubmit} className="bg-gray-50 p-4 rounded-xl mb-6">
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase">Meal Name</label>
                <input type="text" value={mealForm.type} onChange={(e) => setMealForm({...mealForm, type: e.target.value})} className="mt-1 w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none" placeholder="e.g. Chicken Salad" required />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Protein (g)</label>
                  <input type="number" value={mealForm.protein} onChange={(e) => setMealForm({...mealForm, protein: e.target.value})} className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Carbs (g)</label>
                  <input type="number" value={mealForm.carbs} onChange={(e) => setMealForm({...mealForm, carbs: e.target.value})} className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Fats (g)</label>
                  <input type="number" value={mealForm.fats} onChange={(e) => setMealForm({...mealForm, fats: e.target.value})} className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-lg outline-none" />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-orange-600 transition-colors flex justify-center items-center gap-2">
                  {editingMealId ? <Edit2 size={18}/> : <Plus size={18}/>} 
                  {editingMealId ? 'Update Meal' : 'Log Meal'}
                </button>
                {editingMealId && (
                  <button type="button" onClick={cancelMealEdit} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors" title="Cancel Edit">
                    <X size={20} />
                  </button>
                )}
              </div>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 max-h-[220px] space-y-3 custom-scrollbar">
              {meals.map((m) => (
                <div key={m.id} className={`flex justify-between items-center p-3 border rounded-xl bg-white transition-all ${editingMealId === m.id ? 'border-orange-400 shadow-md shadow-orange-100' : 'border-gray-100 hover:border-orange-200'}`}>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{m.type}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs font-semibold text-orange-500">{Math.round(calculateCalories(m.protein, m.carbs, m.fats))} kcal</span>
                      <span className="text-xs text-gray-400">P:{m.protein||0} C:{m.carbs||0} F:{m.fats||0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditMealClick(m)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit Meal">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteMeal(m.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Meal">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

       
        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 mb-8 flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="text-orange-500" /> Your Training Plan
              </h2>
              <p className="text-gray-400 mt-1 text-sm">
                Based on your profile: <span className="text-orange-400 font-semibold">{latestBMI ? getBMICategory(latestBMI.bmi) : 'Update BMI'}</span>
              </p>
            </div>
          </div>
          {exercises.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-700 rounded-xl text-gray-500">Log height and weight above to unlock your plan.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {exercises.map((ex, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 hover:border-orange-500/50 p-6 rounded-xl transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">{ex.name}</h3>
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-gray-700 text-gray-300 rounded-md">{ex.diff}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{ex.desc}</p>
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <Clock size={16} className="text-orange-500" /> {ex.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;