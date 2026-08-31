export function FoodDiary({ foods }) {
  if (!foods || foods.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <p className="text-slate-400">Nenhuma refeição registrada ainda</p>
        <p className="text-xs text-slate-500 mt-2">Comece adicionando uma comida!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-black mb-4 text-white">DIÁRIO DO DIA</h2>

      <div className="space-y-3">
        {foods.map((food, idx) => (
          <div key={idx} className="bg-slate-800 border-l-4 border-amber-500 rounded-lg p-4">
            {/* Hora + Descrição */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-amber-400">
                  {food.time || `Refeição ${idx + 1}`}
                </p>
                <p className="text-sm text-white mt-1">{food.food}</p>
              </div>
              <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400">
                #{idx + 1}
              </span>
            </div>

            {/* Macros em formato estilo "ingestão" */}
            <div className="bg-slate-900 rounded p-3 mt-3">
              <p className="text-xs text-slate-400 mb-2 uppercase">O que você ingeriu:</p>
              <div className="space-y-1">
                <p className="text-xs text-slate-300">
                  💥 <span className="font-bold text-red-400">{food.kcal} kcal</span> de energia
                </p>
                <p className="text-xs text-slate-300">
                  💪 <span className="font-bold text-emerald-400">{food.protein}g</span> de proteína (músculos)
                </p>
                <p className="text-xs text-slate-300">
                  🔥 <span className="font-bold text-amber-400">{food.fat}g</span> de gordura (hormônios + energia)
                </p>
                <p className="text-xs text-slate-300">
                  🍞 <span className="font-bold text-blue-400">{food.carbs}g</span> de carbos (energia rápida)
                </p>
              </div>
            </div>

            {/* Sumário nutricional */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              <div className="bg-red-900/30 rounded p-2 text-center">
                <p className="text-xs text-red-300 font-bold">{food.kcal}</p>
                <p className="text-xs text-red-400">kcal</p>
              </div>
              <div className="bg-emerald-900/30 rounded p-2 text-center">
                <p className="text-xs text-emerald-300 font-bold">{food.protein}g</p>
                <p className="text-xs text-emerald-400">proteína</p>
              </div>
              <div className="bg-amber-900/30 rounded p-2 text-center">
                <p className="text-xs text-amber-300 font-bold">{food.fat}g</p>
                <p className="text-xs text-amber-400">gordura</p>
              </div>
              <div className="bg-blue-900/30 rounded p-2 text-center">
                <p className="text-xs text-blue-300 font-bold">{food.carbs}g</p>
                <p className="text-xs text-blue-400">carbos</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sumário geral */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-4 mt-6 border border-slate-700">
        <p className="text-xs uppercase text-slate-400 mb-3">Resumo de tudo que entrou no seu corpo:</p>
        <p className="text-sm text-slate-300 leading-relaxed">
          Você ingeriu <span className="font-bold text-amber-400">{foods.length} refeição(ões)</span> até agora.
          Seu corpo recebeu energia, aminoácidos para reparação muscular, gorduras para funções hormonais e
          uma quantidade controlada de carboidratos para energia. Mantenha o foco nas metas!
        </p>
      </div>
    </div>
  );
}
