import { Module } from '@/types/journey';
import { getModuleColor } from '@/lib/colorTokens';

interface Props {
  module: Module;
  index?: number;
  onClick?: () => void;
}

export default function ModuleFlag({ module, index = 0, onClick }: Props) {
  const color = getModuleColor(index);

  const statusLabel =
    module.status === 'final'
      ? 'Final'
      : module.status === 'inReview'
        ? 'In review'
        : 'Draft';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ backgroundColor: color.hex }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white hover:opacity-90 transition-opacity"
    >
      <span>{module.title}</span>
      <span className="opacity-70">·</span>
      <span className="opacity-70 font-normal">{statusLabel}</span>
      {module.duration && (
        <>
          <span className="opacity-70">·</span>
          <span className="opacity-70 font-normal">{module.duration}</span>
        </>
      )}
    </button>
  );
}
