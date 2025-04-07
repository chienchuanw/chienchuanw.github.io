'use client';

import { useEffect, useState } from 'react';
import PostPreview from "@/app/blog/PostPreview";
import { getAllPosts, Post } from "@/lib/posts";

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // 獲取所有已發布的文章並按更新日期排序
    const fetchedPosts = getAllPosts()
      .filter(post => post.published)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    setPosts(fetchedPosts);
  }, []);

  if (posts.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-medium">目前還沒有發布的文章</h2>
        <p className="mt-4 text-neutral-600">文章將很快上線，請稍後再來查看</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
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
  );
}
