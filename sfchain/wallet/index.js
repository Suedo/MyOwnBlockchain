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

  createTransaction(recipient, amount, transactionPool) {
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

  static blockchainWallet() {
    const blockchainWallet = new this();
    blockchainWallet.publicKey = "blockchain-wallet";
    return blockchainWallet;
  }
}

module.exports = Wallet;
