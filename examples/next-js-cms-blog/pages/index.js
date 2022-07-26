import Container from '@/components/container';
import Intro from '@/components/intro';
import Layout from '@/components/layout';
import Head from 'next/head';
import { builder } from '@builder.io/react';
import PostCard from '@/components/post-card';

export default function Index({ allPosts, preview }) {
  const heroPost = allPosts[0];
  const morePosts = allPosts.slice(1);
  return (
    <>
      <Layout preview={preview}>
        <Head>
          <title>Next.js Blog Example with Builder.io</title>
        </Head>
        <Container>
          <Intro />
          {heroPost && (
            <PostCard
              intro={heroPost.data.intro}
              key={heroPost.data.slug}
              title={heroPost.data.title}
              coverImage={heroPost.data.image}
              author={heroPost.data.author.value?.data}
              slug={heroPost.data.slug}
            />
          )}
          {morePosts.length > 0 && (
            <section>
              <h2 className="mb-8 text-6xl md:text-7xl font-bold tracking-tighter leading-tight">
                Latest
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 md:col-gap-16 lg:col-gap-32 row-gap-20 md:row-gap-32 mb-32">
                {morePosts.map(post => (
                  <PostCard
                    intro={post.data.intro}
                    key={post.data.slug}
                    title={post.data.title}
                    coverImage={post.data.image}
                    author={post.data.author.value?.data}
                    slug={post.data.slug}
                  />
                ))}
              </div>
            </section>
          )}
        </Container>
      </Layout>
    </>
  );
}

export async function getStaticProps({ preview = null }) {
  const allPosts =
    (await builder.getAll('post', {
      options: { includeRefs: true },
    })) || null;

  return {
    props: { allPosts, preview },
  };
}
