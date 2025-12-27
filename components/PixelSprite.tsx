import React from 'react';

interface PixelSpriteProps {
  data: (string | string[])[]; // Can be array of strings (rows) if we parse later, or array of array of colors
  size?: number; // Pixel size multiplier
  className?: string;
}

const PixelSprite: React.FC<PixelSpriteProps> = ({ data, size = 4, className = '' }) => {
  // Normalize data to string[][]
  const rows = data.map((row) => Array.isArray(row) ? row : row.split(''));
  
  const height = rows.length;
  const width = rows[0]?.length || 0;

  return (
    <svg 
      viewBox={`0 0 ${width} ${height}`} 
      className={className}
      shapeRendering="crispEdges" // CRITICAL for pixel art look
      style={{ 
        display: 'block',
        width: size ? `${width * size}px` : '100%',
        height: size ? `${height * size}px` : '100%'
      }} 
    >
      {rows.map((row, y) => (
        row.map((color, x) => (
          color !== 'transparent' && (
            <rect 
              key={`${x}-${y}`} 
              x={x} 
              y={y} 
              width={1} 
              height={1} 
              fill={color} 
            />
          )
        ))
      ))}
    </svg>
  );
};

export default PixelSprite;