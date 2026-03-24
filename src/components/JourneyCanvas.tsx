'use client';

import { useMemo, useState } from 'react';
import { Module, Objective, SelectedItem } from '@/types/journey';
import { getModuleColor } from '@/lib/colorTokens';

// ----------------------------------------------------------------
// Layout constants
// ----------------------------------------------------------------
const SVG_PADDING = 60;
const PATH_WIDTH = 900;           // usable width for the S-curves
const SEGMENT_HEIGHT = 260;       // vertical space per module row
const CURVE_RADIUS = 100;         // radius of the U-turn curves
const FLAG_BAR_HEIGHT = 60;       // space for the chevron flags at top
const TOUCHPOINT_RADIUS = 14;
const LABEL_OFFSET = 28;          // distance from circle to label text

interface Props {
  modules: Module[];
  objectives: Objective[];
  onSelect: (item: SelectedItem) => void;
}

// ----------------------------------------------------------------
// Helpers: build the winding path geometry
// ----------------------------------------------------------------

interface TouchpointPos {
  x: number;
  y: number;
  objective: Objective;
  moduleIndex: number;
}

interface ModuleSegment {
  pathD: string;          // SVG path "d" attribute for this segment
  color: string;          // hex colour
  module: Module;
  index: number;
  touchpoints: TouchpointPos[];
}

/**
 * For each module, generates an SVG path segment and positions for
 * its objectives (touchpoints). The path snakes left→right then
 * right→left, with U-turn curves between rows.
 */
function buildSegments(
  modules: Module[],
  objectives: Objective[],
): { segments: ModuleSegment[]; totalHeight: number; totalWidth: number } {
  const segments: ModuleSegment[] = [];
  const totalWidth = PATH_WIDTH + SVG_PADDING * 2;

  const leftX = SVG_PADDING + CURVE_RADIUS;
  const rightX = SVG_PADDING + PATH_WIDTH - CURVE_RADIUS;
  const startY = FLAG_BAR_HEIGHT + SVG_PADDING;

  let curY = startY;

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    const color = getModuleColor(i).hex;
    const goingRight = i % 2 === 0;
    const modObjectives = objectives.filter((o) => o.moduleId === mod.id);

    // Straight horizontal segment
    const fromX = goingRight ? leftX : rightX;
    const toX = goingRight ? rightX : leftX;
    const y = curY;

    // Place touchpoints evenly along the straight segment
    const touchpoints: TouchpointPos[] = modObjectives.map((obj, oi) => {
      const t = modObjectives.length === 1
        ? 0.5
        : oi / (modObjectives.length - 1);
      return {
        x: fromX + (toX - fromX) * t,
        y,
        objective: obj,
        moduleIndex: i,
      };
    });

    // Build the SVG path: straight line + U-turn curve to next row
    let pathD = `M ${fromX} ${y} L ${toX} ${y}`;

    // Add U-turn curve to connect to next module (unless last)
    if (i < modules.length - 1) {
      const turnDir = goingRight ? 1 : -1; // which side the turn is on
      const turnX = toX;
      const nextY = y + SEGMENT_HEIGHT;

      // Semicircular arc: go down by SEGMENT_HEIGHT via a wide U-turn
      pathD += ` C ${turnX + turnDir * CURVE_RADIUS} ${y}, ${turnX + turnDir * CURVE_RADIUS} ${nextY}, ${turnX} ${nextY}`;
    }

    segments.push({ pathD, color, module: mod, index: i, touchpoints });

    curY += SEGMENT_HEIGHT;
  }

  const totalHeight = curY + SVG_PADDING;
  return { segments, totalHeight, totalWidth };
}

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------

function ChevronFlags({
  modules,
  onSelect,
}: {
  modules: Module[];
  onSelect: (item: SelectedItem) => void;
}) {
  const flagWidth = Math.min(160, (PATH_WIDTH - 20) / modules.length);
  const startX = SVG_PADDING + CURVE_RADIUS;

  return (
    <g>
      {modules.map((mod, i) => {
        const color = getModuleColor(i).hex;
        const x = startX + i * (flagWidth + 4);
        const y = SVG_PADDING / 2;
        const h = 32;
        const chevronTip = 10;

        // Chevron/arrow shape
        const points = [
          `${x},${y}`,
          `${x + flagWidth - chevronTip},${y}`,
          `${x + flagWidth},${y + h / 2}`,
          `${x + flagWidth - chevronTip},${y + h}`,
          `${x},${y + h}`,
          `${x + chevronTip},${y + h / 2}`,
        ].join(' ');

        return (
          <g
            key={mod.id}
            className="cursor-pointer"
            onClick={() => onSelect({ type: 'module', moduleId: mod.id })}
          >
            <polygon
              points={points}
              fill={color}
              className="hover:opacity-80 transition-opacity"
            />
            <text
              x={x + (flagWidth + chevronTip) / 2}
              y={y + h / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="11"
              fontWeight="600"
              className="pointer-events-none select-none"
            >
              {mod.title.length > 18 ? mod.title.slice(0, 16) + '…' : mod.title}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ----------------------------------------------------------------
// Main component
// ----------------------------------------------------------------

export default function JourneyCanvas({ modules, objectives, onSelect }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { segments, totalHeight, totalWidth } = useMemo(
    () => buildSegments(modules, objectives),
    [modules, objectives],
  );

  if (modules.length === 0) {
    return (
      <div className="relative flex-1 p-8">
        <div className="border border-dashed border-slate-700 rounded-lg h-full flex items-center justify-center">
          <p className="text-sm text-slate-400">
            No modules to display. Upload a design doc to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-auto p-4">
      <svg
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="mx-auto"
      >
        {/* Chevron flags across the top */}
        <ChevronFlags modules={modules} onSelect={onSelect} />

        {/* Path segments (dashed, coloured per module) */}
        {segments.map((seg) => (
          <path
            key={seg.module.id}
            d={seg.pathD}
            fill="none"
            stroke={seg.color}
            strokeWidth="4"
            strokeDasharray="14 8"
            strokeLinecap="round"
          />
        ))}

        {/* Touchpoint circles + labels */}
        {segments.map((seg) =>
          seg.touchpoints.map((tp) => {
            const isHovered = hoveredId === tp.objective.id;
            const labelOnLeft = seg.index % 2 !== 0;
            // Alternate labels above and below the path
            const labelAbove =
              tp.objective.order !== undefined
                ? tp.objective.order % 2 === 0
                : seg.touchpoints.indexOf(tp) % 2 === 0;
            const labelY = labelAbove
              ? tp.y - LABEL_OFFSET
              : tp.y + LABEL_OFFSET + 4;

            return (
              <g
                key={tp.objective.id}
                className="cursor-pointer"
                onClick={() =>
                  onSelect({
                    type: 'objective',
                    objectiveId: tp.objective.id,
                  })
                }
                onMouseEnter={() => setHoveredId(tp.objective.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Outer ring */}
                <circle
                  cx={tp.x}
                  cy={tp.y}
                  r={TOUCHPOINT_RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? 4 : 3}
                  className="transition-all"
                />
                {/* Inner dot */}
                <circle
                  cx={tp.x}
                  cy={tp.y}
                  r={5}
                  fill={isHovered ? seg.color : 'transparent'}
                  className="transition-all"
                />

                {/* Label: title */}
                <text
                  x={tp.x}
                  y={labelY}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="600"
                  className="pointer-events-none select-none"
                >
                  {tp.objective.bloomType || 'Touchpoint'}
                </text>
                {/* Label: description (truncated) */}
                <text
                  x={tp.x}
                  y={labelY + 14}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  className="pointer-events-none select-none"
                >
                  {tp.objective.text.length > 30
                    ? tp.objective.text.slice(0, 28) + '…'
                    : tp.objective.text}
                </text>
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}
