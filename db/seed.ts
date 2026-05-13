import { getDb } from "../api/queries/connection";
import { tools as toolsTable } from "./schema";

async function seed() {
  const db = getDb();

  // Seed tools - all the user's existing tools
  const toolsData = [
    {
      name: "Mining Calculator",
      slug: "mining-calculator",
      description: "Bereken streaming inkomsten over meerdere platformen (Spotify, Apple Music, YouTube, Tidal, etc.) met stream farm capaciteit planning.",
      category: "calculator" as const,
      icon: "Calculator",
      status: "active" as const,
    },
    {
      name: "Vastgoed Vliegwiel Calculator",
      slug: "estate-calculator",
      description: "Simuleer vastgoed acquisitie kracht met het vliegwiel effect. Bereken rendement op basis van startkapitaal, huur en kamerverhuur.",
      category: "calculator" as const,
      icon: "TrendingUp",
      status: "active" as const,
    },
    {
      name: "ZZP Netto Calculator",
      slug: "zzp-calculator",
      description: "Bereken je netto inkomen als ZZP'er inclusief BTW, inkomstenbelasting, zelfstandigenaftrek, startersaftrek en ZVW bijdrage.",
      category: "calculator" as const,
      icon: "Wallet",
      status: "active" as const,
    },
    {
      name: "VVC Calculator",
      slug: "vvc-calculator",
      description: "Bereken je inkomen bij de Verdienende Vrienden Club inclusief uurloon, plaatsingsbonussen en passief inkomen.",
      category: "calculator" as const,
      icon: "Users",
      status: "active" as const,
    },
    {
      name: "Takenblok",
      slug: "takenblok",
      description: "Beheer je taken met prioriteiten, deadlines en status tracking. Verander je rommelige lijst in een actieplan.",
      category: "productivity" as const,
      icon: "CheckSquare",
      status: "active" as const,
    },
    {
      name: "Organigram",
      slug: "organigram",
      description: "Interactieve organisatiestructuur van Founder tot Kandidaat. Klikbare hiërarchie met alle management lagen.",
      category: "productivity" as const,
      icon: "Network",
      status: "active" as const,
    },
    {
      name: "TGC Chatbot",
      slug: "tgc-chatbot",
      description: "AI Chatbot gespecialiseerd in Time Gap Cash Flow (TGC) - een liquiditeitsstrategie gebaseerd op tijd, niet op bezit.",
      category: "chatbot" as const,
      icon: "MessageSquare",
      status: "active" as const,
    },
    {
      name: "Ecosysteem Chatbot",
      slug: "ecosysteem-chatbot",
      description: "De centrale AI chatbot die alle tools en modules met elkaar verbindt. Gedeelde context en sessiegeheugen.",
      category: "chatbot" as const,
      icon: "Bot",
      status: "active" as const,
    },
    {
      name: "VVC Chatbot",
      slug: "vvc-chatbot",
      description: "AI chatbot voor de Verdienende Vrienden Club met club-specifieke kennis en procedures.",
      category: "chatbot" as const,
      icon: "MessageCircle",
      status: "active" as const,
    },
    {
      name: "Voice Verificatie",
      slug: "voice-verificatie",
      description: "Veilige stemverificatie systeem met real-time audio waveform visualisatie en analyse.",
      category: "security" as const,
      icon: "Mic",
      status: "active" as const,
    },
  ];

  for (const tool of toolsData) {
    await db.insert(toolsTable).values(tool);
  }

  console.log(`Seeded ${toolsData.length} tools`);
}

seed().catch(console.error);
