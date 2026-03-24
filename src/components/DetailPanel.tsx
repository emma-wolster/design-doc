'use client';

import { SelectedItem } from '@/types/journey';
import { useJourney } from '@/lib/JourneyContext';

interface Props {
  selected: SelectedItem;
}

export default function DetailPanel({ selected }: Props) {
  const { modules, objectives } = useJourney();

  if (!selected) {
    return (
      <aside className="w-80 border-l border-slate-800 p-4 text-xs hidden md:block">
        <p className="text-slate-400">
          Select a module or objective to see details.
        </p>
      </aside>
    );
  }

  // --- Module detail ---
  if (selected.type === 'module') {
    const mod = modules.find((m) => m.id === selected.moduleId);
    if (!mod) return null;

    const modObjectives = objectives.filter(
      (obj) => obj.moduleId === mod.id
    );

    const statusLabel =
      mod.status === 'final'
        ? 'Final'
        : mod.status === 'inReview'
          ? 'In review'
          : 'Draft';

    return (
      <aside className="w-80 border-l border-slate-800 p-5 text-sm hidden md:block overflow-y-auto">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Module</p>
        <h3 className="text-base font-semibold text-slate-100 mb-3">{mod.title}</h3>

        <dl className="space-y-2 text-xs">
          <div>
            <dt className="text-slate-500">ID</dt>
            <dd className="text-slate-200">{mod.id}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="text-slate-200">{statusLabel}</dd>
          </div>
          {mod.duration && (
            <div>
              <dt className="text-slate-500">Duration</dt>
              <dd className="text-slate-200">{mod.duration}</dd>
            </div>
          )}
          {mod.topic && (
            <div>
              <dt className="text-slate-500">Topic</dt>
              <dd className="text-slate-200">{mod.topic}</dd>
            </div>
          )}
          <div>
            <dt className="text-slate-500">Description</dt>
            <dd className="text-slate-200">{mod.shortDescription}</dd>
          </div>
        </dl>

        {modObjectives.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
              Objectives ({modObjectives.length})
            </p>
            <ul className="space-y-2">
              {modObjectives.map((obj) => (
                <li
                  key={obj.id}
                  className="text-xs text-slate-300 pl-3 border-l-2 border-cyan-400/40"
                >
                  {obj.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    );
  }

  // --- Objective detail ---
  const obj = objectives.find((o) => o.id === selected.objectiveId);
  if (!obj) return null;

  const parentModule = modules.find((m) => m.id === obj.moduleId);

  return (
    <aside className="w-80 border-l border-slate-800 p-5 text-sm hidden md:block overflow-y-auto">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Objective</p>
      <h3 className="text-base font-semibold text-slate-100 mb-3">{obj.text}</h3>

      <dl className="space-y-2 text-xs">
        {parentModule && (
          <div>
            <dt className="text-slate-500">Module</dt>
            <dd className="text-slate-200">{parentModule.title}</dd>
          </div>
        )}
        {obj.bloomType && (
          <div>
            <dt className="text-slate-500">Bloom / Type</dt>
            <dd className="text-slate-200">{obj.bloomType}</dd>
          </div>
        )}
        {obj.contentType && (
          <div>
            <dt className="text-slate-500">Content type</dt>
            <dd className="text-slate-200">{obj.contentType}</dd>
          </div>
        )}
        {obj.sourceLink && (
          <div>
            <dt className="text-slate-500">Source link</dt>
            <dd>
              <a
                href={obj.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline break-all"
              >
                {obj.sourceLink}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </aside>
  );
}
