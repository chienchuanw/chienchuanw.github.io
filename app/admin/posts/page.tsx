'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllPosts, deletePost, Post } from '@/lib/posts';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Edit, Trash, Eye, Plus, ArrowLeft } from 'lucide-react';

export default function PostsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加載所有文章
  useEffect(() => {
    try {
      const allPosts = getAllPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Failed to load posts', error);
      toast({
        title: '載入文章失敗',
        description: '請刷新頁面重試',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // 刪除文章
  const handleDelete = (id: string) => {
    try {
      const success = deletePost(id);
      if (success) {
        setPosts(posts.filter(post => post.id !== id));
        toast({
          title: '文章已刪除',
          description: '文章已成功刪除',
        });
      } else {
        toast({
          title: '刪除失敗',
          description: '無法刪除文章，請重試',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Delete post error', error);
      toast({
        title: '刪除失敗',
        description: '發生錯誤，請重試',
        variant: 'destructive',
      });
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => router.push('/admin/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">文章管理</h1>
          </div>
          <Button 
            onClick={() => router.push('/admin/posts/new')}
          >
            <Plus className="h-4 w-4 mr-2" /> 新增文章
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p>載入中...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-40">
                <p className="text-muted-foreground mb-4">目前沒有文章</p>
                <Button onClick={() => router.push('/admin/posts/new')}>
                  <Plus className="h-4 w-4 mr-2" /> 建立第一篇文章
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">標題</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>建立日期</TableHead>
                    <TableHead>更新日期</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <Badge variant={post.published ? "default" : "secondary"}>
                          {post.published ? '已發布' : '草稿'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(post.createdAt)}</TableCell>
                      <TableCell>{formatDate(post.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/posts/edit/${post.id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              編輯
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                              <Eye className="h-4 w-4 mr-2" />
                              查看
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(post.id)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              刪除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
