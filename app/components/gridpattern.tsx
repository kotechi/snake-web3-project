import React from 'react';

interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: Array<[number, number]>;
  strokeDasharray?: string;
  className?: string;
  [key: string]: any;
}

export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  squares,
  className,
  ...props
}: GridPatternProps) {
  const id = React.useId();
  
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full fill-gray-700/20 stroke-gray-700/30 ${className || ''}`}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y], index) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}-${index}`}
              width={width - 1}
              height={height - 1}
              x={x * width + 1}
              y={y * height + 1}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

const GridPatternBG = () => {
  return (
    <>
      <div className="absolute inset-0 z-0 h-full w-full">
        <GridPattern
          width={50}
          height={50}
          x={-1}
          y={-1}
          squares={[
            [0, 1],
            [1, 3],
            [3, 0],
            [4, 4],
            [6, 2],
            [8, 5],
            [10, 1],
            [12, 4],
            [2, 6],
            [5, 8],
            [7, 7],
            [9, 3],
            [11, 6],
            [13, 2],
            [15, 5],
          ]}
          className="fill-gray-800/40 stroke-gray-700/40"
        />
      </div>
      {/* Gradient overlay for fade effect */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black-900/80 via-black/50 to-black-900 pointer-events-none"></div>
    </>
  );
};

export default GridPatternBG;