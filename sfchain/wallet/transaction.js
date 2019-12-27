const ChainUtil = require("../chain.util");
const { MINING_REWARD } = require("../config");

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

  static transactionWithOutputs(sourceWallet, outputs) {
    const transaction = new Transaction();
    // the `...` spreads out the array to individual objects for push.
    transaction.outputs.push(...outputs);
    Transaction.signTransaction(transaction, sourceWallet);
    return transaction;
  }

  // a static method to help generate outputs
  static newTransaction(sourceWallet, recipientAddr, txAmount) {
    if (txAmount > sourceWallet.balance) {
      console.log(`Amount: ${txAmount} exceeds balance`);
      return;
    }

    const outputs = [
      // this is the updated balance `sent` to self
      {
        amount: sourceWallet.balance - txAmount,
        address: sourceWallet.publicKey
      },
      // this is the amount sent to the actual recipient
      { amount: txAmount, address: recipientAddr }
    ];

    return Transaction.transactionWithOutputs(sourceWallet, outputs);
  }
  /**
   * blockchainWallet will sign the transaction to verify that it indeed is a reward
   */
  static rewardTransaction(minerWallet, blockchainWallet) {
    let outputs = [
      {
        amount: MINING_REWARD,
        address: minerWallet.publicKey
      }
    ];
    return Transaction.transactionWithOutputs(blockchainWallet, outputs);
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
      console.log(
        `Error: Input and Output amounts dont match for Transaction ${tx.id}`
      );
      return;
    }

    if (!Transaction.isTxSignatureValid(tx)) {
      console.log(
        `Error verifying Transaction signature \n${JSON.stringify(tx, null, 2)}`
      );
      return;
    }

    return tx;
  }
}

module.exports = Transaction;
