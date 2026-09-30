"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

type Category = "tecnologia" | "casa" | "transporte" | "estudo" | "pessoal" | "outros";
type View = "resumo" | "parcelas" | "previsao";

type Installment = {
  id: string;
  name: string;
  monthlyAmount: number;
  totalMonths: number;
  remainingMonths: number;
  category: Category;
};

type AppData = {
  onboarded: boolean;
  name: string;
  salary: number;
  fixedCosts: number;
  payday: number;
  installments: Installment[];
};

const STORAGE_KEY = "folego-data-v1";

const initialData: AppData = {
  onboarded: false,
  name: "",
  salary: 0,
  fixedCosts: 0,
  payday: 5,
  installments: [],
};

const demoData: AppData = {
  onboarded: true,
  name: "Laura",
  salary: 4200,
  fixedCosts: 2150,
  payday: 5,
  installments: [
    { id: "demo-iphone", name: "iPhone 14", monthlyAmount: 289, totalMonths: 12, remainingMonths: 7, category: "tecnologia" },
    { id: "demo-curso", name: "Curso profissional", monthlyAmount: 179, totalMonths: 6, remainingMonths: 3, category: "estudo" },
    { id: "demo-sofa", name: "Sofá", monthlyAmount: 240, totalMonths: 10, remainingMonths: 5, category: "casa" },
    { id: "demo-tenis", name: "Tênis", monthlyAmount: 119, totalMonths: 4, remainingMonths: 2, category: "pessoal" },
  ],
};

const categoryLabel: Record<Category, string> = {
  tecnologia: "Tecnologia",
  casa: "Casa",
  transporte: "Transporte",
  estudo: "Estudo",
  pessoal: "Pessoal",
  outros: "Outros",
};

function money(value: number, cents = false) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function monthLabel(offset: number, long = false) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + offset);
  return new Intl.DateTimeFormat("pt-BR", {
    month: long ? "long" : "short",
    ...(long ? { year: "numeric" as const } : {}),
  }).format(date).replace(".", "");
}

function firstName(name: string) {
  return name.trim().split(" ")[0] || "você";
}

function safeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function readNumber(value: string) {
  return Math.max(0, Number(value.replace(",", ".")) || 0);
}

function Icon({ name, size = 20 }: { name: "home" | "card" | "chart" | "plus" | "spark" | "settings" | "calendar" | "check" | "trash" | "arrow" | "wallet"; size?: number }) {
  const paths: Record<typeof name, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></>,
    chart: <><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    spark: <><path d="m12 2 1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/><path d="M10 11v6M14 11v6"/></>,
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h11"/><path d="M15 11h6v5h-6a2.5 2.5 0 0 1 0-5Z"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function Home() {
  const [data, setData] = useState<AppData>(initialData);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>("resumo");
  const [modal, setModal] = useState<"parcela" | "simulador" | "ajustes" | null>(null);

  useEffect(() => {
    let storedData = initialData;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppData>;
        storedData = {
          ...initialData,
          ...parsed,
          installments: Array.isArray(parsed.installments) ? parsed.installments : [],
        };
      }
    } catch {
      // The session still works when browser storage is unavailable.
    }
    const timer = window.setTimeout(() => {
      setData(storedData);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Keep the current session usable even if local storage is full.
    }
  }, [data, hydrated]);

  const activeInstallments = useMemo(() => data.installments.filter((item) => item.remainingMonths > 0), [data.installments]);
  const committed = useMemo(() => activeInstallments.reduce((sum, item) => sum + item.monthlyAmount, 0), [activeInstallments]);
  const margin = data.salary - data.fixedCosts - committed;
  const timeline = useMemo(() => Array.from({ length: 12 }, (_, offset) => {
    const installments = activeInstallments.filter((item) => item.remainingMonths > offset);
    const total = installments.reduce((sum, item) => sum + item.monthlyAmount, 0);
    const finishing = activeInstallments.filter((item) => item.remainingMonths === offset + 1);
    return { offset, total, margin: data.salary - data.fixedCosts - total, finishing };
  }), [activeInstallments, data.salary, data.fixedCosts]);

  if (!hydrated) return <div className="boot"><LogoMark /></div>;

  if (!data.onboarded) {
    return <Onboarding onComplete={(next) => setData({ ...initialData, ...next, onboarded: true })} onDemo={() => setData(demoData)} />;
  }

  function addInstallment(item: Omit<Installment, "id">) {
    setData((current) => ({ ...current, installments: [...current.installments, { ...item, id: safeId() }] }));
    setModal(null);
  }

  function registerPayment(id: string) {
    setData((current) => ({
      ...current,
      installments: current.installments.map((item) => item.id === id ? { ...item, remainingMonths: Math.max(0, item.remainingMonths - 1) } : item),
    }));
  }

  function removeInstallment(id: string) {
    if (!window.confirm("Remover esta parcela do seu controle?")) return;
    setData((current) => ({ ...current, installments: current.installments.filter((item) => item.id !== id) }));
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Brand />
        <nav className="side-nav" aria-label="Navegação principal">
          <NavButton active={view === "resumo"} icon="home" label="Resumo" onClick={() => setView("resumo")} />
          <NavButton active={view === "parcelas"} icon="card" label="Parcelas" badge={activeInstallments.length} onClick={() => setView("parcelas")} />
          <NavButton active={view === "previsao"} icon="chart" label="Próximos meses" onClick={() => setView("previsao")} />
        </nav>
        <div className="side-bottom">
          <div className="privacy-note"><span>Seus dados ficam aqui</span><p>Nada é enviado ao banco ou para terceiros.</p></div>
          <button className="profile-button" onClick={() => setModal("ajustes")}><span>{firstName(data.name).charAt(0).toUpperCase()}</span><div><strong>{firstName(data.name)}</strong><small>Ajustar renda</small></div><Icon name="settings" size={17} /></button>
        </div>
      </aside>

      <section className="main-area">
        <header className="mobile-header"><Brand /><button className="icon-button" onClick={() => setModal("ajustes")} aria-label="Abrir ajustes"><Icon name="settings" /></button></header>
        <div className="content-wrap">
          {view === "resumo" && <Overview data={data} committed={committed} margin={margin} timeline={timeline} installments={activeInstallments} onAdd={() => setModal("parcela")} onSimulate={() => setModal("simulador")} onViewAll={() => setView("parcelas")} onRegister={registerPayment} />}
          {view === "parcelas" && <InstallmentsView installments={data.installments} committed={committed} onAdd={() => setModal("parcela")} onRegister={registerPayment} onRemove={removeInstallment} />}
          {view === "previsao" && <ForecastView timeline={timeline} committed={committed} />}
        </div>
      </section>

      <nav className="mobile-nav" aria-label="Navegação principal">
        <NavButton active={view === "resumo"} icon="home" label="Resumo" onClick={() => setView("resumo")} />
        <NavButton active={view === "parcelas"} icon="card" label="Parcelas" onClick={() => setView("parcelas")} />
        <button className="mobile-add" onClick={() => setModal("parcela")} aria-label="Adicionar parcela"><Icon name="plus" size={25} /></button>
        <NavButton active={view === "previsao"} icon="chart" label="Previsão" onClick={() => setView("previsao")} />
        <button className="nav-button" onClick={() => setModal("simulador")}><Icon name="spark"/><span>Simular</span></button>
      </nav>

      {modal === "parcela" && <InstallmentModal onClose={() => setModal(null)} onSave={addInstallment} />}
      {modal === "simulador" && <SimulatorModal data={data} committed={committed} onClose={() => setModal(null)} onAdd={addInstallment} />}
      {modal === "ajustes" && <SettingsModal data={data} onClose={() => setModal(null)} onSave={(patch) => { setData((current) => ({ ...current, ...patch })); setModal(null); }} onReset={() => { if (!window.confirm("Apagar seus dados e começar de novo?")) return; window.localStorage.removeItem(STORAGE_KEY); setData(initialData); setModal(null); setView("resumo"); }} />}
    </main>
  );
}

function Brand() {
  return <div className="brand"><LogoMark /><div><strong>fôlego</strong><small>parcelas sob controle</small></div></div>;
}

function LogoMark() {
  return <span className="logo-mark"><span /></span>;
}

function NavButton({ active, icon, label, badge, onClick }: { active: boolean; icon: "home" | "card" | "chart"; label: string; badge?: number; onClick: () => void }) {
  return <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}><Icon name={icon}/><span>{label}</span>{badge ? <b>{badge}</b> : null}</button>;
}

function Onboarding({ onComplete, onDemo }: { onComplete: (data: Pick<AppData, "name" | "salary" | "fixedCosts" | "payday">) => void; onDemo: () => void }) {
  const [step, setStep] = useState<"intro" | "form">("intro");
  const [name, setName] = useState("");
  const [salary, setSalary] = useState("");
  const [fixedCosts, setFixedCosts] = useState("");
  const [payday, setPayday] = useState("5");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || readNumber(salary) <= 0) return;
    onComplete({ name: name.trim(), salary: readNumber(salary), fixedCosts: readNumber(fixedCosts), payday: Math.min(31, Math.max(1, Number(payday) || 5)) });
  }

  return (
    <main className="onboarding">
      <header className="onboarding-header"><Brand /><button className="ghost-link" onClick={onDemo}>Ver demonstração <Icon name="arrow" size={16}/></button></header>
      {step === "intro" ? (
        <section className="intro-grid">
          <div className="intro-copy">
            <span className="eyebrow"><i /> Clareza antes da próxima compra</span>
            <h1>Seu salário chega.<br/><em>As parcelas já estão esperando.</em></h1>
            <p>Veja quanto do próximo salário já está comprometido e em qual mês o seu dinheiro volta a respirar.</p>
            <button className="primary large" onClick={() => setStep("form")}>Ver meu salário livre <Icon name="arrow" /></button>
            <small>Sem banco conectado. Sem planilha. Leva menos de 2 minutos.</small>
          </div>
          <div className="intro-preview">
            <div className="preview-window">
              <div className="preview-top"><span><i/><i/><i/></span><small>SEU PRÓXIMO SALÁRIO</small></div>
              <div className="preview-balance"><span>Já chega comprometido</span><strong>R$ 827</strong><p>em 4 parcelas ativas</p></div>
              <div className="preview-track"><span/><span/><span/></div>
              <div className="preview-legend"><span><i className="fixed"/>Fixos <b>R$ 2.150</b></span><span><i className="installments"/>Parcelas <b>R$ 827</b></span><span><i className="free"/>Margem <b>R$ 1.223</b></span></div>
              <div className="preview-release"><span>EM 3 MESES</span><strong>Você recupera R$ 298 por mês</strong><small>Curso e tênis chegam ao fim.</small></div>
            </div>
            <div className="floating-note"><Icon name="spark"/><span><small>ANTES DE COMPRAR</small><strong>Simule uma nova parcela</strong></span></div>
          </div>
        </section>
      ) : (
        <section className="setup-wrap">
          <form className="setup-card" onSubmit={submit}>
            <button type="button" className="back-button" onClick={() => setStep("intro")}>← Voltar</button>
            <span className="eyebrow"><i /> Sua realidade hoje</span>
            <h1>Três números. Uma visão completamente diferente.</h1>
            <p>Use valores aproximados. Você poderá ajustar tudo depois.</p>
            <label>Como podemos chamar você?<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu primeiro nome" /></label>
            <div className="two-fields">
              <label>Salário líquido mensal<div className="money-field"><span>R$</span><input inputMode="decimal" value={salary} onChange={(event) => setSalary(event.target.value.replace(/[^0-9,.]/g, ""))} placeholder="4.200" /></div></label>
              <label>Gastos fixos mensais<div className="money-field"><span>R$</span><input inputMode="decimal" value={fixedCosts} onChange={(event) => setFixedCosts(event.target.value.replace(/[^0-9,.]/g, ""))} placeholder="2.150" /></div></label>
            </div>
            <label>Em que dia o salário costuma cair?<div className="day-field"><span>Dia</span><input type="number" min="1" max="31" value={payday} onChange={(event) => setPayday(event.target.value)} /></div></label>
            <button className="primary large" type="submit" disabled={!name.trim() || readNumber(salary) <= 0}>Criar meu panorama <Icon name="arrow" /></button>
            <small className="form-security">Esses dados ficam salvos somente neste aparelho.</small>
          </form>
        </section>
      )}
    </main>
  );
}

type TimelineItem = { offset: number; total: number; margin: number; finishing: Installment[] };

function Overview({ data, committed, margin, timeline, installments, onAdd, onSimulate, onViewAll, onRegister }: { data: AppData; committed: number; margin: number; timeline: TimelineItem[]; installments: Installment[]; onAdd: () => void; onSimulate: () => void; onViewAll: () => void; onRegister: (id: string) => void }) {
  const usableIncome = Math.max(0, data.salary - data.fixedCosts);
  const pressure = data.salary > 0 ? Math.min(100, (committed / data.salary) * 100) : 0;
  const firstRelease = timeline.find((month) => month.finishing.length > 0);
  const maxTimeline = Math.max(1, ...timeline.map((month) => month.total));

  return <>
    <header className="page-header"><div><span className="eyebrow">VISÃO DE {monthLabel(0, true).toUpperCase()}</span><h1>Olá, {firstName(data.name)}.</h1></div><div className="header-actions"><button className="secondary" onClick={onSimulate}><Icon name="spark"/> Posso parcelar isso?</button><button className="primary" onClick={onAdd}><Icon name="plus"/> Nova parcela</button></div></header>

    <section className={`balance-hero ${margin < 0 ? "danger" : ""}`}>
      <div className="balance-copy">
        <span className="hero-kicker"><i/> PRÓXIMO SALÁRIO · DIA {data.payday}</span>
        <h2>{committed > 0 ? <><strong>{money(committed)}</strong> já chegam<br/>comprometidos.</> : <>Seu próximo salário<br/><strong>não tem parcelas.</strong></>}</h2>
        <p>{installments.length ? `São ${installments.length} cobranças antes de você decidir o que fazer com o dinheiro.` : "Adicione suas compras parceladas para enxergar o impacto real."}</p>
        <div className="hero-actions"><button className="light-button" onClick={onSimulate}>Testar uma compra <Icon name="arrow" size={18}/></button><button className="text-light" onClick={onViewAll}>Ver todas as parcelas</button></div>
      </div>
      <div className="margin-card">
        <span>MARGEM ESTIMADA DO MÊS</span>
        <strong className={margin < 0 ? "negative" : ""}>{money(margin)}</strong>
        <p>Depois dos gastos fixos e parcelas informados.</p>
        <div className="salary-track" aria-label={`${Math.round(pressure)}% do salário comprometido por parcelas`}><span className="fixed-part" style={{ width: `${Math.min(100, data.salary ? data.fixedCosts / data.salary * 100 : 0)}%` }}/><span className="parcel-part" style={{ width: `${pressure}%` }}/></div>
        <div className="salary-legend"><span><i className="fixed-dot"/>Fixos {money(data.fixedCosts)}</span><span><i className="parcel-dot"/>Parcelas {money(committed)}</span></div>
        <small>RENDA INFORMADA: {money(data.salary)}</small>
      </div>
    </section>

    <section className="metric-grid">
      <article><span>PARCELAS ATIVAS</span><strong>{installments.length}</strong><p>{installments.length ? `${money(committed)} saem todo mês` : "Nenhuma registrada"}</p></article>
      <article><span>DA RENDA EM PARCELAS</span><strong>{Math.round(pressure)}%</strong><p>{pressure > 25 ? "Vale observar antes de assumir outra" : "Dentro da renda informada"}</p></article>
      <article className="release-metric"><span>PRÓXIMO ALÍVIO</span><strong>{firstRelease ? `+ ${money(firstRelease.finishing.reduce((sum, item) => sum + item.monthlyAmount, 0))}` : "—"}</strong><p>{firstRelease ? `em ${monthLabel(firstRelease.offset + 1, true)}` : "Adicione parcelas para calcular"}</p></article>
      <article><span>RENDA APÓS FIXOS</span><strong>{money(usableIncome)}</strong><p>Antes das compras parceladas</p></article>
    </section>

    <section className="dashboard-grid">
      <article className="panel forecast-panel">
        <div className="panel-head"><div><span className="section-kicker">PRÓXIMOS 12 MESES</span><h3>Quando o salário volta a respirar?</h3></div><button className="quiet-button" onClick={() => document.querySelector(".forecast-bars")?.scrollIntoView({ behavior: "smooth" })}>Ver evolução</button></div>
        <div className="forecast-bars">
          {timeline.map((month) => <div className="bar-column" key={month.offset}><span className="bar-value">{month.total ? money(month.total) : "Livre"}</span><div className="bar-track"><span style={{ height: `${month.total ? Math.max(8, month.total / maxTimeline * 100) : 3}%` }} className={month.finishing.length ? "release" : ""}/></div><small>{monthLabel(month.offset)}</small></div>)}
        </div>
        {firstRelease ? <div className="release-callout"><span><Icon name="calendar"/></span><div><small>PRIMEIRO ALÍVIO NO FLUXO</small><strong>Em {monthLabel(firstRelease.offset + 1, true)}, {firstRelease.finishing.map((item) => item.name).join(" e ")} {firstRelease.finishing.length > 1 ? "terminam" : "termina"}.</strong></div><b>+{money(firstRelease.finishing.reduce((sum, item) => sum + item.monthlyAmount, 0))}/mês</b></div> : <div className="release-callout empty"><span><Icon name="calendar"/></span><div><small>SEM PARCELAS ATIVAS</small><strong>Seu horizonte está livre de cobranças parceladas.</strong></div></div>}
      </article>

      <article className="panel current-panel">
        <div className="panel-head"><div><span className="section-kicker">COMPROMISSOS ATUAIS</span><h3>O que está levando seu salário</h3></div><button className="quiet-button" onClick={onViewAll}>Ver tudo</button></div>
        <div className="compact-list">
          {installments.slice().sort((a, b) => b.monthlyAmount - a.monthlyAmount).slice(0, 4).map((item) => <div className="compact-item" key={item.id}><CategoryMark category={item.category}/><div><strong>{item.name}</strong><small>{item.remainingMonths}x restantes · termina em {monthLabel(item.remainingMonths)}</small></div><span>{money(item.monthlyAmount)}<small>/mês</small></span><button title="Registrar uma parcela paga" aria-label={`Registrar parcela paga de ${item.name}`} onClick={() => onRegister(item.id)}><Icon name="check" size={17}/></button></div>)}
          {!installments.length && <EmptyList onAdd={onAdd}/>}
        </div>
      </article>
    </section>

    <button className="mobile-simulator" onClick={onSimulate}><Icon name="spark"/><span><strong>Pensando em comprar?</strong><small>Veja se uma nova parcela cabe antes de fechar.</small></span><Icon name="arrow"/></button>
    <p className="disclaimer">Estimativas baseadas somente nos valores informados por você. O Fôlego não acessa sua conta bancária e não oferece aconselhamento financeiro.</p>
  </>;
}

function InstallmentsView({ installments, committed, onAdd, onRegister, onRemove }: { installments: Installment[]; committed: number; onAdd: () => void; onRegister: (id: string) => void; onRemove: (id: string) => void }) {
  const active = installments.filter((item) => item.remainingMonths > 0);
  const complete = installments.filter((item) => item.remainingMonths === 0);
  return <>
    <header className="page-header"><div><span className="eyebrow">SEUS COMPROMISSOS</span><h1>Parcelas</h1><p>{active.length} ativas somam {money(committed)} por mês.</p></div><button className="primary" onClick={onAdd}><Icon name="plus"/> Nova parcela</button></header>
    <section className="panel installment-panel">
      <div className="installment-table-head"><span>COMPRA</span><span>PROGRESSO</span><span>VALOR MENSAL</span><span>RESTANTE</span><span/></div>
      {active.map((item) => <InstallmentRow key={item.id} item={item} onRegister={onRegister} onRemove={onRemove}/>)}
      {!active.length && <EmptyList onAdd={onAdd}/>}
    </section>
    {complete.length > 0 && <section className="panel completed-panel"><div className="panel-head"><div><span className="section-kicker">HISTÓRICO</span><h3>Parcelas concluídas</h3></div></div>{complete.map((item) => <InstallmentRow key={item.id} item={item} onRegister={onRegister} onRemove={onRemove}/>)}</section>}
  </>;
}

function InstallmentRow({ item, onRegister, onRemove }: { item: Installment; onRegister: (id: string) => void; onRemove: (id: string) => void }) {
  const paid = Math.max(0, item.totalMonths - item.remainingMonths);
  const progress = item.totalMonths ? paid / item.totalMonths * 100 : 0;
  return <div className={`installment-row ${item.remainingMonths === 0 ? "complete" : ""}`}><div className="installment-name"><CategoryMark category={item.category}/><span><strong>{item.name}</strong><small>{categoryLabel[item.category]}</small></span></div><div className="row-progress"><div><span style={{ width: `${progress}%` }}/></div><small>{paid} de {item.totalMonths} pagas</small></div><strong className="row-amount">{money(item.monthlyAmount)}</strong><div className="row-remaining"><strong>{item.remainingMonths ? `${item.remainingMonths}x` : "Quitada"}</strong><small>{item.remainingMonths ? `até ${monthLabel(item.remainingMonths, true)}` : "ciclo concluído"}</small></div><div className="row-actions">{item.remainingMonths > 0 && <button className="pay-button" onClick={() => onRegister(item.id)}><Icon name="check" size={16}/> Registrar pagamento</button>}<button className="delete-button" aria-label={`Remover ${item.name}`} onClick={() => onRemove(item.id)}><Icon name="trash" size={17}/></button></div></div>;
}

function ForecastView({ timeline, committed }: { timeline: TimelineItem[]; committed: number }) {
  const max = Math.max(1, ...timeline.map((month) => month.total));
  return <>
    <header className="page-header"><div><span className="eyebrow">HORIZONTE DE 12 MESES</span><h1>Próximos meses</h1><p>O efeito real de cada parcela no seu salário.</p></div></header>
    <section className="forecast-summary"><div><span>HOJE</span><strong>{money(committed)}</strong><small>comprometidos por mês</small></div><Icon name="arrow" size={26}/><div><span>EM 12 MESES</span><strong>{money(timeline[11]?.total ?? 0)}</strong><small>comprometidos por mês</small></div><div className="forecast-gain"><span>FÔLEGO RECUPERADO</span><strong>+ {money(Math.max(0, committed - (timeline[11]?.total ?? 0)))}</strong></div></section>
    <section className="panel month-table">
      <div className="panel-head"><div><span className="section-kicker">MÊS A MÊS</span><h3>Quanto sobra depois dos compromissos</h3></div></div>
      <div className="month-table-head"><span>MÊS</span><span>PARCELAS</span><span>PRESSÃO ATUAL</span><span>MARGEM ESTIMADA</span><span>EVENTO</span></div>
      {timeline.map((month) => <div className="month-row" key={month.offset}><strong>{monthLabel(month.offset, true)}</strong><span>{money(month.total)}</span><div className="month-pressure"><span style={{ width: `${month.total / max * 100}%` }}/></div><b className={month.margin < 0 ? "negative" : ""}>{money(month.margin)}</b><small>{month.finishing.length ? `${month.finishing.map((item) => item.name).join(" + ")} termina${month.finishing.length > 1 ? "m" : ""}` : "—"}</small></div>)}
    </section>
    <p className="disclaimer">Margem estimada = salário informado − gastos fixos − parcelas ativas naquele mês.</p>
  </>;
}

function CategoryMark({ category }: { category: Category }) {
  return <span className={`category-mark ${category}`}><Icon name={category === "transporte" ? "wallet" : category === "estudo" ? "chart" : category === "casa" ? "home" : "card"} size={18}/></span>;
}

function EmptyList({ onAdd }: { onAdd: () => void }) {
  return <div className="empty-list"><span><Icon name="card" size={25}/></span><div><strong>Nenhuma parcela ativa</strong><p>Adicione uma compra para enxergar o impacto no próximo salário.</p></div><button className="secondary" onClick={onAdd}>Adicionar primeira</button></div>;
}

function ModalShell({ title, kicker, onClose, children, wide = false }: { title: string; kicker: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return <div className="modal-backdrop" role="presentation"><section className={`modal-card ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}><header><div><span>{kicker}</span><h2>{title}</h2></div><button onClick={onClose} aria-label="Fechar">×</button></header>{children}</section></div>;
}

function InstallmentModal({ onClose, onSave }: { onClose: () => void; onSave: (item: Omit<Installment, "id">) => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState("12");
  const [remaining, setRemaining] = useState("12");
  const [category, setCategory] = useState<Category>("outros");
  function submit(event: FormEvent) {
    event.preventDefault();
    const totalMonths = Math.max(1, Number(total) || 1);
    const remainingMonths = Math.min(totalMonths, Math.max(1, Number(remaining) || totalMonths));
    if (!name.trim() || readNumber(amount) <= 0) return;
    onSave({ name: name.trim(), monthlyAmount: readNumber(amount), totalMonths, remainingMonths, category });
  }
  return <ModalShell title="Adicionar parcela" kicker="NOVO COMPROMISSO" onClose={onClose}><form className="modal-form" onSubmit={submit}><label>O que você comprou?<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: iPhone, curso, sofá" /></label><label>Valor de cada parcela<div className="money-field"><span>R$</span><input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9,.]/g, ""))} placeholder="289" /></div></label><div className="two-fields"><label>Total de parcelas<input type="number" min="1" max="120" value={total} onChange={(event) => { setTotal(event.target.value); if (Number(remaining) > Number(event.target.value)) setRemaining(event.target.value); }} /></label><label>Quantas faltam?<input type="number" min="1" max={Math.max(1, Number(total) || 1)} value={remaining} onChange={(event) => setRemaining(event.target.value)} /></label></div><fieldset><legend>Categoria</legend><div className="category-options">{(Object.keys(categoryLabel) as Category[]).map((key) => <button key={key} type="button" className={category === key ? "active" : ""} onClick={() => setCategory(key)}>{categoryLabel[key]}</button>)}</div></fieldset><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" type="submit" disabled={!name.trim() || readNumber(amount) <= 0}>Adicionar ao mês <Icon name="arrow" size={18}/></button></div></form></ModalShell>;
}

function SimulatorModal({ data, committed, onClose, onAdd }: { data: AppData; committed: number; onClose: () => void; onAdd: (item: Omit<Installment, "id">) => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [months, setMonths] = useState("12");
  const monthly = readNumber(amount);
  const count = Math.max(1, Number(months) || 1);
  const newMargin = data.salary - data.fixedCosts - committed - monthly;
  const disposable = Math.max(1, data.salary - data.fixedCosts);
  const commitment = (committed + monthly) / disposable;
  const status = newMargin < 0 ? "danger" : commitment > .5 ? "warning" : "safe";
  const content = {
    danger: { label: "APERTA O MÊS", title: "Essa parcela passa da sua margem.", text: "Pelos valores informados, você terminaria o mês no negativo antes dos gastos variáveis." },
    warning: { label: "EXIGE ATENÇÃO", title: "Cabe, mas ocupa boa parte do seu espaço.", text: "Mais da metade da renda após gastos fixos ficaria presa em parcelas." },
    safe: { label: "CABE NA MARGEM INFORMADA", title: "A parcela não estoura o mês.", text: "Ainda assim, considere alimentação, lazer e imprevistos que não foram informados aqui." },
  }[status];
  const ready = monthly > 0;
  return <ModalShell title="Posso parcelar isso?" kicker="SIMULAÇÃO RÁPIDA" onClose={onClose} wide><div className="simulator-grid"><form className="modal-form simulator-form" onSubmit={(event) => event.preventDefault()}><p>Descubra o impacto antes de passar o cartão. Nada será salvo até você confirmar.</p><label>O que você está pensando em comprar?<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: notebook novo" /></label><div className="two-fields"><label>Valor da parcela<div className="money-field"><span>R$</span><input autoFocus inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9,.]/g, ""))} placeholder="350" /></div></label><label>Por quantos meses?<input type="number" min="1" max="120" value={months} onChange={(event) => setMonths(event.target.value)} /></label></div><div className="simulation-baseline"><span>Sua margem hoje <strong>{money(data.salary - data.fixedCosts - committed)}</strong></span><Icon name="arrow"/><span>Com essa compra <strong>{ready ? money(newMargin) : "—"}</strong></span></div></form><section className={`simulation-result ${ready ? status : "idle"}`}><span className="result-label">{ready ? content.label : "PREENCHA O VALOR"}</span><div className="result-orb"><small>NOVA MARGEM</small><strong>{ready ? money(newMargin) : "—"}</strong><span>por mês</span></div><h3>{ready ? content.title : "Veja a compra dentro da sua realidade."}</h3><p>{ready ? content.text : "Informe o valor da parcela para calcular o impacto no seu próximo salário."}</p>{ready && <div className="result-facts"><span><small>CUSTO TOTAL</small><strong>{money(monthly * count)}</strong></span><span><small>FIM PREVISTO</small><strong>{monthLabel(count, true)}</strong></span></div>}<button className="primary full" disabled={!ready || !name.trim()} onClick={() => onAdd({ name: name.trim(), monthlyAmount: monthly, totalMonths: count, remainingMonths: count, category: "outros" })}>Adicionar às minhas parcelas <Icon name="arrow"/></button><small className="result-disclaimer">Simulação informativa baseada somente nos dados cadastrados.</small></section></div></ModalShell>;
}

function SettingsModal({ data, onClose, onSave, onReset }: { data: AppData; onClose: () => void; onSave: (patch: Pick<AppData, "name" | "salary" | "fixedCosts" | "payday">) => void; onReset: () => void }) {
  const [name, setName] = useState(data.name);
  const [salary, setSalary] = useState(String(data.salary));
  const [fixedCosts, setFixedCosts] = useState(String(data.fixedCosts));
  const [payday, setPayday] = useState(String(data.payday));
  return <ModalShell title="Sua base mensal" kicker="AJUSTES" onClose={onClose}><form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSave({ name: name.trim() || data.name, salary: readNumber(salary), fixedCosts: readNumber(fixedCosts), payday: Math.min(31, Math.max(1, Number(payday) || 5)) }); }}><label>Seu nome<input value={name} onChange={(event) => setName(event.target.value)} /></label><div className="two-fields"><label>Salário líquido<div className="money-field"><span>R$</span><input inputMode="decimal" value={salary} onChange={(event) => setSalary(event.target.value.replace(/[^0-9,.]/g, ""))} /></div></label><label>Gastos fixos<div className="money-field"><span>R$</span><input inputMode="decimal" value={fixedCosts} onChange={(event) => setFixedCosts(event.target.value.replace(/[^0-9,.]/g, ""))} /></div></label></div><label>Dia do pagamento<input type="number" min="1" max="31" value={payday} onChange={(event) => setPayday(event.target.value)} /></label><div className="modal-actions split"><button type="button" className="danger-link" onClick={onReset}>Apagar meus dados</button><span/><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" type="submit">Salvar ajustes</button></div></form></ModalShell>;
}
