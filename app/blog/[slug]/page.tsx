'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAllPosts, Post } from '@/lib/posts';
import Link from 'next/link';
// 移除 Lucide React 圖標
// import { ArrowLeft } from 'lucide-react';
// 引入 Font Awesome 圖標
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// 可選：引入 Markdown 渲染庫
// 這裡假設您使用 react-markdown，您需要安裝此套件：
// npm install react-markdown
// import ReactMarkdown from 'react-markdown';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || typeof slug !== 'string') {
      setError('無效的文章 URL');
      setLoading(false);
      return;
    }

    // 從本地儲存中獲取文章
    const posts = getAllPosts();
    const foundPost = posts.find(p => p.slug === slug && p.published);

    if (foundPost) {
      setPost(foundPost);
    } else {
      setError('找不到文章');
    }

    setLoading(false);
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
        <h2 className="text-2xl font-medium">{error || '找不到文章'}</h2>
        <div className="mt-6">
          <Link href="/blog" className="inline-flex items-center text-blue-600 hover:underline">
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-1" /> 返回文章列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link href="/blog" className="inline-flex items-center text-neutral-600 hover:text-neutral-900">
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-1" /> 返回文章列表
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
            發佈於 {new Date(post.createdAt).toLocaleDateString('zh-TW')}
            {post.updatedAt !== post.createdAt && (
              <span>
                ，更新於 {new Date(post.updatedAt).toLocaleDateString('zh-TW')}
              </span>
            )}
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          {/* 如果使用 ReactMarkdown，可以替換下面的 pre 標籤 */}
          {/* <ReactMarkdown>{post.content}</ReactMarkdown> */}
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {post.content}
          </pre>
        </div>
      </article>
    </div>
  );
}
