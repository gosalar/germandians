interface AuthoredPassage {
  id: string;
  area: string;
  title: string;
  set: 'mock' | 'practice';
  blocks: unknown[];
  questions: {
    id: string;
    type: string;
    level: number;
    stem: string;
    options: { text: string; correct?: boolean; why: string }[];
    explanation: string;
  }[];
}

export const passages: AuthoredPassage[];
export const passageReport: string[];
