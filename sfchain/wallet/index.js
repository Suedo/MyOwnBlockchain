const ChainUtil = require("../chain.util");
const { INITIAL_BALANCE } = require("../config");
const Transaction = require("./Transaction");

class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ChainUtil.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }

  toString() {
    return `Wallet - 
      publicKey : ${this.publicKey}
      balance   : ${this.balance}
    `;
  }

  sign(dataHash) {
    return this.keyPair.sign(dataHash);
  }

  createTransaction(recipient, amount, blockchain, transactionPool) {

    this.balance = this.calculateBalance(blockchain);

    if (amount > this.balance) {
      console.log(
        `createTransaction Error: Amount ${amount} exceeds wallet balance ${this.balance}`
      );
      return;
    }

    /**
     * The goal is to find a transaction associated with this sender/source wallet
     * if it exists, we update the same, else create a new one.
     */
    let tx = transactionPool.getTxForGivenSource(this.publicKey);

    if (tx) {
      tx.update(this, recipient, amount);
    } else {
      tx = Transaction.newTransaction(this, recipient, amount);
      transactionPool.addOrUpdateTransaction(tx);
    }

    return tx;
  }

  calculateBalance(blockchain) {
    let currentBalance = this.balance;
    let txArr = [];

    // blockchain has many block, each block has many transaction
    // we want a flatmapped array of all transactions in this blockchain
    blockchain.chain.forEach(block =>
      block.data.forEach(transaction => txArr.push(transaction))
    );

    // now we find only the transactions that were input-ed by this wallet
    const walletTxs = txArr.filter(tx => tx.input.address === this.publicKey);

    let startTime = 0;
    // reduce walletTxs to single tx based on the highest value of timestamp
    // this is same as sorting based on timestamp to get the MOST RECENT tx
    if (walletTxs.length > 0) {
      const mostRecentWalletTX = walletTxs.reduce((prev, curr) =>
        prev.input.timestamp > curr.input.timestamp ? prev : curr
      );
      currentBalance = mostRecentWalletTX.outputs.find(
        op => op.address === this.publicKey
      ).amount;

      startTime = mostRecentWalletTX.input.timestamp;
    }

    txArr.forEach(tx => {
      // most recent TX onwards
      if (tx.input.timestamp > startTime) {
        tx.outputs.find(op => {
          // this wallet may have been the recipient of another wallet's tx
          if (op.address === this.publicKey) {
            currentBalance += op.amount;
          }
        });
      }
    });

    return currentBalance;
  }

  static blockchainWallet() {
    const blockchainWallet = new this();
    blockchainWallet.publicKey = "blockchain-wallet";
    return blockchainWallet;
  }
}

module.exports = Wallet;
