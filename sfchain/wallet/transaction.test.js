const Transaction = require("./transaction");
const Wallet = require(".");

describe("Transaction", () => {
  let transaction, wallet, recipient, amount;

  beforeEach(() => {
    wallet = new Wallet();
    txAmount = 50;
    recipient = "r3c1p13nt";
    transaction = Transaction.newTransaction(wallet, recipient, txAmount);
  });

  it("creates `output` with amount being balance left, sent to own address", () => {
    const ownEntryInTXLog = transaction.outputs.find(
      output => output.address === wallet.publicKey
    );
    const amountLeftWithSelf = ownEntryInTXLog.amount;

    expect(amountLeftWithSelf).toEqual(wallet.balance - txAmount);
  });

  it("creates `output` with amount to be sent to recipient", () => {
    const recipientEntryInTXLog = transaction.outputs.find(
      output => output.address === recipient
    );
    const amountSentToRecipient = recipientEntryInTXLog.amount;

    expect(amountSentToRecipient).toEqual(txAmount);
  });

  it("does not create a Transaction when transfer amount greater than wallet balance", () => {
    let hugeAmount = 5000;
    let nonExistingTx = Transaction.newTransaction(
      wallet,
      recipient,
      hugeAmount
    );
    expect(nonExistingTx).toEqual(undefined);
  });

  it("puts the wallet balance in Transaction input", () => {
    expect(transaction.input.amount).toEqual(wallet.balance);
  });

  it("validates a valid Transaction", () => {
    // courtesy beforeEach, we have a freshly created transaction, so we expect it to be valid
    // console.log(`validation: transaction: ${JSON.stringify(transaction, null, 2)}`);
    expect(Transaction.verifyTransaction(transaction)).toBe(true);
  });

  it("invalidates a corrupted transaction", () => {
    transaction.outputs[0].amount = 50000;
    expect(Transaction.verifyTransaction(transaction)).toBe(false);
  });

  // for testing transaction updates
  describe("and updating a transaction", () => {
    let nextAmount, nextRecipient;

    beforeEach(() => {
      nextAmount = 20;
      nextRecipient = "n3xt-4ddr355";
      transaction = transaction.update(
        wallet,
        nextRecipient,
        nextAmount
      );
    });

    it("it subtracts the next amount from the sender's output", () => {
      const ownEntryInTXLog = transaction.outputs.find(
        output => output.address === wallet.publicKey
      );
      const amountLeftWithSelf = ownEntryInTXLog.amount;
      console.log(JSON.stringify(transaction, null, 2));
      expect(amountLeftWithSelf).toEqual(
        wallet.balance - txAmount - nextAmount
      );
    });

    it("creates an output amount for the next recipient", () => {
      const recipientEntryInTXLog = transaction.outputs.find(
        output => output.address === nextRecipient
      );

      const amountSentToRecipient = recipientEntryInTXLog.amount;

      expect(amountSentToRecipient).toEqual(nextAmount);
    });
  });
});
