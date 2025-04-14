import { badgeVariants } from "@/components/ui/badge";
import Link from "next/link";

interface Tag {
  tagName: string;
  href: string;
}

const tags: Tag[] = [
  // No tags for now
];

const Tags = () => {
  // If there are no tags, don't render the section
  if (tags.length === 0) return null;

  return (
    <section className="flex justify-center gap-4 mt-10">
      {tags.map((tag) => (
        <Link
          key={tag.tagName}
          href={tag.href}
          className={badgeVariants({ variant: "outline" })}
        >
          {tag.tagName}
        </Link>
      ))}
    </section>
  );
};

export default Tags;
