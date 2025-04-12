'use client';

import { useEffect, useState } from 'react';
import PostPreview from "@/app/blog/PostPreview";
import { getAllPosts, Post } from "@/lib/posts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Mail, Linkedin } from "lucide-react";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // 獲取所有已發布的文章並按更新日期排序
    const fetchedPosts = getAllPosts()
      .filter(post => post.published)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    setPosts(fetchedPosts);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-grow">
        {posts.length === 0 ? (
          <div className="container mx-auto py-20 text-center">
            <h2 className="text-2xl font-medium">目前還沒有發布的文章</h2>
            <p className="mt-4 text-neutral-600">文章將很快上線，請稍後再來查看</p>
          </div>
        ) : (
          <div className="container mx-auto py-10">
            <h2 className="text-3xl font-bold mb-10">最新文章</h2>
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
      </main>
      
      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Chien Chuan W. All rights reserved.
            </p>
            
            <div className="flex gap-4">
              <a href="https://github.com/chienchuanw" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/in/chienchuanw" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:contact@chienchuan.com" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}