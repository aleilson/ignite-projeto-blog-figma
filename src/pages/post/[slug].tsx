import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect } from 'react';
import { getPrismicClient } from '../../services/prismic';
import { dateFormat } from '../../utils/dateFormat';
import { Utterances } from '../../components/Utterances';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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
interface NavigationPost {
  uid: string | null;
  title: string | null;
}
interface Navigation {
  afterPost: NavigationPost;
  beforePost: NavigationPost;
}

interface PostProps {
  post: Post;
  navigation: Navigation;
  preview: boolean;
}

export default function Post({
  post,
  navigation,
  preview,
}: PostProps): JSX.Element {
  useEffect(() => {
    Utterances();
  }, []);

  const humanWordsPerMinute = 200;
  const titleWords = post.data.title.split(' ').length;

  const contentWords = post.data.content.reduce((acc, content) => {
    const headingWords = content.heading
      ? content.heading.split(' ').length
      : 0;

    const bodyWords = RichText.asText(content.body).split(' ').length;

    // eslint-disable-next-line no-param-reassign
    acc += headingWords + bodyWords;
    return acc;
  }, 0);

  const timeToRead = Math.ceil(
    (titleWords + contentWords) / humanWordsPerMinute
  );

  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Header />
      {post ? (
        <>
          <div className={styles.bannerPost}>
            <img src={post.data.banner.url} alt={post.data.title} />
          </div>

          <main className={styles.hero}>
            <article className={styles.articlePost}>
              <h1>{post.data.title}</h1>

              <div className={styles.contentDatePost}>
                <div className={styles.infoPost}>
                  <span>
                    <FiCalendar color="#BBBBBB" />
                    {dateFormat(post.first_publication_date)}
                  </span>

                  <span>
                    <FiUser color="#BBBBBB" />
                    {post.data.author}
                  </span>
                  <span>
                    <FiClock color="#BBBBBB" />
                    {timeToRead} min
                  </span>
                </div>

                {post.first_publication_date !== post.last_publication_date && (
                  <span className={styles.editedPost}>
                    * editado em {dateFormat(post.last_publication_date)}, às
                    15:49
                  </span>
                )}
              </div>

              {post.data.content.map(content => (
                <div key={content.heading} className={styles.contentPost}>
                  <h2>{content.heading}</h2>
                  <div
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </div>
              ))}
            </article>

            <div className={styles.pagination}>
              {!preview && (
                <ul>
                  {navigation.beforePost && (
                    <li>
                      <Link href={`/post/${navigation.beforePost.uid}`}>
                        <a>
                          <span>{navigation.beforePost.title}</span>
                          <strong>Post anterior</strong>
                        </a>
                      </Link>
                    </li>
                  )}

                  {navigation.afterPost && (
                    <li>
                      <Link href={`/post/${navigation.afterPost.uid}`}>
                        <a>
                          <span>{navigation.afterPost.title}</span>
                          <strong>Próximo Post</strong>
                        </a>
                      </Link>
                    </li>
                  )}
                </ul>
              )}

              <div id="comments" />

              {preview && (
                <Link href="/api/exit-preview">
                  <a>
                    <span>Sair do modo Preview</span>
                  </a>
                </Link>
              )}
            </div>
          </main>
        </>
      ) : (
        <strong>Carregando...</strong>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title'],
    }
  );

  const postUids = posts.results.map(post => {
    return {
      params: {
        slug: String(post.uid),
      },
    };
  });

  return {
    paths: postUids,
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
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const formatedPost = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      banner: {
        url: response.data.banner.url,
      },
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      content: response.data.content,
    },
  };

  let navigation = {};
  if (!preview) {
    const { results: afterPost } = await prismic.query([
      Prismic.Predicates.at('document.type', 'posts'),
      Prismic.Predicates.date.after(
        'document.first_publication_date',
        response.first_publication_date
      ),
    ]);

    const { results: beforePost } = await prismic.query([
      Prismic.Predicates.at('document.type', 'posts'),
      Prismic.Predicates.dateBefore(
        'document.first_publication_date',
        response.first_publication_date
      ),
    ]);

    navigation = {
      afterPost: afterPost[0]
        ? {
            uid: afterPost[afterPost.length - 1].uid,
            title: afterPost[afterPost.length - 1].data.title,
          }
        : null,
      beforePost: beforePost[0]
        ? {
            uid: beforePost[0].uid,
            title: beforePost[0].data.title,
          }
        : null,
    };
  }

  return {
    props: {
      post: response,
      navigation,
      preview,
    },
    revalidate: 60 * 60, // 1 hour
  };
};
