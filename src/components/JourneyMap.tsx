'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Module, Objective, SelectedItem } from '@/types/journey';
import { getModuleColor } from '@/lib/colorTokens';
import { useJourney } from '@/lib/JourneyContext';
import ThemeToggle from '@/components/ThemeToggle';

// ── Column width ─────────────────────────────────
const MIN_COL_WIDTH = 220;
const MAX_COL_WIDTH = 320;

function calcColWidth(moduleCount: number): number {
  // Aim for columns that comfortably fill ~1200px, clamped to min/max
  if (moduleCount === 0) return MIN_COL_WIDTH;
  const ideal = Math.floor(1200 / moduleCount);
  return Math.max(MIN_COL_WIDTH, Math.min(MAX_COL_WIDTH, ideal));
}

// ── Helpers ──────────────────────────────────────
function alpha(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Props ────────────────────────────────────────
interface Props {
  modules: Module[];
  objectives: Objective[];
  onSelect: (item: SelectedItem) => void;
}

// ── Component ────────────────────────────────────
export default function JourneyMap({ modules, objectives, onSelect }: Props) {
  const { courseName } = useJourney();

  // Module display order (indices into modules array)
  const [order, setOrder] = useState<number[]>([]);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelModule, setPanelModule] = useState<Module | null>(null);
  const [panelObjective, setPanelObjective] = useState<Objective | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Initialise order when modules change
  useEffect(() => {
    setOrder(modules.map((_, i) => i));
  }, [modules]);

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!panelOpen) return;
      const panel = panelRef.current;
      const target = e.target as HTMLElement;
      if (panel && !panel.contains(target) && !target.closest('.jm-tp')) {
        setPanelOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [panelOpen]);

  // Column width based on module count
  const colWidth = useMemo(() => calcColWidth(modules.length), [modules.length]);

  // ── Drag handlers ──────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, dispIdx: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(dispIdx));
    // Use a minimal transparent drag image so the browser doesn't ghost the whole div
    const el = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, 20);
    setDragFrom(dispIdx);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, dispIdx: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOver(dispIdx);
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, toIdx: number) => {
      e.preventDefault();
      if (dragFrom === null || dragFrom === toIdx) return;
      setOrder((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragFrom, 1);
        next.splice(toIdx, 0, moved);
        return next;
      });
      setPanelOpen(false);
      setDragFrom(null);
      setDragOver(null);
    },
    [dragFrom],
  );

  const handleDragEnd = useCallback(() => {
    setDragFrom(null);
    setDragOver(null);
  }, []);

  // ── Panel open ─────────────────────────────────
  function openPanel(mod: Module, obj: Objective | null) {
    setPanelModule(mod);
    setPanelObjective(obj);
    setPanelOpen(true);
    if (obj) {
      onSelect({ type: 'objective', objectiveId: obj.id });
    } else {
      onSelect({ type: 'module', moduleId: mod.id });
    }
  }

  // ── Stats ──────────────────────────────────────
  const totalObjectives = objectives.length;

  // ── Empty state ────────────────────────────────
  if (modules.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <p className="text-sm text-slate-400">
          No modules to display.{' '}
          <a href="/" className="underline text-blue-400">
            Upload a design doc
          </a>{' '}
          to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="journey-page" style={{ fontFamily: "'Sora', sans-serif" }}>
      {/* ── Header ─────────────────────────────── */}
      <div className="jm-hdr">
        <div>
          <div className="jm-eyebrow">Course &nbsp;·&nbsp; Learner Journey Map</div>
          <h1 className="jm-title">
            {courseName}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="jm-stats">
            <div className="jm-chip">
              <b>{modules.length}</b> modules
            </div>
            <div className="jm-chip">
              <b>{totalObjectives}</b> objectives
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* ── Hint bar ───────────────────────────── */}
      <div className="jm-hint-bar">
        <div className="jm-hint-item">
          <span className="jm-hint-icon">⠿</span> Drag a module flag to reorder
        </div>
        <div className="jm-hint-item">
          <span className="jm-hint-icon">◈</span> Hover a flag to see objectives
        </div>
        <div className="jm-hint-item">
          <span className="jm-hint-icon">○</span> Click any node to view details
        </div>
        <div className="jm-hint-item">
          <span className="jm-hint-icon">★</span> Gold star = objectives attached
        </div>
      </div>

      {/* ── Journey area ───────────────────────── */}
      <div className="jm-journey-area">
        <div style={{ position: 'relative' }}>
          {/* Flags row */}
          <div className="jm-flags-row">
            {order.map((modIdx, dispIdx) => {
              const mod = modules[modIdx];
              const color = getModuleColor(modIdx).hex;
              const modObjs = objectives.filter((o) => o.moduleId === mod.id);
              const isDragging = dragFrom === dispIdx;
              const isOver = dragOver === dispIdx && dragFrom !== dispIdx;

              return (
                <div
                  key={mod.id}
                  className={`jm-module${isDragging ? ' is-dragging' : ''}${isOver ? ' is-over' : ''}`}
                  style={{
                    width: colWidth,
                    zIndex: order.length - dispIdx + 10,
                    animationDelay: `${dispIdx * 0.06}s`,
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, dispIdx)}
                  onDragOver={(e) => handleDragOver(e, dispIdx)}
                  onDrop={(e) => handleDrop(e, dispIdx)}
                  onDragLeave={() => setDragOver(null)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="jm-flag-wrap">
                    {/* Chevron flag */}
                    <div
                      className={`jm-flag ${dispIdx === 0 ? 'jm-flag--first' : 'jm-flag--rest'}`}
                      style={{ background: color }}
                    >
                      <span className="jm-flag-num">{dispIdx + 1}</span>
                      <span className="jm-flag-text">{mod.title}</span>
                      <span className="jm-flag-drag">⠿</span>
                    </div>

                    {/* Tooltip */}
                    <FlagTooltip module={mod} objectives={modObjs} color={color} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Module columns (tracks) */}
          <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
            {order.map((modIdx, dispIdx) => {
              const mod = modules[modIdx];
              const color = getModuleColor(modIdx).hex;
              const modObjs = objectives.filter((o) => o.moduleId === mod.id);

              return (
                <div
                  key={mod.id}
                  style={{
                    flexShrink: 0,
                    width: colWidth,
                    position: 'relative',
                    animation: 'jm-reveal-up .4s ease both',
                    animationDelay: `${dispIdx * 0.06}s`,
                  }}
                >
                  <div
                    className="jm-track"
                    style={{ '--track-col': color } as React.CSSProperties}
                  >
                    {/* Track cap dot */}
                    <div
                      className="jm-track-cap"
                      style={{ background: color }}
                    />

                    {/* Module description touchpoint */}
                    <div
                      className="jm-tp"
                      onClick={() => openPanel(mod, null)}
                    >
                      <div
                        className="jm-tp-node"
                        style={{ '--node-col': color } as React.CSSProperties}
                      >
                        0
                      </div>
                      <div className="jm-tp-card">
                        {mod.shortDescription || mod.title}
                      </div>
                    </div>

                    {/* Objective touchpoints */}
                    {modObjs.map((obj, oi) => (
                      <div
                        key={obj.id}
                        className="jm-tp"
                        onClick={() => openPanel(mod, obj)}
                      >
                        <div
                          className="jm-tp-node has-obj"
                          style={{ '--node-col': color } as React.CSSProperties}
                        >
                          ★
                        </div>
                        <div
                          className="jm-tp-card"
                          style={{ borderColor: alpha(color, 0.28) }}
                        >
                          {obj.text.length > 50
                            ? obj.text.slice(0, 48) + '…'
                            : obj.text}
                          {obj.bloomType && (
                            <span
                              className="jm-tp-obj-label"
                              style={{ color }}
                            >
                              {obj.bloomType}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Legend ──────────────────────────────── */}
      <div className="jm-legend">
        <div className="jm-leg">
          <div className="jm-leg-node filled" /> Has learning objectives
        </div>
        <div className="jm-leg">
          <div className="jm-leg-node" /> No objectives defined
        </div>
        <div className="jm-leg">★ Objective node</div>
      </div>

      {/* ── Objectives panel ───────────────────── */}
      <div
        ref={panelRef}
        className={`jm-panel${panelOpen ? ' open' : ''}`}
      >
        {panelModule && (
          <>
            <div className="jm-panel-hdr">
              <div
                className="jm-panel-tag"
                style={{
                  background: alpha(
                    getModuleColor(modules.indexOf(panelModule)).hex,
                    0.18,
                  ),
                  color: getModuleColor(modules.indexOf(panelModule)).hex,
                }}
              >
                {panelModule.title}
              </div>
              <div className="jm-panel-topic">
                {panelObjective ? panelObjective.text : panelModule.shortDescription || panelModule.title}
              </div>
              <button
                className="jm-panel-close"
                onClick={() => setPanelOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="jm-panel-body">
              <div className="jm-panel-section-lbl">
                {panelObjective ? 'Objective Details' : 'Learning Objectives'}
              </div>

              {panelObjective ? (
                /* Single objective detail */
                <div>
                  <div className="jm-obj-row">
                    <div
                      className="jm-obj-dot"
                      style={{
                        background: getModuleColor(modules.indexOf(panelModule)).hex,
                      }}
                    />
                    <div>
                      <div>{panelObjective.text}</div>
                      {panelObjective.bloomType && (
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                          Bloom type: {panelObjective.bloomType}
                        </div>
                      )}
                      {panelObjective.contentType && (
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                          Content: {panelObjective.contentType}
                        </div>
                      )}
                      {panelObjective.sourceLink && (
                        <div style={{ marginTop: 4 }}>
                          <a
                            href={panelObjective.sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 10, color: 'var(--accent)' }}
                          >
                            {panelObjective.sourceLink}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* All objectives for this module */
                (() => {
                  const modObjs = objectives.filter(
                    (o) => o.moduleId === panelModule.id,
                  );
                  if (modObjs.length === 0) {
                    return (
                      <div className="jm-panel-empty">
                        No objectives defined for this module yet.
                      </div>
                    );
                  }
                  return modObjs.map((obj) => (
                    <div key={obj.id} className="jm-obj-row">
                      <div
                        className="jm-obj-dot"
                        style={{
                          background: getModuleColor(modules.indexOf(panelModule)).hex,
                        }}
                      />
                      <div>{obj.text}</div>
                    </div>
                  ));
                })()
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Flag tooltip sub-component ───────────────────
function FlagTooltip({
  module: mod,
  objectives: modObjs,
  color,
}: {
  module: Module;
  objectives: Objective[];
  color: string;
}) {
  return (
    <div className="jm-flag-tooltip">
      <div className="jm-ft-head">
        <div className="jm-ft-mod-name">{mod.title}</div>
        <div
          className="jm-ft-badge"
          style={{ background: alpha(color, 0.18), color }}
        >
          {modObjs.length} obj{modObjs.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="jm-ft-body">
        <div className="jm-ft-lbl">Learning Objectives</div>
        {modObjs.length > 0 ? (
          modObjs.map((obj) => (
            <div key={obj.id} className="jm-ft-obj-row">
              <div className="jm-ft-obj-pip" style={{ background: color }} />
              <div>{obj.text}</div>
            </div>
          ))
        ) : (
          <div className="jm-ft-none">No objectives written yet for this module.</div>
        )}
      </div>
      <div className="jm-ft-stats">
        <div className="jm-ft-stat">
          <b>{modObjs.length}</b>objectives
        </div>
        <div className="jm-ft-stat">
          <b style={{ color }}>{mod.status === 'final' ? 'Final' : mod.status === 'inReview' ? 'Review' : 'Draft'}</b>
          status
        </div>
      </div>
    </div>
  );
}
