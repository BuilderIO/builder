import Avatar from '../components/avatar';
import CoverImage from '../components/cover-image';
import Link from 'next/link';

export default function PostCard({ title, coverImage, author, slug, intro }) {
  return (
    <div className="mx-3">
      <div className="mb-5">
        <CoverImage title={title} slug={slug} url={coverImage} />
      </div>
      <h3 className="text-3xl mb-3 leading-snug">
        <Link href={`/blog/${slug}`}>
          <a className="hover:underline">{title}</a>
        </Link>
      </h3>
      <p className="text-lg leading-relaxed mb-4">{intro}</p>
      {author && <Avatar name={author.name} picture={author.image} />}
    </div>
  );
}
