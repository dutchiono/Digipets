import React from 'react';
import { PetStats, TileType, PetType } from '../types';
import { TILE_NAMES, PET_BUILD_OPTIONS, getTileSprite } from '../constants';
import { Hammer, Apple, Moon, Play } from 'lucide-react';
import PixelSprite from './PixelSprite';

interface ControlsProps {
  stats: PetStats;
  petType: PetType;
  mode: 'PLAY' | 'BUILD';
  setMode: (mode: 'PLAY' | 'BUILD') => void;
  selectedTile: TileType;
  setSelectedTile: (tile: TileType) => void;
  onFeed: () => void;
  onSleep: () => void;
  onPlay: () => void;
  hideStats?: boolean;
  hideActions?: boolean;
}

const ProgressBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="w-full mb-2">
    <div className="flex justify-between text-xs font-mono-retro mb-1 text-gray-300">
      <span>{label}</span>
      <span>{Math.round(value)}%</span>
    </div>
    <div className="w-full h-3 bg-gray-700 rounded-none border border-gray-600">
      <div 
        className="h-full transition-all duration-300"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const Controls: React.FC<ControlsProps> = ({ 
  stats, 
  petType,
  mode, 
  setMode, 
  selectedTile, 
  setSelectedTile,
  onFeed,
  onSleep,
  onPlay,
  hideStats = false,
  hideActions = false
}) => {
  const buildOptions = PET_BUILD_OPTIONS[petType] || [];

  return (
    <div className="flex flex-col gap-4 p-4 bg-pixel-ui/20 border-t-2 border-pixel-ui w-full max-w-lg">
      
      {/* Stats Area */}
      {!hideStats && (
        <div className="grid grid-cols-3 gap-4 mb-2">
          <ProgressBar label="HUNGER" value={stats.hunger} color="#ef4444" />
          <ProgressBar label="HAPPY" value={stats.happiness} color="#22c55e" />
          <ProgressBar label="ENERGY" value={stats.energy} color="#3b82f6" />
        </div>
      )}

      {/* Main Action Bar */}
      {!hideActions && (
        <div className="flex justify-center gap-4 border-b border-gray-700 pb-4 mb-2">
          <button 
            onClick={onFeed}
            disabled={mode === 'BUILD'}
            className="flex flex-col items-center gap-1 p-3 bg-gray-800 hover:bg-gray-700 active:translate-y-1 border-b-4 border-gray-950 rounded text-xs font-pixel disabled:opacity-50"
          >
            <Apple size={20} className="text-red-400" />
            FEED
          </button>
          <button 
            onClick={onPlay}
            disabled={mode === 'BUILD'}
            className="flex flex-col items-center gap-1 p-3 bg-gray-800 hover:bg-gray-700 active:translate-y-1 border-b-4 border-gray-950 rounded text-xs font-pixel disabled:opacity-50"
          >
            <Play size={20} className="text-green-400" />
            PLAY
          </button>
          <button 
            onClick={onSleep}
            disabled={mode === 'BUILD'}
            className="flex flex-col items-center gap-1 p-3 bg-gray-800 hover:bg-gray-700 active:translate-y-1 border-b-4 border-gray-950 rounded text-xs font-pixel disabled:opacity-50"
          >
            <Moon size={20} className="text-blue-400" />
            NAP
          </button>
          
          <div className="w-px bg-gray-600 mx-2" />

          <button 
            onClick={() => setMode(mode === 'PLAY' ? 'BUILD' : 'PLAY')}
            className={`flex flex-col items-center gap-1 p-3 active:translate-y-1 border-b-4 border-gray-950 rounded text-xs font-pixel 
              ${mode === 'BUILD' ? 'bg-amber-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            <Hammer size={20} className={mode === 'BUILD' ? 'text-white' : 'text-amber-400'} />
            {mode === 'BUILD' ? 'DONE' : 'BUILD'}
          </button>
        </div>
      )}

      {/* Building Palette */}
      {mode === 'BUILD' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-xs font-mono-retro text-gray-400 mb-2 text-center uppercase">- {petType} Habitat Items -</p>
          <div className="grid grid-cols-4 gap-2">
            <button
               onClick={() => setSelectedTile(TileType.EMPTY)}
               className={`flex flex-col items-center justify-center p-3 border-2 rounded bg-gray-900 ${selectedTile === TileType.EMPTY ? 'border-white bg-gray-800' : 'border-gray-600 hover:border-gray-400'}`}
               title="Erase"
            >
              <div className="w-12 h-12 flex items-center justify-center text-red-500 font-bold text-3xl mb-2">X</div>
              <span className="text-[10px] font-mono-retro text-gray-300 uppercase">ERASE</span>
            </button>
            {buildOptions.map(tile => (
              <button
                key={tile}
                onClick={() => setSelectedTile(tile)}
                className={`flex flex-col items-center justify-center p-3 border-2 rounded transition-all ${selectedTile === tile ? 'border-white bg-gray-700 scale-105' : 'border-gray-600 hover:border-gray-400 bg-gray-800'}`}
                title={TILE_NAMES[tile]}
              >
                <div className="w-12 h-12 mb-2 flex items-center justify-center">
                  <PixelSprite data={getTileSprite(tile)} size={0} className="w-full h-full" />
                </div>
                <span className="text-[10px] font-mono-retro text-gray-300 uppercase leading-none text-center">
                  {TILE_NAMES[tile]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Controls;