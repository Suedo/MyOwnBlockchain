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
    // TODO: include reward for mine
    // TODO: create block with valid transactions
    // TODO: sync the chains via p2pServer
    // TODO: clear the txpool
    // TODO: broadcast to other miners to clear their txPool as well
  }
}

module.exports = Miner;
