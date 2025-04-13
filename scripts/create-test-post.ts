import { config } from "dotenv";
import { join } from "path";
import * as fs from "fs";

// Load environment variables first, before importing any other modules
const envPath = join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from: ${envPath}`);
  config({ path: envPath });
} else {
  console.error(`Environment file not found: ${envPath}`);
  process.exit(1);
}

// Set DATABASE_URL explicitly
process.env.DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/db_blog";

// Now import modules that depend on environment variables
import { postService } from "../lib/services/post-service";

async function createTestPost() {
  try {
    console.log("Creating test post...");

    // Create a test post
    const post = await postService.create({
      title: "Test Post",
      slug: "test-post-" + Date.now(),
      content: "This is a test post content.",
      excerpt: "Test excerpt",
      tags: ["test", "debug"],
      published: true,
      authorId: 2, // Use the user ID we created earlier
    });

    console.log("Test post created successfully:", post);
    process.exit(0);
  } catch (error) {
    console.error("Failed to create test post:", error);
    process.exit(1);
  }
}

createTestPost();
