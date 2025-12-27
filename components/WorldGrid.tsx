import React from 'react';
import { TileType, Coordinates, PetType } from '../types';
import { WORLD_SIZE, getSprite, getTileSprite } from '../constants';
import PixelSprite from './PixelSprite';

interface WorldGridProps {
  world: TileType[][];
  petPosition: Coordinates;
  petType: PetType;
  petAction: 'idle' | 'move' | 'sleep';
  onTileClick: (x: number, y: number) => void;
  isBuilding: boolean;
  showPet?: boolean;
}

const WorldGrid: React.FC<WorldGridProps> = ({ 
  world, 
  petPosition, 
  petType, 
  petAction,
  onTileClick,
  isBuilding,
  showPet = true
}) => {
  
  const petSpriteData = getSprite(petType, petAction);

  return (
    <div 
      className="relative bg-[#1a1c29] border-4 border-[#484a77] shadow-xl select-none"
      style={{
        width: `${WORLD_SIZE * 32}px`,
        height: `${WORLD_SIZE * 32}px`,
      }}
    >
      {/* Render Tiles */}
      <div 
        className="grid absolute inset-0" 
        style={{ 
          gridTemplateColumns: `repeat(${WORLD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${WORLD_SIZE}, 1fr)`,
        }}
      >
        {world.map((row, y) => (
          row.map((tile, x) => (
            <div 
              key={`${x}-${y}`}
              onClick={() => onTileClick(x, y)}
              className={`
                w-full h-full box-border relative
                ${isBuilding ? 'cursor-pointer hover:brightness-110 hover:after:absolute hover:after:inset-0 hover:after:border-2 hover:after:border-white/30 hover:after:content-[""]' : ''}
              `}
              title={`Pos: ${x},${y}`}
            >
              {tile !== TileType.EMPTY && (
                <PixelSprite 
                  data={getTileSprite(tile)} 
                  size={4} 
                  className="w-full h-full"
                />
              )}
            </div>
          ))
        ))}
      </div>

      {/* Render Pet */}
      {showPet && (
        <div 
          className="absolute transition-all duration-500 ease-in-out z-10 pointer-events-none"
          style={{
            left: `${petPosition.x * 32}px`,
            top: `${petPosition.y * 32}px`,
            width: '32px',
            height: '32px',
          }}
        >
          <PixelSprite data={petSpriteData} size={4} />
        </div>
      )}
    </div>
  );
};

export default WorldGrid;