import { create } from 'zustand';

// 定義文章類型
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  authorId: number;
  authorName?: string;
}

// 定義部落格狀態
interface BlogState {
  posts: Post[];
  selectedPost: Post | null;
  isLoading: boolean;
  error: string | null;
  
  // 操作方法
  setPosts: (posts: Post[]) => void;
  selectPost: (post: Post | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addPost: (post: Post) => void;
  updatePost: (updatedPost: Post) => void;
  removePost: (postId: number) => void;
}

// 創建 Zustand store
const useBlogStore = create<BlogState>((set) => ({
  posts: [],
  selectedPost: null,
  isLoading: false,
  error: null,
  
  setPosts: (posts) => set({ posts }),
  selectPost: (post) => set({ selectedPost: post }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  addPost: (post) => set((state) => ({ 
    posts: [...state.posts, post] 
  })),
  
  updatePost: (updatedPost) => set((state) => ({ 
    posts: state.posts.map((post) => 
      post.id === updatedPost.id ? updatedPost : post
    ),
    selectedPost: state.selectedPost?.id === updatedPost.id 
      ? updatedPost 
      : state.selectedPost
  })),
  
  removePost: (postId) => set((state) => ({ 
    posts: state.posts.filter((post) => post.id !== postId),
    selectedPost: state.selectedPost?.id === postId 
      ? null 
      : state.selectedPost
  })),
}));

export default useBlogStore;
