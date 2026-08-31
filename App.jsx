import React, { useState, useEffect } from 'react';
import { FoodScoreboard } from './src/components/FoodScoreboard';
import { FoodDiary } from './src/components/FoodDiary';
import WellnessCompanion from './src/components/WellnessCompanion';
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

const SUPABASE_URL = 'https://ydvgriihdfjokukrbblb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_onryM4k2P3qJz6PaWffKEg_Ga97Efsr';

const sbHeaders = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
};

async function sbFetch(table, query) {
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + query, { headers: sbHeaders });
    if (!res.ok) throw new Error('Erro ao buscar ' + table);
    return res.json();
}

async function sbInsert(table, row) {
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
          method: 'POST',
          headers: { ...sbHeaders, Prefer: 'return=representation' },
          body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error('Erro ao salvar em ' + table);
    return res.json();
}

async function sbUpsertPesagem(row) {
    const res = await fetch(SUPABASE_URL + '/rest/v1/pesagens?on_conflict=data', {
          method: 'POST',
          headers: { ...sbHeaders, Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error('Erro ao salvar pesagem');
    return res.json();
}

function formatDateBR(iso) {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return parts[2] + '/' + parts[1];
}

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

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
    const [pesagensChart, setPesagensChart] = useState([]);
    const [photoData, setPhotoData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dbStatus, setDbStatus] = useState('carregando');
    const [novoPeso, setNovoPeso] = useState('');
    const [novaCintura, setNovaCintura] = useState('');
    const [novaGordura, setNovaGordura] = useState('');

  useEffect(() => {
        (async () => {
                try {
                          const pesagensData = await sbFetch('pesagens', 'select=*&order=data.asc');
                          setPesagensChart(pesagensData);
                          if (pesagensData.length) {
                                      const sorted = [...pesagensData].sort((a, b) => (a.data < b.data ? 1 : -1));
                                      setWeighins(sorted.map(p => ({
                                                    date: formatDateBR(p.data),
                                                    weight: p.peso_kg,
                                                    waist: p.cintura_cm,
                                                    fat: p.massa_gorda_kg,
                                      })));
                          }

                  const treinosData = await sbFetch('treinos', 'select=*&order=data.desc&limit=40');
                          setWorkouts(treinosData.map(t => ({
                                      id: t.id,
                                      date: formatDateBR(t.data),
                                      type: t.tipo,
                                      descricao: t.descricao,
                                      fc_media: t.fc_media,
                                      fc_max: t.fc_maxima,
                                      carga: t.carga_treino,
                                      vo2max: null,
                          })));

                  const refeicoesData = await sbFetch('refeicoes', 'select=*&order=data.desc&limit=150');
                          if (refeicoesData.length) {
                                      const latestDate = refeicoesData[0].data;
                                      const todays = refeicoesData.filter(r => r.data === latestDate).reverse();
                                      setFoods(todays.map(f => ({
                                                    food: f.descricao,
                                                    kcal: f.calorias || 0,
                                                    protein: f.proteina_g || 0,
                                                    fat: f.gordura_g || 0,
                                                    carbs: f.carboidrato_g || 0,
                                                    time: f.refeicao || '',
                                      })));
                          }
                          setDbStatus('conectado');
                } catch (e) {
                          console.error('Erro ao carregar dados do Supabase', e);
                          setDbStatus('erro');
                }
        })();
  }, []);

  const historicoFallback = [
    { semana: 1, peso: 99.2 },
    { semana: 2, peso: 97.9 },
    { semana: 5, peso: 95.95 },
    { semana: 7, peso: 96.05 },
    { semana: 8, peso: 95.3 },
      ];

  const analyzeFoodWithLLM = async (foodDescription) => {
        setLoading(true);
        const mockResponse = {
                food: foodDescription,
                kcal: Math.floor(Math.random() * 500 + 200),
                protein: Math.floor(Math.random() * 40 + 20),
                fat: Math.floor(Math.random() * 40 + 10),
                carbs: Math.floor(Math.random() * 20 + 2),
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };

        setTimeout(async () => {
                setFoods([...foods, mockResponse]);
                setFoodInput('');
                setLoading(false);
                try {
                          await sbInsert('refeicoes', {
                                      data: todayIso(),
                                      refeicao: 'App',
                                      descricao: mockResponse.food,
                                      calorias: mockResponse.kcal,
                                      proteina_g: mockResponse.protein,
                                      gordura_g: mockResponse.fat,
                                      carboidrato_g: mockResponse.carbs,
                          });
                } catch (e) {
                          console.error(e);
                }
        }, 800);
  };

  const generateWorkout = async () => {
        const workouts_db = {
                'perna pesada': {
                          nome: 'Perna Pesada',
                          exercicios: [
                                      '85kg Agachamento 5x5',
                                      'RDL ~60kg 3x8',
                                      'Swing KB20 3x15',
                                      'Panturrilha 3x20',
                                    ],
                },
                'perna leve': {
                          nome: 'Perna Leve',
                          exercicios: [
                                      'Agachamento 60kg 4x10',
                                      'Legpress 3x12',
                                      'Leg curl 3x12',
                                      'Panturrilha 2x15',
                                    ],
                },
                'ombro': {
                          nome: 'Ombros + Bracos',
                          exercicios: [
                                      'Elevacao lateral 10kg 3x12',
                                      'Elevacao frontal 8kg 3x12',
                                      'Encolhimento 15kg 3x12',
                                      'Triceps corda 3x12',
                                      'Rosca direta 3x12',
                                    ],
                },
                'superior': {
                          nome: 'Superior (Forca)',
                          exercicios: [
                                      'Supino 60kg 3x8',
                                      'Barra assistida 4x8',
                                      'Serrote KB20 3x12',
                                      'Prancha 3x1min',
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
        try {
                await sbInsert('treinos', {
                          data: todayIso(),
                          tipo: selected.nome,
                          descricao: selected.exercicios.join('; '),
                });
        } catch (e) {
                console.error(e);
        }
  };

  const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
                const mockWorkoutData = {
                          fc_media: 162,
                          fc_max: 186,
                          carga: 179,
                          vo2max: '42',
                          tempo: '20:09',
                          date: new Date().toLocaleDateString('pt-BR'),
                };
                setPhotoData(mockWorkoutData);

          const workout = {
                    date: mockWorkoutData.date,
                    type: 'Corrida/Cardio (do relogio)',
                    fc_media: mockWorkoutData.fc_media,
                    fc_max: mockWorkoutData.fc_max,
                    carga: mockWorkoutData.carga,
                    vo2max: mockWorkoutData.vo2max,
                    tempo: mockWorkoutData.tempo,
                    id: Date.now(),
          };
                setWorkouts([workout, ...workouts]);

          sbInsert('treinos', {
                    data: todayIso(),
                    tipo: 'Corrida/Cardio (do relogio)',
                    fc_media: mockWorkoutData.fc_media,
                    fc_maxima: mockWorkoutData.fc_max,
                    carga_treino: mockWorkoutData.carga,
                    observacoes: 'VO2max ' + mockWorkoutData.vo2max + ', tempo ' + mockWorkoutData.tempo + ' (lido de foto do relogio)',
          }).catch(err => console.error(err));
        }
  };

  const addPesagem = async () => {
        if (!novoPeso) return;
        const row = {
                data: todayIso(),
                peso_kg: parseFloat(novoPeso),
                cintura_cm: novaCintura ? parseFloat(novaCintura) : null,
                massa_gorda_kg: novaGordura ? parseFloat(novaGordura) : null,
        };
        setWeighins([{ date: formatDateBR(row.data), weight: row.peso_kg, waist: row.cintura_cm, fat: row.massa_gorda_kg }, ...weighins]);
        setNovoPeso('');
        setNovaCintura('');
        setNovaGordura('');
        try {
                await sbUpsertPesagem(row);
        } catch (e) {
                console.error(e);
        }
  };

  const dailyTotals = {
        kcal: foods.reduce((acc, f) => acc + f.kcal, 0),
        protein: foods.reduce((acc, f) => acc + f.protein, 0),
        fat: foods.reduce((acc, f) => acc + f.fat, 0),
        carbs: foods.reduce((acc, f) => acc + f.carbs, 0),
  };

  const weightSource = pesagensChart.length
      ? pesagensChart.map(p => ({ label: formatDateBR(p.data), peso: p.peso_kg }))
        : historicoFallback.map(h => ({ label: 'S' + h.semana, peso: h.peso }));

  const weightChartData = {
        labels: weightSource.map(w => w.label),
        datasets: [{
                label: 'Peso (kg)',
                data: weightSource.map(w => w.peso),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.3,
                fill: true,
        }],
  };

  const macroChartData = {
        labels: ['Proteina', 'Gordura', 'Carbos'],
        datasets: [{
                label: 'Macros (g)',
                data: [dailyTotals.protein, dailyTotals.fat, dailyTotals.carbs],
                backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
        }],
  };

  const performanceChartData = {
        labels: workouts.slice(0, 10).reverse().map((w, i) => String(i + 1)),
        datasets: [{
                label: 'Carga (treinos ultimos 10)',
                data: workouts.slice(0, 10).reverse().map(w => w.carga || 60),
                borderColor: '#a78bfa',
                backgroundColor: 'rgba(167, 139, 250, 0.1)',
                tension: 0.3,
        }],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-24">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-sm uppercase tracking-widest text-slate-400">Wellness v2</h1>
          <p className="text-3xl font-black mt-1">Performance Center</p>
          <p className="text-xs text-slate-400 mt-2">
            LLM + Treino + Hidratacao + Fotos - {dbStatus === 'conectado' ? 'banco conectado' : dbStatus === 'erro' ? 'erro ao conectar banco' : 'conectando...'}
          </p>
        </div>
      </div>

      <div className="sticky top-20 bg-slate-900 border-b border-slate-700 flex overflow-x-auto z-40">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'coach', label: 'Coach' },
          { id: 'alimentacao', label: 'Comida' },
          { id: 'hidratacao', label: 'Agua' },
          { id: 'treino', label: 'Treino' },
          { id: 'fotos', label: 'Relogio' },
          { id: 'graficos', label: 'Graficos' },
          { id: 'pesagens', label: 'Pesagens' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'px-3 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition bg-amber-500 text-black' : 'px-3 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition text-slate-400 hover:text-white'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-4">
                <p className="text-xs text-red-200 uppercase">Kcal hoje</p>
                <p className="text-3xl font-black">{dailyTotals.kcal}</p>
                <p className="text-xs text-red-200 mt-1">meta: 2400</p>
              </div>
              <div className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-lg p-4">
                <p className="text-xs text-amber-200 uppercase">Agua</p>
                <p className="text-3xl font-black">{waterIntake}/3500</p>
                <p className="text-xs text-amber-200 mt-1">ml</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-lg p-4">
                <p className="text-xs text-emerald-200 uppercase">Proteina</p>
                <p className="text-3xl font-black">{dailyTotals.protein}g</p>
                <p className="text-xs text-emerald-200 mt-1">meta: 215g</p>
              </div>
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4">
                <p className="text-xs text-blue-200 uppercase">Treinos</p>
                <p className="text-3xl font-black">{workouts.length}</p>
                <p className="text-xs text-blue-200 mt-1">no historico</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-bold mb-3">Refeicoes do dia mais recente</p>
              {foods.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhuma refeicao registrada</p>
              ) : (
                foods.map((food, idx) => (
                  <div key={idx} className="bg-slate-900 rounded p-2 mb-2">
                    <p className="text-xs font-bold">{food.time} - {food.food}</p>
                    <p className="text-xs text-amber-400">{food.kcal}kcal | P:{food.protein}g | G:{food.fat}g</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

{activeTab === 'alimentacao' && (
  <div>
    {/* Input de comida */}
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

    {/* Placar do dia */}
    <FoodScoreboard
      dailyTotals={dailyTotals}
      metas={{ kcal: 2400, protein: 215, fat: 160, carbs: 20 }}
    />

    {/* Diario de alimentacao */}
    <div className="mt-6">
      <FoodDiary foods={foods} />
    </div>
  </div>
)}

        {activeTab === 'hidratacao' && (
          <div>
            <div className="bg-slate-800 rounded-lg p-6 text-center mb-4">
              <p className="text-sm text-slate-400 mb-2">Ingestao de hoje</p>
              <p className="text-5xl font-black text-blue-400">{waterIntake}</p>
              <p className="text-xs text-slate-400 mt-1">/ 3500 ml</p>
              <div className="w-full bg-slate-900 rounded-full h-3 mt-4">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: Math.min((waterIntake / 3500) * 100, 100) + '%' }}
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

        {activeTab === 'treino' && (
          <div>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold mb-3">Gerar treino automatico</p>
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="w-full bg-slate-900 text-white px-3 py-2 rounded text-sm mb-2"
              >
                <option value="perna pesada">Perna Pesada (85kg)</option>
                <option value="perna leve">Perna Leve</option>
                <option value="ombro">Ombro + Bracos</option>
                <option value="superior">Superior (Forca)</option>
              </select>
              <button
                onClick={generateWorkout}
                className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-2 rounded"
              >
                Gerar treino
              </button>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-bold mb-3">Historico ({workouts.length})</p>
              {workouts.map(w => (
                <div key={w.id} className="bg-slate-900 rounded p-3 mb-2">
                  <p className="font-bold text-sm">{w.type}</p>
                  <p className="text-xs text-slate-400 mb-2">{w.date}</p>
                  {w.descricao && (
                    <p className="text-xs text-slate-300 mb-1">{w.descricao}</p>
                  )}
                  {w.exercises ? (
                    w.exercises.map((ex, idx) => (
                      <p key={idx} className="text-xs text-amber-400">- {ex}</p>
                    ))
                  ) : w.fc_media ? (
                    <div>
                      <p className="text-xs">FC: {w.fc_media} bpm (max {w.fc_max})</p>
                      <p className="text-xs">Carga: {w.carga} - VO2: {w.vo2max}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'fotos' && (
          <div>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold mb-3">Bater foto do relogio</p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-sm"
              />
              <p className="text-xs text-slate-400 mt-2">A IA lera FC, carga, VO2 automaticamente</p>
            </div>

            {photoData && (
              <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4">
                <p className="font-bold mb-3">Dados extraidos do relogio</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-purple-200">FC Media</p>
                    <p className="text-2xl font-black">{photoData.fc_media}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-200">FC Maxima</p>
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

        {activeTab === 'graficos' && (
          <div>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold mb-3">Peso (historico)</p>
              <Line data={weightChartData} options={{ responsive: true, maintainAspectRatio: true }} height="100" />
            </div>

            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold mb-3">Macros do dia mais recente</p>
              <Bar data={macroChartData} options={{ responsive: true, maintainAspectRatio: true }} height="100" />
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-bold mb-3">Performance (treinos)</p>
              <Line data={performanceChartData} options={{ responsive: true, maintainAspectRatio: true }} height="100" />
            </div>
          </div>
        )}

        {activeTab === 'pesagens' && (
          <div>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold mb-3">Ultimas pesagens</p>
              {weighins.map((w, idx) => (
                <div key={idx} className="bg-slate-900 rounded p-3 mb-2 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{w.date}</p>
                    <p className="text-xs text-slate-400">{w.weight}kg | {w.waist}cm | {w.fat}kg gordura</p>
                  </div>
                  <button
                    onClick={() => {
                      alert('Print:' + String.fromCharCode(10) + w.date + String.fromCharCode(10) + w.weight + 'kg' + String.fromCharCode(10) + w.waist + 'cm');
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
                value={novoPeso}
                onChange={(e) => setNovoPeso(e.target.value)}
                className="w-full bg-slate-900 text-white px-3 py-2 rounded text-sm mb-2"
              />
              <input
                type="number"
                placeholder="Cintura (cm)"
                value={novaCintura}
                onChange={(e) => setNovaCintura(e.target.value)}
                className="w-full bg-slate-900 text-white px-3 py-2 rounded text-sm mb-2"
              />
              <input
                type="number"
                placeholder="Gordura (kg)"
                step="0.1"
                value={novaGordura}
                onChange={(e) => setNovaGordura(e.target.value)}
                className="w-full bg-slate-900 text-white px-3 py-2 rounded text-sm mb-2"
              />
              <button
                onClick={addPesagem}
                disabled={!novoPeso}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-black font-bold py-2 rounded"
              >
                Adicionar pesagem
              </button>
            </div>
          </div>
        )}

        {activeTab === 'coach' && (
          <WellnessCompanion />
        )}
      </div>
    </div>
  );
}
