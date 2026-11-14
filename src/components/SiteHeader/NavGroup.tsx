import { useWindowEvent } from '@mantine/hooks';
import { useRef, useState } from 'react';
import { useLocation } from 'react-router';

import HomeSectionLink from '@/components/HomeSectionLink';
import type { NavMenuEntry } from '@/utils/constants';

import styles from './styles.module.scss';

type Group = Extract<NavMenuEntry, { kind: 'group' }>;

/**
 * A disclosure in the inline header: a button that shows or hides a short list of links. It opens by
 * click, Enter or Space, and closes on Escape (returning focus to the button), on a click or focus
 * outside it, when a link is chosen and when the page changes.
 */
export default function NavGroup({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const [openedOn, setOpenedOn] = useState(pathname);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  // A page change (including back and forward) closes the list.
  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setOpen(false);
  }

  useWindowEvent('keydown', (event) => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      trigger.current?.focus();
    }
  });
  useWindowEvent('pointerdown', (event) => {
    if (open && !root.current?.contains(event.target as Node)) setOpen(false);
  });

  return (
    <div
      ref={root}
      className={styles.group}
      onBlur={(event) => {
        if (open && !event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className={styles.groupTrigger}
        aria-expanded={open}
        aria-controls={group.id}
        onClick={() => setOpen((value) => !value)}
      >
        {group.label}
        <span aria-hidden="true" className={styles.chevron} data-open={open} />
      </button>
      <div id={group.id} className={styles.groupPanel} hidden={!open}>
        {group.links.map((link) => (
          <HomeSectionLink key={link.href} href={link.href} className={styles.groupLink} onClick={() => setOpen(false)}>
            {link.label}
          </HomeSectionLink>
        ))}
      </div>
    </div>
  );
}
