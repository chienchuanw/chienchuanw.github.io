"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { createPost, generateExcerpt, generateSlug } from "@/lib/posts";
import MarkdownEditor, {
  MarkdownPreview,
} from "@/components/admin/markdown-editor";
import BannerUploader from "@/components/admin/banner-uploader";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";

/**
 * 新增文章頁面
 * 提供建立新文章的完整功能，包含 Markdown 編輯器和預覽
 */
export default function NewPostPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('admin.posts');
  const { toast } = useToast();

  // 表單狀態管理
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState(
    "# Start writing your article\n\nYou can use Markdown syntax to edit your article."
  );
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postId, setPostId] = useState<number | undefined>(undefined);

  // 自動生成 URL slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  };

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
          title: "Title Cannot Be Empty",
          description: "Please enter a title for your article",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!content) {
        toast({
          title: "Content Cannot Be Empty",
          description: "Please enter content for your article",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // 處理標籤
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      // 準備摘要
      const finalExcerpt = excerpt || generateExcerpt(content);

      try {
        // 建立文章
        const newPost = await createPost({
          title,
          slug,
          subtitle,
          content,
          excerpt: finalExcerpt,
          coverImage: bannerImage || undefined,
          tags: tagArray,
          published: isPublished,
        });

        if (newPost) {
          setPostId(newPost.id);

          toast({
            title: "Article Saved",
            description: isPublished
              ? "Article has been published"
              : "Article has been saved as draft",
          });

          // 導航到文章列表
          router.push(`/${locale}/admin/posts`);
        }
      } catch (postError) {
        console.error("Error creating post:", postError);
        toast({
          title: "Save Failed",
          description:
            "Failed to create post. Please check your login status and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Submit error", error);
      toast({
        title: "Save Failed",
        description: "An error occurred, please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/${locale}/admin/posts`)}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Add New Article</h1>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={isPublished ? "success" : "secondary"}>
            {isPublished ? "Ready to Publish" : "Draft"}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter article title"
                  value={title}
                  onChange={handleTitleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  placeholder="url-friendly-name"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  This will be part of your article&apos;s URL: /blog/{slug}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  placeholder="A brief subtitle for your article"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  This will appear below the title on your article page
                </p>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateExcerpt}
                  >
                    Auto Generate
                  </Button>
                </div>
                <Textarea
                  id="excerpt"
                  placeholder="Brief description of your article"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="tag1, tag2, tag3"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Separate multiple tags with commas
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Banner Image</Label>
                <BannerUploader
                  postId={postId}
                  onImageChange={setBannerImage}
                />
                <p className="text-sm text-muted-foreground">
                  This image will be displayed at the top of your article
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="published">Publish Article</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Article Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="w-full">
                <div className="mb-2 font-medium">Edit</div>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  height={500}
                  preview="edit"
                  postId={postId}
                />
              </div>
              <div className="w-full">
                <div className="mb-2 font-medium">Preview</div>
                <div className="border rounded-md p-4 h-[500px] overflow-auto">
                  <MarkdownPreview content={content} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${locale}/admin/posts`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                Save{isPublished ? " and Publish" : " as Draft"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
