import React, { useState, useEffect, useRef } from 'react';

const SUPABASE_URL = 'https://ydvgriihdfjokukrbblb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_onryM4k2P3qJz6PaWffKEg_Ga97Efsr';

const sbHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
};

async function sbFetch(table, query) {
  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + query, { headers: sbHeaders });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function sbInsert(table, row) {
  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: { ...sbHeaders, Prefer: 'return=representation' },
      body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error('Erro ao salvar');
    return res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function renderMessageText(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return (
      <React.Fragment key={i}>
        {parts}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

const PEDRO_PROFILE = {
  nome: 'Pedro',
  idade: 41,
  peso: 93.9,
  altura: 1.93,
  metas: {
    kcal: 2400,
    proteina: 215,
    gordura: 160,
    carbos: 20,
    agua: 3500,
  },
  objetivos: [
    'Perder 5% de gordura (chegando a ~10-11%)',
    'Agacho: 85kg (PR atual: 82,5kg)',
    'Preservar massa magra',
    'Manter proteina 215g/dia',
    'Hidratacao 3,5L/dia + eletrolitos',
  ],
  restaurantes_favoritos: [
    'Bar Leoncio (Vila Madalena)',
    'Bottega Bernacca',
  ],
  restricoes: 'Sem overhead ombro (cirurgia anterior)',
};

export default function WellnessCompanion() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Opa, ' + PEDRO_PROFILE.nome + '! Bem-vindo ao seu Wellness Companion. Posso te ajudar com recomendacoes de comida, controlar seus macros, e te manter motivado rumo aos seus objetivos. Onde voce esta agora?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dailyData, setDailyData] = useState({
    kcal: 0,
    proteina: 0,
    gordura: 0,
    carbos: 0,
    agua: 0,
    refeicoes: 0,
  });
  const [gamification, setGamification] = useState({
    pontos: 0,
    streaks: 0,
    achievements: [],
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    (async () => {
      const refeicoes = await sbFetch('refeicoes', 'select=*&data=eq.' + todayIso());
      if (refeicoes.length) {
        const totais = {
          kcal: refeicoes.reduce((acc, r) => acc + (r.calorias || 0), 0),
          proteina: refeicoes.reduce((acc, r) => acc + (r.proteina_g || 0), 0),
          gordura: refeicoes.reduce((acc, r) => acc + (r.gordura_g || 0), 0),
          carbos: refeicoes.reduce((acc, r) => acc + (r.carboidrato_g || 0), 0),
          refeicoes: refeicoes.length,
        };
        setDailyData(prev => ({ ...prev, ...totais }));
        checkAchievements(totais);
      }
    })();
  }, []);

  const checkAchievements = (data) => {
    const newAchievements = [];
    if (data.proteina >= 215) newAchievements.push('Proteinado! (>215g)');
    if (data.agua >= 3500) newAchievements.push('Hidratacao Perfeita!');
    if (data.kcal <= 2400 && data.kcal > 2200) newAchievements.push('Caloria na Ponta!');
    setGamification(prev => ({
      ...prev,
      achievements: [...new Set([...prev.achievements, ...newAchievements])],
      pontos: data.proteina >= 215 ? prev.pontos + 10 : prev.pontos,
    }));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const context = 'Voce e um personal trainer e nutricionista AI especializado em recomposicao corporal. ' +
        'Voce conhece ' + PEDRO_PROFILE.nome + ', ' + PEDRO_PROFILE.idade + ' anos, ' + PEDRO_PROFILE.altura + 'm, ' + PEDRO_PROFILE.peso + 'kg. ' +
        'OBJETIVOS: ' + PEDRO_PROFILE.objetivos.join('; ') + '. ' +
        'METAS DIARIAS: Calorias ' + PEDRO_PROFILE.metas.kcal + 'kcal, Proteina ' + PEDRO_PROFILE.metas.proteina + 'g, Gordura ' + PEDRO_PROFILE.metas.gordura + 'g, Carbos menor que ' + PEDRO_PROFILE.metas.carbos + 'g, Agua ' + PEDRO_PROFILE.metas.agua + 'ml. ' +
        'CONSUMO DE HOJE: Kcal ' + dailyData.kcal + '/' + PEDRO_PROFILE.metas.kcal + ', Proteina ' + dailyData.proteina + '/' + PEDRO_PROFILE.metas.proteina + 'g, Gordura ' + dailyData.gordura + '/' + PEDRO_PROFILE.metas.gordura + 'g, Carbos ' + dailyData.carbos + '/' + PEDRO_PROFILE.metas.carbos + 'g, Agua ' + dailyData.agua + '/' + PEDRO_PROFILE.metas.agua + 'ml. ' +
        'RESTRICOES: ' + PEDRO_PROFILE.restricoes + '. Foco em forca e recomposicao. ' +
        'Agora, ' + PEDRO_PROFILE.nome + ' esta te perguntando: ' + JSON.stringify(currentInput) + '. ' +
        'Se ele mencionar um restaurante: recomenda pratos, mostra macros aproximados, diz se encaixa na meta do dia. ' +
        'Se ele disser o que comeu: reconhece o prato, estima os macros, sugere proxima refeicao pra balancear o dia. ' +
        'Se for sobre treino ou motivacao: motiva com contexto dos objetivos e sugere estrategia. ' +
        'Seja conversacional, motivador, mas direto. Maximo 150 palavras por resposta. Nao use markdown, sem asteriscos de negrito e sem listas com hifen, escreva em texto corrido. Pode usar emojis.';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 500,
          messages: [{ role: 'user', content: context }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na API');
      }

      const botMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: (data.content && data.content[0] && data.content[0].text) || 'Desculpa, erro ao processar.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      if (currentInput.toLowerCase().includes('comi') || currentInput.toLowerCase().includes('comendo')) {
        await sbInsert('refeicoes', {
          data: todayIso(),
          refeicao: 'Conversational Input',
          descricao: currentInput,
          calorias: 0,
          proteina_g: 0,
          gordura_g: 0,
          carboidrato_g: 0,
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'bot',
          text: 'Erro ao conectar com Claude. Tenta de novo!',
          timestamp: new Date(),
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="bg-slate-950 flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col bg-slate-800 rounded-lg" style={{ minHeight: '480px' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '480px' }}>
          {messages.map(msg => (
            <div key={msg.id} className={'flex ' + (msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={'max-w-xs px-4 py-2 rounded-lg ' + (msg.sender === 'user' ? 'bg-amber-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-100 rounded-bl-none')}>
                <p className="text-sm">{renderMessageText(msg.text)}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 px-4 py-2 rounded-lg rounded-bl-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-600 p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ex: Estou na Bottega Bernacca... Comi 300g mollejas..."
              className="flex-1 bg-slate-900 text-white px-3 py-2 rounded text-sm border border-slate-600 focus:border-amber-600 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 text-white px-4 py-2 rounded font-bold"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-80 flex flex-col gap-3">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4">
          <h2 className="text-sm font-black text-amber-400 mb-3">PLACAR DO DIA</h2>
          {[
            { label: 'Proteina', current: dailyData.proteina, max: PEDRO_PROFILE.metas.proteina, color: 'emerald' },
            { label: 'Kcal', current: dailyData.kcal, max: PEDRO_PROFILE.metas.kcal, color: 'red' },
            { label: 'Gordura', current: dailyData.gordura, max: PEDRO_PROFILE.metas.gordura, color: 'amber' },
            { label: 'Carbos', current: dailyData.carbos, max: PEDRO_PROFILE.metas.carbos, color: 'blue' },
          ].map((item, idx) => {
            const pct = Math.min((item.current / item.max) * 100, 100);
            return (
              <div key={idx} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="font-black text-slate-100">{item.current} / {item.max}</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className={'h-2 rounded-full transition-all bg-' + item.color + '-500'} style={{ width: pct + '%' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4">
          <h3 className="text-sm font-black text-purple-300 mb-3">GAMIFICACAO</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-200">Pontos</span>
              <span className="text-xl font-black text-purple-400">{gamification.pontos}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-200">Streak</span>
              <span className="text-xl font-black text-purple-400">{gamification.streaks}</span>
            </div>
          </div>
        </div>

        {gamification.achievements.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg p-4">
            <h3 className="text-sm font-black text-yellow-300 mb-2">ACHIEVEMENTS</h3>
            <div className="space-y-1">
              {gamification.achievements.map((ach, idx) => (
                <p key={idx} className="text-xs text-yellow-100">{ach}</p>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-black text-blue-300 mb-2">PROXIMO OBJETIVO</h3>
          <p className="text-xs text-blue-100">
            Faltam <span className="font-black text-blue-300">{Math.max(PEDRO_PROFILE.metas.proteina - dailyData.proteina, 0)}g</span> de proteina pra bater a meta!
          </p>
        </div>
      </div>
    </div>
  );
}
