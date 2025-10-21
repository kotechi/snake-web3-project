import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CCWZWD4BH6Y7NIIVWSHKRFERRDZPKIDRBF5WTOCTGD2XYXG3L6MYCHXY",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAAC0NvbXBldGl0aW9uAAAAAAUAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAAKcHJpemVfcG9vbAAAAAAACwAAAAAAAAAKc2Vzc2lvbl9pZAAAAAAABAAAAAAAAAAGc3RhdHVzAAAAAAAEAAAAAAAAAA10b3RhbF9wbGF5ZXJzAAAAAAAABA==",
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
            "AAAAAAAAAB/wn5SnIEFkbWluIGNhbiB1cGRhdGUgZW50cnkgZmVlAAAAABB1cGRhdGVfZW50cnlfZmVlAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAduZXdfZmVlAAAAAAsAAAAA"]), options);
        this.options = options;
    }
    fromJSON = {
        initialize: (this.txFromJSON),
        create_competition: (this.txFromJSON),
        play_game: (this.txFromJSON),
        end_competition: (this.txFromJSON),
        get_competition: (this.txFromJSON),
        get_leaderboard: (this.txFromJSON),
        get_player_stats: (this.txFromJSON),
        get_entry_fee: (this.txFromJSON),
        get_admin: (this.txFromJSON),
        update_entry_fee: (this.txFromJSON)
    };
}
