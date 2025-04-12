import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  boolean,
} from "drizzle-orm/pg-core";

// 用戶表
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  displayName: varchar("full_name", { length: 100 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 會話表 - 用於記錄用戶登入會話
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id")
    .references(() => users.id)
    .notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 導出類型定義，用於TypeScript類型安全
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
