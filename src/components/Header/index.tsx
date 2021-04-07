import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <a>
            <figure>
              <img src="/images/logo.svg" alt="logo" />
            </figure>
          </a>
        </Link>
      </div>
    </header>
  );
}
