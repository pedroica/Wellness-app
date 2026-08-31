export function FoodScoreboard({ dailyTotals, metas = {} }) {
  const metasPadrao = {
    kcal: 2400,
    protein: 215,
    fat: 160,
    carbs: 20,
  };

  const config = { ...metasPadrao, ...metas };

  const MetricBar = ({ label, current, max, unit, color }) => {
    const percentage = Math.min((current / max) * 100, 100);
    const remaining = max - current;
    const isOver = current > max;

    return (
      <div className="bg-slate-800 rounded-lg p-4 mb-3">
        <div className="flex justify-between items-baseline mb-2">
          <p className="text-sm font-bold text-slate-200">{label}</p>
          <p className={`text-2xl font-black ${isOver ? 'text-red-400' : 'text-amber-400'}`}>
            {current}
            <span className="text-xs ml-1 text-slate-400">/ {max}{unit}</span>
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${
              isOver ? 'bg-red-500' : color
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Status */}
        <div className="flex justify-between mt-2">
          <p className={`text-xs ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
            {isOver ? `+${Math.abs(remaining)}${unit} acima` : `Faltam ${remaining}${unit}`}
          </p>
          <p className="text-xs text-slate-500">{percentage.toFixed(0)}%</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-black mb-4 text-white">PLACAR DO DIA</h2>

        <MetricBar
          label="Calorias"
          current={dailyTotals.kcal}
          max={config.kcal}
          unit=""
          color="bg-red-500"
        />

        <MetricBar
          label="Proteína"
          current={dailyTotals.protein}
          max={config.protein}
          unit="g"
          color="bg-emerald-500"
        />

        <MetricBar
          label="Gordura"
          current={dailyTotals.fat}
          max={config.fat}
          unit="g"
          color="bg-amber-500"
        />

        <MetricBar
          label="Carbos"
          current={dailyTotals.carbs}
          max={config.carbs}
          unit="g"
          color="bg-blue-500"
        />
      </div>

      {/* Resumo */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-4">
        <p className="text-xs text-slate-400 uppercase mb-3">Status do dia</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-400">Refeições</p>
            <p className="text-2xl font-black text-amber-400">{dailyTotals.refeicoes || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Progresso</p>
            <p className="text-2xl font-black text-blue-400">
              {Math.round((dailyTotals.kcal / config.kcal) * 100)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
