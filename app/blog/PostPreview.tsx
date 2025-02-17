type PostPreviewProps = {
  title: string;
  subtitle: string;
  content: string;
};

const PostPreview: React.FC<PostPreviewProps> = ({
  title,
  subtitle,
  content,
}) => {
  return (
    <section className="flex justify-center mt-10">
      <div className="container space-y-4">
        <div className="flex justify-between gap-4">
          <div className="bg-neutral-500 w-9/12 h-[500px]"></div>
          <div className="bg-black w-3/12 h-[500px] relative">
            <button className="bg-neutral-50 text-neutral-950 py-2 px-4 rounded-full flex items-center justify-center gap-1 w-fit absolute bottom-10 left-10 text-sm">
              read more
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="16px"
                  width="16px"
                  viewBox="0 -960 960 960"
                  fill="#fffff"
                >
                  <path d="m216-160-56-56 464-464H360v-80h400v400h-80v-264L216-160Z" />
                </svg>
              </span>
            </button>
          </div>
        </div>
        <div>
          <div className="flex space-x-3 w-9/12 px-4 items-center h-[100px]">
            <div className="w-1 h-1/2 bg-black flex-shrink-0"></div>
            <h1 className="font-medium text-3xl pl-2">{title}</h1>
          </div>
          <div className="py-6 border-b border-neutral-300 flex w-9/12 px-10 justify-center">
            <h2 className="text-sm font-bold text-neutral-950 w-1/3 pr-10">
              {subtitle}
            </h2>
            <p className="text-sm text-neutral-700 w-2/3 flex-shrink-0">
              {content}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostPreview;
