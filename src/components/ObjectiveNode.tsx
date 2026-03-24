import { Objective } from '@/types/journey';

interface Props {
  objective: Objective;
  onClick?: () => void;
}

export default function ObjectiveNode({ objective, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-4 h-4 rounded-full border-2 border-cyan-400 bg-slate-900"
      title={objective.text}
    />
  );
}
