import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { SnakeGame } from '../components/SnakeGames';
import { ConnectWallet } from '../components/connect-wallet';
import { useWallet } from '../hooks/use-wallet';
import { useNotification } from '../components/NotificationContext';
import { contractInstance } from '../lib/stellar-contract';
import { Trophy, ArrowLeft, Coins } from 'lucide-react';
import type { Competition, PlayerScore } from '../lib/types';

export default function GamePage() {
  const { address, isConnected } = useWallet();
  const { addNotification } = useNotification();
  const [currentScore, setCurrentScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entryFee, setEntryFee] = useState('0');
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerScore | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [gameScore, setGameScore] = useState(0);

  useEffect(() => {
    loadCompetitionData();
  }, []);

  useEffect(() => {
    if (address && address !== '-') {
      loadPlayerStats();
      checkHasPaid();
    }
  }, [address]);

  const loadCompetitionData = async () => {
    try {
      const [comp, fee] = await Promise.all([
        contractInstance.getCompetition(),
        contractInstance.getEntryFee(),
      ]);
      setCompetition(comp);
      setEntryFee(fee);
    } catch (error) {
      console.error('Error loading competition:', error);
    }
  };

  const loadPlayerStats = async () => {
    if (!address || address === '-') return;
    try {
      const stats = await contractInstance.getPlayerStats(address);
      setPlayerStats(stats);
    } catch (error) {
      console.error('Error loading player stats:', error);
    }
  };

  const checkHasPaid = async () => {
    if (!address || address === '-') return;
    try {
      const paid = await contractInstance.hasPaid(address);
      setHasPaid(paid);
    } catch (error) {
      console.error('Error checking has paid:', error);
    }
  };

  const handlePayEntry = async () => {
    if (!isConnected || !address || address === '-') {
      addNotification('warning', 'Please connect your wallet first!');
      return;
    }
    
    setIsPaying(true);
    try {
      const success = await contractInstance.payEntryFee(address);
      
      if (success) {
        setHasPaid(true);
        addNotification('success', 'Entry fee paid successfully! You can now play the game.');
        await loadPlayerStats();
        await loadCompetitionData();
      } else {
        addNotification('error', 'Failed to pay entry fee. Please try again.');
      }
    } catch (error) {
      console.error('Error paying entry fee:', error);
      addNotification('error', `Error paying entry fee: ${(error as Error).message}`);
    } finally {
      setIsPaying(false);
    }
  };

  const handleGameOver = async (finalScore: number) => {
    // Prevent double submission
    if (isSubmitting) {
      console.log('Already submitting, skipping...');
      return;
    }

    if (!hasPaid) {
      addNotification('warning', 'Please pay entry fee first!');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await contractInstance.submitScore(address, finalScore);
      
      if (success) {
        addNotification('success', `Score ${finalScore} submitted successfully!`);
        await loadPlayerStats();
        await loadCompetitionData();
        
        setHasPaid(false); // Reset setelah submit
      } else {
        addNotification('error', 'Failed to submit score. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      addNotification('error', `Error submitting score: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeRemaining = competition
    ? Math.max(0, Number(competition.deadline) - Math.floor(Date.now() / 1000))
    : 0;

  const canPlay = competition?.status === 1 && timeRemaining > 60;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>

          <div className="flex items-center gap-4">
            <ConnectWallet />
            
            <Link
              to="/leaderboard"
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition"
            >
              <Trophy size={20} />
              Leaderboard
            </Link>
          </div>
        </div>

        {/* Competition Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Competition Info</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Session ID</p>
              <p className="text-xl font-bold">{competition?.session_id || '-'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Entry Fee</p>
              <p className="text-xl font-bold">{competition ? (parseInt(competition.entry_fee) / 10000000).toFixed(2) : '0'} XLM</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Prize Pool</p>
              <p className="text-xl font-bold">
                {competition ? (parseInt(competition.prize_pool) / 10000000).toFixed(2) : '0'} XLM
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Time Left</p>
              <p className="text-xl font-bold">
                {Math.floor(timeRemaining / 3600)}h {Math.floor((timeRemaining % 3600) / 60)}m
              </p>
            </div>
          </div>

          {!canPlay && competition?.status === 1 && (
            <div className="mt-4 bg-red-900 border border-red-500 rounded-lg p-4">
              <p className="text-red-200">
                ⚠️ Competition ends in less than 1 minute. New games cannot be started.
              </p>
            </div>
          )}
        </div>

        {/* Player Stats */}
        {playerStats && isConnected && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Stats</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Rank</p>
                <p className="text-3xl font-bold text-yellow-500">#{playerStats.rank}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Score</p>
                <p className="text-3xl font-bold">{playerStats.total_score}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Games Played</p>
                <p className="text-3xl font-bold">{playerStats.total_games}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="flex flex-col items-center">
          {!isConnected ? (
            <div className="text-center py-16">
              <div className="mb-4 text-6xl">🎮</div>
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-8">
                Connect your wallet to play the game and compete for prizes
              </p>
              <ConnectWallet />
            </div>
          ) : !canPlay ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">Competition Not Active</h2>
              <p className="text-gray-400">
                {competition?.status === 3
                  ? 'This competition has ended. Check the leaderboard for results!'
                  : 'No active competition at the moment.'}
              </p>
              <Link
                to="/leaderboard"
                className="inline-block mt-6 px-8 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold transition"
              >
                View Leaderboard
              </Link>
            </div>
          ) : !hasPaid ? (
            <div className="text-center py-16 max-w-md">
              <div className="mb-6 text-6xl">💰</div>
              <h2 className="text-3xl font-bold mb-4">Pay Entry Fee</h2>
              <p className="text-gray-400 mb-6">
                To participate in this competition, you need to pay an entry fee of <span className="text-yellow-400 font-bold">{competition ? (parseInt(competition.entry_fee) / 10000000).toFixed(2) : '0'} XLM</span> for each game.
              </p>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="font-bold mb-3">What you get:</h3>
                <ul className="text-left text-gray-300 space-y-2">
                  <li>✅ Play one game after paying</li>
                  <li>✅ Your score will be added to the leaderboard</li>
                  <li>✅ Compete for 50%, 30%, or 20% of the prize pool</li>
                  <li>✅ Entry fee adds to the total prize pool</li>
                </ul>
              </div>

              <button
                onClick={handlePayEntry}
                disabled={isPaying}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition flex items-center gap-2 mx-auto"
              >
                {isPaying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Coins size={24} />
                    Pay {competition ? (parseInt(competition.entry_fee) / 10000000).toFixed(2) : '0'} XLM & Play
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4">
                Make sure you have enough XLM in your wallet for the entry fee and transaction fees
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 bg-green-900 border border-green-500 rounded-lg p-4 max-w-md">
                <p className="text-green-200 text-center">
                  ✅ Entry fee paid! Play the game and submit your score.
                </p>
              </div>

              <SnakeGame
                onGameOver={handleGameOver}
                onScoreUpdate={setCurrentScore}
              />
              
              {isSubmitting && (
                <div className="mt-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <p className="mt-2 text-gray-400">Submitting score to blockchain...</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}