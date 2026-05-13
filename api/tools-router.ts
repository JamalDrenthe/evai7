import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tools, toolExecutions } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const toolsRouter = createRouter({
  list: publicQuery.query(async () => {
    try {
      const db = getDb();
      let dbTools = await db.select().from(tools).orderBy(tools.name);
      // Fallback to hardcoded tools if database is empty
      if (dbTools.length === 0) {
        dbTools = [
          {
            id: 1,
            name: "Mining Calculator",
            slug: "mining-calculator",
            description: "Bereken streaming inkomsten over meerdere platformen (Spotify, Apple Music, YouTube, Tidal, etc.) met stream farm capaciteit planning.",
            category: "calculator" as const,
            icon: "Calculator",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 2,
            name: "Estate Calculator",
            slug: "estate-calculator",
            description: "Simuleer vastgoed acquisitie kracht met het vliegwiel effect. Bereken rendement op basis van startkapitaal, huur en kamerverhuur.",
            category: "calculator" as const,
            icon: "TrendingUp",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 3,
            name: "ZZP Netto Calculator",
            slug: "zzp-calculator",
            description: "Bereken je netto inkomen als ZZP'er inclusief BTW, inkomstenbelasting, zelfstandigenaftrek, startersaftrek en ZVW bijdrage.",
            category: "calculator" as const,
            icon: "Wallet",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 4,
            name: "VVC Calculator",
            slug: "vvc-calculator",
            description: "Bereken je inkomen bij de Verdienende Vrienden Club inclusief uurloon, plaatsingsbonussen en passief inkomen.",
            category: "calculator" as const,
            icon: "Users",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 5,
            name: "Takenblok",
            slug: "takenblok",
            description: "Beheer je taken met prioriteiten, deadlines en status tracking. Verander je rommelige lijst in een actieplan.",
            category: "productivity" as const,
            icon: "CheckSquare",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 6,
            name: "Organigram",
            slug: "organigram",
            description: "Interactieve organisatiestructuur van Founder tot Kandidaat. Klikbare hiërarchie met alle management lagen.",
            category: "productivity" as const,
            icon: "Network",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 7,
            name: "TGC Chatbot",
            slug: "tgc-chatbot",
            description: "AI Chatbot gespecialiseerd in Time Gap Cash Flow (TGC) - een liquiditeitsstrategie gebaseerd op tijd, niet op bezit.",
            category: "chatbot" as const,
            icon: "MessageSquare",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 8,
            name: "Ecosysteem Chatbot",
            slug: "ecosysteem-chatbot",
            description: "De centrale AI chatbot die alle tools en modules met elkaar verbindt. Gedeelde context en sessiegeheugen.",
            category: "chatbot" as const,
            icon: "Bot",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 11,
            name: "VVC Chatbot",
            slug: "vvc-chatbot",
            description: "AI chatbot voor de Verdienende Vrienden Club met club-specifieke kennis en procedures.",
            category: "chatbot" as const,
            icon: "MessageCircle",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 12,
            name: "Voice Verificatie",
            slug: "voice-verificatie",
            description: "Veilige stemverificatie systeem met real-time audio waveform visualisatie en analyse.",
            category: "security" as const,
            icon: "Mic",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
        ];
      }
      return dbTools;
    } catch (error) {
      console.error("Error fetching tools:", error);
      // Return hardcoded tools on error
      return [
        {
          id: 1,
          name: "Mining Calculator",
          slug: "mining-calculator",
          description: "Bereken streaming inkomsten over meerdere platformen (Spotify, Apple Music, YouTube, Tidal, etc.) met stream farm capaciteit planning.",
          category: "calculator" as const,
          icon: "Calculator",
          status: "active" as const,
          config: null,
          createdAt: new Date(),
        },
        {
          id: 2,
          name: "Estate Calculator",
          slug: "estate-calculator",
          description: "Simuleer vastgoed acquisitie kracht met het vliegwiel effect. Bereken rendement op basis van startkapitaal, huur en kamerverhuur.",
          category: "calculator" as const,
          icon: "TrendingUp",
          status: "active" as const,
          config: null,
          createdAt: new Date(),
        },
        {
          id: 3,
          name: "ZZP Netto Calculator",
          slug: "zzp-calculator",
          description: "Bereken je netto inkomen als ZZP'er inclusief BTW, inkomstenbelasting, zelfstandigenaftrek, startersaftrek en ZVW bijdrage.",
          category: "calculator" as const,
          icon: "Wallet",
          status: "active" as const,
          config: null,
          createdAt: new Date(),
        },
        {
          id: 4,
          name: "VVC Calculator",
          slug: "vvc-calculator",
          description: "Bereken je inkomen bij de Verdienende Vrienden Club inclusief uurloon, plaatsingsbonussen en passief inkomen.",
          category: "calculator" as const,
          icon: "Users",
          status: "active" as const,
          config: null,
          createdAt: new Date(),
        },
        {
          id: 5,
          name: "Takenblok",
          slug: "takenblok",
          description: "Beheer je taken met prioriteiten, deadlines en status tracking. Verander je rommelige lijst in een actieplan.",
          category: "productivity" as const,
          icon: "CheckSquare",
          status: "active" as const,
          config: null,
          createdAt: new Date(),
        },
        {
          id: 6,
          name: "Organigram",
          slug: "organigram",
          description: "Interactieve organisatiestructuur van Founder tot Kandidaat. Klikbare hiërarchie met alle management lagen.",
          category: "productivity" as const,
          icon: "Network",
          status: "active" as const,
          config: null,
          createdAt: new Date(),
        },
        {
          id: 7,
          name: "TGC Chatbot",
          slug: "tgc-chatbot",
          description: "AI Chatbot gespecialiseerd in Time Gap Cash Flow (TGC) - een liquiditeitsstrategie gebaseerd op tijd, niet op bezit.",
          category: "chatbot" as const,
          icon: "MessageSquare",
          status: "active" as const,
          config: null,
          createdAt: new Date(),
        },
        {
          id: 8,
          name: "Ecosysteem Chatbot",
          slug: "ecosysteem-chatbot",
          description: "De centrale AI chatbot die alle tools en modules met elkaar verbindt. Gedeelde context en sessiegeheugen.",
          category: "chatbot" as const,
          icon: "Bot",
          status: "active" as const,
          config: null,
          createdAt: new Date(),
        },
        {
          id: 11,
          name: "VVC Chatbot",
          slug: "vvc-chatbot",
          description: "AI chatbot voor de Verdienende Vrienden Club met club-specifieke kennis en procedures.",
          category: "chatbot" as const,
          icon: "MessageCircle",
          status: "active" as const,
          config: null,
          createdAt: new Date(),
        },
        {
          id: 12,
          name: "Voice Verificatie",
          slug: "voice-verificatie",
          description: "Veilige stemverificatie systeem met real-time audio waveform visualisatie en analyse.",
          category: "security" as const,
          icon: "Mic",
          status: "active" as const,
          config: null,
          createdAt: new Date(),
        },
      ];
    }
  }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      let result = await db.select().from(tools).where(eq(tools.slug, input.slug));
      // Fallback to hardcoded tools if database is empty
      if (result.length === 0) {
        const allTools = [
          {
            id: 1,
            name: "Mining Calculator",
            slug: "mining-calculator",
            description: "Bereken streaming inkomsten over meerdere platformen (Spotify, Apple Music, YouTube, Tidal, etc.) met stream farm capaciteit planning.",
            category: "calculator" as const,
            icon: "Calculator",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 2,
            name: "Estate Calculator",
            slug: "estate-calculator",
            description: "Simuleer vastgoed acquisitie kracht met het vliegwiel effect. Bereken rendement op basis van startkapitaal, huur en kamerverhuur.",
            category: "calculator" as const,
            icon: "TrendingUp",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 3,
            name: "ZZP Netto Calculator",
            slug: "zzp-calculator",
            description: "Bereken je netto inkomen als ZZP'er inclusief BTW, inkomstenbelasting, zelfstandigenaftrek, startersaftrek en ZVW bijdrage.",
            category: "calculator" as const,
            icon: "Wallet",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 4,
            name: "VVC Calculator",
            slug: "vvc-calculator",
            description: "Bereken je inkomen bij de Verdienende Vrienden Club inclusief uurloon, plaatsingsbonussen en passief inkomen.",
            category: "calculator" as const,
            icon: "Users",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 5,
            name: "Takenblok",
            slug: "takenblok",
            description: "Beheer je taken met prioriteiten, deadlines en status tracking. Verander je rommelige lijst in een actieplan.",
            category: "productivity" as const,
            icon: "CheckSquare",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 6,
            name: "Organigram",
            slug: "organigram",
            description: "Interactieve organisatiestructuur van Founder tot Kandidaat. Klikbare hiërarchie met alle management lagen.",
            category: "productivity" as const,
            icon: "Network",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 7,
            name: "TGC Chatbot",
            slug: "tgc-chatbot",
            description: "AI Chatbot gespecialiseerd in Time Gap Cash Flow (TGC) - een liquiditeitsstrategie gebaseerd op tijd, niet op bezit.",
            category: "chatbot" as const,
            icon: "MessageSquare",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 8,
            name: "Ecosysteem Chatbot",
            slug: "ecosysteem-chatbot",
            description: "De centrale AI chatbot die alle tools en modules met elkaar verbindt. Gedeelde context en sessiegeheugen.",
            category: "chatbot" as const,
            icon: "Bot",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 11,
            name: "VVC Chatbot",
            slug: "vvc-chatbot",
            description: "AI chatbot voor de Verdienende Vrienden Club met club-specifieke kennis en procedures.",
            category: "chatbot" as const,
            icon: "MessageCircle",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
          {
            id: 12,
            name: "Voice Verificatie",
            slug: "voice-verificatie",
            description: "Veilige stemverificatie systeem met real-time audio waveform visualisatie en analyse.",
            category: "security" as const,
            icon: "Mic",
            status: "active" as const,
            config: null,
            createdAt: new Date(),
          },
        ];
        result = allTools.filter((t) => t.slug === input.slug);
      }
      return result[0] ?? null;
    }),

  getByCategory: publicQuery
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(tools).where(eq(tools.category, input.category as "calculator" | "chatbot" | "productivity" | "security" | "ai"));
    }),

  execute: authedQuery
    .input(
      z.object({
        toolId: z.number(),
        input: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Store the execution
      await db.insert(toolExecutions).values({
        userId,
        toolId: input.toolId,
        input: input.input,
        status: "success",
      });

      return { success: true, message: "Tool executed" };
    }),

  executionHistory: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(toolExecutions)
      .where(eq(toolExecutions.userId, ctx.user.id))
      .orderBy(desc(toolExecutions.createdAt))
      .limit(50);
  }),
});
