import * as StellarSdk from '@stellar/stellar-sdk';
import { CONTRACT_CONFIG } from './types';

const server = new StellarSdk.rpc.Server(CONTRACT_CONFIG.rpcUrl);

// Helper to build transaction
async function buildTransaction(
  sourceAccount: string,
  operation: StellarSdk.xdr.Operation
) {
  const account = await server.getAccount(sourceAccount);
  
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: CONTRACT_CONFIG.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  return transaction;
}

// Helper to simulate contract call (for read-only operations)
async function simulateContractCall(
  operation: StellarSdk.xdr.Operation,
  sourceAccount?: string
) {
  // Use a dummy account for simulation if not provided
  const account = sourceAccount 
    ? await server.getAccount(sourceAccount)
    : new StellarSdk.Account(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        '0'
      );
  
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: CONTRACT_CONFIG.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(transaction);
  
  if (StellarSdk.rpc.Api.isSimulationSuccess(simulated) && simulated.result) {
    return StellarSdk.scValToNative(simulated.result.retval);
  }
  
  throw new Error('Simulation failed');
}

// Contract Interactions
export class SnakeGameContract {
  private contractId: string;

  constructor(contractId: string = CONTRACT_CONFIG.contractId) {
    this.contractId = contractId;
  }

  // Get competition info
  async getCompetition(): Promise<any> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const operation = contract.call('get_competition');
      const result = await simulateContractCall(operation);
      return result;
    } catch (error) {
      console.error('Error getting competition:', error);
      return null;
    }
  }

  // Get leaderboard
  async getLeaderboard(): Promise<any[]> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const operation = contract.call('get_leaderboard');
      const result = await simulateContractCall(operation);
      return result;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Get player stats
  async getPlayerStats(playerAddress: string): Promise<any> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const operation = contract.call(
        'get_player_stats',
        StellarSdk.nativeToScVal(playerAddress, { type: 'address' })
      );
      const result = await simulateContractCall(operation);
      return result;
    } catch (error) {
      console.error('Error getting player stats:', error);
      return null;
    }
  }

  // Get entry fee
  async getEntryFee(): Promise<string> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const operation = contract.call('get_entry_fee');
      const fee = await simulateContractCall(operation);
      return (fee / 10000000).toString(); // Convert stroops to XLM
    } catch (error) {
      console.error('Error getting entry fee:', error);
      return '0';
    }
  }

  // Play game (submit score)
  async playGame(
    playerAddress: string,
    score: number,
    signTransaction: (xdr: string) => Promise<string>
  ): Promise<boolean> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      
      const operation = contract.call(
        'play_game',
        StellarSdk.nativeToScVal(playerAddress, { type: 'address' }),
        StellarSdk.nativeToScVal(score, { type: 'u64' })
      );

      const transaction = await buildTransaction(playerAddress, operation);
      const preparedTx = await server.prepareTransaction(transaction);
      
      // Sign with Freighter
      const signedXdr = await signTransaction(preparedTx.toXDR());
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        CONTRACT_CONFIG.networkPassphrase
      );

      // Submit transaction
      const result = await server.sendTransaction(signedTx);
      
      if (result.status === 'PENDING') {
        // Wait for confirmation
        let getResult = await server.getTransaction(result.hash);
        while (getResult.status === 'NOT_FOUND') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          getResult = await server.getTransaction(result.hash);
        }
        return getResult.status === 'SUCCESS';
      }
      
      return false;
    } catch (error) {
      console.error('Error playing game:', error);
      return false;
    }
  }

  // Admin: Create competition
  async createCompetition(
    adminAddress: string,
    sessionId: number,
    deadline: number,
    signTransaction: (xdr: string) => Promise<string>
  ): Promise<boolean> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      
      const operation = contract.call(
        'create_competition',
        StellarSdk.nativeToScVal(adminAddress, { type: 'address' }),
        StellarSdk.nativeToScVal(sessionId, { type: 'u32' }),
        StellarSdk.nativeToScVal(deadline, { type: 'u64' })
      );

      const transaction = await buildTransaction(adminAddress, operation);
      const preparedTx = await server.prepareTransaction(transaction);
      
      const signedXdr = await signTransaction(preparedTx.toXDR());
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        CONTRACT_CONFIG.networkPassphrase
      );

      const result = await server.sendTransaction(signedTx);
      
      if (result.status === 'PENDING') {
        let getResult = await server.getTransaction(result.hash);
        while (getResult.status === 'NOT_FOUND') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          getResult = await server.getTransaction(result.hash);
        }
        return getResult.status === 'SUCCESS';
      }
      
      return false;
    } catch (error) {
      console.error('Error creating competition:', error);
      return false;
    }
  }

  // Admin: End competition
  async endCompetition(
    adminAddress: string,
    signTransaction: (xdr: string) => Promise<string>
  ): Promise<boolean> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      
      const operation = contract.call(
        'end_competition',
        StellarSdk.nativeToScVal(adminAddress, { type: 'address' })
      );

      const transaction = await buildTransaction(adminAddress, operation);
      const preparedTx = await server.prepareTransaction(transaction);
      
      const signedXdr = await signTransaction(preparedTx.toXDR());
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        CONTRACT_CONFIG.networkPassphrase
      );

      const result = await server.sendTransaction(signedTx);
      
      if (result.status === 'PENDING') {
        let getResult = await server.getTransaction(result.hash);
        while (getResult.status === 'NOT_FOUND') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          getResult = await server.getTransaction(result.hash);
        }
        return getResult.status === 'SUCCESS';
      }
      
      return false;
    } catch (error) {
      console.error('Error ending competition:', error);
      return false;
    }
  }
}

export const contractInstance = new SnakeGameContract();