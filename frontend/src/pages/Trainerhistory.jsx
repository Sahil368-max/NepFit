// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Users, Activity, Utensils, Award, X } from 'lucide-react'; // Added icons
import { getTrainerClientsFromDB, getClientHistoryFromDB, awardBadgeToClient } from '../services/api';
import { toast } from 'react-hot-toast';

const TrainerHistory = () => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeForm, setBadgeForm] = useState({
    title: '',
    description: '',
    icon: '🏆'
  });

  const badgePresets = [
    { title: 'Weight Crusher', icon: '📉', desc: 'Significant BMI improvement!' },
    { title: 'Meal Master', icon: '🥗', desc: 'Perfect calorie tracking week.' },
    { title: 'Iron Addict', icon: '🏋️‍♂️', desc: '10+ workouts completed!' },
    { title: 'Stride Hero', icon: '⚡', desc: 'Hitting your daily goals consistently.' }
  ];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getTrainerClientsFromDB();
        if (response.data.success) {
          setClients(response.data.data);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        toast.error("Failed to load clients");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (!selectedClientId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHistoryData(null);
      return;
    }
    const fetchHistory = async () => {
      try {
        const response = await getClientHistoryFromDB(selectedClientId);
        if (response.data.success) {
          setHistoryData(response.data);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        toast.error("Failed to load client history");
      }
    };
    fetchHistory();
  }, [selectedClientId]);

 
  const handleAwardBadge = async (e) => {
    e.preventDefault();
    try {
      const response = await awardBadgeToClient({
        clientId: selectedClientId,
        ...badgeForm
      });
      if (response.data.success) {
        toast.success(`Badge awarded to ${historyData?.clientName}!`);
        setShowBadgeModal(false);
        setBadgeForm({ title: '', description: '', icon: '🏆' });
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to award badge");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="text-center mt-20 text-xl font-bold">Loading Clients...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Selector */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Users className="text-orange-500" /> Client History Explorer
            </h1>
            <p className="text-gray-500 mt-1">Select a client to view their logged meals and BMI.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              className="flex-grow md:w-72 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-gray-700"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="">-- Select a Client --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>

            
            {selectedClientId && (
              <button 
                onClick={() => setShowBadgeModal(true)}
                className="bg-gray-900 text-white p-3 rounded-lg hover:bg-black transition-colors flex items-center gap-2 shadow-lg"
                title="Award Achievement"
              >
                <Award size={20} /> <span className="hidden sm:inline">Award</span>
              </button>
            )}
          </div>
        </div>

        
        {selectedClientId && historyData && (
          <div className="grid md:grid-cols-2 gap-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="text-orange-500" /> BMI History
              </h2>
              {historyData.bmiHistory.length === 0 ? (
                <p className="text-gray-500 italic">No BMI records logged yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="p-3 text-sm font-semibold text-gray-600">Date</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Weight</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">BMI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {historyData.bmiHistory.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="p-3 text-sm text-gray-600">{formatDate(record.createdAt)}</td>
                          <td className="p-3 font-medium text-gray-900">{record.weight} kg</td>
                          <td className="p-3 font-bold text-orange-600">{record.bmi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

           
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Utensils className="text-orange-500" /> Meal History
              </h2>
              {historyData.mealHistory.length === 0 ? (
                <p className="text-gray-500 italic">No meals logged yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="p-3 text-sm font-semibold text-gray-600">Date</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Type</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Calories</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {historyData.mealHistory.map((meal) => (
                        <tr key={meal.id} className="hover:bg-gray-50">
                          <td className="p-3 text-sm text-gray-600">{formatDate(meal.createdAt)}</td>
                          <td className="p-3 font-medium text-gray-900 capitalize">{meal.type}</td>
                          <td className="p-3 font-bold text-orange-600">{meal.calories} kcal</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        
        {showBadgeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
              <button onClick={() => setShowBadgeModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black text-gray-900 mb-1">Award Badge</h2>
              <p className="text-gray-500 mb-6">Choose an achievement for {historyData?.clientName}</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {badgePresets.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => setBadgeForm({ title: preset.title, icon: preset.icon, description: preset.desc })}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${badgeForm.title === preset.title ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}
                  >
                    <span className="text-2xl">{preset.icon}</span>
                    <p className="font-bold text-xs mt-1">{preset.title}</p>
                  </button>
                ))}
              </div>

              <form onSubmit={handleAwardBadge} className="space-y-4">
                <input 
                  type="text" 
                  value={badgeForm.title}
                  onChange={(e) => setBadgeForm({...badgeForm, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  placeholder="Achievement Title..."
                  required
                />
                <button type="submit" className="w-full py-4 bg-orange-500 text-white rounded-xl font-black text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200">
                  Confirm Award 🏆
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerHistory;