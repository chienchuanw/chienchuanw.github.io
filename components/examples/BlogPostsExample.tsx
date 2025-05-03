'use client';

import React, { useState } from 'react';
import { usePosts } from '@/hooks/swr/usePosts';
import useBlogStore, { Post } from '@/lib/store/useBlogStore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function BlogPostsExample() {
  const [page, setPage] = useState(1);
  const { posts, totalPosts, isLoading, error, mutate } = usePosts(page);
  const selectedPost = useBlogStore((state) => state.selectedPost);
  const selectPost = useBlogStore((state) => state.selectPost);

  // 處理頁面變更
  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setPage((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // 處理文章選擇
  const handleSelectPost = (post: Post) => {
    selectPost(post);
  };

  // 處理刷新
  const handleRefresh = () => {
    mutate();
  };

  // 如果正在加載
  if (isLoading) {
    return <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">載入文章中...</div>;
  }

  // 如果發生錯誤
  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg text-red-800 dark:text-red-100">
        發生錯誤：{error.message}
        <Button variant="secondary" className="mt-2" onClick={handleRefresh}>
          重試
        </Button>
      </div>
    );
  }

  // 如果沒有文章
  if (!posts || posts.length === 0) {
    return <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">尚無文章</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium">部落格文章</h3>
        <Button variant="outline" onClick={handleRefresh}>
          刷新
        </Button>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
              selectedPost?.id === post.id
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : ''
            }`}
            onClick={() => handleSelectPost(post)}
          >
            <h4 className="font-medium">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h4>
            {post.excerpt && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>作者: {post.authorName || '未知'}</span>
              <span>
                {new Date(post.createdAt).toLocaleDateString('zh-TW')}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={handlePrevPage}
          disabled={page === 1}
        >
          上一頁
        </Button>
        <span>
          第 {page} 頁 / 共 {Math.ceil(totalPosts / 10)} 頁
        </span>
        <Button
          variant="outline"
          onClick={handleNextPage}
          disabled={page >= Math.ceil(totalPosts / 10)}
        >
          下一頁
        </Button>
      </div>
    </div>
  );
}
