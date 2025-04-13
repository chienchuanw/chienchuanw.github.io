"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getPostById, updatePost, generateExcerpt } from "@/lib/posts";
import MarkdownEditor from "@/components/admin/markdown-editor";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";
import { Badge } from "@/components/ui/badge";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const postId = parseInt(params.id as string);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load post data
  useEffect(() => {
    async function fetchPost() {
      if (postId) {
        try {
          const post = await getPostById(postId);
          if (post) {
            setTitle(post.title);
            setSlug(post.slug);
            setContent(post.content);
            setExcerpt(post.excerpt || "");
            setTags(post.tags?.join(", ") || "");
            setIsPublished(post.published);
          } else {
            toast({
              title: "Article Not Found",
              description: "The specified article could not be found",
              variant: "destructive",
            });
            router.push("/admin/posts");
          }
        } catch (error) {
          console.error(`Failed to fetch post with ID ${postId}:`, error);
          toast({
            title: "Error Loading Article",
            description: "Failed to load the article. Please try again.",
            variant: "destructive",
          });
          router.push("/admin/posts");
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchPost();
  }, [postId, router, toast]);

  // Auto-generate excerpt
  const handleGenerateExcerpt = () => {
    if (content) {
      setExcerpt(generateExcerpt(content));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
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

      // Prepare tags
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      // Prepare excerpt
      const finalExcerpt = excerpt || generateExcerpt(content);

      try {
        // Update post
        const updatedPost = await updatePost(postId, {
          title,
          slug,
          content,
          excerpt: finalExcerpt,
          tags: tagArray,
          published: isPublished,
        });

        if (updatedPost) {
          toast({
            title: "Article Updated",
            description: isPublished
              ? "Article has been published"
              : "Article has been saved as draft",
          });

          // Navigate to post list
          router.push("/admin/posts");
        } else {
          throw new Error("Failed to update article");
        }
      } catch (postError) {
        console.error("Error updating post:", postError);
        toast({
          title: "Update Failed",
          description:
            "Failed to update post. Please check your login status and try again.",
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex justify-center items-center h-96">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/posts")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Article</h1>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={isPublished ? "default" : "secondary"}>
            {isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter article title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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

          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="edit">
                <div className="mb-4">
                  <TabsList>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="edit">
                  <MarkdownEditor
                    value={content}
                    onChange={setContent}
                    height={500}
                    preview="edit"
                    postId={postId}
                  />
                </TabsContent>

                <TabsContent value="preview">
                  <MarkdownEditor
                    value={content}
                    onChange={setContent}
                    height={500}
                    preview="preview"
                    postId={postId}
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
            onClick={() => router.push("/admin/posts")}
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
