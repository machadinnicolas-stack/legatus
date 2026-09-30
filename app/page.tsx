"use client";

import NextImage from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

type CategoryKey = "carro" | "moto" | "celular" | "viagem" | "casa" | "reserva" | "personalizada";
type TabKey = "mapa" | "conquistas" | "conselho" | "plano" | "perfil";
type CommanderKey = "martel" | "darc" | "hannibal" | "scipio" | "alexander" | "belisarius";

type Goal = {
  id: string;
  title: string;
  category: CategoryKey;
  target: number;
  saved: number;
  priority: 1 | 2 | 3;
  createdAt: string;
  image?: string;
};

type PriorityItem = {
  id: string;
  text: string;
  done: boolean;
};

type CouncilMessage = {
  id: string;
  role: "user" | "commander";
  text: string;
  createdAt: string;
};

type AppData = {
  onboarded: boolean;
  name: string;
  monthlyBudget: number;
  goals: Goal[];
  priorityItems: PriorityItem[];
  commander?: CommanderKey;
  councilMessages: CouncilMessage[];
};

const commanders: Record<CommanderKey, {
  name: string;
  epithet: string;
  symbol: string;
  color: string;
  strength: string;
  doctrine: string;
  image: string;
  welcome: string;
}> = {
  martel: {
    name: "Martel",
    epithet: "O Protetor",
    symbol: "M",
    color: "#9a7040",
    strength: "Estabilidade antes da expansão",
    doctrine: "Nenhum território cresce se suas fronteiras permanecem vulneráveis.",
    image: "/commanders/martel.png",
    welcome: "Antes de avançarmos, vamos proteger a base que sustentará todas as suas conquistas.",
  },
  darc: {
    name: "D’Arc",
    epithet: "A Visionária",
    symbol: "✦",
    color: "#a88958",
    strength: "Coragem para começar uma nova fase",
    doctrine: "Toda mudança real começa quando alguém decide acreditar antes de enxergar.",
    image: "/commanders/darc.png",
    welcome: "Sua visão já existe. Minha função é ajudá-lo a transformá-la em movimento.",
  },
  hannibal: {
    name: "Aníbal",
    epithet: "O Estrategista",
    symbol: "H",
    color: "#5f766f",
    strength: "Fazer mais com recursos limitados",
    doctrine: "O caminho impossível apenas exige uma rota que ninguém considerou.",
    image: "/commanders/hannibal.png",
    welcome: "Não precisamos de mais recursos para começar. Precisamos posicionar melhor os que você já possui.",
  },
  scipio: {
    name: "Cipião",
    epithet: "O Adaptável",
    symbol: "S",
    color: "#6f7384",
    strength: "Aprender, ajustar e recuperar o controle",
    doctrine: "Uma derrota estudada pode se tornar a arquitetura da próxima vitória.",
    image: "/commanders/scipio.png",
    welcome: "Vamos observar o que não funcionou, ajustar a formação e retomar o controle da sua rota.",
  },
  alexander: {
    name: "Alexandre",
    epithet: "O Conquistador",
    symbol: "A",
    color: "#9c6048",
    strength: "Ambição transformada em velocidade",
    doctrine: "Grandes territórios pertencem a quem tem coragem de iniciar a marcha.",
    image: "/commanders/alexander.png",
    welcome: "Sua ambição não precisa ser reduzida. Ela precisa de direção, ritmo e um primeiro avanço.",
  },
  belisarius: {
    name: "Belisário",
    epithet: "O Leal",
    symbol: "B",
    color: "#66745f",
    strength: "Constância mesmo sem condições perfeitas",
    doctrine: "A disciplina permanece quando a motivação abandona o campo.",
    image: "/commanders/belisarius.png",
    welcome: "Não dependeremos de dias perfeitos. Construiremos uma rotina capaz de resistir aos dias difíceis.",
  },
};

const categories: Record<CategoryKey, { label: string; icon: string; color: string; suggestion: string }> = {
  carro: { label: "Carro", icon: "◆", color: "#d78561", suggestion: "Meu primeiro carro" },
  moto: { label: "Moto", icon: "◒", color: "#687c65", suggestion: "Minha moto" },
  celular: { label: "Celular", icon: "▯", color: "#8c77a8", suggestion: "Celular novo" },
  viagem: { label: "Viagem", icon: "✦", color: "#477b83", suggestion: "Viagem dos sonhos" },
  casa: { label: "Casa & apê", icon: "⌂", color: "#a56b52", suggestion: "Meu primeiro apê" },
  reserva: { label: "Reserva", icon: "◉", color: "#606d80", suggestion: "Minha segurança" },
  personalizada: { label: "Outra", icon: "+", color: "#756d64", suggestion: "Minha conquista" },
};

const initialData: AppData = {
  onboarded: false,
  name: "",
  monthlyBudget: 800,
  goals: [],
  priorityItems: [],
  councilMessages: [],
};

const demoData: AppData = {
  onboarded: true,
  name: "Marina",
  monthlyBudget: 1500,
  goals: [
    { id: "demo-1", title: "Meu primeiro carro", category: "carro", target: 28000, saved: 9300, priority: 3, createdAt: "2026-07-14" },
    { id: "demo-2", title: "Viagem para o Chile", category: "viagem", target: 6500, saved: 2100, priority: 2, createdAt: "2026-08-03" },
    { id: "demo-3", title: "Reserva de paz", category: "reserva", target: 12000, saved: 4800, priority: 1, createdAt: "2026-06-01" },
  ],
  priorityItems: [
    { id: "priority-demo-1", text: "Separar o aporte assim que o salário cair", done: true },
    { id: "priority-demo-2", text: "Pesquisar seguro para o primeiro carro", done: false },
  ],
  commander: "hannibal",
  councilMessages: [
    { id: "council-demo-1", role: "commander", text: commanders.hannibal.welcome, createdAt: "2026-09-28T12:00:00.000Z" },
  ],
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value || 0);
}

function monthLabel(monthsFromNow: number) {
  if (monthsFromNow >= 999) return "Sem previsão";
  const date = new Date();
  date.setMonth(date.getMonth() + Math.max(0, monthsFromNow));
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(date).replace(" de ", " ");
}

function pluralMonths(value: number) {
  if (value <= 1) return "1 mês";
  if (value > 120) return "mais de 10 anos";
  return `${value} meses`;
}

async function compressGoalImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Escolha uma imagem válida.");
  if (file.size > 12 * 1024 * 1024) throw new Error("A imagem pode ter no máximo 12 MB.");

  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Não foi possível abrir a imagem."));
    element.src = source;
  });

  const maxWidth = 1400;
  const maxHeight = 1000;
  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar a imagem.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

function calculatePlans(goals: Goal[], monthlyBudget: number) {
  const totalWeight = goals.reduce((sum, goal) => sum + goal.priority, 0) || 1;
  return goals
    .map((goal) => {
      const contribution = monthlyBudget * (goal.priority / totalWeight);
      const remaining = Math.max(0, goal.target - goal.saved);
      const months = contribution > 0 ? Math.max(1, Math.ceil(remaining / contribution)) : 999;
      const progress = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
      return { ...goal, contribution, remaining, months, progress };
    })
    .sort((a, b) => b.priority - a.priority || a.months - b.months);
}

export default function Home() {
  const [data, setData] = useState<AppData>(initialData);
  const [hydrated, setHydrated] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState<"hero" | "setup">("hero");
  const [tab, setTab] = useState<TabKey>("mapa");
  const [goalModal, setGoalModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let nextData = initialData;
    try {
      const stored = window.localStorage.getItem("legatus-data");
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppData>;
        nextData = {
          ...initialData,
          ...parsed,
          goals: Array.isArray(parsed.goals) ? parsed.goals : [],
          priorityItems: Array.isArray(parsed.priorityItems) ? parsed.priorityItems : [],
          councilMessages: Array.isArray(parsed.councilMessages) ? parsed.councilMessages : [],
        };
      }
    } catch {
      // The app remains usable with in-memory data when storage is unavailable.
    }
    const timer = window.setTimeout(() => {
      setData(nextData);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem("legatus-data", JSON.stringify(data));
    } catch {
      // The current session remains usable if the browser storage quota is full.
    }
  }, [data, hydrated]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js");
  }, []);

  const plans = useMemo(() => calculatePlans(data.goals, data.monthlyBudget), [data.goals, data.monthlyBudget]);
  const selectedGoal = plans.find((goal) => goal.id === selectedId) ?? null;

  if (!hydrated) return <div className="boot"><div className="brand-mark">L</div></div>;

  if (!data.onboarded) {
    return welcomeStep === "hero" ? (
      <Welcome
        onStart={() => setWelcomeStep("setup")}
        onDemo={() => setData(demoData)}
      />
    ) : (
      <Setup
        onBack={() => setWelcomeStep("hero")}
        onComplete={(name, monthlyBudget) => {
          setData({ onboarded: true, name, monthlyBudget, goals: [], priorityItems: [], councilMessages: [] });
          setGoalModal(true);
        }}
      />
    );
  }

  return (
    <main className="app-shell">
      <Sidebar tab={tab} setTab={setTab} onAdd={() => setGoalModal(true)} />
      <section className="app-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Seu mapa de conquistas</span>
            <h1>{greeting()}, {firstName(data.name)}.</h1>
          </div>
          <div className="topbar-actions">
            <span className="command-status"><i /> Plano em marcha</span>
            <button className="avatar" onClick={() => setTab("perfil")} aria-label="Abrir perfil">
              {firstName(data.name).charAt(0).toUpperCase() || "L"}
            </button>
          </div>
        </header>

        {tab === "mapa" && (
          <Dashboard
            data={data}
            plans={plans}
            onAdd={() => setGoalModal(true)}
            onSelect={setSelectedId}
            onChangeBudget={(monthlyBudget) => setData((current) => ({ ...current, monthlyBudget }))}
            onAddPriority={(text) => setData((current) => ({
              ...current,
              priorityItems: [...current.priorityItems, { id: crypto.randomUUID(), text, done: false }],
            }))}
            onTogglePriority={(id) => setData((current) => ({
              ...current,
              priorityItems: current.priorityItems.map((item) => item.id === id ? { ...item, done: !item.done } : item),
            }))}
            onRemovePriority={(id) => setData((current) => ({
              ...current,
              priorityItems: current.priorityItems.filter((item) => item.id !== id),
            }))}
            onOpenCouncil={() => setTab("conselho")}
          />
        )}
        {tab === "conquistas" && (
          <GoalsView plans={plans} onAdd={() => setGoalModal(true)} onSelect={setSelectedId} />
        )}
        {tab === "conselho" && (
          <CouncilView
            data={data}
            plans={plans}
            onChooseCommander={(commander) => setData((current) => ({
              ...current,
              commander,
              councilMessages: [{
                id: crypto.randomUUID(),
                role: "commander",
                text: commanders[commander].welcome,
                createdAt: new Date().toISOString(),
              }],
            }))}
            onSend={(text) => setData((current) => {
              if (!current.commander) return current;
              const userMessage: CouncilMessage = { id: crypto.randomUUID(), role: "user", text, createdAt: new Date().toISOString() };
              const response: CouncilMessage = {
                id: crypto.randomUUID(),
                role: "commander",
                text: councilResponse(current.commander, text, plans, current.priorityItems, current.monthlyBudget),
                createdAt: new Date().toISOString(),
              };
              return { ...current, councilMessages: [...current.councilMessages, userMessage, response].slice(-20) };
            })}
            onOpenPlan={() => setTab("plano")}
          />
        )}
        {tab === "plano" && <PlanView data={data} plans={plans} />}
        {tab === "perfil" && (
          <ProfileView
            data={data}
            onChange={(patch) => setData((current) => ({ ...current, ...patch }))}
            onReset={() => {
              window.localStorage.removeItem("legatus-data");
              setData(initialData);
              setWelcomeStep("hero");
              setTab("mapa");
            }}
          />
        )}
      </section>

      <MobileNav tab={tab} setTab={setTab} onAdd={() => setGoalModal(true)} />

      {goalModal && (
        <GoalModal
          onClose={() => setGoalModal(false)}
          onSave={(goal) => {
            setData((current) => ({ ...current, goals: [...current.goals, goal] }));
            setGoalModal(false);
          }}
        />
      )}

      {selectedGoal && (
        <GoalDetails
          goal={selectedGoal}
          monthlyBudget={data.monthlyBudget}
          onClose={() => setSelectedId(null)}
          onPriority={(priority) => setData((current) => ({
            ...current,
            goals: current.goals.map((goal) => goal.id === selectedGoal.id ? { ...goal, priority } : goal),
          }))}
          onDeposit={(amount) => setData((current) => ({
            ...current,
            goals: current.goals.map((goal) => goal.id === selectedGoal.id
              ? { ...goal, saved: Math.min(goal.target, goal.saved + amount) }
              : goal),
          }))}
          onImage={(image) => setData((current) => ({
            ...current,
            goals: current.goals.map((goal) => goal.id === selectedGoal.id ? { ...goal, image } : goal),
          }))}
          onDelete={() => {
            setData((current) => ({ ...current, goals: current.goals.filter((goal) => goal.id !== selectedGoal.id) }));
            setSelectedId(null);
          }}
        />
      )}
    </main>
  );
}

function firstName(name: string) {
  return name.trim().split(" ")[0] || "Comandante";
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function Welcome({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  return (
    <main className="welcome">
      <header className="welcome-nav">
        <Logo />
        <button className="text-button" onClick={onDemo}>Ver demonstração <span>↗</span></button>
      </header>
      <section className="welcome-grid">
        <div className="welcome-copy">
          <span className="welcome-kicker">A estratégia por trás da vida que você quer</span>
          <h1>Sonhos não precisam depender do acaso.</h1>
          <p>Reúna suas maiores conquistas, escolha suas prioridades e descubra o caminho real até cada uma delas.</p>
          <div className="welcome-actions">
            <button className="primary-button large" onClick={onStart}>Comandar meu futuro <span>→</span></button>
            <small>Grátis para começar · Leva menos de 2 minutos</small>
          </div>
          <div className="proof-row">
            <div><strong>1 mapa</strong><span>para toda a sua vida</span></div>
            <div><strong>Sem achismo</strong><span>datas e decisões reais</span></div>
          </div>
        </div>
        <div className="welcome-visual" aria-label="Prévia do mapa de conquistas">
          <div className="sun-orbit"><span /></div>
          <div className="quote-card">“Você não precisa correr.<br />Precisa saber para onde vai.”</div>
          <div className="mock-phone">
            <div className="mock-status"><span>9:41</span><span>● ●</span></div>
            <div className="mock-title"><small>PRÓXIMA CONQUISTA</small><strong>Meu primeiro carro</strong></div>
            <div className="mock-ring"><div><strong>33%</strong><span>concluído</span></div></div>
            <div className="mock-values"><span>Você já comandou<strong>R$ 9.300</strong></span><span>Seu alvo<strong>R$ 28.000</strong></span></div>
            <div className="mock-date"><span>Previsão atual</span><strong>OUT 2027</strong></div>
          </div>
          <div className="floating-badge badge-one"><span>✦</span><div><small>ROTA ATUALIZADA</small><strong>2 meses mais cedo</strong></div></div>
          <div className="floating-badge badge-two"><span>⌂</span><div><small>DEPOIS DO CARRO</small><strong>Meu primeiro apê</strong></div></div>
        </div>
      </section>
      <footer className="welcome-footer"><span>LEGATUS / 2026</span><span>PLANEJE · PRIORIZE · CONQUISTE</span></footer>
    </main>
  );
}

function Setup({ onBack, onComplete }: { onBack: () => void; onComplete: (name: string, budget: number) => void }) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("800");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onComplete(name.trim(), Math.max(0, Number(budget) || 0));
  }

  return (
    <main className="setup-page">
      <header className="welcome-nav"><Logo /><button className="text-button" onClick={onBack}>← Voltar</button></header>
      <form className="setup-card" onSubmit={submit}>
        <span className="step-count">PASSO 01 — SUA BASE</span>
        <h1>Todo grande plano começa com clareza.</h1>
        <p>Essas informações criam a primeira versão do seu mapa. Você poderá mudar tudo depois.</p>
        <label>
          Como devemos chamar você?
          <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu primeiro nome" />
        </label>
        <label>
          Quanto você pode direcionar às suas conquistas por mês?
          <div className="money-input"><span>R$</span><input inputMode="decimal" value={budget} onChange={(event) => setBudget(event.target.value.replace(/[^0-9]/g, ""))} /></div>
          <small>Não precisa ser perfeito. Use um valor confortável para começar.</small>
        </label>
        <button className="primary-button large" type="submit" disabled={!name.trim()}>Escolher primeira conquista <span>→</span></button>
      </form>
    </main>
  );
}

function Logo() {
  return <div className="logo"><span className="logo-symbol">L</span><div><strong>LEGATUS</strong><small>MAPA DE CONQUISTAS</small></div></div>;
}

function Sidebar({ tab, setTab, onAdd }: { tab: TabKey; setTab: (tab: TabKey) => void; onAdd: () => void }) {
  return (
    <aside className="sidebar">
      <Logo />
      <nav>
        <NavButton active={tab === "mapa"} icon="⌘" label="Meu mapa" onClick={() => setTab("mapa")} />
        <NavButton active={tab === "conquistas"} icon="◇" label="Conquistas" onClick={() => setTab("conquistas")} />
        <NavButton active={tab === "conselho"} icon="✦" label="Meu conselho" onClick={() => setTab("conselho")} />
        <NavButton active={tab === "plano"} icon="≋" label="Plano estratégico" onClick={() => setTab("plano")} />
        <NavButton active={tab === "perfil"} icon="○" label="Meu perfil" onClick={() => setTab("perfil")} />
      </nav>
      <div className="sidebar-cta">
        <span>SEU PRÓXIMO MARCO</span>
        <strong>Começa com uma decisão.</strong>
        <button onClick={onAdd}>+ Nova conquista</button>
      </div>
      <small className="sidebar-version">LEGATUS · VERSÃO INICIAL</small>
    </aside>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) {
  return <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}><span>{icon}</span>{label}</button>;
}

function MobileNav({ tab, setTab, onAdd }: { tab: TabKey; setTab: (tab: TabKey) => void; onAdd: () => void }) {
  return (
    <nav className="mobile-nav">
      <button className={tab === "mapa" ? "active" : ""} onClick={() => setTab("mapa")}><span>⌘</span>Mapa</button>
      <button className={tab === "conquistas" ? "active" : ""} onClick={() => setTab("conquistas")}><span>◇</span>Metas</button>
      <button className="mobile-add" onClick={onAdd}>+</button>
      <button className={tab === "conselho" ? "active" : ""} onClick={() => setTab("conselho")}><span>✦</span>Conselho</button>
      <button className={tab === "perfil" ? "active" : ""} onClick={() => setTab("perfil")}><span>○</span>Perfil</button>
    </nav>
  );
}

type PlannedGoal = ReturnType<typeof calculatePlans>[number];

function Dashboard({ data, plans, onAdd, onSelect, onChangeBudget, onAddPriority, onTogglePriority, onRemovePriority, onOpenCouncil }: {
  data: AppData;
  plans: PlannedGoal[];
  onAdd: () => void;
  onSelect: (id: string) => void;
  onChangeBudget: (value: number) => void;
  onAddPriority: (text: string) => void;
  onTogglePriority: (id: string) => void;
  onRemovePriority: (id: string) => void;
  onOpenCouncil: () => void;
}) {
  const [priorityDraft, setPriorityDraft] = useState("");
  const totalTarget = plans.reduce((sum, goal) => sum + goal.target, 0);
  const totalSaved = plans.reduce((sum, goal) => sum + goal.saved, 0);
  const overall = totalTarget ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const primary = plans[0];
  const secondary = plans[1];
  const budgetCeiling = Math.max(10000, Math.ceil(Math.max(data.monthlyBudget, 1) / 10000) * 10000);
  const completedPriorities = data.priorityItems.filter((item) => item.done).length;

  function addPriority(event: FormEvent) {
    event.preventDefault();
    const text = priorityDraft.trim();
    if (!text) return;
    onAddPriority(text);
    setPriorityDraft("");
  }

  if (!plans.length) {
    return (
      <section className="empty-map">
        <div className="empty-orbit"><span>✦</span></div>
        <span className="eyebrow">Seu território está livre</span>
        <h2>Qual será a primeira conquista sob seu comando?</h2>
        <p>Crie uma meta e o Legatus transformará o valor que você tem hoje em uma rota possível.</p>
        <button className="primary-button large" onClick={onAdd}>Criar primeira conquista <span>→</span></button>
      </section>
    );
  }

  const acceleration = secondary
    ? Math.max(1, Math.round(secondary.months - (secondary.remaining / Math.max(1, secondary.contribution + primary.contribution))))
    : 0;

  return (
    <div className="dashboard-grid">
      <section className="command-card dark-card">
        {primary.image && <div className="command-photo" style={{ backgroundImage: `url(${primary.image})` }} />}
        <div className="command-copy">
          <span className="eyebrow light">Visão do comando</span>
          <h2>{overall}% da sua rota já foi conquistada.</h2>
          <p>Você já reuniu <strong>{money(totalSaved)}</strong> para construir a vida que planejou.</p>
          <button onClick={() => onSelect(primary.id)}>Ver conquista principal <span>→</span></button>
        </div>
        <div className="overall-ring" style={{ "--progress": `${overall * 3.6}deg` } as React.CSSProperties}>
          <div><strong>{overall}%</strong><span>DO MAPA</span></div>
        </div>
        <div className="corner-lines" />
      </section>

      <section className="budget-card panel">
        <div className="panel-heading"><div><span className="eyebrow">Poder mensal</span><h3>Quanto você comanda</h3></div><span className="seal">L</span></div>
        <div className="budget-editor">
          <span>R$</span>
          <input
            inputMode="numeric"
            value={data.monthlyBudget ? new Intl.NumberFormat("pt-BR").format(data.monthlyBudget) : ""}
            onChange={(event) => onChangeBudget(Math.max(0, Number(event.target.value.replace(/[^0-9]/g, "")) || 0))}
            aria-label="Valor mensal disponível"
          />
          <small>/mês</small>
        </div>
        <input
          className="budget-slider"
          type="range"
          min="100"
          max={budgetCeiling}
          step="100"
          value={Math.min(budgetCeiling, Math.max(100, data.monthlyBudget))}
          onChange={(event) => onChangeBudget(Number(event.target.value))}
          aria-label="Valor mensal para conquistas"
        />
        <div className="slider-labels"><span>R$ 100</span><span>{money(budgetCeiling)}</span></div>
        <div className="budget-presets">
          {[2500, 5000, 10000, 20000].map((value) => <button key={value} onClick={() => onChangeBudget(value)}>{value >= 1000 ? `${value / 1000}k` : value}</button>)}
        </div>
        <p>Digite qualquer valor. O mapa recalcula sua estratégia instantaneamente.</p>
      </section>

      <section className={`commander-strip wide-panel ${data.commander ? "has-commander" : ""}`}>
        {data.commander ? (
          <>
            <div className="commander-mini-emblem has-portrait" style={{ "--commander-color": commanders[data.commander].color } as React.CSSProperties}>
              <NextImage src={commanders[data.commander].image} alt={`Retrato artístico de ${commanders[data.commander].name}`} fill sizes="76px" />
            </div>
            <div className="commander-strip-copy">
              <small>SEU CONSELHEIRO ESTRATÉGICO</small>
              <h3>{commanders[data.commander].name} <em>· {commanders[data.commander].epithet}</em></h3>
              <p><span>Doutrina inspirada</span>{commanders[data.commander].doctrine}</p>
            </div>
            <button onClick={onOpenCouncil}>Entrar no conselho <span>→</span></button>
          </>
        ) : (
          <>
            <div className="commander-mini-emblem"><span>✦</span></div>
            <div className="commander-strip-copy">
              <small>CONSELHO DE COMANDANTES</small>
              <h3>Quem deveria orientar a sua próxima conquista?</h3>
              <p>Responda três perguntas e descubra qual mente estratégica combina com você.</p>
            </div>
            <button onClick={onOpenCouncil}>Descobrir meu comandante <span>→</span></button>
          </>
        )}
      </section>

      <section className="goals-section panel wide-panel">
        <div className="panel-heading"><div><span className="eyebrow">Territórios em progresso</span><h3>Suas conquistas</h3></div><button className="ghost-button" onClick={onAdd}>+ Adicionar</button></div>
        <div className="goal-row">
          {plans.map((goal) => (
            <button className={`goal-card ${goal.image ? "has-photo" : ""}`} key={goal.id} onClick={() => onSelect(goal.id)}>
              <div
                className="goal-visual"
                style={goal.image
                  ? { backgroundImage: `linear-gradient(180deg, rgba(10,10,8,.03), rgba(10,10,8,.55)), url(${goal.image})` }
                  : { background: `linear-gradient(145deg, ${categories[goal.category].color}, color-mix(in srgb, ${categories[goal.category].color} 55%, #171612))` }}
              >
                <div className="goal-card-top"><span className="category-icon">{categories[goal.category].icon}</span><span className={`priority priority-${goal.priority}`}>{goal.priority === 3 ? "Prioridade" : goal.priority === 2 ? "Em marcha" : "Na rota"}</span></div>
                <span className="goal-watermark">{categories[goal.category].icon}</span>
              </div>
              <div className="goal-card-content">
                <div><small>{categories[goal.category].label}</small><h4>{goal.title}</h4></div>
                <div className="goal-progress"><span style={{ width: `${goal.progress}%`, background: categories[goal.category].color }} /></div>
                <div className="goal-stats"><span><strong>{goal.progress}%</strong> concluído</span><span><strong>{monthLabel(goal.months)}</strong> previsão</span></div>
              </div>
            </button>
          ))}
          <button className="goal-card add-card" onClick={onAdd}><span>+</span><strong>Nova conquista</strong><small>Expanda seu mapa</small></button>
        </div>
      </section>

      <section className="priority-board panel wide-panel">
        <div className="priority-intro">
          <span className="eyebrow light">Ordem de comando</span>
          <h3>O que merece sua atenção agora?</h3>
          <p>Transforme intenção em próximos passos claros. Aqui entram decisões pequenas que aproximam suas grandes conquistas.</p>
          <div className="priority-score"><strong>{completedPriorities}/{data.priorityItems.length || 0}</strong><span>prioridades concluídas</span></div>
        </div>
        <div className="priority-workspace">
          <form className="priority-form" onSubmit={addPriority}>
            <input
              value={priorityDraft}
              onChange={(event) => setPriorityDraft(event.target.value)}
              placeholder="Ex.: separar o aporte no dia do salário"
              maxLength={90}
              aria-label="Nova prioridade"
            />
            <button type="submit" disabled={!priorityDraft.trim()} aria-label="Adicionar prioridade">+</button>
          </form>
          <div className="priority-list">
            {!data.priorityItems.length ? (
              <div className="priority-empty"><span>✦</span><p>Sua lista está livre. Adicione o primeiro movimento da semana.</p></div>
            ) : data.priorityItems.map((item, index) => (
              <div className={`priority-item ${item.done ? "done" : ""}`} key={item.id}>
                <button className="priority-check" onClick={() => onTogglePriority(item.id)} aria-label={item.done ? `Reabrir ${item.text}` : `Concluir ${item.text}`}>{item.done ? "✓" : String(index + 1).padStart(2, "0")}</button>
                <span>{item.text}</span>
                <button className="priority-remove" onClick={() => onRemovePriority(item.id)} aria-label={`Remover ${item.text}`}>×</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="strategy-card panel">
        <div className="panel-heading"><div><span className="eyebrow">Decisão estratégica</span><h3>O impacto das escolhas</h3></div><span className="insight-icon">↗</span></div>
        {secondary ? (
          <div className="strategy-content">
            <p>Ao concluir <strong>{primary.title}</strong>, você libera <strong>{money(primary.contribution)}/mês</strong> para as próximas metas.</p>
            <div className="impact-box"><span>ISSO PODE ANTECIPAR</span><strong>{secondary.title}</strong><b>em até {pluralMonths(acceleration)}</b></div>
          </div>
        ) : (
          <div className="strategy-content"><p>Adicione uma segunda conquista para comparar prioridades e visualizar como uma escolha afeta a outra.</p><button className="inline-action" onClick={onAdd}>Expandir meu mapa →</button></div>
        )}
      </section>

      <section className="timeline-card panel">
        <div className="panel-heading"><div><span className="eyebrow">Sua marcha</span><h3>Linha do tempo</h3></div><span className="timeline-year">{new Date().getFullYear()}—{new Date().getFullYear() + 3}</span></div>
        <div className="timeline">
          {plans.slice().sort((a, b) => a.months - b.months).map((goal, index) => (
            <button key={goal.id} onClick={() => onSelect(goal.id)} className="timeline-item">
              <div className="timeline-marker" style={{ borderColor: categories[goal.category].color }}><span style={{ background: categories[goal.category].color }} /></div>
              <div><small>{monthLabel(goal.months)}</small><strong>{goal.title}</strong><span>{money(goal.remaining)} restantes</span></div>
              {index === 0 && <em>PRÓXIMA</em>}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function GoalsView({ plans, onAdd, onSelect }: { plans: PlannedGoal[]; onAdd: () => void; onSelect: (id: string) => void }) {
  return (
    <section className="view-page">
      <div className="view-title"><div><span className="eyebrow">Seu domínio</span><h2>Todas as conquistas</h2><p>Cada desejo ganha força quando recebe valor, prazo e prioridade.</p></div><button className="primary-button" onClick={onAdd}>+ Nova conquista</button></div>
      {!plans.length ? <div className="simple-empty">Seu mapa ainda não possui conquistas.</div> : (
        <div className="goal-list">
          {plans.map((goal) => (
            <button key={goal.id} className="goal-list-item" onClick={() => onSelect(goal.id)}>
              <span
                className={`goal-thumb ${goal.image ? "has-photo" : ""}`}
                style={goal.image ? { backgroundImage: `url(${goal.image})` } : { background: categories[goal.category].color }}
              >{goal.image ? "" : categories[goal.category].icon}</span>
              <div className="list-main"><small>{categories[goal.category].label}</small><strong>{goal.title}</strong><div className="goal-progress"><span style={{ width: `${goal.progress}%`, background: categories[goal.category].color }} /></div></div>
              <div className="list-stat"><small>GUARDADO</small><strong>{money(goal.saved)}</strong></div>
              <div className="list-stat"><small>PREVISÃO</small><strong>{monthLabel(goal.months)}</strong></div>
              <span className="list-arrow">→</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

const quizQuestions: Array<{
  title: string;
  context: string;
  options: Array<{ label: string; detail: string; scores: Partial<Record<CommanderKey, number>> }>;
}> = [
  {
    title: "Quando a rota fica incerta, qual é seu primeiro instinto?",
    context: "Não existe resposta correta. Escolha o que você realmente faria.",
    options: [
      { label: "Proteger minha base", detail: "Garanto segurança antes de avançar.", scores: { martel: 2, belisarius: 1 } },
      { label: "Encontrar outro caminho", detail: "Observo, recalculo e mudo o ângulo.", scores: { hannibal: 2, scipio: 1 } },
      { label: "Avançar com convicção", detail: "O movimento cria a oportunidade.", scores: { alexander: 2, darc: 1 } },
    ],
  },
  {
    title: "Qual força mais combina com você?",
    context: "Pense em como você age quando ninguém está cobrando.",
    options: [
      { label: "Disciplina", detail: "Continuo mesmo quando a motivação diminui.", scores: { belisarius: 2, martel: 1 } },
      { label: "Estratégia", detail: "Prefiro pensar melhor antes de gastar energia.", scores: { hannibal: 2, scipio: 1 } },
      { label: "Coragem", detail: "Consigo começar antes de me sentir pronto.", scores: { darc: 2, alexander: 1 } },
    ],
  },
  {
    title: "O que você mais precisa nesta fase?",
    context: "Esta resposta define a direção do seu conselho.",
    options: [
      { label: "Segurança", detail: "Quero construir algo que não desmorone.", scores: { martel: 4 } },
      { label: "Uma estratégia melhor", detail: "Tenho recursos, mas preciso posicioná-los.", scores: { hannibal: 4 } },
      { label: "Recuperar o controle", detail: "Quero aprender com meus erros e reorganizar tudo.", scores: { scipio: 4 } },
      { label: "Constância", detail: "Sei o que fazer; preciso continuar fazendo.", scores: { belisarius: 4 } },
      { label: "Uma transformação", detail: "Preciso de coragem para iniciar uma nova vida.", scores: { darc: 4 } },
      { label: "Uma grande conquista", detail: "Quero acelerar um objetivo realmente ambicioso.", scores: { alexander: 4 } },
    ],
  },
];

function councilResponse(commanderKey: CommanderKey, message: string, plans: PlannedGoal[], priorityItems: PriorityItem[], monthlyBudget: number) {
  const commander = commanders[commanderKey];
  const primary = plans[0];
  const nextPriority = priorityItems.find((item) => !item.done);
  const normalized = message.toLocaleLowerCase("pt-BR");

  if (/desist|difícil|cansad|fracass|medo/.test(normalized)) {
    return `${commander.doctrine} Hoje não exijo uma vitória completa. ${nextPriority ? `Conclua apenas isto: “${nextPriority.text}”.` : "Escolha um movimento pequeno que possa ser concluído ainda hoje."}`;
  }
  if (/dinheiro|valor|aporte|salário|salario|guardar/.test(normalized)) {
    return primary
      ? `Seu poder mensal atual é ${money(monthlyBudget)}. Pela formação do seu mapa, ${money(primary.contribution)} devem marchar para “${primary.title}”. Proteja esse aporte antes de assumir outra despesa.`
      : `Você dispõe de ${money(monthlyBudget)} por mês. Primeiro escolha uma conquista com valor e prazo; então darei uma missão específica a cada parte desse recurso.`;
  }
  if (/primeiro|prioridade|foco|começ|comec/.test(normalized)) {
    return primary
      ? `A ordem é clara: “${primary.title}” permanece como frente principal. ${nextPriority ? `Seu próximo movimento é “${nextPriority.text}”.` : `Registre uma ação concreta para esta semana e proteja ${money(primary.contribution)} para o próximo aporte.`}`
      : "Seu primeiro movimento é transformar um desejo em campanha: defina o nome, o valor necessário e quanto já possui.";
  }
  return primary
    ? `${commander.welcome} Neste momento, sua frente principal é “${primary.title}”, com ${primary.progress}% conquistado. Diga se você precisa decidir sobre dinheiro, prioridade ou constância.`
    : `${commander.welcome} Conte qual conquista você quer colocar em marcha e eu ajudarei a transformá-la em uma primeira ordem.`;
}

function CouncilView({ data, plans, onChooseCommander, onSend, onOpenPlan }: {
  data: AppData;
  plans: PlannedGoal[];
  onChooseCommander: (commander: CommanderKey) => void;
  onSend: (text: string) => void;
  onOpenPlan: () => void;
}) {
  const [quizStep, setQuizStep] = useState(0);
  const [scores, setScores] = useState<Record<CommanderKey, number>>({ martel: 0, darc: 0, hannibal: 0, scipio: 0, alexander: 0, belisarius: 0 });
  const [retake, setRetake] = useState(false);
  const [message, setMessage] = useState("");

  function answer(scoresToAdd: Partial<Record<CommanderKey, number>>) {
    const nextScores = { ...scores };
    (Object.keys(scoresToAdd) as CommanderKey[]).forEach((key) => {
      nextScores[key] += scoresToAdd[key] ?? 0;
    });
    if (quizStep === quizQuestions.length - 1) {
      const result = (Object.keys(nextScores) as CommanderKey[]).sort((a, b) => nextScores[b] - nextScores[a])[0];
      onChooseCommander(result);
      setRetake(false);
      setQuizStep(0);
      setScores({ martel: 0, darc: 0, hannibal: 0, scipio: 0, alexander: 0, belisarius: 0 });
      return;
    }
    setScores(nextScores);
    setQuizStep((current) => current + 1);
  }

  if (!data.commander || retake) {
    const question = quizQuestions[quizStep];
    return (
      <section className="council-discovery">
        <div className="council-discovery-copy">
          <span className="eyebrow light">Conselho de comandantes</span>
          <h2>Sua forma de conquistar revela quem deveria aconselhar você.</h2>
          <p>Três decisões. Um arquétipo estratégico inspirado em grandes comandantes da história.</p>
          <div className="quiz-progress">{quizQuestions.map((_, index) => <span className={index <= quizStep ? "active" : ""} key={index} />)}</div>
          <small>ARQUÉTIPOS INSPIRADOS EM FIGURAS HISTÓRICAS · NÃO SÃO RECONSTITUIÇÕES LITERAIS</small>
        </div>
        <div className="quiz-panel">
          <span className="step-count">PERGUNTA {String(quizStep + 1).padStart(2, "0")} / 03</span>
          <h3>{question.title}</h3>
          <p>{question.context}</p>
          <div className={`quiz-options ${question.options.length > 3 ? "compact" : ""}`}>
            {question.options.map((option) => (
              <button key={option.label} onClick={() => answer(option.scores)}>
                <span>→</span><div><strong>{option.label}</strong><small>{option.detail}</small></div>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const commander = commanders[data.commander];
  const primary = plans[0];
  const nextPriority = data.priorityItems.find((item) => !item.done);
  const orders = [
    primary ? `Direcione ${money(primary.contribution)} para “${primary.title}” neste ciclo.` : "Crie sua primeira conquista com valor e prazo definidos.",
    nextPriority ? `Conclua “${nextPriority.text}” antes de abrir uma nova frente.` : "Defina uma prioridade pequena que possa ser encerrada nesta semana.",
    primary ? `Proteja o foco: sua campanha principal está ${primary.progress}% concluída.` : "Evite dividir energia antes de definir sua campanha principal.",
  ];

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    onSend(text);
    setMessage("");
  }

  return (
    <section className="council-page">
      <div className="council-hero" style={{ "--commander-color": commander.color } as React.CSSProperties}>
        <div className="commander-portrait">
          <NextImage src={commander.image} alt={`Representação artística temática de ${commander.name}`} fill priority sizes="(max-width: 760px) 220px, 280px" />
          <span>RETRATO TEMÁTICO</span>
        </div>
        <div className="council-hero-copy">
          <span className="eyebrow light">Seu comandante estratégico</span>
          <h2>{commander.name}</h2>
          <strong>{commander.epithet}</strong>
          <small className="doctrine-kicker">DOUTRINA INSPIRADA EM SUA TRAJETÓRIA</small>
          <p>{commander.doctrine}</p>
          <button onClick={() => setRetake(true)}>Refazer teste de perfil</button>
        </div>
        <div className="commander-strength"><small>SUA FORÇA CENTRAL</small><strong>{commander.strength}</strong></div>
      </div>

      <div className="council-grid">
        <section className="weekly-orders panel">
          <div className="panel-heading"><div><span className="eyebrow">Diretriz atual</span><h3>Ordens da semana</h3></div><span className="orders-date">CICLO {new Date().getMonth() + 1}</span></div>
          <div className="orders-list">{orders.map((order, index) => <div key={order}><span>0{index + 1}</span><p>{order}</p></div>)}</div>
          <button className="inline-action" onClick={onOpenPlan}>Ver formação financeira completa →</button>
        </section>

        <section className="strategy-room panel">
          <div className="strategy-room-head"><div><span className="eyebrow">Sala de estratégia</span><h3>Converse com {commander.name}</h3></div><span className="local-mode"><i /> PROTÓTIPO · SEM IA</span></div>
          <div className="chat-mechanics" aria-label="Como o conselho funciona">
            <div><span>01</span><p><strong>Lê o seu mapa</strong>Metas, prioridades e valor mensal formam o contexto.</p></div>
            <div><span>02</span><p><strong>Interpreta a decisão</strong>O comandante define o estilo, não inventa seus dados.</p></div>
            <div><span>03</span><p><strong>Entrega uma ordem</strong>Você recebe uma próxima ação curta e executável.</p></div>
          </div>
          <div className="council-chat">
            {(data.councilMessages.length ? data.councilMessages : [{ id: "welcome", role: "commander" as const, text: commander.welcome, createdAt: "" }]).slice(-8).map((item) => (
              <div className={`council-message ${item.role}`} key={item.id}>
                {item.role === "commander" && <span>{commander.symbol}</span>}
                <p>{item.text}</p>
              </div>
            ))}
          </div>
          <form className="council-chat-form" onSubmit={sendMessage}>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Peça uma orientação sobre sua próxima decisão..." maxLength={280} />
            <button type="submit" disabled={!message.trim()} aria-label="Enviar ao conselho">↑</button>
          </form>
          <small className="council-disclaimer">DEMONSTRAÇÃO ATUAL: RESPOSTAS PRÉ-PROGRAMADAS NO APARELHO. A VERSÃO COMERCIAL USARÁ IA COM O SEU MAPA COMO CONTEXTO.</small>
        </section>
      </div>

      <section className="commander-lineup">
        <div className="view-title"><div><span className="eyebrow">Outras doutrinas</span><h2>O conselho completo</h2><p>Cada comandante representa uma maneira diferente de enfrentar objetivos.</p></div></div>
        <div className="commander-cards">
          {(Object.keys(commanders) as CommanderKey[]).map((key) => (
            <button className={key === data.commander ? "active" : ""} key={key} onClick={() => onChooseCommander(key)}>
              <span className="commander-card-portrait" style={{ background: commanders[key].color }}>
                <NextImage src={commanders[key].image} alt="" fill sizes="58px" />
              </span>
              <div><strong>{commanders[key].name}</strong><small>{commanders[key].epithet}</small><p>{commanders[key].doctrine}</p></div>
              {key === data.commander ? <em>ATUAL</em> : <b>→</b>}
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

function PlanView({ data, plans }: { data: AppData; plans: PlannedGoal[] }) {
  return (
    <section className="view-page">
      <div className="view-title"><div><span className="eyebrow">Plano estratégico</span><h2>Seu dinheiro tem uma missão.</h2><p>Esta é a distribuição sugerida para os {money(data.monthlyBudget)} disponíveis todos os meses.</p></div></div>
      <div className="allocation-layout">
        <div className="allocation-panel panel">
          <div className="allocation-bar">
            {plans.map((goal) => <span key={goal.id} style={{ width: `${data.monthlyBudget ? (goal.contribution / data.monthlyBudget) * 100 : 0}%`, background: categories[goal.category].color }} />)}
          </div>
          <div className="allocation-list">
            {plans.map((goal) => (
              <div key={goal.id}><i style={{ background: categories[goal.category].color }} /><span><strong>{goal.title}</strong><small>Prioridade {goal.priority === 3 ? "alta" : goal.priority === 2 ? "média" : "baixa"}</small></span><b>{money(goal.contribution)}<small>/mês</small></b></div>
            ))}
          </div>
        </div>
        <div className="principle-card dark-card">
          <span className="eyebrow light">Princípio Legatus</span>
          <blockquote>“Priorizar não é desistir de um sonho. É decidir qual deles abrirá caminho para os outros.”</blockquote>
          <p>Você pode alterar a prioridade entrando em qualquer conquista.</p>
        </div>
      </div>
    </section>
  );
}

function ProfileView({ data, onChange, onReset }: { data: AppData; onChange: (patch: Partial<AppData>) => void; onReset: () => void }) {
  return (
    <section className="view-page profile-page">
      <div className="view-title"><div><span className="eyebrow">Configurações</span><h2>Seu comando</h2><p>Ajuste as informações usadas para construir seu mapa.</p></div></div>
      <div className="settings-card panel">
        <label>Seu nome<input value={data.name} onChange={(event) => onChange({ name: event.target.value })} /></label>
        <label>Valor mensal para conquistas<div className="money-input"><span>R$</span><input inputMode="decimal" value={data.monthlyBudget} onChange={(event) => onChange({ monthlyBudget: Number(event.target.value.replace(/[^0-9]/g, "")) || 0 })} /></div></label>
        <div className="data-note"><span>▣</span><div><strong>Seus dados permanecem neste dispositivo</strong><p>Nesta versão inicial, nada é enviado para servidores externos.</p></div></div>
        <button className="danger-button" onClick={onReset}>Apagar meu mapa e recomeçar</button>
      </div>
    </section>
  );
}

function GoalModal({ onClose, onSave }: { onClose: () => void; onSave: (goal: Goal) => void }) {
  const [category, setCategory] = useState<CategoryKey>("carro");
  const [title, setTitle] = useState(categories.carro.suggestion);
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("0");
  const [priority, setPriority] = useState<1 | 2 | 3>(3);
  const [image, setImage] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  function chooseCategory(key: CategoryKey) {
    setCategory(key);
    setTitle(categories[key].suggestion);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const targetNumber = Number(target);
    if (!title.trim() || !targetNumber || targetNumber <= 0) return;
    onSave({
      id: crypto.randomUUID(),
      title: title.trim(),
      category,
      target: targetNumber,
      saved: Math.min(targetNumber, Math.max(0, Number(saved) || 0)),
      priority,
      createdAt: new Date().toISOString(),
      image: image || undefined,
    });
  }

  async function handleImage(file?: File) {
    if (!file) return;
    setImageError("");
    setImageLoading(true);
    try {
      setImage(await compressGoalImage(file));
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Não foi possível adicionar a foto.");
    } finally {
      setImageLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal-card goal-modal" onSubmit={submit}>
        <div className="modal-header"><div><span className="eyebrow">Expandir território</span><h2>Nova conquista</h2></div><button type="button" onClick={onClose}>×</button></div>
        <div className="category-grid">
          {(Object.keys(categories) as CategoryKey[]).map((key) => (
            <button type="button" key={key} className={category === key ? "selected" : ""} onClick={() => chooseCategory(key)}><span style={{ color: categories[key].color }}>{categories[key].icon}</span>{categories[key].label}</button>
          ))}
        </div>
        <div className={`photo-uploader ${image ? "has-photo" : ""}`}>
          {image ? (
            <div className="photo-preview" style={{ backgroundImage: `url(${image})` }}>
              <div><span>FOTO DA CONQUISTA</span><strong>É assim que seu objetivo aparecerá no mapa.</strong></div>
              <button type="button" onClick={() => setImage("")}>Remover</button>
            </div>
          ) : (
            <label htmlFor="goal-photo">
              <span className="upload-icon">↥</span>
              <span><strong>{imageLoading ? "Preparando sua foto..." : "Adicionar foto da conquista"}</strong><small>Use uma imagem que faça você lembrar por que começou.</small></span>
              <em>ESCOLHER</em>
            </label>
          )}
          <input id="goal-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handleImage(event.target.files?.[0])} disabled={imageLoading} />
          {imageError && <p className="upload-error">{imageError}</p>}
        </div>
        <label>Nome da conquista<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <div className="two-fields">
          <label>Valor necessário<div className="money-input"><span>R$</span><input autoFocus inputMode="decimal" value={target} onChange={(event) => setTarget(event.target.value.replace(/[^0-9]/g, ""))} placeholder="25.000" /></div></label>
          <label>Quanto já possui<div className="money-input"><span>R$</span><input inputMode="decimal" value={saved} onChange={(event) => setSaved(event.target.value.replace(/[^0-9]/g, ""))} /></div></label>
        </div>
        <fieldset>
          <legend>Qual é a força desta prioridade?</legend>
          <div className="priority-options">
            {([1, 2, 3] as const).map((value) => <button type="button" className={priority === value ? "selected" : ""} key={value} onClick={() => setPriority(value)}><strong>{value === 3 ? "Alta" : value === 2 ? "Média" : "Baixa"}</strong><small>{value === 3 ? "Quero acelerar" : value === 2 ? "Avançar com equilíbrio" : "Pode aguardar"}</small></button>)}
          </div>
        </fieldset>
        <button className="primary-button large" type="submit" disabled={!title.trim() || !Number(target)}>Adicionar ao meu mapa <span>→</span></button>
      </form>
    </div>
  );
}

function GoalDetails({ goal, monthlyBudget, onClose, onPriority, onDeposit, onImage, onDelete }: {
  goal: PlannedGoal;
  monthlyBudget: number;
  onClose: () => void;
  onPriority: (priority: 1 | 2 | 3) => void;
  onDeposit: (amount: number) => void;
  onImage: (image?: string) => void;
  onDelete: () => void;
}) {
  const [deposit, setDeposit] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const info = categories[goal.category];

  async function handleImage(file?: File) {
    if (!file) return;
    setImageError("");
    setImageLoading(true);
    try {
      onImage(await compressGoalImage(file));
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Não foi possível adicionar a foto.");
    } finally {
      setImageLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card details-modal">
        <div
          className={`details-hero ${goal.image ? "has-photo" : ""}`}
          style={goal.image
            ? { backgroundColor: info.color, backgroundImage: `linear-gradient(160deg, rgba(10,10,8,.08), rgba(10,10,8,.72)), url(${goal.image})` }
            : { background: info.color }}
        >
          <button className="close-light" onClick={onClose}>×</button>
          <div className="detail-photo-control">
            <label htmlFor={`detail-photo-${goal.id}`}>{imageLoading ? "Preparando..." : goal.image ? "Trocar foto" : "+ Adicionar foto"}</label>
            <input
              id={`detail-photo-${goal.id}`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void handleImage(event.target.files?.[0])}
              disabled={imageLoading}
            />
            {goal.image && <button type="button" onClick={() => onImage(undefined)}>Remover</button>}
          </div>
          <span className="detail-symbol">{info.icon}</span>
          <small>{info.label.toUpperCase()}</small>
          <h2>{goal.title}</h2>
          <div className="detail-progress"><span style={{ width: `${goal.progress}%` }} /></div>
          <div className="detail-progress-copy"><strong>{goal.progress}% conquistado</strong><span>{money(goal.saved)} de {money(goal.target)}</span></div>
        </div>
        <div className="details-body">
          {imageError && <p className="upload-error detail-upload-error">{imageError}</p>}
          <div className="detail-metrics"><div><small>APORTE MENSAL</small><strong>{money(goal.contribution)}</strong></div><div><small>PREVISÃO</small><strong>{monthLabel(goal.months)}</strong></div><div><small>FALTAM</small><strong>{money(goal.remaining)}</strong></div></div>
          <div className="deposit-box">
            <div><strong>Registrar avanço</strong><small>Qualquer valor muda sua rota.</small></div>
            <div className="deposit-controls"><div className="money-input compact"><span>R$</span><input inputMode="decimal" value={deposit} onChange={(event) => setDeposit(event.target.value.replace(/[^0-9]/g, ""))} placeholder="0" /></div><button onClick={() => { const amount = Number(deposit); if (amount > 0) { onDeposit(amount); setDeposit(""); } }}>Confirmar</button></div>
          </div>
          <fieldset>
            <legend>Prioridade no mapa</legend>
            <div className="segmented-control">{([1, 2, 3] as const).map((value) => <button className={goal.priority === value ? "active" : ""} key={value} onClick={() => onPriority(value)}>{value === 1 ? "Baixa" : value === 2 ? "Média" : "Alta"}</button>)}</div>
          </fieldset>
          <p className="detail-note">Com {money(monthlyBudget)} mensais distribuídos no mapa, esta conquista recebe {money(goal.contribution)} por mês.</p>
          <button className="danger-link" onClick={onDelete}>Remover esta conquista</button>
        </div>
      </section>
    </div>
  );
}
