import { GetStaticProps } from 'next';
import Link from 'next/link';
import { FiUser, FiCalendar } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';
import { dateFormat } from '../utils/dateFormat';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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
  const [results, setResults] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function handleNextPage(): void {
    fetch(nextPage).then(response => {
      response.json().then(responsePrismic => {
        setNextPage(responsePrismic.next_page);

        const posts = responsePrismic.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setResults([...results, ...posts]);
      });
    });
  }

  return (
    <>
      <Header />
      <main className={commonStyles.container}>
        <div className={commonStyles.posts}>
          {results.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>

                <p>{post.data.subtitle}</p>

                <div className={commonStyles.infoPost}>
                  <span>
                    <FiCalendar
                      color="#BBBBBB"
                      className={commonStyles.calendar}
                    />
                    {dateFormat(post.first_publication_date)}
                  </span>

                  <span>
                    <FiUser color="#BBBBBB" className={commonStyles.user} />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {nextPage !== null && (
          <button
            type="button"
            onClick={handleNextPage}
            className={styles.morePost}
          >
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
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
