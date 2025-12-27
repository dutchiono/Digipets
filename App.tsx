import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  PetType, 
  TileType, 
  PetStats, 
  Coordinates, 
  ChatMessage 
} from './types';
import { 
  WORLD_SIZE, 
  TICK_RATE, 
  INITIAL_STATS, 
  SOLID_TILES,
  INTERACTABLES,
  getSprite 
} from './constants';
import WorldGrid from './components/WorldGrid';
import Controls from './components/Controls';
import PixelSprite from './components/PixelSprite';
import { generatePetReaction } from './services/geminiService';
import { Send, Check } from 'lucide-react';

type GamePhase = 'SELECT' | 'SETUP' | 'PLAYING';
type InteractionTarget = {
  pos: Coordinates;
  type: 'FEED' | 'SLEEP' | 'PLAY';
};

// Simple BFS Pathfinding
const findPath = (start: Coordinates, end: Coordinates, world: TileType[][]): Coordinates | null => {
  if (start.x === end.x && start.y === end.y) return end;

  const queue: { pos: Coordinates; path: Coordinates[] }[] = [{ pos: start, path: [] }];
  const visited = new Set<string>([`${start.x},${start.y}`]);
  
  // Safety break
  let iterations = 0;

  while (queue.length > 0 && iterations < 500) {
    iterations++;
    const { pos, path } = queue.shift()!;
    
    // Check neighbors
    const dirs = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];
    for (const d of dirs) {
      const nx = pos.x + d.x;
      const ny = pos.y + d.y;
      
      if (nx === end.x && ny === end.y) {
        return path[0] || { x: nx, y: ny };
      }

      if (nx >= 0 && nx < WORLD_SIZE && ny >= 0 && ny < WORLD_SIZE) {
        const key = `${nx},${ny}`;
        if (!visited.has(key)) {
          // Check collision
          const tile = world[ny][nx];
          if (!SOLID_TILES.includes(tile)) {
            visited.add(key);
            queue.push({ pos: { x: nx, y: ny }, path: [...path, { x: nx, y: ny }] });
          }
        }
      }
    }
  }
  return null; // No path found
};

const App: React.FC = () => {
  // --- STATE ---
  const [phase, setPhase] = useState<GamePhase>('SELECT');
  const [petType, setPetType] = useState<PetType>(PetType.DOG);
  const [petName, setPetName] = useState<string>('');
  
  const [world, setWorld] = useState<TileType[][]>([]);
  // Start pet on the ground (ground level is y=9, so pet stands at y=8)
  const [petPos, setPetPos] = useState<Coordinates>({ x: Math.floor(WORLD_SIZE/2), y: 8 });
  const [stats, setStats] = useState<PetStats>(INITIAL_STATS);
  const [mode, setMode] = useState<'PLAY' | 'BUILD'>('PLAY');
  const [selectedTile, setSelectedTile] = useState<TileType>(TileType.GRASS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  
  // Animation & AI State
  const [action, setAction] = useState<'idle' | 'move' | 'sleep'>('idle');
  const [target, setTarget] = useState<InteractionTarget | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const tickRef = useRef<number>(0);

  // --- INITIALIZATION ---
  useEffect(() => {
    // Initialize empty world with default floor
    const newWorld = Array(WORLD_SIZE).fill(null).map(() => Array(WORLD_SIZE).fill(TileType.EMPTY));
    
    // Generate ground at the bottom
    for(let x=0; x<WORLD_SIZE; x++) {
        for(let y=0; y<WORLD_SIZE; y++) {
            if (y > 9) newWorld[y][x] = TileType.DIRT;
            else if (y === 9) newWorld[y][x] = TileType.GRASS;
        }
    }
    setWorld(newWorld);
  }, []);

  const startSetup = () => {
    if (petName.trim().length > 0) {
      setPhase('SETUP');
      setMode('BUILD');
      
      // Select first available tile for that pet by default
      if (petType === PetType.FISH) {
        setSelectedTile(TileType.WATER);
        // Clear the default grass/dirt for fish so user starts with empty tank
        const emptyWorld = Array(WORLD_SIZE).fill(null).map(() => Array(WORLD_SIZE).fill(TileType.EMPTY));
        setWorld(emptyWorld);
        // Center fish
        setPetPos({ x: Math.floor(WORLD_SIZE/2), y: Math.floor(WORLD_SIZE/2) });
      } else {
        setSelectedTile(TileType.WOOD);
      }
    }
  };

  const startGame = () => {
    setPhase('PLAYING');
    setMode('PLAY');
    // Welcome message
    addMessage('pet', `*${petName} enters the habitat*`);
    triggerAIReaction(`${petName} has just arrived in their new home you built.`);
  };

  // --- GAME LOGIC ---

  const addMessage = (sender: 'user' | 'pet', text: string) => {
    setMessages(prev => [...prev.slice(-4), { sender, text, timestamp: Date.now() }]);
  };

  const movePet = useCallback(() => {
    // If we have a target, try to move there
    if (target) {
      // Are we there yet?
      if (petPos.x === target.pos.x && petPos.y === target.pos.y) {
        // ACTION COMPLETE
        if (target.type === 'FEED') {
           setStats(prev => ({ ...prev, hunger: Math.min(100, prev.hunger + 30), happiness: Math.min(100, prev.happiness + 10) }));
           addMessage('pet', '*Nom nom nom*');
           setAction('move'); // eating wiggle
        } else if (target.type === 'SLEEP') {
           setAction('sleep');
           addMessage('pet', '*Zzz...*');
        } else if (target.type === 'PLAY') {
           setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 20), energy: Math.max(0, prev.energy - 15) }));
           setAction('move');
           addMessage('pet', '*Plays happily!*');
        }
        
        // Clear target but keep sleep action if sleeping
        setTarget(null);
        if (target.type !== 'SLEEP') {
           setTimeout(() => setAction('idle'), 1000);
        }
        return;
      }

      // Pathfind
      const nextStep = findPath(petPos, target.pos, world);
      if (nextStep) {
        setPetPos(nextStep);
        setAction('move');
        // If we are just moving, reset to idle quickly if not consecutive
      } else {
        // Path blocked
        addMessage('pet', "*Can't reach it!*");
        setTarget(null);
        setAction('idle');
      }
      return;
    }

    // Random Wander if no target and awake
    if (stats.energy < 5) return; // Too tired
    if (action === 'sleep') return;

    const moves = [
      { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
    ];
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    const newX = petPos.x + randomMove.x;
    const newY = petPos.y + randomMove.y;

    if (newX >= 0 && newX < WORLD_SIZE && newY >= 0 && newY < WORLD_SIZE) {
      const tile = world[newY][newX];
      if (!SOLID_TILES.includes(tile)) {
        setPetPos({ x: newX, y: newY });
        setAction('move');
        setTimeout(() => setAction('idle'), 500);
      }
    }
  }, [petPos, stats.energy, target, world, action]);

  const decayStats = useCallback(() => {
    setStats(prev => ({
      hunger: Math.max(0, prev.hunger - 1), 
      energy: action === 'sleep' ? Math.min(100, prev.energy + 5) : Math.max(0, prev.energy - 0.5),
      happiness: Math.max(0, prev.happiness - 0.5)
    }));
  }, [action]);

  // Main Loop
  useEffect(() => {
    if (phase !== 'PLAYING') return;

    const interval = setInterval(() => {
      tickRef.current += 1;
      
      decayStats();

      // If we have a target, move every tick (faster). 
      // If wandering, move occasionally.
      if (target) {
         movePet();
      } else if (Math.random() < 0.3 && action !== 'sleep' && mode === 'PLAY') {
        movePet();
      }

      // Check for critical stats to trigger AI complaint
      if (tickRef.current % 15 === 0 && !isProcessingAI) { 
         if (stats.hunger < 20 || stats.happiness < 20) {
             triggerAIReaction();
         }
      }

    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [phase, decayStats, movePet, action, mode, stats, isProcessingAI, target]);


  // --- INTERACTIONS ---

  const findNearestTile = (types: TileType[]): Coordinates | null => {
    let nearest: Coordinates | null = null;
    let minDist = Infinity;

    for (let y = 0; y < WORLD_SIZE; y++) {
      for (let x = 0; x < WORLD_SIZE; x++) {
        if (types.includes(world[y][x])) {
           // Calc distance
           const d = Math.abs(petPos.x - x) + Math.abs(petPos.y - y);
           if (d < minDist) {
             minDist = d;
             nearest = { x, y };
           }
        }
      }
    }
    return nearest;
  };

  const handleTileClick = (x: number, y: number) => {
    if (mode === 'BUILD') {
      const newWorld = [...world];
      newWorld[y] = [...newWorld[y]]; // Copy row
      newWorld[y][x] = selectedTile;
      setWorld(newWorld);
    }
  };

  const handleFeed = () => {
    const bowlPos = findNearestTile(INTERACTABLES.FEED);
    if (bowlPos) {
      addMessage('pet', '*Smells food...*');
      setTarget({ pos: bowlPos, type: 'FEED' });
      // Wake up if sleeping
      if (action === 'sleep') setAction('idle');
    } else {
      // Magic feed if no bowl
      setStats(prev => ({ ...prev, hunger: Math.min(100, prev.hunger + 15) }));
      addMessage('pet', '*Catching treats!*');
      setAction('move');
      setTimeout(() => setAction('idle'), 500);
    }
  };

  const handlePlay = () => {
    if (stats.energy < 10) {
      addMessage('pet', '*Too tired...*');
      return;
    }
    
    const toyPos = findNearestTile(INTERACTABLES.PLAY);
    if (toyPos) {
      setTarget({ pos: toyPos, type: 'PLAY' });
      // Wake up
      if (action === 'sleep') setAction('idle');
    } else {
      // Magic play
      setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 15), energy: Math.max(0, prev.energy - 10) }));
      setAction('move');
      setTimeout(() => setAction('idle'), 500);
      triggerAIReaction("The user played with you!");
    }
  };

  const handleSleep = () => {
    if (action === 'sleep') {
      setAction('idle');
      addMessage('pet', '*Wakes up*');
      return;
    }

    const bedPos = findNearestTile(INTERACTABLES.SLEEP);
    if (bedPos) {
       addMessage('pet', '*Yawn... going to bed*');
       setTarget({ pos: bedPos, type: 'SLEEP' });
    } else {
       setAction('sleep');
       addMessage('pet', '*Naps on the floor*');
    }
  };

  const triggerAIReaction = async (context?: string) => {
    setIsProcessingAI(true);
    const reaction = await generatePetReaction(petType, petName, stats, context);
    addMessage('pet', reaction);
    setIsProcessingAI(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isProcessingAI) return;
    
    const txt = inputMsg;
    setInputMsg('');
    addMessage('user', txt);
    
    await triggerAIReaction(txt);
  };

  // --- RENDER ---

  if (phase === 'SELECT') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pixel-bg text-white font-pixel">
        <div className="max-w-md w-full p-8 border-4 border-pixel-ui bg-gray-900 shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]">
          <h1 className="text-3xl text-center text-pixel-accent mb-8">PIXEL PET</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs text-gray-400 mb-2">CHOOSE YOUR COMPANION</label>
              <div className="flex justify-center gap-4">
                {[PetType.DOG, PetType.CAT, PetType.FISH].map(type => (
                  <button
                    key={type}
                    onClick={() => setPetType(type)}
                    className={`p-4 border-2 transition-transform hover:scale-110 flex flex-col items-center gap-2 ${petType === type ? 'border-pixel-accent bg-pixel-accent/20' : 'border-gray-600 bg-gray-800'}`}
                  >
                    <div className="w-16 h-16">
                      <PixelSprite data={getSprite(type, 'idle')} size={8} />
                    </div>
                    <span className="font-pixel text-[10px] uppercase text-gray-300 tracking-wider">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">NAME YOUR PET</label>
              <input 
                type="text" 
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                maxLength={10}
                className="w-full bg-gray-800 border-2 border-gray-600 p-3 text-center text-xl focus:border-pixel-accent outline-none font-mono-retro"
                placeholder="TYPE NAME..."
              />
            </div>

            <button 
              onClick={startSetup}
              disabled={!petName}
              className="w-full py-4 bg-pixel-accent text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-red-900 active:border-b-0 active:translate-y-1 mt-4"
            >
              NEXT: BUILD HABITAT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pixel-bg text-white flex flex-col items-center py-6 px-4 font-sans select-none">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="font-pixel text-xl text-pixel-accent tracking-widest drop-shadow-md">
          {phase === 'SETUP' ? `BUILDING ${petName.toUpperCase()}'S HOME` : `${petName.toUpperCase()}'S WORLD`}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full max-w-5xl">
        
        {/* Left Column: Game View */}
        <div className="flex flex-col items-center">
          <WorldGrid 
            world={world} 
            petPosition={petPos} 
            petType={petType}
            petAction={action}
            onTileClick={handleTileClick}
            isBuilding={mode === 'BUILD'}
            showPet={phase === 'PLAYING'}
          />
          
          <div className="mt-4 w-full">
            {phase === 'SETUP' ? (
               <div className="bg-pixel-ui/20 border-2 border-pixel-ui p-4">
                  <div className="flex justify-between items-center mb-4">
                     <p className="font-mono-retro text-yellow-400 text-lg">
                       Design a cozy spot for {petName} to live!
                     </p>
                     <button
                       onClick={startGame}
                       className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-pixel text-xs border-b-4 border-green-800 active:border-b-0 active:translate-y-1 flex items-center gap-2"
                     >
                       <Check size={16} /> FINISH
                     </button>
                  </div>
                  <Controls 
                    stats={stats}
                    mode={mode}
                    setMode={setMode}
                    selectedTile={selectedTile}
                    setSelectedTile={setSelectedTile}
                    onFeed={handleFeed}
                    onSleep={handleSleep}
                    onPlay={handlePlay}
                    hideStats={true}
                    hideActions={true}
                    petType={petType}
                  />
               </div>
            ) : (
              <Controls 
                stats={stats}
                mode={mode}
                setMode={setMode}
                selectedTile={selectedTile}
                setSelectedTile={setSelectedTile}
                onFeed={handleFeed}
                onSleep={handleSleep}
                onPlay={handlePlay}
                petType={petType}
              />
            )}
          </div>
        </div>

        {/* Right Column: Chat & AI Log */}
        {phase === 'PLAYING' && (
          <div className="w-full lg:w-80 h-[500px] flex flex-col border-4 border-pixel-ui bg-gray-900 shadow-xl animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-pixel-ui p-2 text-center border-b-4 border-gray-800">
              <h2 className="font-pixel text-xs">PET LOG</h2>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto font-mono-retro text-lg space-y-3 scrollbar-thin">
              {messages.length === 0 && (
                <p className="text-gray-500 text-center italic mt-10">No activity yet...</p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-500 mb-1">{msg.sender === 'user' ? 'YOU' : petName.toUpperCase()}</span>
                  <div className={`p-2 rounded max-w-[90%] border-b-2 ${
                    msg.sender === 'user' 
                      ? 'bg-blue-900/50 border-blue-700 text-blue-100' 
                      : 'bg-green-900/50 border-green-700 text-green-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isProcessingAI && (
                <div className="flex items-start animate-pulse">
                  <span className="text-xs text-gray-500 mb-1">{petName.toUpperCase()}</span>
                  <div className="bg-gray-800 p-2 text-gray-400 text-sm rounded ml-1">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-2 border-t-2 border-gray-700 bg-gray-800 flex gap-2">
              <input 
                className="flex-1 bg-gray-900 border border-gray-600 px-3 py-2 text-sm font-mono-retro focus:border-pixel-accent outline-none"
                placeholder="Say something..."
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                disabled={isProcessingAI}
              />
              <button 
                type="submit" 
                disabled={isProcessingAI || !inputMsg.trim()}
                className="bg-pixel-ui hover:bg-blue-600 text-white p-2 border-b-2 border-blue-900 active:translate-y-px disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;