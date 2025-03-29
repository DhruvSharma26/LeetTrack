import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the user table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
});

// Define problem difficulty enum
export const difficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
export type Difficulty = z.infer<typeof difficultyEnum>;

// Define coding platform enum
export const platformEnum = z.enum(["LEETCODE", "CODECHEF", "CODEFORCES", "HACKERRANK", "OTHER"]);
export type Platform = z.infer<typeof platformEnum>;

// Define a topics table
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// Define the problems table
export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  platformId: text("platform_id"), // Problem ID on the platform (e.g., "#1" for LeetCode)
  platform: text("platform").notNull().$type<Platform>(),
  difficulty: text("difficulty").notNull().$type<Difficulty>(),
  dateSolved: date("date_solved").notNull(),
  notes: text("notes"),
  url: text("url"),
});

// Define problem topics (many-to-many relationship)
export const problemTopics = pgTable("problem_topics", {
  id: serial("id").primaryKey(),
  problemId: integer("problem_id").notNull(),
  topicName: text("topic_name").notNull(),
});

// Define schemas for data insertion
export const insertUserSchema = createInsertSchema(users);
export const insertProblemSchema = createInsertSchema(problems).omit({ id: true });
export const insertTopicSchema = createInsertSchema(topics).omit({ id: true });
export const insertProblemTopicSchema = createInsertSchema(problemTopics).omit({ id: true });

// Define types for the data models
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Problem = typeof problems.$inferSelect;
export type InsertProblem = typeof problems.$inferInsert;
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = typeof topics.$inferInsert;
export type ProblemTopic = typeof problemTopics.$inferSelect;
export type InsertProblemTopic = typeof problemTopics.$inferInsert;

// Extended schemas for UI validation
export const problemFormSchema = insertProblemSchema.extend({
  topics: z.array(z.string()).min(1, "Select at least one topic")
});

export type ProblemFormValues = z.infer<typeof problemFormSchema>;

// Stats schema
export const statsSchema = z.object({
  totalSolved: z.number(),
  currentStreak: z.number(),
  weeklyAverage: z.number().optional(),
  difficultyBreakdown: z.object({
    easy: z.number(),
    medium: z.number(),
    hard: z.number(),
  }),
  platformBreakdown: z.record(z.string(), z.number()),
  topicDistribution: z.array(z.object({
    name: z.string(),
    count: z.number(),
  })),
  dailyActivity: z.array(z.object({
    date: z.string(),
    count: z.number(),
  })),
  recentProblems: z.array(z.object({
    id: z.number(),
    title: z.string(),
    platformId: z.string().optional(),
    platform: z.string(),
    difficulty: z.string(),
    topics: z.array(z.string()),
    dateSolved: z.string(),
  })),
  progressData: z.array(z.object({
    date: z.string(),
    count: z.number(),
  })),
});

export type Stats = z.infer<typeof statsSchema>;
