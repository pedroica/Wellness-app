# WELLNESS APP v2 - Pedro Performance Center

App completo com LLM, tracker de hidratação, gerador de treino, upload de fotos, e gráficos.

---

## 🚀 SETUP (5 min)

### 1. **Clone/copie os arquivos**
```bash
cd wellness-app-v2
```

### 2. **Instale dependências**
```bash
npm install
```

### 3. **Rode no localhost**
```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## ✅ O que já funciona (MOCK DATA)

✓ **Dashboard** - métricas do dia (kcal, água, proteína, treinos)
✓ **Alimentação** - input de comida com análise LLM (mock agora, vai com Claude depois)
✓ **Hidratação** - tracker visual de água (0-5000ml)
✓ **Gerador de Treino** - cria treinos customizados (perna pesada, ombro, etc)
✓ **Histórico de Treino** - salva todos os treinos com exercícios
✓ **Upload de Foto** - simulado OCR do relógio (vai com Vision API depois)
✓ **Gráficos** - peso 12 semanas, macros, performance
✓ **Pesagens** - log de pesagens com print

---

## 🔗 PRÓXIMA ETAPA - Integrar Claude API

### Quando você passar a chave regenerada:

1. Cria arquivo `.env` na raiz:
```
VITE_CLAUDE_API_KEY=sk-ant-api03-xxxxx
```

2. Na função `analyzeFoodWithLLM` (linha ~120 do App.jsx), trocar:

```javascript
// ANTES (mock):
const mockResponse = {
  food: foodDescription,
  kcal: Math.floor(Math.random() * 500 + 200),
  // ...
};

// DEPOIS (Claude real):
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-opus-4-1',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Analise essa comida e retorne JSON com kcal, proteína (g), gordura (g), carbos (g): ${foodDescription}`
    }]
  })
});
```

3. Para **upload de foto do relógio** (Vision API):
   - Usar `claude-opus-4-1` com `type: "image"`
   - Fazer OCR automático do Garmin
   - Extrair FC, carga, VO2

---

## 📊 Estrutura

```
wellness-app-v2/
├── App.jsx                 ← Componente principal (TUDO está aqui)
├── src/
│   ├── main.jsx           ← Entry point
│   └── index.css          ← Tailwind
├── index.html             ← HTML root
├── vite.config.js         ← Vite config
├── tailwind.config.js     ← Tailwind config
├── postcss.config.js      ← PostCSS
├── package.json           ← Dependências
└── README.md             ← Este arquivo
```

---

## 🎯 Funcionalidades por Tab

### Dashboard
- Totais do dia (kcal, proteína, água, treinos)
- Resumo das refeições

### Alimentação
- Input de comida (texto)
- Claude analisa e calcula macros
- Total diário em tempo real

### Hidratação
- Botões rápidos (+250ml, +500ml, +750ml)
- Barra visual de progresso
- Reset diário

### Gerador de Treino
- Seleciona tipo (perna pesada, leve, ombro, superior)
- Claude gera exercícios personalizados
- Histórico de todos os treinos

### Upload de Foto
- Tira foto do relógio Garmin
- Claude extrai: FC média, FC máxima, carga, VO2
- Salva automaticamente como treino

### Gráficos
- Peso (12 semanas)
- Macros (hoje)
- Performance (últimos treinos)

### Pesagens
- Log de todas as pesagens
- Export para print/screenshot

---

## 🔑 Quando passar a chave

Você tem total liberdade — pode testar com mock data primeiro (tudo já está rodando), ou passar a chave quando quiser e eu integro 100% em 2 min.

Avisa quando tiver a chave regenerada! 🚀

---

## 💡 Tips

- **Mock data funciona perfeitamente** pra testar a UI
- **Todos os dados salvam em localStorage** (não perdem se atualizar)
- **Build pra production:** `npm run build`
- **Deploy no Vercel:** conecta o repo, pronto

---

**Pronto pra usar agora. Entra e testa tudo!** 🔥
