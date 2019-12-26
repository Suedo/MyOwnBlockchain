const ChainUtil = require("../chain.util");
const { INITIAL_BALANCE } = require("../config");
const Transaction = require("./transaction");

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

    let tx = transactionPool.getTxWithPubKey(recipient);
    // console.log(`getTxWithPubKey: Transaction:\n${JSON.stringify(tx, null, 2)}`);

    if (tx) {
      tx.update(this, recipient, amount);
    } else {
      tx = Transaction.newTransaction(this, recipient, amount);
      transactionPool.addOrUpdateTransaction(tx);
    }

    return tx;
  }
}

module.exports = Wallet;
