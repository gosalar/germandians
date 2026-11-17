import PassageTask, { type PassageTaskProps } from './PassageTask';

export type PassageViewProps = Pick<PassageTaskProps, 'passage' | 'answers' | 'onAnswer' | 'mode' | 'reviewActions'>;

export default function PassageView(props: PassageViewProps) {
  return <PassageTask {...props} />;
}
