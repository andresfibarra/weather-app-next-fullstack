'use-client';

import React from 'react';
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  ResponsiveContainer,
} from 'recharts';

function UVIndexGraph({ uvi }) {
  // clamp value
  const uvValue = Math.min(Math.max(uvi ?? 0, 0), 11);

  // create data range
  const data = [
    { x: 0, uvi: 0 },
    { x: 11, uvi: 0 },
  ];

  return (
    <div className="w-full max-w-[700px] h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 20,
            bottom: 0,
          }}
        >
          <Line
            type="monotone"
            dataKey="uvi"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
          <ReferenceDot
            x={uvValue}
            y={0}
            r={6}
            fill="#f87171" // red dot (change if you want)
            stroke="#ffffff"
            strokeWidth={2}
            isFront
          />
          {/* Horizontal scale labeling */}
          <XAxis dataKey="x" type="number" domain={[0, 11]} ticks={[0, 2, 4, 6, 8, 10, 11]} />
          <YAxis hide domain={[-1, 1]} /> {/* Hide Y axis since it's a flat line */}
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default UVIndexGraph;
