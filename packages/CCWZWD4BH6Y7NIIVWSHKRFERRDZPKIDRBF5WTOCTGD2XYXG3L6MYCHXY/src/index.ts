import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCWZWD4BH6Y7NIIVWSHKRFERRDZPKIDRBF5WTOCTGD2XYXG3L6MYCHXY",
  }
} as const


export interface Competition {
  deadline: u64;
  prize_pool: i128;
  session_id: u32;
  status: u32;
  total_players: u32;
}


export interface PlayerScore {
  player: string;
  rank: u32;
  total_games: u32;
  total_score: u64;
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * 🔧 Initialize contract (only once)
   */
  initialize: ({admin, token_address, entry_fee}: {admin: string, token_address: string, entry_fee: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a create_competition transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * 🏁 Admin creates a new competition session
   */
  create_competition: ({admin, session_id, deadline}: {admin: string, session_id: u32, deadline: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a play_game transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * 🎮 Player joins and plays (pays entry fee)
   */
  play_game: ({player, score}: {player: string, score: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a end_competition transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * 🏆 Admin ends competition and distributes prize
   */
  end_competition: ({admin}: {admin: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_competition transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_competition: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<Competition>>>

  /**
   * Construct and simulate a get_leaderboard transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_leaderboard: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<PlayerScore>>>

  /**
   * Construct and simulate a get_player_stats transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_player_stats: ({player}: {player: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<PlayerScore>>>

  /**
   * Construct and simulate a get_entry_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_entry_fee: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_admin: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a update_entry_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * 🔧 Admin can update entry fee
   */
  update_entry_fee: ({admin, new_fee}: {admin: string, new_fee: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAAC0NvbXBldGl0aW9uAAAAAAUAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAAKcHJpemVfcG9vbAAAAAAACwAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAABAAAAAAAAAAGc3RhdHVzAAAAAAAEAAAAAAAAAA10b3RhbF9wbGF5ZXJzAAAAAAAABA==",
        "AAAAAQAAAAAAAAAAAAAAC1BsYXllclNjb3JlAAAAAAQAAAAAAAAABnBsYXllcgAAAAAAEwAAAAAAAAAEcmFuawAAAAQAAAAAAAAAC3RvdGFsX2dhbWVzAAAAAAQAAAAAAAAAC3RvdGFsX3Njb3JlAAAAAAY=",
        "AAAAAAAAACTwn5SnIEluaXRpYWxpemUgY29udHJhY3QgKG9ubHkgb25jZSkAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAA10b2tlbl9hZGRyZXNzAAAAAAAAEwAAAAAAAAAJZW50cnlfZmVlAAAAAAAACwAAAAA=",
        "AAAAAAAAACzwn4+BIEFkbWluIGNyZWF0ZXMgYSBuZXcgY29tcGV0aXRpb24gc2Vzc2lvbgAAABJjcmVhdGVfY29tcGV0aXRpb24AAAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAABAAAAAAAAAAIZGVhZGxpbmUAAAAGAAAAAA==",
        "AAAAAAAAACzwn46uIFBsYXllciBqb2lucyBhbmQgcGxheXMgKHBheXMgZW50cnkgZmVlKQAAAAlwbGF5X2dhbWUAAAAAAAACAAAAAAAAAAZwbGF5ZXIAAAAAABMAAAAAAAAABXNjb3JlAAAAAAAABgAAAAA=",
        "AAAAAAAAADHwn4+GIEFkbWluIGVuZHMgY29tcGV0aXRpb24gYW5kIGRpc3RyaWJ1dGVzIHByaXplAAAAAAAAD2VuZF9jb21wZXRpdGlvbgAAAAABAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAPZ2V0X2NvbXBldGl0aW9uAAAAAAAAAAABAAAD6AAAB9AAAAALQ29tcGV0aXRpb24A",
        "AAAAAAAAAAAAAAAPZ2V0X2xlYWRlcmJvYXJkAAAAAAAAAAABAAAD6gAAB9AAAAALUGxheWVyU2NvcmUA",
        "AAAAAAAAAAAAAAAQZ2V0X3BsYXllcl9zdGF0cwAAAAEAAAAAAAAABnBsYXllcgAAAAAAEwAAAAEAAAPoAAAH0AAAAAtQbGF5ZXJTY29yZQA=",
        "AAAAAAAAAAAAAAANZ2V0X2VudHJ5X2ZlZQAAAAAAAAAAAAABAAAACw==",
        "AAAAAAAAAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAAT",
        "AAAAAAAAAB/wn5SnIEFkbWluIGNhbiB1cGRhdGUgZW50cnkgZmVlAAAAABB1cGRhdGVfZW50cnlfZmVlAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAduZXdfZmVlAAAAAAsAAAAA" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        create_competition: this.txFromJSON<null>,
        play_game: this.txFromJSON<null>,
        end_competition: this.txFromJSON<null>,
        get_competition: this.txFromJSON<Option<Competition>>,
        get_leaderboard: this.txFromJSON<Array<PlayerScore>>,
        get_player_stats: this.txFromJSON<Option<PlayerScore>>,
        get_entry_fee: this.txFromJSON<i128>,
        get_admin: this.txFromJSON<string>,
        update_entry_fee: this.txFromJSON<null>
  }
}