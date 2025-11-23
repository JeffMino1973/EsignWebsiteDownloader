import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Download jobs schema
export const downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  status: text("status").notNull().default("pending"), // pending, downloading, completed, error
  totalFiles: integer("total_files").default(0),
  downloadedFiles: integer("downloaded_files").default(0),
  fileSize: integer("file_size").default(0), // in bytes
  error: text("error"),
  zipPath: text("zip_path"),
  files: jsonb("files").default([]), // array of file paths
  crawlDepth: integer("crawl_depth").default(0), // 0 = single page, 1-5 = follow links
  maxPages: integer("max_pages").default(50), // maximum pages to download
  totalPages: integer("total_pages").default(1), // total pages discovered/downloaded
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertDownloadSchema = createInsertSchema(downloads).pick({
  url: true,
}).extend({
  url: z.string().url({ message: "Please enter a valid URL" }),
  crawlDepth: z.number().min(0).max(5).optional().default(0),
  maxPages: z.number().min(1).max(500).optional().default(50),
});

export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;

// File structure for display
export type FileNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  size?: number;
  children?: FileNode[];
};
