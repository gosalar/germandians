import type { Frame, SectionId, Shape } from '@/utils/dmat/types';

export const RUNNER_COPY = {
  endSection: 'End section', endModule: 'End module', leave: 'Leave test', finish: 'Finish practising',
  keepWorking: 'Keep working', leaveConfirm: 'Leave and see my record',
  endWarning: 'This cannot be undone. A finished section cannot be reopened. Your answers will stay in your practice record.',
  leaveWarning: 'This ends your test and cannot be undone. Finished sections cannot be reopened. You can see the answers you gave in your practice record.',
  fiveMinutes: '5 minutes left', oneMinute: '1 minute left',
  textSize: 'Text size', textSizes: ['Standard text', 'Larger text', 'Largest text'],
  back: 'Back', next: 'Next', mark: 'Mark', check: 'Check answer', nextTask: 'Next task', nextSection: 'Next section',
  tasks: 'Tasks in this section', legend: '→ current · ✓ answered · ◆ marked',
  current: 'current', answered: 'answered', marked: 'marked',
  figuresAccess: 'Each matrix has a text description of its figures. Following several changing figures with a screen reader can still be difficult.',
  part: (module: string, index: number, total: number, mock?: number) =>
    mock !== undefined ? `Mock ${mock} · ${module} · part ${index} of ${total}` : `${module} · part ${index} of ${total}`,
  position: (academic: boolean, index: number, total: number) => `${academic ? 'Passage' : 'Task'} ${index} of ${total}`,
  screen: (academic: boolean, index: number) => `${academic ? 'Passage' : 'Task'} ${index}`,
  rightCount: (count: number) => `${count} right so far`,
} as const;

export const INSTRUCTIONS: Record<SectionId, string> = {
  figures: 'Follow how the figures move, turn and change colour. Choose the fifth matrix and the sixth matrix, one option for each.',
  equations: 'Find the whole number from 1 to 20 that each letter stands for. Type each answer using your keyboard.',
  latin: 'Each row and each column contains A, B, C, D and E once each. Choose the letter that belongs in the cell marked with a question mark.',
  academic: 'Read the passage and use its information to answer the questions. Open each question and choose one of its four options.',
};

export const TASK_COPY = {
  fifth: 'Fifth matrix', sixth: 'Sixth matrix',
  option: (number: number) => `Option ${number}`,
  matrix: (number: number) => `Matrix ${number}`,
  equations: 'Equations', yourAnswers: 'Your answers',
  letterLabel: (letter: string) => `${letter} =`,
  square: 'Latin square', latinQuestion: 'Which letter replaces the question mark?',
  row: (number: number) => `Row ${number}`, column: (number: number) => `Column ${number}`,
  empty: 'empty', target: 'Target cell',
  yourAnswer: 'Your answer', correctAnswer: 'Correct answer', noAnswer: 'No answer',
  right: 'Right', wrong: 'Wrong', unanswered: 'Unanswered',
  selected: 'Your choice', correctOption: 'Correct option',
  solution: 'Worked solution', mistake: 'Why this choice is wrong',
  passage: 'Passage', questions: 'Questions',
  question: (number: number) => `Question ${number}`,
  enlarge: 'Enlarge figure', close: 'Close figure',
  enlarged: (caption: string) => `Enlarged figure: ${caption}`,
  description: (colour: string, shape: string, row: number, column: number, direction: string) => `${colour} ${shape} in row ${row}, column ${column}, pointing ${direction}`,
} as const;

export const DIRECTIONS = ['up', 'right', 'down', 'left'] as const;
export const SHAPE_NAMES: Record<Shape, string> = {
  square: 'square', circle: 'circle', diamond: 'diamond', hexagon: 'hexagon', triangle: 'triangle',
  arrow: 'arrow', angle: 'angle', halfCircle: 'half circle', trapezoid: 'trapezoid', flag: 'flag',
};

export function describeMatrix(frame: Frame, shapes: Shape[]): string {
  return frame.map((figure, index) => TASK_COPY.description(
    figure.colour, SHAPE_NAMES[shapes[index]], figure.pos[0] + 1, figure.pos[1] + 1,
    DIRECTIONS[((figure.orient % 4) + 4) % 4],
  )).join('; ');
}
