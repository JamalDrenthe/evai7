import { z } from "zod";

export const PlatformSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Payout rate (€) per 1M streams. */
  rate: z.number().nonnegative(),
  /** Share of total streams routed through this platform (0–100). */
  percent: z.number().min(0).max(100),
});

export const MiningInputSchema = z.object({
  albums: z.number().int().min(1).max(500).default(2),
  tracksPerAlbum: z.number().int().min(1).max(100).default(10),
  streamsPerTrack: z.number().int().min(0).default(1_000_000),
  platforms: z.array(PlatformSchema).min(1).default([
    { id: "spotify", name: "Spotify", rate: 3720, percent: 50 },
    { id: "apple", name: "Apple Music", rate: 4650, percent: 15 },
    { id: "youtube", name: "YouTube", rate: 1627.5, percent: 15 },
    { id: "tidal", name: "Tidal", rate: 11160, percent: 5 },
    { id: "amazon", name: "Amazon Music", rate: 4650, percent: 5 },
    { id: "deezer", name: "Deezer", rate: 4371, percent: 5 },
    { id: "pandora", name: "Pandora", rate: 1302, percent: 3 },
    { id: "soundcloud", name: "SoundCloud", rate: 1209, percent: 2 },
  ]),
  /** Distributor fee as percentage (0–100). */
  distributorFeePct: z.number().min(0).max(100).default(15),
  /** Number of Apple Mini devices used as a stream farm. */
  appleMinis: z.number().int().min(0).default(10),
  /** Days the farm runs. Default = 365. */
  farmDays: z.number().int().min(1).max(3650).default(365),
});

export type MiningInput = z.infer<typeof MiningInputSchema>;

export const PlatformBreakdownSchema = z.object({
  id: z.string(),
  name: z.string(),
  streams: z.number(),
  revenue: z.number(),
});

export const MiningOutputSchema = z.object({
  totalTracks: z.number(),
  totalStreams: z.number(),
  totalGross: z.number(),
  distributorFee: z.number(),
  totalNet: z.number(),
  platforms: z.array(PlatformBreakdownSchema),
  farm: z.object({
    appleMinis: z.number(),
    dailyTotalStreams: z.number(),
    totalStreams: z.number(),
    gross: z.number(),
    distributorFee: z.number(),
    net: z.number(),
    daysToGoal: z.number(),
  }),
});

export type MiningOutput = z.infer<typeof MiningOutputSchema>;
