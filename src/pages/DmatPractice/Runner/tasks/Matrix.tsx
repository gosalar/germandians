import type { Colour, Frame, Shape } from '@/utils/dmat/types';

import { describeMatrix } from '../data';
import styles from './styles.module.scss';

// Task colours carry meaning and deliberately stay separate from the brand palette.
const COLOURS: Record<Colour, string> = {
  yellow: '#F0E442', orange: '#E69F00', pink: '#CC79A7', green: '#009E73',
  blue: '#0072B2', black: '#222222', white: '#FFFFFF',
};

const SHAPES = {
  square: <rect x={-0.6} y={-0.6} width={1.2} height={1.2} />,
  circle: <circle r={0.65} />,
  diamond: <polygon points="0,-0.75 0.75,0 0,0.75 -0.75,0" />,
  hexagon: <polygon points="0.72,0 0.36,0.62 -0.36,0.62 -0.72,0 -0.36,-0.62 0.36,-0.62" />,
  triangle: <polygon points="0,-0.75 0.72,0.6 -0.72,0.6" />,
  arrow: <polygon points="0,-0.8 0.7,-0.05 0.28,-0.05 0.28,0.75 -0.28,0.75 -0.28,-0.05 -0.7,-0.05" />,
  angle: <polygon points="-0.65,-0.75 -0.3,-0.75 -0.3,0.35 0.7,0.35 0.7,0.7 -0.65,0.7" />,
  halfCircle: <path d="M -0.75 0.3 A 0.75 0.75 0 0 1 0.75 0.3 Z" />,
  trapezoid: <polygon points="-0.35,-0.6 0.35,-0.6 0.75,0.6 -0.75,0.6" />,
  flag: <polygon points="-0.55,-0.8 0.7,-0.4 -0.3,0 -0.3,0.8 -0.55,0.8" />,
} satisfies Record<Shape, React.ReactNode>;

export default function Matrix({ frame, shapes, label, decorative = false }: { frame: Frame | null; shapes: Shape[]; label: string; decorative?: boolean }) {
  const ariaLabel = decorative ? undefined : frame ? `${label}: ${describeMatrix(frame, shapes)}` : label;
  return (
    <svg className={styles.matrix} viewBox="0 0 100 100" role={decorative ? undefined : 'img'} aria-label={ariaLabel}>
      <rect className={styles.matrixFrame} x="1.25" y="1.25" width="97.5" height="97.5" />
      {frame ? (
        <>
          <path className={styles.matrixGrid} d="M25 2V98M50 2V98M75 2V98M2 25H98M2 50H98M2 75H98" />
          {frame.map((figure, index) => (
            <g key={index} transform={`translate(${figure.pos[1] * 25 + 12.5} ${figure.pos[0] * 25 + 12.5}) scale(10) rotate(${figure.orient * 90})`} fill={COLOURS[figure.colour]} stroke="#222222" strokeWidth="0.12" strokeLinejoin="round">
              {SHAPES[shapes[index]]}
            </g>
          ))}
        </>
      ) : <text x="50" y="65" textAnchor="middle" className={styles.questionMark}>?</text>}
    </svg>
  );
}
