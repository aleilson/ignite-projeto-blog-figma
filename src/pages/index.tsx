import { GetStaticProps } from 'next';
import Link from 'next/link';
import { FiUser, FiCalendar } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { useState } from 'react';
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
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [results, setResults] = useState<Post[]>(
    postsPagination.results.map(result => {
      return {
        ...result,
      };
    })
  );

  function handleNextPage(): void {
    fetch(nextPage).then(response => {
      response.json().then(responsePrismic => {
        setNextPage(responsePrismic.next_page);

        const posts = responsePrismic.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: new Date(
              post.first_publication_date
            ).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }),
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
    <main className={styles.container}>
      <div className={styles.posts}>
        {results.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
              <strong>{post.data.title}</strong>

              <p>{post.data.subtitle}</p>

              <div className={styles.infoPost}>
                <span>
                  <FiCalendar color="#BBBBBB" className={styles.calendar} />
                  {post.first_publication_date}
                </span>

                <span>
                  <FiUser color="#BBBBBB" className={styles.user} />
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
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
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
