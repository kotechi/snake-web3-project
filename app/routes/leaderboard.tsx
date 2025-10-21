  import { useState, useEffect } from 'react';
  import { Link } from 'react-router';
  import { ConnectWallet } from '../components/connect-wallet';
  import { useWallet } from '../hooks/use-wallet';
  import { contractInstance } from '../lib/stellar-contract';
  import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
  import type { PlayerScore, Competition } from '../lib/types';

  export default function LeaderboardPage() {
    const { address, isConnected } = useWallet();
    const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
    const [competition, setCompetition] = useState<Competition | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadData();
      const interval = setInterval(loadData, 5000); // Refresh every 5s
      return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
      try {
        const [lb, comp] = await Promise.all([
          contractInstance.getLeaderboard(),
          contractInstance.getCompetition(),
        ]);
        setLeaderboard(lb);
        setCompetition(comp);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    const getRankIcon = (rank: number) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `#${rank}`;
    };

    const getPrizePercentage = (rank: number) => {
      if (rank === 1) return '50%';
      if (rank === 2) return '30%';
      if (rank === 3) return '20%';
      return '-';
    };

    const calculatePrize = (rank: number) => {
      if (!competition || rank > 3) return 0;
      const prizePool = parseInt(competition.prize_pool) / 10000000;
      if (rank === 1) return prizePool * 0.5;
      if (rank === 2) return prizePool * 0.3;
      if (rank === 3) return prizePool * 0.2;
      return 0;
    };

    const isMyAddress = (playerAddress: string) => {
      return isConnected && address !== '-' && playerAddress === address;
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
            <ConnectWallet />
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-8 py-16">
          {/* Title Section */}
          <div className="text-center mb-12">
            <Trophy className="mx-auto mb-4 text-yellow-400" size={64} />
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <p className="text-xl text-gray-400">
              Top players competing for the prize pool
            </p>
          </div>

          {/* Competition Info */}
          {competition && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-gray-400 text-sm">Session ID</p>
                  <p className="text-2xl font-bold">#{competition.session_id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Prize Pool</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {(parseInt(competition.prize_pool) / 10000000).toFixed(2)} XLM
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Players</p>
                  <p className="text-2xl font-bold">{competition.total_players}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className={`text-2xl font-bold ${competition.status === 1 ? 'text-green-400' : 'text-red-400'}`}>
                    {competition.status === 1 ? 'Active' : competition.status === 3 ? 'Ended' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="mt-4 text-gray-400">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16 bg-gray-800 rounded-lg">
              <Trophy className="mx-auto mb-4 text-gray-600" size={64} />
              <h2 className="text-2xl font-bold mb-2">No Players Yet</h2>
              <p className="text-gray-400 mb-6">
                Be the first to play and claim the top spot!
              </p>
              <Link
                to="/game"
                className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition"
              >
                Start Playing
              </Link>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {leaderboard.length >= 3 && (
                <div className="mb-12 grid grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center pt-12">
                    <div className="w-full bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg p-6 text-center border-2 border-gray-400">
                      <Medal className="mx-auto mb-2 text-gray-300" size={32} />
                      <p className="text-3xl mb-2">🥈</p>
                      <p className="text-sm text-gray-400 mb-2 font-mono">
                        {leaderboard[1].player.slice(0, 6)}...
                      </p>
                      <p className="text-2xl font-bold mb-1">{leaderboard[1].total_score.toLocaleString()}</p>
                      <p className="text-sm text-green-400">{calculatePrize(2).toFixed(2)} XLM</p>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-6 text-center border-2 border-yellow-400 shadow-xl shadow-yellow-500/50">
                      <Trophy className="mx-auto mb-2 text-yellow-300" size={40} />
                      <p className="text-4xl mb-2">🥇</p>
                      <p className="text-sm text-yellow-200 mb-2 font-mono">
                        {leaderboard[0].player.slice(0, 6)}...
                      </p>
                      <p className="text-3xl font-bold mb-1">{leaderboard[0].total_score.toLocaleString()}</p>
                      <p className="text-sm text-yellow-200">{calculatePrize(1).toFixed(2)} XLM</p>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex flex-col items-center pt-16">
                    <div className="w-full bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-center border-2 border-orange-400">
                      <Award className="mx-auto mb-2 text-orange-300" size={28} />
                      <p className="text-2xl mb-2">🥉</p>
                      <p className="text-sm text-orange-200 mb-2 font-mono">
                        {leaderboard[2].player.slice(0, 6)}...
                      </p>
                      <p className="text-xl font-bold mb-1">{leaderboard[2].total_score.toLocaleString()}</p>
                      <p className="text-sm text-orange-200">{calculatePrize(3).toFixed(2)} XLM</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Leaderboard Table */}
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold">Rank</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Player</th>
                        <th className="px-6 py-4 text-right text-sm font-bold">Total Score</th>
                        <th className="px-6 py-4 text-right text-sm font-bold">Games</th>
                        <th className="px-6 py-4 text-right text-sm font-bold">Avg Score</th>
                        <th className="px-6 py-4 text-right text-sm font-bold">Prize</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {leaderboard.map((player, index) => (
                        <tr
                          key={player.player}
                          className={`hover:bg-gray-700 transition ${
                            isMyAddress(player.player) ? 'bg-blue-900/30 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <span className="text-2xl">{getRankIcon(index + 1)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">
                                {player.player.slice(0, 8)}...{player.player.slice(-6)}
                              </span>
                              {isMyAddress(player.player) && (
                                <span className="px-2 py-1 bg-blue-600 text-xs rounded">You</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-xl font-bold">{player.total_score.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-400">
                            {player.total_games}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-400">
                            {player.total_games > 0 
                              ? Math.round(Number(player.total_score) / Number(player.total_games)).toLocaleString()
                              : 0
                            }
                          </td>
                          <td className="px-6 py-4 text-right">
                            {index < 3 ? (
                              <div>
                                <p className="font-bold text-green-400">
                                  {calculatePrize(index + 1).toFixed(2)} XLM
                                </p>
                                <p className="text-xs text-gray-400">{getPrizePercentage(index + 1)}</p>
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-8 text-center">
                <Link
                  to="/game"
                  className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition"
                >
                  Play Now to Climb the Ranks!
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }