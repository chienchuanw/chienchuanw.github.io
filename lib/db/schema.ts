import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  boolean,
  integer,
  json,
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

// 文章表 - 用於存儲博客文章
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  subtitle: text("subtitle"),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: varchar("cover_image", { length: 255 }),
  tags: json("tags").$type<string[]>().default([]),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  authorId: integer("author_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 媒體文件表 - 用於存儲上傳的圖片、視頻等媒體文件
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(), // 文件大小（字節）
  path: varchar("path", { length: 255 }).notNull(), // 存儲路徑
  url: varchar("url", { length: 255 }).notNull(), // 訪問URL
  postId: integer("post_id").references(() => posts.id), // 關聯的文章ID（可選）
  authorId: integer("author_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 導出類型定義，用於TypeScript類型安全
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

// Base Post type from database schema
export type PostBase = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

// Extended Post type with additional fields
export interface Post extends PostBase {
  authorName?: string;
}

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
