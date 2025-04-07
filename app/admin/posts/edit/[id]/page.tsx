'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { getPostById, updatePost, generateExcerpt } from '@/lib/posts';
import MarkdownEditor from '@/components/admin/markdown-editor';
import { useToast } from '@/components/ui/use-toast';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const postId = params.id as string;
  
  // 表單狀態
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 加載文章數據
  useEffect(() => {
    if (postId) {
      const post = getPostById(postId);
      if (post) {
        setTitle(post.title);
        setSlug(post.slug);
        setContent(post.content);
        setExcerpt(post.excerpt);
        setTags(post.tags.join(', '));
        setIsPublished(post.published);
        setIsLoading(false);
      } else {
        toast({
          title: '文章不存在',
          description: '找不到指定的文章',
          variant: 'destructive',
        });
        router.push('/admin/posts');
      }
    }
  }, [postId, router, toast]);
  
  // 自動生成摘要
  const handleGenerateExcerpt = () => {
    if (content) {
      setExcerpt(generateExcerpt(content));
    }
  };
  
  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 驗證必填欄位
      if (!title) {
        toast({
          title: '標題不能為空',
          description: '請填寫文章標題',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!content) {
        toast({
          title: '內容不能為空',
          description: '請填寫文章內容',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      // 準備標籤
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      
      // 準備摘要
      const finalExcerpt = excerpt || generateExcerpt(content);
      
      // 更新文章
      const updatedPost = updatePost(postId, {
        title,
        slug,
        content,
        excerpt: finalExcerpt,
        tags: tagArray,
        published: isPublished,
      });
      
      if (updatedPost) {
        toast({
          title: '文章已更新',
          description: isPublished ? '文章已發布' : '文章已保存為草稿',
        });
        
        // 導航到文章列表
        router.push('/admin/posts');
      } else {
        throw new Error('更新文章失敗');
      }
    } catch (error) {
      console.error('Submit error', error);
      toast({
        title: '保存失敗',
        description: '發生錯誤，請重試',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex justify-center items-center h-96">
            <p>載入中...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push('/admin/posts')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">編輯文章</h1>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={isPublished ? "default" : "secondary"}>
              {isPublished ? '已發布' : '草稿'}
            </Badge>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>文章基本資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">標題</Label>
                  <Input
                    id="title"
                    placeholder="輸入文章標題"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="slug">網址別名</Label>
                  <Input
                    id="slug"
                    placeholder="url-friendly-name"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    這將作為您文章的 URL 的一部分: /blog/{slug}
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="excerpt">摘要</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={handleGenerateExcerpt}
                    >
                      自動生成
                    </Button>
                  </div>
                  <Textarea
                    id="excerpt"
                    placeholder="簡短描述您的文章"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="tags">標籤</Label>
                  <Input
                    id="tags"
                    placeholder="標籤1, 標籤2, 標籤3"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    用逗號分隔多個標籤
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <Label htmlFor="published">發布文章</Label>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>文章內容</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="edit">
                  <div className="mb-4">
                    <TabsList>
                      <TabsTrigger value="edit">編輯</TabsTrigger>
                      <TabsTrigger value="preview">預覽</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="edit">
                    <MarkdownEditor
                      value={content}
                      onChange={setContent}
                      height={500}
                      preview="edit"
                    />
                  </TabsContent>
                  
                  <TabsContent value="preview">
                    <MarkdownEditor
                      value={content}
                      onChange={setContent}
                      height={500}
                      preview="preview"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/posts')}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>處理中...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存{isPublished ? '並發布' : '為草稿'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
