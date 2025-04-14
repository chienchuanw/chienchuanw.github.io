"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPostBySlug, Post } from "@/lib/posts";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { PostDetails } from "@/components/blog/post-details";
import { PostSkeleton } from "@/components/blog/post-skeleton";
import { calculateReadingTime } from "@/lib/utils/reading-time";

// Dynamically import ReactMarkdown for rendering
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

// Import remark-gfm plugin for GitHub Flavored Markdown
// This plugin adds support for tables, strikethrough, tasklists, and URLs
const RemarkGfm = dynamic(
  () => import("remark-gfm").then((mod) => mod.default),
  { ssr: false }
);

// Helper function to detect strikethrough text
const processStrikethrough = (text: string) => {
  // Match text between ~~ and ~~ (strikethrough in markdown)
  const strikethroughRegex = /~~([^~]+)~~/g;
  return text.replace(strikethroughRegex, "<del>$1</del>");
};

// Helper function to detect code blocks
const processCodeBlocks = (text: string) => {
  // Match code blocks with backticks
  const codeBlockRegex = /```([a-z]*)?\n([\s\S]*?)```/g;
  return text.replace(codeBlockRegex, (_match, language, code) => {
    const lang = language || "";
    // Return a placeholder that will be replaced with the actual syntax highlighter component
    return `<div data-syntax-highlight="true" data-language="${lang}">${code}</div>`;
  });
};

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || typeof slug !== "string") {
      setError("Invalid article URL");
      setLoading(false);
      return;
    }

    // Fetch post from database
    async function fetchPost() {
      try {
        // Ensure slug is a string
        const slugString = Array.isArray(slug) ? slug[0] : slug;
        // TypeScript check to ensure slugString is not undefined
        if (!slugString) {
          setError("Invalid article URL");
          return;
        }
        const foundPost = await getPostBySlug(slugString);

        if (foundPost && foundPost.published) {
          setPost(foundPost);
        } else {
          setError("Article not found");
        }
      } catch (error) {
        console.error(`Failed to fetch post with slug ${slug}:`, error);
        setError("Error loading article");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Articles
          </Link>
        </div>
        <PostSkeleton />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-medium">{error || "Article not found"}</h2>
        <div className="mt-6">
          <Link
            href="/blog"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  // Format date for display - ensure it's done client-side to avoid hydration issues
  const formattedDate = new Date(
    post.updatedAt || post.createdAt
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate reading time - ensure consistent calculation between server and client
  const readingTime = calculateReadingTime(post.content || "");

  // Get first tag as category (if available)
  const category =
    post.tags && post.tags.length > 0 ? post.tags[0] : "Uncategorized";

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Articles
        </Link>
      </div>

      {/* Banner image - full width at the top */}
      {post.coverImage ? (
        <div className="-mx-4 md:-mx-6 mb-10 relative h-[50vh] min-h-[400px] max-h-[600px]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex flex-col justify-end p-6 md:p-10">
            <div className="text-center">
              <div className="text-sm text-neutral-200 uppercase tracking-wider mb-2">
                {formattedDate}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-white drop-shadow-sm">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-lg text-neutral-200 max-w-2xl mx-auto">
                  {post.excerpt}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Date at the top */}
          <div className="text-center mb-4 text-sm text-neutral-500 uppercase tracking-wider">
            {formattedDate}
          </div>

          {/* Title and subtitle */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                {post.excerpt}
              </p>
            )}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main content */}
        <article className="lg:col-span-2">
          <div
            className="prose prose-lg max-w-none w-full markdown-body"
            data-color-mode="light"
          >
            <ReactMarkdown
              // @ts-expect-error - Type issues with remarkPlugins
              remarkPlugins={[RemarkGfm]}
              components={{
                // Custom rendering for images
                img: ({ ...props }) => {
                  return (
                    <img
                      src={props.src || ""}
                      alt={props.alt || ""}
                      className="max-w-full h-auto rounded-md"
                    />
                  );
                },
                // Custom rendering for links
                a: ({ ...props }) => {
                  return (
                    <a
                      href={props.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {props.children}
                    </a>
                  );
                },
                // Custom rendering for code blocks
                code: ({ className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match && (props.inline || false);

                  if (isInline) {
                    return (
                      <code
                        className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  // Use SyntaxHighlighter for code blocks
                  const language = match ? match[1] : "";
                  return (
                    <SyntaxHighlighter
                      language={language}
                      style={tomorrow}
                      className="rounded-md overflow-auto my-4 text-sm"
                      customStyle={{
                        padding: "1rem",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem", // 14px
                        lineHeight: "1.5",
                      }}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  );
                },
                // Handle HTML in markdown, including videos and strikethrough
                p: ({ children, ...props }) => {
                  // Check if the paragraph contains a video element
                  const childrenArray = React.Children.toArray(children);
                  const hasVideo = childrenArray.some(
                    (child) =>
                      typeof child === "string" && child.includes("<video")
                  );

                  // Check if the paragraph contains strikethrough text
                  const hasStrikethrough = childrenArray.some(
                    (child) => typeof child === "string" && child.includes("~~")
                  );

                  // Check if the paragraph contains code blocks
                  const hasCodeBlock = childrenArray.some(
                    (child) =>
                      typeof child === "string" && child.includes("```")
                  );

                  if (hasVideo) {
                    // Extract video HTML and render it
                    const videoHtml = childrenArray
                      .map((child) => (typeof child === "string" ? child : ""))
                      .join("");
                    return (
                      <div dangerouslySetInnerHTML={{ __html: videoHtml }} />
                    );
                  }

                  if (hasCodeBlock) {
                    // Process code blocks
                    const processedHtml = childrenArray
                      .map((child) => {
                        if (typeof child === "string") {
                          return processCodeBlocks(child);
                        }
                        return "";
                      })
                      .join("");

                    // Create a temporary div to parse the HTML
                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = processedHtml;

                    // Find all syntax highlight placeholders
                    const syntaxHighlightElements = tempDiv.querySelectorAll(
                      '[data-syntax-highlight="true"]'
                    );

                    if (syntaxHighlightElements.length > 0) {
                      // If we have syntax highlight elements, render them with SyntaxHighlighter
                      return (
                        <>
                          {Array.from(syntaxHighlightElements).map(
                            (element, index) => {
                              const language =
                                element.getAttribute("data-language") || "";
                              const code = element.textContent || "";

                              return (
                                <SyntaxHighlighter
                                  key={index}
                                  language={language}
                                  style={tomorrow}
                                  className="rounded-md overflow-auto my-4 text-sm"
                                  customStyle={{
                                    padding: "1rem",
                                    borderRadius: "0.375rem",
                                    fontSize: "0.875rem", // 14px
                                    lineHeight: "1.5",
                                  }}
                                >
                                  {code.trim()}
                                </SyntaxHighlighter>
                              );
                            }
                          )}
                        </>
                      );
                    }

                    // Fallback to the original approach
                    return (
                      <div
                        {...props}
                        dangerouslySetInnerHTML={{ __html: processedHtml }}
                      />
                    );
                  }

                  if (hasStrikethrough) {
                    // Process strikethrough text
                    const processedHtml = childrenArray
                      .map((child) => {
                        if (typeof child === "string") {
                          return processStrikethrough(child);
                        }
                        return "";
                      })
                      .join("");
                    return (
                      <p
                        {...props}
                        dangerouslySetInnerHTML={{ __html: processedHtml }}
                      />
                    );
                  }

                  return <p {...props}>{children}</p>;
                },
                // Add explicit support for del (strikethrough)
                del: ({ children }) => {
                  return <del className="line-through">{children}</del>;
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Sidebar */}
        <aside>
          <PostDetails
            date={formattedDate}
            category={category}
            readingTime={readingTime}
            author={{
              name: post.authorName || "Admin",
              role: "Content Writer",
            }}
          />
        </aside>
      </div>
    </div>
  );
}
