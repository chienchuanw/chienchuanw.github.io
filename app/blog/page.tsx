"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import PostPreview from "@/app/blog/PostPreview";
import { Post } from "@/lib/store/useBlogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import * as clientPosts from "@/lib/client/posts";

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (page: number) => {
    try {
      const isInitialLoad = page === 1;
      if (isInitialLoad) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const { posts: fetchedPosts, total } = await clientPosts.fetchPosts({
        page,
        limit: 10,
        publishedOnly: true,
        orderBy: "updatedAt",
        orderDirection: "desc",
      });

      setPosts((prevPosts) => {
        const newPosts = isInitialLoad
          ? fetchedPosts
          : [...prevPosts, ...fetchedPosts];
        // Check if we've loaded all posts
        setHasMore(fetchedPosts.length === 10 && newPosts.length < total);
        return newPosts;
      });

      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isLoading
        ) {
          fetchPosts(currentPage + 1);
        }
      },
      { threshold: 0.5, rootMargin: "100px" }
    );

    const currentObserverTarget = observerTarget.current;
    if (currentObserverTarget) {
      observer.observe(currentObserverTarget);
    }

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [fetchPosts, currentPage, hasMore, isLoadingMore, isLoading]);

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-10">All Articles</h1>

      {/* Scroll to top button */}
      <ScrollToTop />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-10 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {posts.length === 0 && !isLoading && !error ? (
            <div className="py-10">
              <p className="text-center text-gray-500">No posts found.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {posts.map((post) => (
                <PostPreview
                  key={post.id}
                  title={post.title}
                  subtitle={post.subtitle || post.excerpt}
                  content={post.content}
                  slug={post.slug}
                  tags={post.tags}
                  date={new Date(
                    post.publishedAt || post.updatedAt || post.createdAt
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  coverImage={post.coverImage}
                />
              ))}
            </div>
          )}

          {/* Loading indicator and observer target */}
          <div ref={observerTarget} className="py-8">
            {isLoadingMore && (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
