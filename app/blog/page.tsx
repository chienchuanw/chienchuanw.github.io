import PostPreview from "@/app/blog/PostPreview";
import { postData } from "@/app/blog/postData";

export default function blog() {
  return (
    <>
      {postData.map((post) => (
        <PostPreview
          key={post.postId}
          title={post.title}
          subtitle={post.subtitle}
          content={post.content}
        />
      ))}
    </>
  );
}
