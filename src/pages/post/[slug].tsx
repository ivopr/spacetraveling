/* eslint-disable react/no-danger */
/* eslint-disable no-return-assign */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';

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
  navigation: {
    prevPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
    nextPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
  };
  preview: boolean;
}

export default function Post({
  post,
  navigation,
  preview,
}: PostProps): JSX.Element {
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

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a className={commonStyles.preview}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}

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

          <div className={styles.nav}>
            {navigation?.prevPost.length > 0 && (
              <Link href={`/post/${navigation.prevPost[0].uid}`}>
                <a>
                  <h3>{navigation.prevPost[0].data.title}</h3> Post anterior
                </a>
              </Link>
            )}

            {navigation?.nextPost.length > 0 && (
              <Link href={`/post/${navigation.nextPost[0].uid}`}>
                <a>
                  <h3>{navigation.nextPost[0].data.title}</h3>Próximo post
                </a>
              </Link>
            )}
          </div>

          <Comments />
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
      pageSize: 5,
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref || null,
  });

  const prevPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date desc]',
    }
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response?.data.title,
      subtitle: response?.data.subtitle,
      author: response?.data.author,
      banner: {
        url: response?.data.banner.url,
      },
      content: response?.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
      navigation: {
        prevPost: prevPost?.results,
        nextPost: nextPost?.results,
      },
      preview,
    },
  };
};
