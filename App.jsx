import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function WellnessApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [waterIntake, setWaterIntake] = useState(0);
  const [foods, setFoods] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [foodInput, setFoodInput] = useState('');
  const [workoutType, setWorkoutType] = useState('perna pesada');
  const [weighins, setWeighins] = useState([
    { date: '01/09', weight: 93.9, waist: 101, fat: 14.5 },
  ]);
  const [photoData, setPhotoData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock histórico de 12 semanas
  const historico = [
    { semana: 1, peso: 99.2, cintura: 110, gordura: 17.2, proteina: 178 },
    { semana: 2, peso: 97.9, cintura: 109, gordura: 17.0, proteina: 185 },
    { semana: 3, peso: 97.25, cintura: 108, gordura: 16.8, proteina: 190 },
    { semana: 4, peso: 96.65, cintura: 107, gordura: 16.5, proteina: 188 },
    { semana: 5, peso: 95.95, cintura: 105, gordura: 16.2, proteina: 192 },
    { semana: 6, peso: 96.2, cintura: 105, gordura: 16.0, proteina: 190 },
    { semana: 7, peso: 96.05, cintura: 104, gordura: 15.8, proteina: 194 },
    { semana: 8, peso: 95.3, cintura: 103, gordura: 15.4, proteina: 198 },
    { semana: 9, peso: 94.8, cintura: 102.5, gordura: 15.1, proteina: 214 },
    { semana: 10, peso: 94.5, cintura: 102, gordura: 14.9, proteina: 210 },
    { semana: 11, peso: 94.2, cintura: 101.5, gordura: 14.7, proteina: 212 },
    { semana: 12, peso: 93.9, cintura: 101, gordura: 14.5, proteina: 215 },
  ];

  // Mock LLM response (substituir com Claude API depois)
  const analyzeFoodWithLLM = async (foodDescription) => {
    setLoading(true);
    // Aqui vai Claude API depois
    // Por agora, mock data
    const mockResponse = {
      food: foodDescription,
      kcal: Math.floor(Math.random() * 500 + 200),
      protein: Math.floor(Math.random() * 40 + 20),
      fat: Math.floor(Math.random() * 40 + 10),
      carbs: Math.floor(Math.random() * 20 + 2),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    
    setTimeout(() => {
      setFoods([...foods, mockResponse]);
      setFoodInput('');
      setLoading(false);
    }, 800);
  };

  // Gerar treino automático
  const generateWorkout = () => {
    const workouts_db = {
      'perna pesada': {
        nome: 'Perna Pesada',
        exercicios: [
          '85kg Agachamento 5×5',
          'RDL ~60kg 3×8',
          'Swing KB20 3×15',
          'Panturrilha 3×20',
        ],
      },
      'perna leve': {
        nome: 'Perna Leve',
        exercicios: [
          'Agachamento 60kg 4×10',
          'Legpress 3×12',
          'Leg curl 3×12',
          'Panturrilha 2×15',
        ],
      },
      'ombro': {
        nome: 'Ombros + Braços',
        exercicios: [
          'Elevação lateral 10kg 3×12',
          'Elevação frontal 8kg 3×12',
          'Encolhimento 15kg 3×12',
          'Tríceps corda 3×12',
          'Rosca direta 3×12',
        ],
      },
      'superior': {
        nome: 'Superior (Força)',
        exercicios: [
          'Supino 60kg 3×8',
          'Barra assistida 4×8',
          'Serrote KB20 3×12',
          'Prancha 3×1min',
        ],
      },
    };

    const selected = workouts_db[workoutType] || workouts_db['perna pesada'];
    const workout = {
      date: new Date().toLocaleDateString('pt-BR'),
      type: selected.nome,
      exercises: selected.exercicios,
      id: Date.now(),
    };

    setWorkouts([workout, ...workouts]);
  };

  // Upload foto do relógio (mock OCR)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Mock OCR - depois integra Vision API
      const mockWorkoutData = {
        fc_media: 162,
        fc_max: 186,
        carga: 179,
        vo2max: '42',
        tempo: '20:09',
        date: new Date().toLocaleDateString('pt-BR'),
      };
      setPhotoData(mockWorkoutData);
      
      // Adiciona como workout também
      const workout = {
        date: mockWorkoutData.date,
        type: 'Corrida/Cardio (do relógio)',
        fc_media: mockWorkoutData.fc_media,
        fc_max: mockWorkoutData.fc_max,
        carga: mockWorkoutData.carga,
        vo2max: mockWorkoutData.vo2max,
        tempo: mockWorkoutData.tempo,
        id: Date.now(),
      };
      setWorkouts([workout, ...workouts]);
    }
  };

  // Calcular totais do dia
  const dailyTotals = {
    kcal: foods.reduce((acc, f) => acc + f.kcal, 0),
    protein: foods.reduce((acc, f) => acc + f.protein, 0),
    fat: foods.reduce((acc, f) => acc + f.fat, 0),
    carbs: foods.reduce((acc, f) => acc + f.carbs, 0),
  };

  // Dados pra gráficos
  const weightChartData = {
    labels: historico.map(h => `S${h.semana}`),
    datasets: [{
      label: 'Peso (kg)',
      data: historico.map(h => h.peso),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.3,
      fill: true,
    }],
  };

  const macroChartData = {
    labels: ['Proteína', 'Gordura', 'Carbos'],
    datasets: [{
      label: 'Macros (g)',
      data: [dailyTotals.protein, dailyTotals.fat, dailyTotals.carbs],
      backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
    }],
  };

  const performanceChartData = {
    labels: workouts.slice(0, 10).reverse().map((w, i) => `${i + 1}`),
    datasets: [{
      label: 'Carga (treinos últimos 10)',
      data: workouts.slice(0, 10).reverse().map(w => w.carga || 60),
      borderColor: '#a78bfa',
      backgroundColor: 'rgba(167, 139, 250, 0.1)',
      tension: 0.3,
    }],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-sm uppercase tracking-widest text-slate-400">Wellness v2</h1>
          <p className="text-3xl font-black mt-1">Performance Center</p>
          <p className="text-xs text-slate-400 mt-2">LLM + Treino + Hidratação + Fotos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-20 bg-slate-900 border-b border-slate-700 flex overflow-x-auto z-40">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'alimentacao', label: 'Comida' },
          { id: 'hidratacao', label: 'Água' },
          { id: 'treino', label: 'Treino' },
          { id: 'fotos', label: 'Relógio' },
          { id: 'graficos', label: 'Gráficos' },
          { id: 'pesagens', label: 'Pesagens' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
              activeTab === tab.id ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-4">
                <p className="text-xs text-red-200 uppercase">Kcal hoje</p>
                <p className="text-3xl font-black">{dailyTotals.kcal}</p>
                <p className="text-xs text-red-200 mt-1">meta: 2400</p>
              </div>
              <div className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-lg p-4">
                <p className="text-xs text-amber-200 uppercase">Água</p>
                <p className="text-3xl font-black">{waterIntake}/3500</p>
                <p className="text-xs text-amber-200 mt-1">ml</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-lg p-4">
                <p className="text-xs text-emerald-200 uppercase">Proteína</p>
                <p className="text-3xl font-black">{dailyTotals.protein}g</p>
                <p className="text-xs text-emerald-200 mt-1">meta: 215g</p>
              </div>
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4">
                <p className="text-xs text-blue-200 uppercase">Treinos</p>
                <p className="text-3xl font-black">{workouts.length}</p>
                <p className="text-xs text-blue-200 mt-1">hoje</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-bold mb-3">Refeições de hoje</p>
              {foods.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhuma refeição registrada</p>
              ) : (
                foods.map((food, idx) => (
                  <div key={idx} className="bg-slate-900 rounded p-2 mb-2">
                    <p className="text-xs font-bold">{food.time} · {food.food}</p>
                    <p className="text-xs text-amber-400">{food.kcal}kcal | P:{food.protein}g | G:{food.fat}g</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ALIMENTAÇÃO */}
        {activeTab === 'alimentacao' && (
          <div>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold mb-3">Adicionar comida (LLM calcula)</p>
              <input
                type="text"
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                placeholder="Ex: 300g costela + 2 ovos + arroz"
                className="w-full bg-slate-900 text-white px-3 py-2 rounded text-sm mb-2"
              />
              <button
                onClick={() => analyzeFoodWithLLM(foodInput)}
                disabled={!foodInput || loading}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-black font-bold py-2 rounded text-sm"
              >
                {loading ? 'Analisando...' : 'Analisar com IA'}
              </button>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-bold mb-3">Total do dia</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900 rounded p-2">
                  <p className="text-xs text-slate-400">Calorias</p>
                  <p className="text-lg font-black text-red-400">{dailyTotals.kcal}</p>
                </div>
                <div className="bg-slate-900 rounded p-2">
                  <p className="text-xs text-slate-400">Proteína</p>
                  <p className="text-lg font-black text-emerald-400">{dailyTotals.protein}g</p>
                </div>
                <div className="bg-slate-900 rounded p-2">
                  <p className="text-xs text-slate-400">Gordura</p>
                  <p className="text-lg font-black text-amber-400">{dailyTotals.fat}g</p>
                </div>
                <div className="bg-slate-900 rounded p-2">
                  <p className="text-xs text-slate-400">Carbos</p>
                  <p className="text-lg font-black text-blue-400">{dailyTotals.carbs}g</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HIDRATAÇÃO */}
        {activeTab === 'hidratacao' && (
          <div>
            <div className="bg-slate-800 rounded-lg p-6 text-center mb-4">
              <p className="text-sm text-slate-400 mb-2">Ingestão de hoje</p>
              <p className="text-5xl font-black text-blue-400">{waterIntake}</p>
              <p className="text-xs text-slate-400 mt-1">/ 3500 ml</p>
              <div className="w-full bg-slate-900 rounded-full h-3 mt-4">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((waterIntake / 3500) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[250, 500, 750].map(ml => (
                <button
                  key={ml}
                  onClick={() => setWaterIntake(Math.min(waterIntake + ml, 5000))}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded"
                >
                  +{ml}ml
                </button>
              ))}
            </div>

            <button
              onClick={() => setWaterIntake(0)}
              className="w-full mt-3 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded text-xs"
            >
              Reset
            </button>
          </div>
        )}

        {/* TREINO */}
        {activeTab === 'treino' && (
          <div>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold mb-3">Gerar treino automático</p>
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="w-full bg-slate-900 text-white px-3 py-2 rounded text-sm mb-2"
              >
                <option value="perna pesada">Perna Pesada (85kg)</option>
                <option value="perna leve">Perna Leve</option>
                <option value="ombro">Ombro + Braços</option>
                <option value="superior">Superior (Força)</option>
              </select>
              <button
                onClick={generateWorkout}
                className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-2 rounded"
              >
                Gerar treino
              </button>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-bold mb-3">Histórico ({workouts.length})</p>
              {workouts.map(w => (
                <div key={w.id} className="bg-slate-900 rounded p-3 mb-2">
                  <p className="font-bold text-sm">{w.type}</p>
                  <p className="text-xs text-slate-400 mb-2">{w.date}</p>
                  {w.exercises ? (
                    w.exercises.map((ex, idx) => (
                      <p key={idx} className="text-xs text-amber-400">• {ex}</p>
                    ))
                  ) : (
                    <>
                      <p className="text-xs">FC: {w.fc_media} bpm (máx {w.fc_max})</p>
                      <p className="text-xs">Carga: {w.carga} | VO2: {w.vo2max}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOTOS DO RELÓGIO */}
        {activeTab === 'fotos' && (
          <div>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold mb-3">Bater foto do relógio</p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-sm"
              />
              <p className="text-xs text-slate-400 mt-2">A IA lerá FC, carga, VO2 automaticamente</p>
            </div>

            {photoData && (
              <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4">
                <p className="font-bold mb-3">Dados extraídos do relógio</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-purple-200">FC Média</p>
                    <p className="text-2xl font-black">{photoData.fc_media}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-200">FC Máxima</p>
                    <p className="text-2xl font-black">{photoData.fc_max}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-200">Carga</p>
                    <p className="text-2xl font-black">{photoData.carga}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-200">VO2 Max</p>
                    <p className="text-2xl font-black">{photoData.vo2max}</p>
                  </div>
                </div>
                <p className="text-xs text-purple-200 mt-3">{photoData.date}</p>
              </div>
            )}
          </div>
        )}

        {/* GRÁFICOS */}
        {activeTab === 'graficos' && (
          <div>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold mb-3">Peso (12 semanas)</p>
              <Line data={weightChartData} options={{ responsive: true, maintainAspectRatio: true }} height="100" />
            </div>

            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold mb-3">Macros hoje</p>
              <Bar data={macroChartData} options={{ responsive: true, maintainAspectRatio: true }} height="100" />
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-bold mb-3">Performance (treinos)</p>
              <Line data={performanceChartData} options={{ responsive: true, maintainAspectRatio: true }} height="100" />
            </div>
          </div>
        )}

        {/* PESAGENS */}
        {activeTab === 'pesagens' && (
          <div>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold mb-3">Últimas pesagens</p>
              {weighins.map((w, idx) => (
                <div key={idx} className="bg-slate-900 rounded p-3 mb-2 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{w.date}</p>
                    <p className="text-xs text-slate-400">{w.weight}kg | {w.waist}cm | {w.fat}%</p>
                  </div>
                  <button
                    onClick={() => {
                      // Mock print
                      alert(`Print:\n${w.date}\n${w.weight}kg\n${w.waist}cm\n${w.fat}%`);
                    }}
                    className="text-amber-400 text-xs font-bold hover:text-amber-300"
                  >
                    Print
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-bold mb-3">Adicionar nova pesagem</p>
              <input
                type="number"
                placeholder="Peso (kg)"
                step="0.1"
                className="w-full bg-slate-900 text-white px-3 py-2 rounded text-sm mb-2"
              />
              <input
                type="number"
                placeholder="Cintura (cm)"
                className="w-full bg-slate-900 text-white px-3 py-2 rounded text-sm mb-2"
              />
              <input
                type="number"
                placeholder="Gordura %"
                step="0.1"
                className="w-full bg-slate-900 text-white px-3 py-2 rounded text-sm mb-2"
              />
              <button
                className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-2 rounded"
              >
                Adicionar pesagem
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
