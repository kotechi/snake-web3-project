import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ConnectWallet } from '../components/connect-wallet';
import { useWallet } from '../hooks/use-wallet';
import { contractInstance } from '../lib/stellar-contract';
import { Trophy, Gamepad2, Timer, Coins, Users, Crown } from 'lucide-react';
import type { Competition, PlayerScore } from '../lib/types';
import GridPatternBG from '~/components/gridpattern';

export default function HomePage() {
  const { address, isConnected } = useWallet();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [entryFee, setEntryFee] = useState('0.1');
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [comp, fee, lb] = await Promise.all([
        contractInstance.getCompetition(),
        contractInstance.getEntryFee(),
        contractInstance.getLeaderboard(),
      ]);
      setCompetition(comp);
      setEntryFee(fee);
      setLeaderboard(lb.slice(0, 3)); // Top 3 only
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const timeRemaining = competition
    ? Math.max(0, Number(competition.deadline) - Math.floor(Date.now() / 1000))
    : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const isActive = competition?.status === 1 && timeRemaining > 60;

  // Check if connected wallet is admin
  const isAdmin = address === 'GDC6STZRTFF7GY7WWJ3G7FUZ6FX62YGYUTUWKLXU724D2TFDQGI2NZY6';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Header with Wallet */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐍</span>
            <span className="font-bold text-xl">Snake Competition</span>
          </div>
          <ConnectWallet />
        </div>
      </header>

      {/* Hero Section */}
       
      <div className="relative overflow-hidden">
        <GridPatternBG /> 
        <div className="relative max-w-6xl z-10 mx-auto px-8 py-16 text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              🐍 Snake Game Competition
            </h1>
            <p className="text-xl text-gray-300">
              Play Snake • Earn XLM • Dominate the Leaderboard
            </p>
          </div>

          {/* Competition Status */}
          <div className="inline-block bg-gray-800 rounded-lg p-6 mb-8">
            {isActive ? (
              <div className="items-center">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Competition Active</p>
                  <div className='flex gap-4 items-center'>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-2xl font-bold text-green-400">
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-400">No Active Competition</p>
                  <p className="text-xl font-bold text-red-400">Waiting for Admin</p>
                </div>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isConnected ? (
              <div className="text-center">
                <p className="text-gray-400 mb-4">Connect your wallet to play</p>
                <ConnectWallet />
              </div>
            ) : (
              <>
                <Link
                  to="/game"
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg transition flex items-center gap-2"
                >
                  <Gamepad2 size={24} />
                  Play Now
                </Link>
                
                <Link
                  to="/leaderboard"
                  className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-lg transition flex items-center gap-2"
                >
                  <Trophy size={24} />
                  Leaderboard
                </Link>

                {isAdmin && (
                  <Link
                    to="admin"
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-lg transition flex items-center gap-2"
                  >
                    👑 Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-gray-800 rounded-lg p-6 text-center transform hover:scale-105 transition">
            <Coins className="mx-auto mb-2 text-yellow-400" size={32} />
            <p className="text-3xl font-bold">
              {competition ? (parseInt(competition.prize_pool) / 10000000).toFixed(2) : '0'}
            </p>
            <p className="text-gray-400 text-sm">Prize Pool (XLM)</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 text-center transform hover:scale-105 transition">
            <Users className="mx-auto mb-2 text-blue-400" size={32} />
            <p className="text-3xl font-bold">{competition?.total_players || 0}</p>
            <p className="text-gray-400 text-sm">Total Players</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 text-center transform hover:scale-105 transition">
            <Timer className="mx-auto mb-2 text-green-400" size={32} />
            <p className="text-3xl font-bold">{competition ? (parseInt(competition.entry_fee) / 10000000).toFixed(2) : '0'}</p>
            <p className="text-gray-400 text-sm">Entry Fee (XLM)</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 text-center transform hover:scale-105 transition">
            <Crown className="mx-auto mb-2 text-purple-400" size={32} />
            <p className="text-3xl font-bold">#{competition?.session_id || '-'}</p>
            <p className="text-gray-400 text-sm">Session ID</p>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-gray-800 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">How to Play</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="font-bold mb-2">Connect Wallet</h3>
              <p className="text-gray-400 text-sm">
                Connect your Stellar wallet to participate (Freighter, Albedo, xBull, etc)
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="font-bold mb-2">Play & Score</h3>
              <p className="text-gray-400 text-sm">
                Pay entry fee, play snake, and accumulate points. Each game score is submitted on-chain!
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="font-bold mb-2">Win Prizes</h3>
              <p className="text-gray-400 text-sm">
                Top 3 players share the prize pool: 50% • 30% • 20%
              </p>
            </div>
          </div>
        </div>

        {/* Prize Distribution */}
        <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 rounded-lg p-8 mb-16 border border-yellow-600/30">
          <h2 className="text-3xl font-bold mb-6 text-center">💰 Prize Distribution</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-yellow-600/20 rounded-lg p-6 text-center border border-yellow-500/50">
              <div className="text-4xl mb-2">🥇</div>
              <p className="text-2xl font-bold mb-1">50%</p>
              <p className="text-yellow-400">First Place</p>
            </div>
            <div className="bg-gray-600/20 rounded-lg p-6 text-center border border-gray-400/50">
              <div className="text-4xl mb-2">🥈</div>
              <p className="text-2xl font-bold mb-1">30%</p>
              <p className="text-gray-400">Second Place</p>
            </div>
            <div className="bg-orange-600/20 rounded-lg p-6 text-center border border-orange-400/50">
              <div className="text-4xl mb-2">🥉</div>
              <p className="text-2xl font-bold mb-1">20%</p>
              <p className="text-orange-400">Third Place</p>
            </div>
          </div>
        </div>

        {/* Top 3 Preview */}
        {leaderboard.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">🏆 Current Top 3</h2>
            <div className="space-y-4">
              {leaderboard.map((player, index) => (
                <div
                  key={player.player}
                  className="bg-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-600 transition"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <div>
                      <p className="font-mono text-sm text-gray-400">
                        {player.player.slice(0, 8)}...{player.player.slice(-8)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {player.total_games} games played
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{Number(player.total_score).toLocaleString()}</p>
                    <p className="text-sm text-green-400">
                      {index === 0 ? '50%' : index === 1 ? '30%' : '20%'} prize
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link
                to="/leaderboard"
                className="text-yellow-400 hover:text-yellow-300 font-bold"
              >
                View Full Leaderboard →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-8 text-center text-gray-400 text-sm">
          <p className="mb-2">Created by Kotechi</p>
          <p>Built with ❤️ for the blockchain gaming community</p>
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <a href="https://www.instagram.com/aditiya.ftr/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              instagram
            </a>
            <span>•</span>
            <a href="https://github.com/kotechi" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Github
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}