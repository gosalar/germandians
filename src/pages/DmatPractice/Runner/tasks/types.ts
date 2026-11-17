/** 'review' shows the right answer and the visitor's, and takes no input. */
export const VIEW_MODES = ['answer', 'review'] as const;
export type ViewMode = (typeof VIEW_MODES)[number];
