import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

type PostPreviewProps = {
  title: string;
  subtitle?: string;
  content: string;
  slug: string;
  tags?: string[];
  date?: string;
  coverImage?: string;
};

const PostPreview: React.FC<PostPreviewProps> = ({
  title,
  subtitle,
  content,
  slug,
  tags = [],
  date,
  coverImage,
}) => {
  // Extract a short preview from content (first 150 characters)
  const contentPreview =
    content.length > 150 ? content.substring(0, 150).trim() + "..." : content;

  return (
    <article>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Content */}
        <div className="md:col-span-2 space-y-4">
          {/* Date above title */}
          {date && <div className="text-sm text-neutral-500">{date}</div>}

          <h2 className="text-3xl font-bold tracking-tight">
            <Link href={`/blog/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h2>

          {/* Tags underneath the title */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {tags.length > 0 &&
              tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="rounded-sm">
                  {tag}
                </Badge>
              ))}
          </div>

          {subtitle && <p className="text-neutral-600 italic">{subtitle}</p>}

          <p className="text-neutral-700">{contentPreview}</p>

          <div className="pt-4">
            <Link
              href={`/blog/${slug}`}
              className="inline-flex items-center text-sm font-medium text-neutral-900 hover:text-neutral-700"
            >
              Read More <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right column - Image */}
        <div>
          <Link
            href={`/blog/${slug}`}
            className="block overflow-hidden rounded-md"
          >
            {coverImage ? (
              <img
                src={coverImage}
                alt={title}
                className="w-full h-auto object-cover aspect-[4/3] transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="bg-neutral-200 w-full aspect-[4/3] flex items-center justify-center">
                <span className="text-neutral-500">No image</span>
              </div>
            )}
          </Link>

          {/* Date and tags moved to below the title */}
        </div>
      </div>
    </article>
  );
};

export default PostPreview;
