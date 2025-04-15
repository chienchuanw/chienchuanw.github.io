-- Create contact_info table
CREATE TABLE IF NOT EXISTS "contact_info" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(100) NOT NULL,
  "title" varchar(255) NOT NULL,
  "bio" text NOT NULL,
  "email" varchar(255) NOT NULL,
  "github" varchar(255),
  "linkedin" varchar(255),
  "skills" json DEFAULT '[]'::json,
  "avatar_url" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Insert default data
INSERT INTO "contact_info" (
  "name", 
  "title", 
  "bio", 
  "email", 
  "github", 
  "linkedin", 
  "skills", 
  "avatar_url"
) VALUES (
  'Chien Chuan W',
  'Web Developer',
  'Web Developer specializing in Python and TypeScript. Currently working with Ruby on Rails.',
  'contact@chienchuan.com',
  'https://github.com/chienchuanw',
  'https://linkedin.com/in/chienchuanw',
  '["TypeScript", "Python", "Ruby on Rails", "Next.js"]',
  '/images/avatar.jpg'
) ON CONFLICT DO NOTHING;