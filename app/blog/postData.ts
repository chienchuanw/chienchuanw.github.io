type Post = {
  postId: number;
  postBanner: string;
  title: string;
  subtitle: string;
  content: string;
};

const postData: Post[] = [
  {
    postId: 1,
    postBanner: "",
    title: "My Very First Post",
    subtitle: "Introduction",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt quasi repudiandae necessitatibus neque nam illum aliquam, nisi labore aspernatur voluptatum architecto maiores aut impedit itaque, dolor atque sed mollitia magnam porro, tempora laboriosam minus nostrum. Voluptates saepe incidunt veritatis sed!",
  },
];

export { postData };
export type { Post };
