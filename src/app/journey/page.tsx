'use client';

import JourneyMap from '@/components/JourneyMap';
import { useState } from 'react';
import { SelectedItem } from '@/types/journey';
import { useJourney } from '@/lib/JourneyContext';

export default function JourneyPage() {
  const { modules, objectives, warnings } = useJourney();
  const [, setSelected] = useState<SelectedItem>(null);

  return (
    <>
      {/* Parser warnings */}
      {warnings.length > 0 && (
        <div
          style={{
            margin: '16px 40px 0',
            padding: 12,
            borderRadius: 8,
            background: 'rgba(255,171,0,0.08)',
            border: '1px solid rgba(255,171,0,0.25)',
            fontSize: 11,
            color: 'rgba(255,171,0,0.8)',
          }}
        >
          <strong>Parser warnings:</strong>
          <ul style={{ marginTop: 4, paddingLeft: 16 }}>
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <JourneyMap
        modules={modules}
        objectives={objectives}
        onSelect={setSelected}
      />
    </>
  );
}
