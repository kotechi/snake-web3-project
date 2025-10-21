import { useState, useEffect, useCallback, useRef } from 'react';
import { GAME_CONFIG } from '../lib/types';
import type { Position, Direction, GameState } from '../lib/types';
    
interface SnakeGameProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

export function SnakeGame({ onGameOver, onScoreUpdate }: SnakeGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: 'RIGHT',
    score: 0,
    isPlaying: false,
    isGameOver: false,
    speed: GAME_CONFIG.initialSpeed,
  });

  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const gameOverCalledRef = useRef<boolean>(false); // Tambahkan flag untuk mencegah double call

  // Generate random food position
  const generateFood = useCallback((snake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GAME_CONFIG.gridSize),
        y: Math.floor(Math.random() * GAME_CONFIG.gridSize),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Check collision
  const checkCollision = useCallback((head: Position, snake: Position[]): boolean => {
    // Wall collision
    if (
      head.x < 0 ||
      head.x >= GAME_CONFIG.gridSize ||
      head.y < 0 ||
      head.y >= GAME_CONFIG.gridSize
    ) {
      return true;
    }
    // Self collision (check head vs body, exclude head itself)
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    setGameState(prevState => {
      if (!prevState.isPlaying || prevState.isGameOver) return prevState;

      // Update direction dari queue
      if (nextDirectionRef.current) {
        directionRef.current = nextDirectionRef.current;
        nextDirectionRef.current = null;
      }

      const direction = directionRef.current;
      const head = { ...prevState.snake[0] };

      // Move head
      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check collision dengan snake lengkap (termasuk head baru)
      if (checkCollision(head, prevState.snake)) {
        // Gunakan flag untuk mencegah double call
        if (!gameOverCalledRef.current) {
          gameOverCalledRef.current = true;
          // Call onGameOver menggunakan setTimeout untuk memastikan hanya dipanggil sekali
          setTimeout(() => {
            onGameOver(prevState.score);
          }, 0);
        }
        return { ...prevState, isPlaying: false, isGameOver: true };
      }

      const newSnake = [head, ...prevState.snake];
      let newFood = prevState.food;
      let newScore = prevState.score;
      let newSpeed = prevState.speed;

      // Check if food eaten
      if (head.x === prevState.food.x && head.y === prevState.food.y) {
        newScore += 10;
        newFood = generateFood(newSnake);
        
        // Increase speed every 50 points
        if (newScore % 50 === 0 && newSpeed > GAME_CONFIG.maxSpeed) {
          newSpeed -= GAME_CONFIG.speedIncrement;
        }

        // Check if map is full
        if (newSnake.length >= GAME_CONFIG.gridSize * GAME_CONFIG.gridSize) {
          // Reset map but keep score
          return {
            ...prevState,
            snake: [{ x: 10, y: 10 }],
            food: generateFood([{ x: 10, y: 10 }]),
            direction: 'RIGHT',
            score: newScore,
            speed: newSpeed,
          };
        }

        onScoreUpdate(newScore);
      } else {
        newSnake.pop();
      }

      return {
        ...prevState,
        snake: newSnake,
        food: newFood,
        score: newScore,
        speed: newSpeed,
        direction,
      };
    });
  }, [checkCollision, generateFood, onGameOver, onScoreUpdate]);

  // Handle keyboard input dengan queue direction
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;

      const currentDirection = directionRef.current;
      let newDirection: Direction | null = null;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDirection !== 'DOWN') newDirection = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDirection !== 'UP') newDirection = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDirection !== 'RIGHT') newDirection = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDirection !== 'LEFT') newDirection = 'RIGHT';
          break;
      }

      // Queue direction jika valid
      if (newDirection && !nextDirectionRef.current) {
        nextDirectionRef.current = newDirection;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.isPlaying]);

  // Game loop interval
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      gameLoopRef.current = window.setInterval(gameLoop, gameState.speed);
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameState.isPlaying, gameState.isGameOver, gameState.speed, gameLoop]);

  const startGame = () => {
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = null;
    gameOverCalledRef.current = false; // Reset flag saat start game
    setGameState({
      snake: [{ x: 10, y: 10 }],
      food: generateFood([{ x: 10, y: 10 }]),
      direction: 'RIGHT',
      score: 0,
      isPlaying: true,
      isGameOver: false,
      speed: GAME_CONFIG.initialSpeed,
    });
  };

  const resetGame = () => {
    gameOverCalledRef.current = false; // Reset flag saat reset game
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isGameOver: false,
    }));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score Display */}
      <div className="text-2xl font-bold text-white">
        Score: {gameState.score}
      </div>

      {/* Game Board */}
      <div
        className="relative border-4 border-green-500 bg-gray-900 rounded-lg shadow-lg"
        style={{
          width: GAME_CONFIG.gridSize * GAME_CONFIG.cellSize + 10,
          height: GAME_CONFIG.gridSize * GAME_CONFIG.cellSize + 10,
        }}
      >
        {/* Grid lines untuk desain lebih baik */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: GAME_CONFIG.gridSize }).map((_, i) => (
            <div key={`v-${i}`} className="absolute bg-gray-600" style={{ left: i * GAME_CONFIG.cellSize, top: 0, width: 1, height: '100%' }} />
          ))}
          {Array.from({ length: GAME_CONFIG.gridSize }).map((_, i) => (
            <div key={`h-${i}`} className="absolute bg-gray-600" style={{ left: 0, top: i * GAME_CONFIG.cellSize, width: '100%', height: 1 }} />
          ))}
        </div>

        {/* Snake */}
        {gameState.snake.map((segment, index) => (
          <div
            key={`${segment.x}-${segment.y}-${index}`}
            className={`absolute ${
              index === 0 ? 'bg-green-400 shadow-md' : 'bg-green-600'
            } rounded-sm transition-all duration-75`}
            style={{
              left: segment.x * GAME_CONFIG.cellSize + 1,
              top: segment.y * GAME_CONFIG.cellSize + 1,
              width: GAME_CONFIG.cellSize - 2,
              height: GAME_CONFIG.cellSize - 2,
            }}
          />
        ))}

        {/* Food (apple) */}
        <div
          className="absolute bg-red-500 rounded-full shadow-lg animate-pulse"
          style={{
            left: gameState.food.x * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2 - 4,
            top: gameState.food.y * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2 - 4,
            width: 10,
            height: 10,
          }}
        />

        {/* Game Over Overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 rounded-lg">
            <div className="text-center bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-red-400 mb-4">Game Over!</h2>
              <p className="text-xl text-white mb-4">Final Score: {gameState.score}</p>
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!gameState.isPlaying && !gameState.isGameOver && (
        <button
          onClick={startGame}
          className="px-8 py-3 bg-green-500 text-white text-xl font-bold rounded-lg hover:bg-green-600 transition shadow-lg"
        >
          Start Game
        </button>
      )}

      {/* Instructions */}
      <div className="text-center text-gray-300 text-sm bg-gray-800 p-3 rounded-lg">
        <p>Use Arrow Keys or WASD to move</p>
        <p>Eat red apple to grow • Avoid walls and yourself!</p>
      </div>
    </div>
  );
}