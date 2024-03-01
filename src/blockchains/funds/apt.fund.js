require('module-alias/register');
const { Aptos, AptosConfig, Network, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");
const EVMApi = require('@blockchains/apis/evm.api');

class APTFund{
    constructor(api, config) {
        this.api = api || new EVMApi();
        this.config = config;
    }

    static get network () {
        return "apt";
    }

    async buy_asset() {    
        const config = new AptosConfig({ network: Network.DEVNET }); // default network is devnet
        const aptos = new Aptos(config);
        const privateKey = new Ed25519PrivateKey('0xf29d8be243551671c7949f59538980de229cc62061a95ce1505a790f955068e5');

        const dgt_account = await aptos.deriveAccountFromPrivateKey({privateKey});
    
        const transaction = await aptos.transaction.build.simple({
            sender: "0xe8ec9945a78a48452def46207e65a0a4ed6acd400306b977020924ae3652ab85",
            data: {
                function: "0xe8ec9945a78a48452def46207e65a0a4ed6acd400306b977020924ae3652ab85::allocate_funding_v2::buy_asset",
                functionArguments: ["PQD_v27", "Dgt_v27 funding", "Aptos", "0xdgts24111306"],
            },
        });
    
        // using signAndSubmit combined
        const committedTransaction = await aptos.signAndSubmitTransaction({ signer: dgt_account, transaction });
        console.log("Tx resp: ", committedTransaction)
    }
}

module.exports = APTFund;