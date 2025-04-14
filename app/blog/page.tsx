"use client";

import { useEffect, useState } from "react";
import PostPreview from "@/app/blog/PostPreview";
import { getAllPosts, Post } from "@/lib/posts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // 獲取所有已發布的文章並按更新日期排序
    async function fetchPosts() {
      try {
        const fetchedPosts = await getAllPosts();
        // Filter published posts and sort by update date
        const filteredAndSortedPosts = fetchedPosts
          .filter((post) => post.published)
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

        setPosts(filteredAndSortedPosts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    }

    fetchPosts();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-10">All Articles</h1>

      {posts.length === 0 ? (
        <div className="py-10 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-16">
          {posts.map((post) => (
            <PostPreview
              key={post.id}
              title={post.title}
              subtitle={post.subtitle || post.excerpt}
              content={post.content}
              slug={post.slug}
              tags={post.tags}
              date={new Date(
                post.publishedAt || post.updatedAt || post.createdAt
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              coverImage={post.coverImage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
