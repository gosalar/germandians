import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { ANIMALS } from './animals';
import { EXPERIENCE_RECORD, PROFILE_DETAILS, PROFILE_LABELS, portraitLabel, type TeamProfile } from './data';
import Portrait from './Portraits';
import styles from './styles.module.scss';

const isWebLink = (href: string) => /^https?:\/\//i.test(href);
const openerId = (profile: TeamProfile) => `team-${profile.id}-open`;

/** The portrait itself: a photo, or a drawn animal standing in for one. Decorative where it sits. */
function PortraitImage({ profile }: { profile: TeamProfile }) {
  const { portrait } = profile;
  if (portrait.kind === 'animal') return <Portrait animal={portrait.animal} />;
  return (
    <img
      src={portrait.src}
      alt=""
      width={portrait.width}
      height={portrait.height}
      loading="lazy"
      decoding="async"
      style={portrait.position ? { objectPosition: portrait.position } : undefined}
    />
  );
}

/** The German name of a stand-in's animal, with its English beside it. */
function AnimalName({ profile, className }: { profile: TeamProfile; className: string }) {
  if (profile.portrait.kind !== 'animal') return null;
  const animal = ANIMALS[profile.portrait.animal];
  return (
    <span className={className}>
      <span lang="de">{animal.de}</span> · {animal.en}
    </span>
  );
}

/** One portrait on the board. The whole card is the button that opens the profile sheet. */
function PortraitCard({ profile, onOpen }: { profile: TeamProfile; onOpen: (profile: TeamProfile) => void }) {
  return (
    <li id={`team-${profile.id}`} className={styles.member} data-stand-in={profile.standIn ? '' : undefined}>
      <button
        type="button"
        id={openerId(profile)}
        className={styles.polaroid}
        aria-haspopup="dialog"
        aria-label={`${PROFILE_LABELS.open} ${profile.name}`}
        onClick={() => onOpen(profile)}
      >
        <span aria-hidden="true" className={styles.tape} />
        <span className={styles.polaroidPhoto}>
          <PortraitImage profile={profile} />
        </span>
        <span className={styles.polaroidCaption}>
          <span className={styles.memberName}>{profile.name}</span>
          <span className={styles.memberRole}>{profile.role}</span>
        </span>
        <AnimalName profile={profile} className={styles.animalTag} />
      </button>
    </li>
  );
}

/** A German term with its English meaning, as the profile sheet labels its rows. */
function SheetLabel({ label }: { label: { de: string; en: string } }) {
  return (
    <>
      <span lang="de" className={styles.sheetLabelDe}>
        {label.de}
      </span>
      <span className={styles.sheetLabelEn}>{label.en}</span>
    </>
  );
}

/** The profile sheet: a German "Steckbrief" with everything the owners approved for this person. */
function ProfileSheet({ profile, onClose }: { profile: TeamProfile; onClose: () => void }) {
  const nameId = `team-sheet-${profile.id}-name`;
  const details = PROFILE_DETAILS.flatMap((key) => {
    const value = profile[key]?.trim();
    return value ? [{ key, label: PROFILE_LABELS[key], value }] : [];
  });

  return (
    <article aria-labelledby={nameId} className={styles.sheet}>
      <div className={styles.sheetStrip}>
        <p className={styles.sheetStripTitle}>
          <span lang="de">{PROFILE_LABELS.sheet.de}</span>
          <span className={styles.sheetStripNote}>{PROFILE_LABELS.sheet.en}</span>
        </p>
        <button type="button" className={styles.sheetClose} onClick={onClose}>
          <span aria-hidden="true" className={styles.sheetCloseCross} />
          <span lang="de">{PROFILE_LABELS.close.de}</span>
          <span className={styles.visuallyHidden}> ({PROFILE_LABELS.close.en})</span>
        </button>
      </div>

      <div className={styles.sheetBody}>
        <figure className={styles.sheetPortrait}>
          <div role="img" aria-label={portraitLabel(profile)} className={styles.sheetPhoto}>
            <PortraitImage profile={profile} />
          </div>
          {profile.standIn ? (
            <span aria-hidden="true" className={styles.standInStamp}>
              <span lang="de">{PROFILE_LABELS.standIn.de}</span>
              <span>{PROFILE_LABELS.standIn.en}</span>
            </span>
          ) : null}
          <figcaption className={styles.sheetPhotoCaption}>
            <AnimalName profile={profile} className={styles.sheetAnimal} />
          </figcaption>
        </figure>

        <div className={styles.sheetInfo}>
          <h2 id={nameId} className={styles.sheetName}>
            {profile.name}
          </h2>
          <p className={styles.sheetRole}>{profile.role}</p>
          <p className={styles.sheetBio}>{profile.bio}</p>

          {details.length > 0 ? (
            <dl className={styles.sheetDetails}>
              {details.map((detail) => (
                <div key={detail.key} className={styles.sheetDetail}>
                  <dt>
                    <SheetLabel label={detail.label} />
                  </dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className={styles.sheetSteps}>
            <h3 className={styles.sheetStepsTitle}>
              <SheetLabel label={PROFILE_LABELS.steps} />
            </h3>
            <ul className={styles.sheetStepList}>
              {EXPERIENCE_RECORD.steps.map((step) => (
                <li key={step.id} className={styles.sheetStep}>
                  <span aria-hidden="true" className={styles.sheetStepTick} />
                  <span lang="de">{step.de.replaceAll('­', '')}</span>
                  <span className={styles.sheetStepEn}>{step.en}</span>
                </li>
              ))}
            </ul>
          </div>

          {profile.links && profile.links.length > 0 ? (
            <ul className={styles.sheetLinks}>
              {profile.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={isWebLink(link.href) ? '_blank' : undefined}
                    rel={isWebLink(link.href) ? 'noopener' : undefined}
                    className={styles.sheetLink}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/**
 * The team as a board of portraits. Choosing one opens its profile sheet in a modal dialog: Escape, the
 * close button or a click outside the sheet closes it, and focus goes back to the portrait.
 */
export default function TeamGallery({ team }: { team: readonly TeamProfile[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<TeamProfile | null>(null);

  const open = (profile: TeamProfile) => {
    // Render the sheet first, so the dialog opens with its close button ready to take focus.
    flushSync(() => setSelected(profile));
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const returnFocus = () => {
    if (selected) document.getElementById(openerId(selected))?.focus();
  };

  return (
    <>
      <ul className={styles.board}>
        {team.map((profile) => (
          <PortraitCard key={profile.id} profile={profile} onOpen={open} />
        ))}
      </ul>
      <dialog
        ref={dialogRef}
        aria-labelledby={selected ? `team-sheet-${selected.id}-name` : undefined}
        className={styles.dialog}
        onClose={returnFocus}
        onClick={(event) => {
          // The sheet fills the dialog box, so a click on the dialog itself landed on the backdrop.
          if (event.target === event.currentTarget) close();
        }}
      >
        {selected ? <ProfileSheet key={selected.id} profile={selected} onClose={close} /> : null}
      </dialog>
    </>
  );
}
