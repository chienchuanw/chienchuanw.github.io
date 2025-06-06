"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from 'next-intl';
import { getAllPosts, deletePost, Post } from "@/lib/posts";

// UI Components
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faEye,
  faPlus,
  faArrowLeft,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";

// Lucide Icons
import { MoreHorizontal } from "lucide-react";

export default function PostsPage() {
  const router = useRouter();
  const locale = useLocale();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Post | null>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [postsPerPage] = useState<number>(10);

  // Load all posts
  useEffect(() => {
    async function fetchPosts() {
      try {
        const allPosts = await getAllPosts();
        setPosts(allPosts);
      } catch (error) {
        console.error("Failed to load posts", error);
        toast({
          title: "Load Error",
          description: "Failed to load posts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [toast]);

  // Handle post deletion
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const success = await deletePost(id);
        if (success) {
          setPosts(posts.filter((post) => post.id !== id));
          toast({
            title: "Post Deleted",
            description: "The post has been successfully deleted.",
          });
        } else {
          toast({
            title: "Delete Failed",
            description: "Failed to delete the post.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Delete post error", error);
        toast({
          title: "Delete Failed",
          description: "An error occurred while deleting the post.",
          variant: "destructive",
        });
      }
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'tw' ? 'zh-TW' : 'en-US', {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle sorting
  const handleSort = (field: keyof Post) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    // First filter by search term and status
    let filtered = [...posts];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(lowerSearchTerm) ||
          post.content.toLowerCase().includes(lowerSearchTerm) ||
          post.tags?.some((tag) =>
            tag.toLowerCase().includes(lowerSearchTerm)
          ) ||
          false
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((post) =>
        statusFilter === "published" ? post.published : !post.published
      );
    }

    // Then sort
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        // Handle date fields (createdAt, updatedAt, publishedAt)
        if (
          sortField === "createdAt" ||
          sortField === "updatedAt" ||
          sortField === "publishedAt"
        ) {
          // Handle null values for publishedAt
          if (sortField === "publishedAt") {
            if (!aValue && !bValue) return 0;
            if (!aValue) return sortDirection === "asc" ? 1 : -1;
            if (!bValue) return sortDirection === "asc" ? -1 : 1;
          }

          const dateA = new Date(aValue as string).getTime();
          const dateB = new Date(bValue as string).getTime();

          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        }

        // Handle string fields
        if (typeof aValue === "string" && typeof bValue === "string") {
          if (sortDirection === "asc") {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        }

        return 0;
      });
    }

    return filtered;
  }, [posts, searchTerm, sortField, sortDirection, statusFilter]);

  // Paginate posts
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredAndSortedPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredAndSortedPosts, currentPage, postsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);

  // Generate pagination items
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <PaginationItem key={i}>
        <PaginationLink
          isActive={currentPage === i}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

  // Render sort icon
  const renderSortIcon = (field: keyof Post) => {
    if (sortField !== field)
      return (
        <FontAwesomeIcon
          icon={faSort}
          className="ml-1 h-3 w-3 text-muted-foreground"
        />
      );
    return sortDirection === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="ml-1 h-3 w-3" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="ml-1 h-3 w-3" />
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/${locale}/admin/dashboard`)}
            className="md:mr-2"
            aria-label="Back to Dashboard"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">Posts</h1>
        </div>
        <Button onClick={() => router.push(`/${locale}/admin/posts/new`)}>
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" /> Add Post
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Manage Posts</CardTitle>
          <CardDescription>
            Create, edit, and manage your blog posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
              />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[130px] relative pl-11 h-9 border-none shadow-none"
                  >
                    <FontAwesomeIcon
                      icon={faFilter}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4"
                    />
                    <span className="truncate">
                      {statusFilter === "all"
                        ? "All Status"
                        : statusFilter === "published"
                        ? "Published"
                        : "Draft"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("published")}
                  >
                    Published
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                    Draft
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-[300px]" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : filteredAndSortedPosts.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12">
              <p className="text-muted-foreground mb-4">No posts available</p>
              <Button onClick={() => router.push(`/${locale}/admin/posts/new`)}>
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop view - Table */}
              <div className="rounded-md border hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="w-[300px] cursor-pointer"
                        onClick={() => handleSort("title")}
                      >
                        Post Title {renderSortIcon("title")}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead
                        className="cursor-pointer hidden lg:table-cell"
                        onClick={() => handleSort("createdAt")}
                      >
                        Created Date {renderSortIcon("createdAt")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hidden lg:table-cell"
                        onClick={() => handleSort("publishedAt")}
                      >
                        Published Date {renderSortIcon("publishedAt")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("updatedAt")}
                      >
                        Updated Date {renderSortIcon("updatedAt")}
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">
                          <a
                            href={`/${locale}/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline cursor-pointer"
                          >
                            {post.title}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={post.published ? "success" : "secondary"}
                          >
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {formatDate(post.createdAt)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {post.publishedAt
                            ? formatDate(post.publishedAt)
                            : "-"}
                        </TableCell>
                        <TableCell>{formatDate(post.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div
                                className="inline-flex items-center justify-center h-9 w-9 rounded-md text-sm transition-colors hover:bg-accent cursor-pointer"
                                style={{
                                  WebkitTapHighlightColor: "transparent",
                                }}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/${locale}/admin/posts/edit/${post.id}`)
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
                                  window.open(`/${locale}/blog/${post.slug}`, "_blank")
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faEye}
                                  className="h-4 w-4 mr-2"
                                />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
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
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
