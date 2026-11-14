import type { ReactNode } from 'react';

import { colors } from '@/themes/colors';

import type { Animal } from './animals';

import styles from './styles.module.scss';

/**
 * Stand-in portraits for team members whose photos haven't arrived: three animals from India and three
 * from Germany, drawn in the brand palette. Their names are in `animals.ts`.
 * Elements with `styles.eye` blink when the card is hovered or focused.
 */
const navy = colors.navy;
const yellow = colors.yellow;
const red = colors.red;
const green = colors.green;
const orange = colors.orange;
const white = '#ffffff';
const brown = '#6b4a33';
const tan = '#e9c9a0';

function Frame({ bg, halo, children }: { bg: string; halo: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 300" aria-hidden="true" focusable="false" className={styles.portraitArt}>
      <rect width="240" height="300" fill={bg} />
      <circle cx="120" cy="150" r="104" fill={halo} />
      {children}
    </svg>
  );
}

const Eye = ({ x, y, r = 7 }: { x: number; y: number; r?: number }) => (
  <g className={styles.eye}>
    <circle cx={x} cy={y} r={r} fill={navy[9]} />
    <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.32} fill={white} />
  </g>
);

// Fan centred on (120, 200): an outer ring of eight feathers and an inner ring of four.
const OUTER_FEATHERS = [20, 40, 60, 80, 100, 120, 140, 160];
const INNER_FEATHERS = [30, 70, 110, 150];
const onArc = (degrees: number, radius: number) => {
  const angle = (degrees * Math.PI) / 180;
  return { x: 120 + radius * Math.cos(angle), y: 200 - radius * Math.sin(angle) };
};

function Peacock() {
  return (
    <Frame bg={yellow[0]} halo={yellow[1]}>
      <path d="M12 204 A108 108 0 0 1 228 204 Z" fill={green[3]} />
      {[...OUTER_FEATHERS.map((d) => onArc(d, 92)), ...INNER_FEATHERS.map((d) => onArc(d, 56))].map(({ x, y }) => (
        <g key={`${x.toFixed(1)}-${y.toFixed(1)}`}>
          <circle cx={x} cy={y} r="19" fill={green[7]} />
          <circle cx={x} cy={y} r="11" fill={yellow[6]} />
          <circle cx={x} cy={y} r="6" fill={navy[7]} />
        </g>
      ))}
      <path d="M120 132 C152 156 154 236 120 262 C86 236 88 156 120 132 Z" fill={navy[6]} />
      <path d="M120 170 C134 186 134 226 120 244 C106 226 106 186 120 170 Z" fill={navy[4]} />
      <rect x="0" y="258" width="240" height="42" fill={green[2]} />
      <g stroke={navy[6]} strokeWidth="2.5" strokeLinecap="round">
        <path d="M120 106 L120 88" />
        <path d="M112 108 L104 92" />
        <path d="M128 108 L136 92" />
      </g>
      <circle cx="120" cy="86" r="4.5" fill={yellow[6]} />
      <circle cx="103" cy="90" r="4.5" fill={yellow[6]} />
      <circle cx="137" cy="90" r="4.5" fill={yellow[6]} />
      <circle cx="120" cy="124" r="19" fill={navy[6]} />
      <path d="M108 120 Q114 112 122 118" stroke={white} strokeWidth="3" fill="none" strokeLinecap="round" />
      <Eye x={113} y={124} r={5} />
      <Eye x={127} y={124} r={5} />
      <path d="M116 132 L124 132 L120 141 Z" fill={orange[6]} />
    </Frame>
  );
}

function Stork() {
  return (
    <Frame bg={navy[0]} halo={navy[1]}>
      <rect x="0" y="262" width="240" height="38" fill={green[2]} />
      <g stroke={red[6]} strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M122 196 L116 266" />
        <path d="M144 196 L152 266" />
        <path d="M104 268 L128 268" />
        <path d="M140 268 L164 268" />
      </g>
      <path d="M150 150 L214 196 L176 190 Z" fill={navy[9]} />
      <path d="M80 156 C74 130 74 108 80 90 L108 90 C104 108 104 132 112 156 Z" fill={white} stroke={navy[9]} strokeWidth="3" />
      <ellipse cx="136" cy="168" rx="58" ry="36" fill={white} stroke={navy[9]} strokeWidth="3" />
      <path d="M140 146 C176 140 200 166 196 188 C176 190 150 184 140 170 Z" fill={navy[9]} />
      <circle cx="94" cy="80" r="22" fill={white} stroke={navy[9]} strokeWidth="3" />
      <path d="M74 74 L14 100 L74 88 Z" fill={red[6]} />
      <Eye x={88} y={74} r={5} />
    </Frame>
  );
}

function Tiger() {
  return (
    <Frame bg={red[1]} halo={red[2]}>
      <path d="M36 300 Q46 226 120 222 Q194 226 204 300 Z" fill={orange[6]} />
      <path d="M120 236 Q102 266 120 300 Q138 266 120 236 Z" fill={white} />
      <path d="M58 262 L82 270 L60 280 Z M182 262 L158 270 L180 280 Z" fill={navy[9]} />
      <circle cx="62" cy="96" r="24" fill={orange[6]} />
      <circle cx="178" cy="96" r="24" fill={orange[6]} />
      <circle cx="62" cy="96" r="12" fill={orange[1]} />
      <circle cx="178" cy="96" r="12" fill={orange[1]} />
      <ellipse cx="120" cy="150" rx="80" ry="72" fill={orange[6]} />
      <ellipse cx="72" cy="178" rx="24" ry="20" fill={white} />
      <ellipse cx="168" cy="178" rx="24" ry="20" fill={white} />
      <ellipse cx="104" cy="186" rx="22" ry="16" fill={white} />
      <ellipse cx="136" cy="186" rx="22" ry="16" fill={white} />
      <ellipse cx="120" cy="204" rx="18" ry="11" fill={white} />
      <path
        d="M120 82 L113 104 L127 104 Z M98 88 L105 110 L94 106 Z M142 88 L135 110 L146 106 Z M41 140 L68 148 L43 157 Z M43 166 L64 168 L45 178 Z M199 140 L172 148 L197 157 Z M197 166 L176 168 L195 178 Z"
        fill={navy[9]}
      />
      <Eye x={96} y={146} r={8} />
      <Eye x={144} y={146} r={8} />
      <path d="M109 172 L131 172 L120 185 Z" fill={red[4]} />
      <path d="M120 185 L120 192 M120 192 Q110 200 103 194 M120 192 Q130 200 137 194" stroke={navy[9]} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <g fill={navy[9]}>
        <circle cx="98" cy="184" r="2" />
        <circle cx="92" cy="190" r="2" />
        <circle cx="142" cy="184" r="2" />
        <circle cx="148" cy="190" r="2" />
      </g>
    </Frame>
  );
}

function Hedgehog() {
  return (
    <Frame bg={green[1]} halo={green[2]}>
      <rect x="0" y="252" width="240" height="48" fill={green[3]} />
      <path
        d="M30 244 L18 214 L44 208 L32 178 L62 180 L58 148 L88 158 L94 126 L118 148 L132 118 L146 150 L168 134 L170 166 L192 164 L184 194 L200 206 L182 220 L186 244 Z"
        fill={brown}
      />
      <circle cx="84" cy="136" r="17" fill={red[6]} />
      <path d="M84 120 Q86 110 94 106" stroke={green[8]} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="98" cy="108" rx="9" ry="5" fill={green[6]} transform="rotate(-25 98 108)" />
      <path d="M140 246 Q148 186 190 196 Q218 206 226 228 Q216 246 180 248 Z" fill={tan} />
      <circle cx="170" cy="200" r="9" fill="#d9b48a" />
      <circle cx="226" cy="228" r="7" fill={navy[9]} />
      <Eye x={192} y={214} r={6} />
      <path d="M200 236 Q208 240 214 236" stroke={navy[9]} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="66" y="240" width="16" height="16" rx="7" fill={tan} />
      <rect x="150" y="240" width="16" height="16" rx="7" fill={tan} />
    </Frame>
  );
}

function Elephant() {
  return (
    <Frame bg={orange[1]} halo={orange[2]}>
      <ellipse cx="58" cy="150" rx="50" ry="62" fill={navy[3]} />
      <ellipse cx="182" cy="150" rx="50" ry="62" fill={navy[3]} />
      <ellipse cx="62" cy="152" rx="32" ry="44" fill={red[2]} />
      <ellipse cx="178" cy="152" rx="32" ry="44" fill={red[2]} />
      <ellipse cx="120" cy="140" rx="52" ry="58" fill={navy[2]} />
      <path d="M104 166 C98 212 104 248 126 266 C138 276 154 266 148 254 C134 242 132 212 136 166 Z" fill={navy[2]} />
      <g stroke={navy[3]} strokeWidth="2.5" strokeLinecap="round">
        <path d="M108 204 L130 204" />
        <path d="M110 222 L132 222" />
        <path d="M116 240 L136 238" />
      </g>
      <path d="M98 184 Q90 206 104 214 Q100 200 106 188 Z" fill={white} />
      <path d="M142 184 Q150 206 136 214 Q140 200 134 188 Z" fill={white} />
      <circle cx="120" cy="104" r="10" fill={red[6]} />
      <circle cx="120" cy="104" r="5" fill={yellow[6]} />
      <circle cx="102" cy="100" r="4" fill={yellow[6]} />
      <circle cx="138" cy="100" r="4" fill={yellow[6]} />
      <Eye x={100} y={138} r={6} />
      <Eye x={140} y={138} r={6} />
    </Frame>
  );
}

function Owl() {
  return (
    <Frame bg="#efebe2" halo="#e2ddd0">
      <rect x="20" y="262" width="200" height="12" rx="6" fill={brown} />
      <path d="M58 124 L72 76 L98 116 Z M182 124 L168 76 L142 116 Z" fill={orange[9]} />
      <ellipse cx="120" cy="184" rx="72" ry="86" fill={orange[9]} />
      <ellipse cx="120" cy="208" rx="46" ry="58" fill={orange[2]} />
      <g stroke={orange[7]} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M104 196 L110 202 L116 196" />
        <path d="M124 196 L130 202 L136 196" />
        <path d="M112 218 L118 224 L124 218" />
        <path d="M100 236 L106 242 L112 236" />
        <path d="M128 236 L134 242 L140 236" />
      </g>
      <circle cx="94" cy="146" r="29" fill={orange[0]} />
      <circle cx="146" cy="146" r="29" fill={orange[0]} />
      <Eye x={94} y={148} r={15} />
      <Eye x={146} y={148} r={15} />
      <path d="M112 166 L128 166 L120 184 Z" fill={yellow[6]} />
      <ellipse cx="102" cy="266" rx="10" ry="6" fill={yellow[6]} />
      <ellipse cx="138" cy="266" rx="10" ry="6" fill={yellow[6]} />
    </Frame>
  );
}

const ART: Record<Animal, () => ReactNode> = {
  peacock: Peacock,
  stork: Stork,
  tiger: Tiger,
  hedgehog: Hedgehog,
  elephant: Elephant,
  owl: Owl,
};

export default function Portrait({ animal }: { animal: Animal }) {
  const Art = ART[animal];
  return <Art />;
}
