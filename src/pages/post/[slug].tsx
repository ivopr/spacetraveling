/* eslint-disable react/no-danger */
/* eslint-disable no-return-assign */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  const totalWords = post?.data.content.reduce((total, item) => {
    const headingWordsCount = item.heading?.split(' ').length;

    const bodyWordsCount = item.body.map(bItem => bItem.text.split(' ').length);

    let bodyCount = 0;
    bodyWordsCount.map(count => (bodyCount += count));

    const wordsCount = headingWordsCount + bodyCount;

    return total + wordsCount;
  }, 0);

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title>{post?.data.title ?? 'Carregando...'} | spacetraveling</title>
      </Head>

      <Header />

      <main className={`${styles.container}`}>
        <img src={post.data.banner.url} alt="banner" />

        <div className={commonStyles.maxWidth}>
          <h1>{post.data.title}</h1>
          <div>
            <span>
              <FiCalendar />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </span>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <span>
              <FiClock />
              {Math.ceil(totalWords / 200)} min
            </span>
          </div>

          {post.data.content.map(p => (
            <article key={p.heading}>
              <h2>{p.heading}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(p.body) }}
              />
            </article>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: [],
      pageSize: 20,
    }
  );

  const pathsToGenerate = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths: pathsToGenerate,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid || '',
    first_publication_date: response.first_publication_date || '',
    data: {
      title: response?.data.title || '',
      subtitle: response?.data.subtitle || '',
      author: response?.data.author || '',
      banner: {
        url: response?.data.banner.url || null,
      },
      content:
        response?.data.content.map(content => {
          return {
            heading: content.heading || '',
            body: [...content.body] || [],
          };
        }) || [],
    },
  };

  return {
    props: {
      post,
    },
  };
};
