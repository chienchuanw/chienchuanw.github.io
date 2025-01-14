import { badgeVariants } from "@/components/ui/badge";
import Link from "next/link";

const tags = [
  { tagName: "programming", href: "#" },
  // { tagName: "lighting", href: "#" },
  // { tagName: "other", href: "#" },
];

const Tags = () => {
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
