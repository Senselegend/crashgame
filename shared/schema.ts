import { z } from "zod";

// Game state schemas
export const gameResultSchema = z.object({
  id: z.string(),
  multiplier: z.number(),
  isWin: z.boolean(),
  betAmount: z.number(),
  winAmount: z.number().optional(),
  timestamp: z.number(),
  isAuto: z.boolean().optional(),
});

export const userStatsSchema = z.object({
  totalPlayed: z.number().default(0),
  totalWins: z.number().default(0),
  totalLosses: z.number().default(0),
  winRate: z.number().default(0),
  maxWin: z.number().default(0),
  maxMultiplier: z.number().default(0),
  netProfit: z.number().default(0),
  totalWagered: z.number().default(0),
});

export const userDataSchema = z.object({
  balance: z.number().default(10000),
  level: z.number().default(1),
  totalWagered: z.number().default(0),
  lastDailyBonus: z.number().default(0),
  consecutiveLosses: z.number().default(0),
  stats: userStatsSchema,
});

export const gameStateSchema = z.object({
  isPlaying: z.boolean().default(false),
  currentMultiplier: z.number().default(1.0),
  crashPoint: z.number().optional(),
  startTime: z.number().optional(),
  betAmount: z.number().default(100),
  autoStopMultiplier: z.number().default(2.0),
  canCashOut: z.boolean().default(false),
});

export type GameResult = z.infer<typeof gameResultSchema>;
export type UserStats = z.infer<typeof userStatsSchema>;
export type UserData = z.infer<typeof userDataSchema>;
export type GameState = z.infer<typeof gameStateSchema>;
