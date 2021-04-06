import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <figure>
          <img src="/images/logo.svg" alt="Logo spacetraveling" />
        </figure>
      </div>
    </header>
  );
}
