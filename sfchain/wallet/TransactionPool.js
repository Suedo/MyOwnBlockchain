const Transaction = require("./Transaction");
class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  // any tx is being added to pool. It's the miner's job to check for valid ones
  addOrUpdateTransaction(tx) {
    let transactionInPool = this.transactions.find(t => t.id === tx.id);

    if (transactionInPool) {
      // update
      this.transactions[this.transactions.indexOf(transactionInPool)] = tx;
    } else {
      // add
      this.transactions.push(tx);
      // console.log(`transaction added to pool:\n${JSON.stringify(tx,null,2)}`)
    }
  }

  /**
   * Both getTxForGivenSource and getTxForGivenRecipient aims to do the same thing,
   * one works with source address, while the other one with recipient address
   * @param {*} publicKey address of the wallet
   */
  getTxForGivenSource(publicKey) {
    return this.transactions.find(t => t.input.address === publicKey);
  }

  getTxForGivenRecipient(publicKey) {
    return this.transactions.filter(t =>
      t.outputs.some(op => op.address === publicKey)
    )[0];
    // return 1st elem, or undefined
    // without the `[0]`, if nothing found, would return a blank array,
    // which would cause failure
  }

  getValidTxs() {
    return this.transactions.filter(tx => Transaction.isTransactionValid(tx));
  }

  clear() {
    this.transactions = [];
  }
}

module.exports = TransactionPool;
