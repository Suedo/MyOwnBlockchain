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

  update(senderWallet, recipientAddr, txAmount) {
    const ownEntryInTXOutputLog = this.outputs.find(
      output => output.address === senderWallet.publicKey
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
    Transaction.signTransaction(this, senderWallet);

    return this;
  }

  // a static method to help generate outputs
  static newTransaction(senderWallet, recipientAddr, txAmount) {
    const transaction = new Transaction();

    if (txAmount > senderWallet.balance) {
      console.log(`Amount: ${txAmount} exceeds balance`);
      return;
    }

    // some destructuring tricks for learning purpose
    // the `...` spreads out the array to individual objects for push. Thus, push happens twice here
    transaction.outputs.push(
      ...[
        // this is the updated balance `sent` to self
        {
          amount: senderWallet.balance - txAmount,
          address: senderWallet.publicKey
        },
        // this is the amount sent to the actual recipient
        { amount: txAmount, address: recipientAddr }
      ]
    );

    Transaction.signTransaction(transaction, senderWallet);

    return transaction;
  }

  static signTransaction(transaction, senderWallet) {
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
    };
  }

  static verifyTransaction(transaction) {
    return ChainUtil.verifySignature(
      transaction.input.signature,
      transaction.input.address,
      ChainUtil.hash(transaction.outputs)
    );
  }
}

module.exports = Transaction;
