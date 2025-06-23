import { z } from "zod";
import { pgTable, serial, text, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

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

// Database Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  balance: integer("balance").notNull().default(10000),
  level: integer("level").notNull().default(1),
  totalWagered: integer("total_wagered").notNull().default(0),
  lastDailyBonus: timestamp("last_daily_bonus"),
  consecutiveLosses: integer("consecutive_losses").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  multiplier: real("multiplier").notNull(),
  isWin: boolean("is_win").notNull(),
  betAmount: integer("bet_amount").notNull(),
  winAmount: integer("win_amount"),
  isAuto: boolean("is_auto").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Zod schemas for API validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertGameResultSchema = createInsertSchema(gameResults).omit({
  id: true,
  createdAt: true,
});

// Types for database operations
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGameResult = z.infer<typeof insertGameResultSchema>;
