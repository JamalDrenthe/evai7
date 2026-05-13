import type { DocumentEntry } from "./documentsData";

const VVC_INLOG_HTML = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inloggen | Verdienende Vrienden Club</title>

    <!-- Google Fonts: Montserrat voor de zware, geometrische look van het VVC merk -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,900&display=swap" rel="stylesheet">

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Tailwind Configuratie voor VVC Branding -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        vvc: {
                            pink: '#ec1a89',
                            dark: '#0a0a0a',
                            darker: '#050505',
                            card: '#141414',
                            border: '#2a2a2a'
                        }
                    },
                    fontFamily: {
                        sans: ['Montserrat', 'sans-serif'],
                    }
                }
            }
        }
    </script>

    <style>
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #ec1a89; }
        .glow-bg { background: radial-gradient(circle at 50% 50%, rgba(236, 26, 137, 0.15) 0%, rgba(10, 10, 10, 0) 50%); }
    </style>
</head>
<body class="bg-vvc-darker text-white font-sans antialiased min-h-screen flex selection:bg-vvc-pink selection:text-white">

    <!-- Linkerzijde: Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-vvc-dark relative overflow-hidden flex-col justify-between p-16 border-r border-vvc-border">
        <div class="absolute inset-0 glow-bg pointer-events-none"></div>

        <div class="z-10">
            <h1 class="font-black italic text-6xl tracking-tighter select-none">VVC<span class="text-vvc-pink">.</span></h1>
        </div>

        <div class="z-10 max-w-xl">
            <h2 class="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
                Kwaliteit als <br />
                <span class="text-vvc-pink">Hoogste Valuta.</span>
            </h2>
            <p class="text-gray-400 text-lg mb-8 leading-relaxed font-medium">
                Welkom bij het exclusieve platform waar expertise direct wordt vertaald naar beloning. Geen bazen, maar partners. Resultaat is de enige waarheid.
            </p>

            <div class="space-y-4">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-vvc-pink/10 flex items-center justify-center">
                        <svg class="w-4 h-4 text-vvc-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span class="font-bold tracking-wide">LOYALITEIT</span>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-vvc-pink/10 flex items-center justify-center">
                        <svg class="w-4 h-4 text-vvc-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span class="font-bold tracking-wide">EXECUTIE</span>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-vvc-pink/10 flex items-center justify-center">
                        <svg class="w-4 h-4 text-vvc-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span class="font-bold tracking-wide">EIGENAARSCHAP</span>
                </div>
            </div>
        </div>

        <div class="z-10">
            <p class="text-sm text-gray-600 font-medium">&copy; 2025 Verdienende Vrienden Club. Amsterdam.</p>
        </div>
    </div>

    <!-- Rechterzijde: Inlog Formulier -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div class="w-full max-w-md">
            <div class="lg:hidden mb-12 text-center">
                <h1 class="font-black italic text-5xl tracking-tighter select-none">VVC<span class="text-vvc-pink">.</span></h1>
            </div>

            <div class="bg-vvc-card p-8 sm:p-10 rounded-2xl border border-vvc-border shadow-2xl relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vvc-pink to-purple-600"></div>

                <div class="mb-8">
                    <h3 class="text-2xl font-bold mb-2">Inloggen</h3>
                    <p class="text-gray-400 text-sm font-medium">Krijg toegang tot je dashboard en leads.</p>
                </div>

                <form id="loginForm" onsubmit="handleLogin(event)">
                    <div class="mb-5">
                        <label for="email" class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">E-mailadres</label>
                        <input type="email" id="email" required
                            class="w-full bg-vvc-darker border border-vvc-border rounded-xl px-4 py-3.5 text-white font-medium placeholder-gray-600 focus:outline-none focus:border-vvc-pink focus:ring-1 focus:ring-vvc-pink transition-all duration-200"
                            placeholder="jouw@email.nl">
                    </div>

                    <div class="mb-6">
                        <div class="flex justify-between items-center mb-2">
                            <label for="password" class="block text-xs font-bold text-gray-400 uppercase tracking-wider">Wachtwoord</label>
                            <a href="#" class="text-xs font-bold text-vvc-pink hover:text-white transition-colors duration-200">Vergeten?</a>
                        </div>
                        <input type="password" id="password" required
                            class="w-full bg-vvc-darker border border-vvc-border rounded-xl px-4 py-3.5 text-white font-medium placeholder-gray-600 focus:outline-none focus:border-vvc-pink focus:ring-1 focus:ring-vvc-pink transition-all duration-200"
                            placeholder="••••••••">
                    </div>

                    <div class="flex items-center mb-8">
                        <input type="checkbox" id="remember" class="w-4 h-4 rounded bg-vvc-darker border-gray-700 text-vvc-pink focus:ring-vvc-pink focus:ring-offset-vvc-card cursor-pointer">
                        <label for="remember" class="ml-2 text-sm text-gray-400 font-medium cursor-pointer select-none">Ingelogd blijven</label>
                    </div>

                    <button type="submit" id="submitBtn" class="w-full bg-vvc-pink hover:bg-[#d41478] text-white font-bold py-4 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(236,26,137,0.3)] hover:shadow-[0_0_25px_rgba(236,26,137,0.5)]">
                        Toegang Verkrijgen
                    </button>
                </form>
            </div>

            <p class="mt-8 text-center text-gray-500 font-medium">
                Klaar om te winnen?
                <a href="#" class="text-white hover:text-vvc-pink font-bold transition-colors ml-1 border-b border-transparent hover:border-vvc-pink pb-0.5">Start jouw route vandaag.</a>
            </p>
        </div>
    </div>

    <script>
        function handleLogin(e) {
            e.preventDefault();
            console.log('Login attempt');
        }
    </script>
</body>
</html>
`;

const VVC_CHATBOT_TSX = `import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Sparkles, DollarSign, Users, ShieldCheck, Zap, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const VVCChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Welkom bij de Verdienende Vrienden Club.\\n\\nIk ben uw strategische partner voor vragen over ons verdienmodel, de cultuur van executie en onze kwaliteitsnormen.\\n\\nU bent aan zet. Waar starten we de route?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const knowledgeBase = [
    {
      keywords: ['verdien', 'geld', 'salaris', 'inkomen', 'betaald', '30', '300', 'finance'],
      response: "Het VVC Verdienmodel: Een Blueprint voor Groei.\\n\\n1. **Actief (Basis):** €30,- per uur gegarandeerd tijdens acquisitie.\\n2. **Direct (Jacht):** €300,- bonus per succesvolle plaatsing. Direct uitbetaald.\\n3. **Passief (Vermogen):** €25,- per maand per actieve kandidaat. Dit is het 'Sneeuwbaleffect'.\\n\\nRekenvoorbeeld: 10 plaatsingen/maand = €3.000,- passief inkomen na 12 maanden."
    },
    {
      keywords: ['cultuur', 'waarden', 'sfeer', 'normen', 'dna'],
      response: "Het VVC DNA bestaat uit drie ononderhandelbare pijlers:\\n\\n1. **Loyaliteit:** Wij zijn partners, geen collega's.\\n2. **Executie:** Resultaat is de enige waarheid.\\n3. **Eigenaarschap:** U bent de CEO van uw eigen route."
    },
    {
      keywords: ['double', 'team', 'pilot', 'duo', 'samenwerken'],
      response: "**Project: Double Team**\\n\\n1. **De Netwerker:** Opent deuren en bouwt relaties.\\n2. **De Killer Closer:** Sluit de deal en verzilvert het contract.\\n\\nResultaat: 1 Team, 1 Taak. Gemiddelde output: €4.000,- p.p./maand."
    },
    {
      keywords: ['passief', 'sneeuwbal', 'toekomst', 'pensioen'],
      response: "**Het Sneeuwbaleffect**\\n\\nElke plaatsing levert €25,-/maand op zolang de kandidaat blijft. Dit stapelt cumulatief op.\\n\\n• Maand 1: €250 (bij 10 plaatsingen)\\n• Jaar 1: €3.000 /maand passief."
    }
  ];

  const processInput = (text) => {
    const lowerText = text.toLowerCase();
    for (const entry of knowledgeBase) {
      if (entry.keywords.some(keyword => lowerText.includes(keyword))) {
        return entry.response;
      }
    }
    return "Dat ligt buiten mijn huidige focusgebied.\\n\\nMijn expertise:\\n• Het Verdienmodel & Passief Inkomen\\n• De 'Double Team' Strategie\\n• Onze Cultuur van Executie";
  };

  const handleSend = () => {
    if (input.trim() === '') return;
    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const botMessage = { id: Date.now() + 1, sender: 'bot', text: processInput(userMessage.text) };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const suggestions = [
    { label: "Het Verdienmodel", icon: <DollarSign size={14} /> },
    { label: "Double Team Pilot", icon: <Users size={14} /> },
    { label: "Sneeuwbaleffect", icon: <Zap size={14} /> },
    { label: "Onze Cultuur", icon: <ShieldCheck size={14} /> }
  ];

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans">
      <main className="flex-1 flex flex-col">
        <header className="bg-[#F3F4F6]/80 backdrop-blur-md p-4 border-b border-gray-200/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">VVC Live Support</h2>
          <button
            onClick={() => setMessages([messages[0]])}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-black hover:text-black transition-all">
            Nieuwe Sessie
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={\`flex w-full \${msg.sender === 'user' ? 'justify-end' : 'justify-start'}\`}>
              <div className={\`flex items-end gap-3 \${msg.sender === 'user' ? 'flex-row-reverse' : ''}\`}>
                <div className={\`w-10 h-10 rounded-2xl flex items-center justify-center \${msg.sender === 'user' ? 'bg-black text-white' : 'bg-white border border-gray-200'}\`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Sparkles size={18} className="text-yellow-600" />}
                </div>
                <div className={\`p-5 rounded-2xl shadow-sm \${msg.sender === 'user' ? 'bg-black text-white rounded-tr-sm' : 'bg-white text-gray-900 border border-gray-200 rounded-tl-sm'}\`}>
                  {msg.text.split('\\n').map((line, i) => (
                    <span key={i} className="block mb-1">{line}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4">
          {showSuggestions && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
              {suggestions.map((s, idx) => (
                <button key={idx} onClick={() => { setInput(s.label); handleSend(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-xs font-bold text-gray-700 shadow-sm hover:border-black hover:text-white hover:bg-black transition-all whitespace-nowrap">
                  {s.icon}{s.label}
                </button>
              ))}
            </div>
          )}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Typ uw bericht..."
              className="flex-1 bg-transparent px-4 py-3 outline-none"
            />
            <button onClick={handleSend} disabled={!input.trim()}
              className={\`p-3 rounded-xl \${input.trim() ? 'bg-black text-white' : 'bg-gray-100 text-gray-300'}\`}>
              <Send size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VVCChatbot;
`;

const ESTATE_CALCULATOR_TSX = `import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Home, Wallet, ArrowRight, AlertTriangle, Building, Users } from 'lucide-react';

export default function EstateCalculator() {
  const [startCapital, setStartCapital] = useState(25000);
  const [oneTimeCostPerHouse, setOneTimeCostPerHouse] = useState(2000);
  const [rentPaidPerMonth, setRentPaidPerMonth] = useState(2500);
  const [depositPaidMonths, setDepositPaidMonths] = useState(2);
  const [roomsPerHouse, setRoomsPerHouse] = useState(4);
  const [rentReceivedPerRoom, setRentReceivedPerRoom] = useState(750);
  const [depositReceivedMonths, setDepositReceivedMonths] = useState(1);

  const simulation = useMemo(() => {
    const depositPaidAmount = rentPaidPerMonth * depositPaidMonths;
    const totalInitialOutflowPerHouse = Number(oneTimeCostPerHouse) + Number(rentPaidPerMonth) + depositPaidAmount;
    const totalRentReceivedPerMonth = roomsPerHouse * rentReceivedPerRoom;
    const depositReceivedAmount = totalRentReceivedPerMonth * depositReceivedMonths;
    const totalInitialInflowPerHouse = totalRentReceivedPerMonth + depositReceivedAmount;
    const monthlyMarginPerHouse = totalRentReceivedPerMonth - rentPaidPerMonth;

    let balance = Number(startCapital);
    const cost = totalInitialOutflowPerHouse;
    const revenue = totalInitialInflowPerHouse;

    let houses = 0;
    const steps = [];
    const capitalGrows = revenue >= cost;
    const MAX_DEMO_STEPS = 50;

    if (cost > 0 && balance >= cost) {
      while (balance >= cost) {
        houses++;
        const prevBalance = balance;
        balance -= cost;
        balance += revenue;
        steps.push({ house: houses, prevBalance, cost, revenue, newBalance: balance });
        if (capitalGrows && houses >= MAX_DEMO_STEPS) break;
      }
    }

    return {
      houses, balance, steps, capitalGrows,
      totalInitialOutflowPerHouse, totalInitialInflowPerHouse, monthlyMarginPerHouse,
      depositPaidAmount, depositReceivedAmount, totalRentReceivedPerMonth,
      totalMonthlyMargin: houses * monthlyMarginPerHouse,
      totalDepositsOwed: houses * depositReceivedAmount,
      totalDepositsClaimed: houses * depositPaidAmount
    };
  }, [startCapital, oneTimeCostPerHouse, rentPaidPerMonth, depositPaidMonths, roomsPerHouse, rentReceivedPerRoom, depositReceivedMonths]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8">
      {/* ... Volledige Vastgoed Vliegwiel Calculator UI ... */}
      <h1 className="text-2xl font-bold">Vastgoed Vliegwiel Calculator V2</h1>
      <p>Behaalbare woningen: {simulation.capitalGrows ? 'Onbeperkt' : simulation.houses}</p>
      <p>Maandelijkse marge totaal: {formatCurrency(simulation.totalMonthlyMargin)}</p>
    </div>
  );
}
`;

const MINING_CALCULATOR_TSX = `import React, { useState, useMemo } from 'react';
import { Calculator, Disc, DollarSign, Smartphone, Cpu, Link as LinkIcon, Unlink } from 'lucide-react';

const initialPlatforms = [
  { id: 'spotify', name: 'Spotify', rate: 3720, percent: 50 },
  { id: 'apple', name: 'Apple Music', rate: 4650, percent: 15 },
  { id: 'youtube', name: 'YouTube', rate: 1627.50, percent: 15 },
  { id: 'tidal', name: 'Tidal', rate: 11160, percent: 5 },
  { id: 'amazon', name: 'Amazon Music', rate: 4650, percent: 5 },
  { id: 'deezer', name: 'Deezer', rate: 4371, percent: 5 },
  { id: 'pandora', name: 'Pandora', rate: 1302, percent: 3 },
  { id: 'soundcloud', name: 'SoundCloud', rate: 1209, percent: 2 }
];

export default function MiningCalculator() {
  const [albums, setAlbums] = useState(2);
  const [tracksPerAlbum, setTracksPerAlbum] = useState(10);
  const [streamsPerTrack, setStreamsPerTrack] = useState(1000000);
  const [platforms] = useState(initialPlatforms);
  const [distributorFee, setDistributorFee] = useState(15);
  const [appleMinis, setAppleMinis] = useState(10);
  const [isSynced, setIsSynced] = useState(false);

  const farmDays = 365;
  const totalStreams = albums * tracksPerAlbum * streamsPerTrack;

  const platformResults = useMemo(() => {
    return platforms.map(p => {
      const streams = totalStreams * (p.percent / 100);
      const revenue = (streams / 1000000) * p.rate;
      return { ...p, streams, revenue };
    });
  }, [platforms, totalStreams]);

  const totalGrossRevenue = platformResults.reduce((sum, p) => sum + p.revenue, 0);
  const totalNetRevenue = totalGrossRevenue * (1 - distributorFee / 100);

  const formatCurrency = (v) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(v);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold">Mining Calculator</h1>
      <p>Netto doel: {formatCurrency(totalNetRevenue)}</p>
      <p>Farm: {appleMinis} Apple Mini&apos;s gedurende {farmDays} dagen</p>
    </div>
  );
}
`;

const now = Date.now();

export const SEED_DOCUMENTS: DocumentEntry[] = [
  {
    id: "vvc-codes-inlog",
    company: "VVC",
    section: "codes",
    title: "Inlog",
    kind: "code",
    language: "html",
    content: VVC_INLOG_HTML,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "vvc-codes-chatbot",
    company: "VVC",
    section: "codes",
    title: "Chatbot",
    kind: "code",
    language: "tsx",
    content: VVC_CHATBOT_TSX,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "vvc-codes-estate-calculator",
    company: "VVC",
    section: "codes",
    title: "Estate Calculator",
    kind: "code",
    language: "tsx",
    content: ESTATE_CALCULATOR_TSX,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "vvc-codes-mining-calculator",
    company: "VVC",
    section: "codes",
    title: "Mining Calculator",
    kind: "code",
    language: "tsx",
    content: MINING_CALCULATOR_TSX,
    createdAt: now,
    updatedAt: now,
  },
];
