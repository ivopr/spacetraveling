import { ReactElement } from 'react';
import Link from 'next/link';
import styles from './header.module.scss';
import common from '../../styles/common.module.scss';

export default function Header(): ReactElement {
  return (
    <header className={`${styles.container} ${common.maxWidth}`}>
      <Link href="/">
        <a>
          <img src="/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
