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
  selectedSkin: text("selected_skin").notNull().default("ufo"),
  selectedTheme: text("selected_theme").notNull().default("neon"),
  unlockedSkins: text("unlocked_skins").notNull().default("ufo"),
  unlockedThemes: text("unlocked_themes").notNull().default("neon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: text("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
  progress: integer("progress").notNull().default(0),
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
export type Achievement = typeof achievements.$inferSelect;

// Achievement definitions
export const achievementDefinitions = {
  first_win: {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🏆',
    reward: { type: 'credits', amount: 500 },
    requirement: { type: 'wins', count: 1 }
  },
  big_win: {
    id: 'big_win',
    name: 'Big Winner',
    description: 'Win 10,000+ credits in a single game',
    icon: '💰',
    reward: { type: 'skin', item: 'rocket' },
    requirement: { type: 'single_win', amount: 10000 }
  },
  high_roller: {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Place a bet of 5,000+ credits',
    icon: '🎰',
    reward: { type: 'theme', item: 'gold' },
    requirement: { type: 'bet_amount', amount: 5000 }
  },
  multiplier_master: {
    id: 'multiplier_master',
    name: 'Multiplier Master',
    description: 'Reach a multiplier of x20 or higher',
    icon: '🚀',
    reward: { type: 'skin', item: 'spaceship' },
    requirement: { type: 'multiplier', amount: 20 }
  },
  lucky_streak: {
    id: 'lucky_streak',
    name: 'Lucky Streak',
    description: 'Win 5 games in a row',
    icon: '🍀',
    reward: { type: 'credits', amount: 2000 },
    requirement: { type: 'win_streak', count: 5 }
  },
  level_10: {
    id: 'level_10',
    name: 'Veteran Player',
    description: 'Reach level 10',
    icon: '⭐',
    reward: { type: 'skin', item: 'starship' },
    requirement: { type: 'level', amount: 10 }
  },
  crash_survivor: {
    id: 'crash_survivor',
    name: 'Crash Survivor',
    description: 'Survive 100 crashes',
    icon: '💥',
    reward: { type: 'theme', item: 'dark' },
    requirement: { type: 'losses', count: 100 }
  }
} as const;

// Skin and theme definitions
export const skinDefinitions = {
  ufo: { id: 'ufo', name: 'UFO', emoji: '🛸', unlockLevel: 1 },
  rocket: { id: 'rocket', name: 'Rocket', emoji: '🚀', unlockLevel: 5 },
  spaceship: { id: 'spaceship', name: 'Spaceship', emoji: '🛰️', unlockLevel: 10 },
  starship: { id: 'starship', name: 'Starship', emoji: '✨', unlockLevel: 15 },
  comet: { id: 'comet', name: 'Comet', emoji: '☄️', unlockLevel: 20 }
} as const;

export const themeDefinitions = {
  neon: { id: 'neon', name: 'Neon Blue', colors: { primary: '#00D9FF', secondary: '#8B5CF6' } },
  gold: { id: 'gold', name: 'Golden', colors: { primary: '#FFD700', secondary: '#FFA500' } },
  dark: { id: 'dark', name: 'Dark Mode', colors: { primary: '#6366F1', secondary: '#8B5CF6' } },
  matrix: { id: 'matrix', name: 'Matrix', colors: { primary: '#00FF00', secondary: '#00AA00' } },
  sunset: { id: 'sunset', name: 'Sunset', colors: { primary: '#FF6B6B', secondary: '#4ECDC4' } }
} as const;
