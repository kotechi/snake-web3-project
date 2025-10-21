import * as StellarSdk from '@stellar/stellar-sdk';
import { CONTRACT_CONFIG } from './types';
import { signTransaction } from '~/config/wallet.client';

const server = new StellarSdk.rpc.Server(CONTRACT_CONFIG.rpcUrl);

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

async function simulateContractCall(
  operation: StellarSdk.xdr.Operation,
  sourceAccount?: string
) {
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

export class SnakeGameContract {
  private contractId: string;

  constructor(contractId: string = CONTRACT_CONFIG.contractId) {
    this.contractId = contractId;
  }

  async getCompetition(): Promise<any> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const operation = contract.call('get_competition');
      return await simulateContractCall(operation);
    } catch (error) {
      console.error('Error getting competition:', error);
      return null;
    }
  }

  async getLeaderboard(): Promise<any[]> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const operation = contract.call('get_leaderboard');
      return await simulateContractCall(operation);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  async getPlayerStats(playerAddress: string): Promise<any> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const operation = contract.call(
        'get_player_stats',
        StellarSdk.nativeToScVal(playerAddress, { type: 'address' })
      );
      return await simulateContractCall(operation);
    } catch (error) {
      console.error('Error getting player stats:', error);
      return null;
    }
  }

  async getEntryFee(): Promise<string> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const operation = contract.call('get_entry_fee');
      const fee = await simulateContractCall(operation);
      
      // Convert stroops to XLM
      const feeInXLM = fee / BigInt(10000000);
      return feeInXLM.toString();
    } catch (error) {
      console.error('Error getting entry fee:', error);
      return '0';
    }
  }

  async hasPaid(playerAddress: string): Promise<boolean> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const operation = contract.call(
        'has_paid',
        StellarSdk.nativeToScVal(playerAddress, { type: 'address' })
      );
      return await simulateContractCall(operation);
    } catch (error) {
      console.error('Error checking has paid:', error);
      return false;
    }
  }

  async payEntryFee(playerAddress: string): Promise<boolean> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      
      const operation = contract.call(
        'pay_entry_fee',
        StellarSdk.nativeToScVal(playerAddress, { type: 'address' })
      );

      const transaction = await buildTransaction(playerAddress, operation);
      
      // Simulate untuk mendapatkan auth
      const simulated = await server.simulateTransaction(transaction);
      
      if (!StellarSdk.rpc.Api.isSimulationSuccess(simulated)) {
        throw new Error('Transaction simulation failed');
      }

      // Prepare transaction dengan auth dari simulasi
      const preparedTx = StellarSdk.rpc.assembleTransaction(
        transaction,
        simulated
      ).build();
      
      // Sign dengan Stellar Wallets Kit
      const signResult = await signTransaction(
        preparedTx.toXDR(),
        { networkPassphrase: CONTRACT_CONFIG.networkPassphrase }
      );
      
      // Handle berbagai format return
      let signedXdr: string;
      if (typeof signResult === 'string') {
        signedXdr = signResult;
      } else if (signResult && typeof signResult === 'object' && 'signedTxXdr' in signResult) {
        signedXdr = signResult.signedTxXdr;
      } else {
        throw new Error('Invalid signature format');
      }
      
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        CONTRACT_CONFIG.networkPassphrase
      ) as StellarSdk.Transaction;

      const result = await server.sendTransaction(signedTx);
      
      if (result.status === 'PENDING') {
        let getResult = await server.getTransaction(result.hash);
        let attempts = 0;
        while (getResult.status === 'NOT_FOUND' && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          getResult = await server.getTransaction(result.hash);
          attempts++;
        }
        
        if (getResult.status === 'SUCCESS') {
          return true;
        } else if (getResult.status === 'FAILED') {
          console.error('Transaction failed:', getResult);
          throw new Error('Transaction failed on chain');
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error paying entry fee:', error);
      throw error;
    }
  }

  async submitScore(playerAddress: string, score: number): Promise<boolean> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      
      const operation = contract.call(
        'submit_score',
        StellarSdk.nativeToScVal(playerAddress, { type: 'address' }),
        StellarSdk.nativeToScVal(score, { type: 'u64' })
      );

      const transaction = await buildTransaction(playerAddress, operation);
      
      // Simulate untuk mendapatkan auth
      const simulated = await server.simulateTransaction(transaction);
      
      if (!StellarSdk.rpc.Api.isSimulationSuccess(simulated)) {
        throw new Error('Transaction simulation failed');
      }

      // Prepare transaction dengan auth dari simulasi
      const preparedTx = StellarSdk.rpc.assembleTransaction(
        transaction,
        simulated
      ).build();
      
      // Sign dengan Stellar Wallets Kit
      const signResult = await signTransaction(
        preparedTx.toXDR(),
        { networkPassphrase: CONTRACT_CONFIG.networkPassphrase }
      );
      
      // Handle berbagai format return
      let signedXdr: string;
      if (typeof signResult === 'string') {
        signedXdr = signResult;
      } else if (signResult && typeof signResult === 'object' && 'signedTxXdr' in signResult) {
        signedXdr = signResult.signedTxXdr;
      } else {
        throw new Error('Invalid signature format');
      }
      
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        CONTRACT_CONFIG.networkPassphrase
      ) as StellarSdk.Transaction;

      const result = await server.sendTransaction(signedTx);
      
      if (result.status === 'PENDING') {
        let getResult = await server.getTransaction(result.hash);
        let attempts = 0;
        while (getResult.status === 'NOT_FOUND' && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          getResult = await server.getTransaction(result.hash);
          attempts++;
        }
        
        if (getResult.status === 'SUCCESS') {
          return true;
        } else if (getResult.status === 'FAILED') {
          console.error('Transaction failed:', getResult);
          throw new Error('Transaction failed on chain');
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  }

  async createCompetition(
    adminAddress: string,
    sessionId: number,
    deadline: number,
    entryFee: number
  ): Promise<boolean> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const entryFeeInStroops = BigInt(Math.floor(entryFee * 10000000));
      
      const validSessionId = Math.floor(Math.abs(sessionId)) >>> 0;
      const validDeadline = Math.floor(Math.abs(deadline));
      
      const i128Val = StellarSdk.nativeToScVal(entryFeeInStroops, { type: 'i128' });

      const operation = contract.call(
        'create_competition',
        StellarSdk.nativeToScVal(adminAddress, { type: 'address' }),
        StellarSdk.nativeToScVal(validSessionId, { type: 'u32' }),
        StellarSdk.nativeToScVal(validDeadline, { type: 'u64' }),
        i128Val
      );

      const transaction = await buildTransaction(adminAddress, operation);
      
      // Simulate untuk mendapatkan auth
      const simulated = await server.simulateTransaction(transaction);
      
      if (!StellarSdk.rpc.Api.isSimulationSuccess(simulated)) {
        throw new Error('Transaction simulation failed');
      }

      // Prepare transaction dengan auth dari simulasi
      const preparedTx = StellarSdk.rpc.assembleTransaction(
        transaction,
        simulated
      ).build();

      const signResult = await signTransaction(
        preparedTx.toXDR(),
        { networkPassphrase: CONTRACT_CONFIG.networkPassphrase }
      );
      
      // Handle berbagai format return
      let signedXdr: string;
      if (typeof signResult === 'string') {
        signedXdr = signResult;
      } else if (signResult && typeof signResult === 'object' && 'signedTxXdr' in signResult) {
        signedXdr = signResult.signedTxXdr;
        if (signResult.signerAddress && signResult.signerAddress !== adminAddress) {
          throw new Error('Signer address mismatch: expected ' + adminAddress + ', got ' + signResult.signerAddress);
        }
      } else {
        throw new Error('Invalid signature format');
      }

      let signedTx: StellarSdk.Transaction;
      try {
        const parsedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, CONTRACT_CONFIG.networkPassphrase);
        if (parsedTx instanceof StellarSdk.FeeBumpTransaction) {
          throw new Error('Fee bump transactions are not supported here');
        }
        signedTx = parsedTx;
      } catch (parseError) {
        console.error('Error parsing signed XDR:', parseError);
        throw new Error('Failed to parse signed transaction XDR: ' + (parseError as Error).message);
      }

      const result = await server.sendTransaction(signedTx);
      
      if (result.status === 'PENDING') {
        let getResult = await server.getTransaction(result.hash);
        let attempts = 0;
        while (getResult.status === 'NOT_FOUND' && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          getResult = await server.getTransaction(result.hash);
          attempts++;
        }
        return getResult.status === 'SUCCESS';
      }
      
      return false;
    } catch (error) {
      console.error('Error creating competition:', error);
      return false;
    }
  }

  async endCompetition(adminAddress: string): Promise<boolean> {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      
      const operation = contract.call(
        'end_competition',
        StellarSdk.nativeToScVal(adminAddress, { type: 'address' })
      );

      const transaction = await buildTransaction(adminAddress, operation);
      
      // Simulate untuk mendapatkan auth
      const simulated = await server.simulateTransaction(transaction);
      
      if (!StellarSdk.rpc.Api.isSimulationSuccess(simulated)) {
        console.error('Simulation failed:', simulated);
        throw new Error('Transaction simulation failed: ' + JSON.stringify(simulated));
      }

      // Prepare transaction dengan auth dari simulasi
      const preparedTx = StellarSdk.rpc.assembleTransaction(
        transaction,
        simulated
      ).build();
      
      const signResult = await signTransaction(
        preparedTx.toXDR(),
        { networkPassphrase: CONTRACT_CONFIG.networkPassphrase }
      );
      
      // Handle berbagai format return
      let signedXdr: string;
      if (typeof signResult === 'string') {
        signedXdr = signResult;
      } else if (signResult && typeof signResult === 'object' && 'signedTxXdr' in signResult) {
        signedXdr = signResult.signedTxXdr;
      } else {
        throw new Error('Invalid signature format');
      }
      
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        CONTRACT_CONFIG.networkPassphrase
      ) as StellarSdk.Transaction;

      const result = await server.sendTransaction(signedTx);
      
      if (result.status === 'PENDING') {
        let getResult = await server.getTransaction(result.hash);
        let attempts = 0;
        while (getResult.status === 'NOT_FOUND' && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          getResult = await server.getTransaction(result.hash);
          attempts++;
        }
        
        if (getResult.status === 'SUCCESS') {
          return true;
        } else if (getResult.status === 'FAILED') {
          console.error('Transaction failed:', getResult);
          throw new Error('Transaction failed on chain');
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error ending competition:', error);
      throw error;
    }
  }
}

export const contractInstance = new SnakeGameContract();