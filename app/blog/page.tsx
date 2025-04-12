"use client";

import { useEffect, useState } from "react";
import PostPreview from "@/app/blog/PostPreview";
import { getAllPosts, Post } from "@/lib/posts";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // 獲取所有已發布的文章並按更新日期排序
    const fetchedPosts = getAllPosts()
      .filter((post) => post.published)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

    setPosts(fetchedPosts);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-10">所有文章</h1>

      {posts.length === 0 ? (
        <div className="py-10 text-center">
          <h2 className="text-2xl font-medium">目前還沒有發布的文章</h2>
          <p className="mt-4 text-neutral-600">
            文章將很快上線，請稍後再來查看
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {posts.map((post) => (
            <PostPreview
              key={post.id}
              title={post.title}
              subtitle={post.excerpt}
              content={post.content}
              slug={post.slug}
              tags={post.tags}
            />
          ))}
        </div>
      )}
    </div>
  );
}
