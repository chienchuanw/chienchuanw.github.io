"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPostBySlug, Post } from "@/lib/posts";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";

// Dynamically import ReactMarkdown for rendering
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
const RemarkGfm = dynamic(
  () => import("remark-gfm").then((mod) => mod.default),
  { ssr: false }
);

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || typeof slug !== "string") {
      setError("無效的文章 URL");
      setLoading(false);
      return;
    }

    // 從數據庫獲取文章
    async function fetchPost() {
      try {
        const foundPost = await getPostBySlug(slug);

        if (foundPost && foundPost.published) {
          setPost(foundPost);
        } else {
          setError("找不到文章");
        }
      } catch (error) {
        console.error(`Failed to fetch post with slug ${slug}:`, error);
        setError("加載文章時發生錯誤");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p>載入中...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-medium">{error || "找不到文章"}</h2>
        <div className="mt-6">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:underline"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-1" />{" "}
            返回文章列表
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
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-1" />{" "}
          返回文章列表
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
            發佈於 {new Date(post.createdAt).toLocaleDateString("zh-TW")}
            {post.updatedAt !== post.createdAt && (
              <span>
                ，更新於 {new Date(post.updatedAt).toLocaleDateString("zh-TW")}
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
                      className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
                    <code className="text-sm" {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              // Handle HTML in markdown, including videos
              p: ({ children, ...props }) => {
                // Check if the paragraph contains a video element
                const childrenArray = React.Children.toArray(children);
                const hasVideo = childrenArray.some(
                  (child) =>
                    typeof child === "string" && child.includes("<video")
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

                return <p {...props}>{children}</p>;
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
