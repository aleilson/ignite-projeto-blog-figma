import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';
import { dateFormat } from '../../utils/dateFormat';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

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
      <div className={styles.bannerPost}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </div>

      <article className={styles.articlePost}>
        <h1>{post.data.title}</h1>

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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

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

  return {
    props: {
      post: formatedPost,
    },
  };
};
