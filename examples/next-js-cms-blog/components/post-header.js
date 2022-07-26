import Avatar from '../components/avatar';
import CoverImage from '../components/cover-image';
import PostTitle from '../components/post-title';

export default function PostHeader({ title, coverImage, author }) {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="hidden md:block md:mb-12">
        {author && <Avatar name={author.name} picture={author.image} />}
      </div>
      <div className="mb-8 md:mb-16 sm:mx-0">
        <CoverImage title={title} url={coverImage} />
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="block md:hidden mb-6">
          {author && <Avatar name={author.name} picture={author.image} />}
        </div>
      </div>
    </>
  );
}
