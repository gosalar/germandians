import type { Answer, CoreTask } from '@/utils/dmat/types';

import EquationTask from './EquationTask';
import FigureTask from './FigureTask';
import LatinTask from './LatinTask';
import type { ViewMode } from './types';

export interface TaskViewProps {
  task: CoreTask;
  answer: Answer | undefined;
  onAnswer?(answer: Answer): void;
  mode: ViewMode;
}

export default function TaskView({ task, ...props }: TaskViewProps) {
  switch (task.kind) {
    case 'figures': return <FigureTask task={task} {...props} />;
    case 'equations': return <EquationTask task={task} {...props} />;
    case 'latin': return <LatinTask task={task} {...props} />;
  }
}
