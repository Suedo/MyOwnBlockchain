const ChainUtil = require("../chain.util");

class Transaction {
  constructor() {
    this.id = ChainUtil.id();
    this.input = null;

    /**
     * has two outputs per transaction
     * 1. how much will be sent to the other person
     * 2. how will be sent to self, ie same as how much will be left
     */
    this.outputs = [];
  }

  update(sourceWallet, recipientAddr, txAmount) {
    const ownEntryInTXOutputLog = this.outputs.find(
      output => output.address === sourceWallet.publicKey
    );
    const currentBalance = ownEntryInTXOutputLog.amount;

    if (txAmount > currentBalance) {
      console.log(`Update TX Error: ${txAmount} exceeds current balance`);
      return;
    }

    // update the balance, push new entry for amount sent to recipient, and finally sign the tx
    ownEntryInTXOutputLog.amount = currentBalance - txAmount;
    this.outputs.push({
      amount: txAmount,
      address: recipientAddr
    });
    Transaction.signTransaction(this, sourceWallet);

    return this;
  }

  // a static method to help generate outputs
  static newTransaction(sourceWallet, recipientAddr, txAmount) {
    const transaction = new Transaction();

    if (txAmount > sourceWallet.balance) {
      console.log(`Amount: ${txAmount} exceeds balance`);
      return;
    }

    // some destructuring tricks for learning purpose
    // the `...` spreads out the array to individual objects for push. Thus, push happens twice here
    transaction.outputs.push(
      ...[
        // this is the updated balance `sent` to self
        {
          amount: sourceWallet.balance - txAmount,
          address: sourceWallet.publicKey
        },
        // this is the amount sent to the actual recipient
        { amount: txAmount, address: recipientAddr }
      ]
    );

    Transaction.signTransaction(transaction, sourceWallet);

    return transaction;
  }

  static signTransaction(transaction, sourceWallet) {
    transaction.input = {
      timestamp: Date.now(),
      amount: sourceWallet.balance,
      address: sourceWallet.publicKey,
      signature: sourceWallet.sign(ChainUtil.hash(transaction.outputs))
    };
  }

  static isTxSignatureValid(transaction) {
    return ChainUtil.verifySignature(
      transaction.input.signature,
      transaction.input.address,
      ChainUtil.hash(transaction.outputs)
    );
  }

  /**
   * 1. total output amount equals input amount
   * 2. valid signature
   */
  static isTransactionValid(tx) {
    let totalOutputReducer = (acc, output) => acc + output.amount;
    let totalOutput = tx.outputs.reduce(totalOutputReducer, 0);
    if (tx.input.amount !== totalOutput) {
      console.log(`Error: Input and Output amounts dont match for Transaction ${tx.id}`);
      return;
    }

    if (!Transaction.isTxSignatureValid(tx)) {
      console.log(`Error verifying Transaction signature \n${JSON.stringify(tx, null, 2)}`);
      return;
    }

    return tx;
  }
}

module.exports = Transaction;
