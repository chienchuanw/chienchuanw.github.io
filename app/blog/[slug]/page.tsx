"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPostBySlug, Post } from "@/lib/posts";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";

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
      <div className="container mx-auto py-20 text-center">
        <p>Loading...</p>
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
            className="inline-flex items-center text-blue-600 hover:underline"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-1" /> Back
            to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-neutral-600 hover:text-neutral-900"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-1" /> Back
          to Articles
        </Link>
      </div>

      <article className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-neutral-100 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="text-neutral-500 text-sm">
            Published on {new Date(post.createdAt).toLocaleDateString("en-US")}
            {post.updatedAt !== post.createdAt && (
              <span>
                , Updated on{" "}
                {new Date(post.updatedAt).toLocaleDateString("en-US")}
              </span>
            )}
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
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
                  (child) => typeof child === "string" && child.includes("```")
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
    </div>
  );
}
