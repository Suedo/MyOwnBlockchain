const Transaction = require("../wallet/Transaction");
const Wallet = require("../wallet");
class Miner {
  /**
   * @param {*} wallet for the miner to collect reward
   * @param {*} p2pServer for syncing the mined blocks
   */
  constructor(blockchain, txPool, wallet, p2pServer) {
    this.blockchain = blockchain;
    this.txPool = txPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  /**
   * get tx from pool, put them in block, broadcast it, and then clear it from txpool
   */
  mine() {
    const validTransactions = this.txPool.getValidTxs();
    validTransactions.push( 
      // include reward for mine
      Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
    );
    const minedBlock = this.blockchain.addBlock(validTransactions); 
    // sync the chains via p2pServer
    this.p2pServer.broadcastUpdatedChain(); 
    this.txPool.clear();
    // broadcast to other miners to clear their txPool as well
    this.p2pServer.broadcastClearTransaction(); 

    return minedBlock;
  }
}

module.exports = Miner;
