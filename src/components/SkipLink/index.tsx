import styles from './styles.module.scss';

export default function SkipLink() {
  return <a className={styles.link} href="#main-content" onClick={(event) => {
    const main = document.getElementById('main-content');
    if (!main) return;
    event.preventDefault();
    main.focus({ preventScroll: true });
    main.scrollIntoView({ behavior: 'instant' });
  }}>Skip to content</a>;
}
