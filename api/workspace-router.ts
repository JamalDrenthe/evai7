import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chatSessions, chatMessages, documents } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const workspaceRouter = createRouter({
  // Chat Sessions
  sessions: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, ctx.user.id))
      .orderBy(desc(chatSessions.updatedAt));
  }),

  createSession: authedQuery
    .input(z.object({ title: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [row] = await db
        .insert(chatSessions)
        .values({
          userId: ctx.user.id,
          title: input.title,
        })
        .returning({ id: chatSessions.id });
      return { id: row.id };
    }),

  archiveSession: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(chatSessions)
        .set({ status: "archived" })
        .where(and(eq(chatSessions.id, input.id), eq(chatSessions.userId, ctx.user.id)));
      return { success: true };
    }),

  // Chat Messages
  messages: authedQuery
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, input.sessionId))
        .orderBy(chatMessages.createdAt);
    }),

  sendMessage: authedQuery
    .input(
      z.object({
        sessionId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Store user message
      await db.insert(chatMessages).values({
        sessionId: input.sessionId,
        role: "user",
        content: input.content,
      });

      // Simulate AI response (placeholder for real AI integration)
      const aiResponse = generateAIResponse(input.content);

      await db.insert(chatMessages).values({
        sessionId: input.sessionId,
        role: "assistant",
        content: aiResponse,
      });

      // Update session timestamp
      await db
        .update(chatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessions.id, input.sessionId));

      return { success: true };
    }),

  // Documents
  documents: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(documents)
      .where(eq(documents.userId, ctx.user.id))
      .orderBy(desc(documents.updatedAt));
  }),

  createDocument: authedQuery
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().optional(),
        type: z.enum(["note", "draft", "template", "brainstorm"]).default("note"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [row] = await db
        .insert(documents)
        .values({
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          type: input.type,
        })
        .returning({ id: documents.id });
      return { id: row.id };
    }),

  updateDocument: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(documents)
        .set({
          ...(input.title && { title: input.title }),
          ...(input.content !== undefined && { content: input.content }),
          updatedAt: new Date(),
        })
        .where(and(eq(documents.id, input.id), eq(documents.userId, ctx.user.id)));
      return { success: true };
    }),
});

// Simple AI response generator (placeholder)
function generateAIResponse(userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes("hallo") || lowerMsg.includes("hoi") || lowerMsg.includes("hey")) {
    return "Hallo! Ik ben Eva, je AI assistente. Waarmee kan ik je vandaag helpen? Je kunt me vragen stellen over je tools, berekeningen maken, of brainstormen over ideeën.";
  }
  if (lowerMsg.includes("mining") || lowerMsg.includes("stream")) {
    return "De Mining Calculator helpt je bij het berekenen van streaming inkomsten. Je kunt inkomsten per platform (Spotify, Apple Music, YouTube, etc.) berekenen en je stream farm capaciteit plannen. Wil je deze tool openen?";
  }
  if (lowerMsg.includes("vastgoed") || lowerMsg.includes("huis") || lowerMsg.includes("woning")) {
    return "De Vastgoed Vliegwiel Calculator simuleert je acquisitiekracht. Met je startkapitaal, huurkosten en kamerverhuur inkomsten kun je berekenen hoeveel woningen je kunt verwerven. Wil je deze berekening starten?";
  }
  if (lowerMsg.includes("zzp") || lowerMsg.includes("netto") || lowerMsg.includes("belasting")) {
    return "De ZZP Netto Calculator berekent je werkelijke netto inkomen inclusief alle aftrekposten (zelfstandigenaftrek, startersaftrek, MKB-winstvrijstelling) en belastingen. Wil je je cijfers invoeren?";
  }
  if (lowerMsg.includes("vvc") || lowerMsg.includes("vrienden")) {
    return "De VVC Calculator berekent je inkomen bij de Verdienende Vrienden Club, inclusief uurloon, plaatsingsbonussen en het groeiende passieve inkomen. Wil je je scenario berekenen?";
  }
  if (lowerMsg.includes("taak") || lowerMsg.includes("todo") || lowerMsg.includes("lijst")) {
    return "Het Takenblok helpt je bij het organiseren van je taken. Je kunt prioriteiten instellen, deadlines toevoegen en je voortgang volgen. Wil je een nieuwe taak aanmaken?";
  }
  if (lowerMsg.includes("organigram") || lowerMsg.includes("structuur")) {
    return "Het Organigram toont de volledige organisatiestructuur van Founder tot Kandidaat. Je kunt door de hiërarchie navigeren en elk niveau in- en uitklappen. Wil je het organigram bekijken?";
  }
  if (lowerMsg.includes("tgc") || lowerMsg.includes("time gap") || lowerMsg.includes("cash flow")) {
    return "De TGC Chatbot is gespecialiseerd in Time Gap Cash Flow - een unieke liquiditeitsstrategie gebaseerd op tijd in plaats van bezit. Stel gerust je vragen over TGC!";
  }
  if (lowerMsg.includes("help") || lowerMsg.includes("hoe")) {
    return "Ik kan je helpen met:\n\n**Berekeningen:** Mining Calculator, Vastgoed Calculator, ZZP Calculator, VVC Calculator\n**Productiviteit:** Takenblok, Organigram\n**Chatbots:** TGC, Ecosysteem, VVC\n**Veiligheid:** Voice Verificatie\n\nWat wil je doen?";
  }

  return "Interessant! Ik begrijp je vraag. Als Eva, je AI assistente, kan ik je helpen met berekeningen, het opzetten van taken, of het verbinden met de juiste tools in je ecosysteem. Kun je wat meer context geven over wat je nodig hebt?";
}
