class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  addOrUpdateTransaction(tx) {
    let transactionInPool = this.transactions.find(t => t.id === tx.id);

    if (transactionInPool) {
      // update
      this.transactions[this.transactions.indexOf(transactionInPool)] = tx;
    } else {
      // add
      this.transactions.push(tx);
    }
  }

  getTxWithPubKey(publicKey) {
    return this.transactions.filter(t =>
      t.outputs.some(op => op.address === publicKey)
    )[0]; 
    // return 1st elem, or undefined
    // without the `[0]`, if nothing found, would return a blank array, 
    // which would cause failure
  }
}

module.exports = TransactionPool;
