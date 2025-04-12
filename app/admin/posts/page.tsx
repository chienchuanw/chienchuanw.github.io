"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllPosts, deletePost, Post } from "@/lib/posts";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faEdit,
  faTrash,
  faEye,
  faPlus,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

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
      console.error("Failed to load posts", error);
      toast({
        title: "Failed to Load Posts",
        description: "Please refresh the page and try again",
        variant: "destructive",
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
        setPosts(posts.filter((post) => post.id !== id));
        toast({
          title: "Post Deleted",
          description: "The post has been successfully deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Delete Failed",
          description: "Unable to delete the post, please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete post error", error);
      toast({
        title: "Delete Failed",
        description: "An error occurred, please try again",
        variant: "destructive",
      });
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/dashboard")}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Post Management</h1>
        </div>
        <Button onClick={() => router.push("/admin/posts/new")}>
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" /> Add Post
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-40">
              <p className="text-muted-foreground mb-4">No posts available</p>
              <Button onClick={() => router.push("/admin/posts/new")}>
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />{" "}
                Create First Post
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Updated Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(post.createdAt)}</TableCell>
                    <TableCell>{formatDate(post.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className="h-4 w-4"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/posts/edit/${post.id}`)
                            }
                          >
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="h-4 w-4 mr-2"
                            />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(`/blog/${post.slug}`, "_blank")
                            }
                          >
                            <FontAwesomeIcon
                              icon={faEye}
                              className="h-4 w-4 mr-2"
                            />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(post.id)}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="h-4 w-4 mr-2"
                            />
                            Delete
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
  );
}
