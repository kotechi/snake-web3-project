import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ConnectWallet } from '../components/connect-wallet';
import { useWallet } from '../hooks/use-wallet';
import { contractInstance } from '../lib/stellar-contract';
import { ArrowLeft, PlayCircle, StopCircle, AlertCircle, Trophy, Users, Coins } from 'lucide-react';
import type { Competition } from '../lib/types';
import { signTransaction } from '~/config/wallet.client';

const ADMIN_ADDRESS = 'GDC6STZRTFF7GY7WWJ3G7FUZ6FX62YGYUTUWKLXU724D2TFDQGI2NZY6';

export default function AdminPage() {
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [sessionId, setSessionId] = useState('');
  const [durationHours, setDurationHours] = useState('24');
  const [entryFee, setEntryFee] = useState(''); // Tambahkan state untuk entry fee

  useEffect(() => {
    // Check if user is admin
    if (isConnected && address !== '-' && address !== ADMIN_ADDRESS) {
      alert('Unauthorized: Admin access only');
      navigate('/');
    }
  }, [isConnected, address, navigate]);

  useEffect(() => {
    loadCompetition();
    const interval = setInterval(loadCompetition, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadCompetition = async () => {
    try {
      const comp = await contractInstance.getCompetition();
      setCompetition(comp);
    } catch (error) {
      console.error('Error loading competition:', error);
    }
  };

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || address === '-') {
      alert('Please connect your wallet first');
      return;
    }

    if (!sessionId || !durationHours || !entryFee) {
      alert('Please fill in all fields');
      return;
    }

    const deadline = Math.floor(Date.now() / 1000) + (parseInt(durationHours) * 3600);

    setLoading(true);
    try {
      const success = await contractInstance.createCompetition(
        address,
        parseInt(sessionId),
        deadline,
        parseFloat(entryFee), // Tambahkan entryFee
      );

      if (success) {
        alert('Competition created successfully!');
        setSessionId('');
        setEntryFee(''); // Reset
        await loadCompetition();
      } else {
        alert('Failed to create competition');
      }
    } catch (error) {
      console.error('Error creating competition:', error);
      alert('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndCompetition = async () => {
    if (!isConnected || address === '-') {
      alert('Please connect your wallet first');
      return;
    }

    if (!confirm('Are you sure you want to end this competition? This will distribute prizes to winners.')) {
      return;
    }

    setLoading(true);
    try {
      const success = await contractInstance.endCompetition(address);

      if (success) {
        alert('Competition ended successfully! Prizes distributed.');
        await loadCompetition();
      } else {
        alert('Failed to end competition');
      }
    } catch (error) {
      console.error('Error ending competition:', error);
      alert('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const timeRemaining = competition
    ? Math.max(0, Number(competition.deadline) - Math.floor(Date.now() / 1000))
    : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const isActive = competition?.status === 1;
  const hasEnded = competition?.status === 3;

  // Show unauthorized message if not admin
  if (isConnected && address !== '-' && address !== ADMIN_ADDRESS) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-3xl font-bold mb-2">Unauthorized Access</h1>
          <p className="text-gray-400 mb-6">This page is only accessible to administrators</p>
          <Link to="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

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

      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-xl text-gray-400">
            Manage competitions and distribute prizes
          </p>
        </div>

        {/* Current Competition Status */}
        {competition && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy size={24} />
              Current Competition
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Session ID</p>
                <p className="text-2xl font-bold">#{competition.session_id}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Entry Fee</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {(parseInt(competition.entry_fee) / 10000000).toFixed(2)} XLM
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Prize Pool</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {(parseInt(competition.prize_pool) / 10000000).toFixed(2)} XLM
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Status</p>
                <p className={`text-xl font-bold ${isActive ? 'text-green-400' : hasEnded ? 'text-red-400' : 'text-yellow-400'}`}>
                  {isActive ? '🟢 Active' : hasEnded ? '🔴 Ended' : '🟡 Pending'}
                </p>
              </div>
              {isActive && (
                <div className="text-right">
                  <p className="text-gray-400 text-sm mb-1">Time Remaining</p>
                  <p className="text-xl font-bold">{formatTime(timeRemaining)}</p>
                </div>
              )}
            </div>

            {isActive && (
              <div className="mt-6">
                <button
                  onClick={handleEndCompetition}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <StopCircle size={20} />
                  {loading ? 'Ending Competition...' : 'End Competition & Distribute Prizes'}
                </button>
                <p className="text-sm text-gray-400 mt-2 text-center">
                  This will calculate winners and distribute prizes automatically
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create New Competition Form */}
        {(!competition || hasEnded) && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <PlayCircle size={24} />
              Create New Competition
            </h2>

            <form onSubmit={handleCreateCompetition} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Session ID</label>
                <input
                  type="number"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="e.g. 1, 2, 3..."
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Unique identifier for this competition session
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Entry Fee (XLM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  placeholder="1.0"
                  min="0.01"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Entry fee per game in XLM (e.g. 1.0)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Duration (Hours)</label>
                <input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="24"
                  min="1"
                  max="168"
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  How long the competition will run (1-168 hours)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <PlayCircle size={20} />
                {loading ? 'Creating...' : 'Create Competition'}
              </button>
            </form>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/30 border border-blue-500/50 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="flex-shrink-0 text-blue-400" size={24} />
            <div>
              <h3 className="font-bold mb-2">Admin Instructions</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Create a new competition with unique Session ID, entry fee, and duration</li>
                <li>• Players pay entry fee before each game and submit scores after playing</li>
                <li>• End the competition to distribute prizes: Admin gets 10%, winners get 90% (50/30/20)</li>
                <li>• Entry fees contribute to the prize pool</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Link
            to="/leaderboard"
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition text-center"
          >
            <Trophy className="mx-auto mb-2 text-yellow-400" size={32} />
            <p className="font-bold">View Leaderboard</p>
            <p className="text-sm text-gray-400 mt-1">Check current rankings</p>
          </Link>
          
          <Link
            to="/game"
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition text-center"
          >
            <Users className="mx-auto mb-2 text-blue-400" size={32} />
            <p className="font-bold">Test Game</p>
            <p className="text-sm text-gray-400 mt-1">Play as admin</p>
          </Link>
        </div>
      </div>
    </div>
  );
}