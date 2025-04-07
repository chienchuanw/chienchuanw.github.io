// 文章資料模型
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// 本地存儲的 mock 文章資料
const POSTS_STORAGE_KEY = 'blog_posts';

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 生成 URL 友好的 slug
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 創建新文章
export function createPost(postData: Partial<Post>): Post {
  const now = new Date().toISOString();
  
  const newPost: Post = {
    id: generateId(),
    title: postData.title || '未命名文章',
    slug: postData.slug || generateSlug(postData.title || '未命名文章'),
    content: postData.content || '',
    excerpt: postData.excerpt || '',
    tags: postData.tags || [],
    published: postData.published || false,
    coverImage: postData.coverImage,
    createdAt: now,
    updatedAt: now,
  };
  
  // 獲取現有文章
  const posts = getAllPosts();
  
  // 添加新文章
  posts.push(newPost);
  
  // 保存回本地存儲
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  
  return newPost;
}

// 獲取所有文章
export function getAllPosts(): Post[] {
  // 檢查是否在瀏覽器環境中運行
  if (typeof window === 'undefined') {
    return [];
  }
  
  // 嘗試從 localStorage 獲取文章
  try {
    const postsJson = localStorage.getItem(POSTS_STORAGE_KEY);
    if (!postsJson) {
      return [];
    }
    return JSON.parse(postsJson);
  } catch (e) {
    console.error('Failed to parse posts from localStorage', e);
    return [];
  }
}

// 通過 ID 獲取特定文章
export function getPostById(id: string): Post | null {
  const posts = getAllPosts();
  return posts.find(post => post.id === id) || null;
}

// 通過 slug 獲取特定文章
export function getPostBySlug(slug: string): Post | null {
  const posts = getAllPosts();
  return posts.find(post => post.slug === slug) || null;
}

// 更新文章
export function updatePost(id: string, updates: Partial<Post>): Post | null {
  const posts = getAllPosts();
  const postIndex = posts.findIndex(post => post.id === id);
  
  if (postIndex === -1) {
    return null;
  }
  
  // 更新文章
  const updatedPost = {
    ...posts[postIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  posts[postIndex] = updatedPost;
  
  // 保存回本地存儲
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  
  return updatedPost;
}

// 刪除文章
export function deletePost(id: string): boolean {
  const posts = getAllPosts();
  const filteredPosts = posts.filter(post => post.id !== id);
  
  if (filteredPosts.length === posts.length) {
    return false; // 沒有找到要刪除的文章
  }
  
  // 保存回本地存儲
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(filteredPosts));
  
  return true;
}

// 從文章內容生成摘要
export function generateExcerpt(content: string, maxLength: number = 150): string {
  // 去除 Markdown 語法
  const plainText = content
    .replace(/#+\s+/g, '') // 去除標題
    .replace(/\*\*|\*|~~|`/g, '') // 去除粗體、斜體、刪除線、行內代碼
    .replace(/!?\[([^\]]+)\]\([^)]+\)/g, '$1') // 替換圖片和連結為文本
    .replace(/```[\s\S]*?```/g, '') // 去除代碼塊
    .replace(/>\s[^\n]*/g, ''); // 去除引用
  
  // 截斷並添加省略號
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength).trim() + '...';
}
