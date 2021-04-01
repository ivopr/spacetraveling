import { useState } from 'react';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination);

  function parsePosts(postsToParse: Post[]): Post[] {
    const results: Post[] = postsToParse.map(post => ({
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
    }));
    return results.concat(posts.results);
  }

  async function handleLoadMorePosts(): Promise<void> {
    await fetch(postsPagination.next_page)
      .then(res => res.json())
      .then((data: PostPagination) => {
        setPosts({
          next_page: data.next_page,
          results: parsePosts(data.results),
        });
      });
  }

  return (
    <>
      <Head>
        <title>inicio | spacetraveling</title>
      </Head>

      <Header />

      <main className={`${styles.container} ${commonStyles.maxWidth}`}>
        {posts.results.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a>
              <h1>{post.data.title}</h1>
              <h3>{post.data.subtitle}</h3>
              <ul>
                <li>
                  <FiCalendar />
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </li>
                <li>
                  <FiUser />
                  {post.data.author}
                </li>
              </ul>
            </a>
          </Link>
        ))}

        {posts.next_page && (
          <button type="button" onClick={handleLoadMorePosts}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.author', 'post.subtitle'],
      pageSize: 10,
    }
  );
  const postsProp: PostPagination = {
    next_page: postsResponse?.next_page,
    results: postsResponse?.results.map(res => ({
      uid: res.uid,
      data: {
        title: res.data.title,
        subtitle: res.data.subtitle,
        author: res.data.author,
      },
      first_publication_date: res.first_publication_date,
    })),
  };

  return {
    props: {
      postsPagination: postsProp,
    },
  };
};
