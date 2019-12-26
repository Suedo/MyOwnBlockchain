const TransactionPool = require("./TransactionPool");
const Transaction = require("./transaction");
const Wallet = require(".");

describe("TransactionPool", () => {
  let tp, transaction, wallet, txAmount, recipient;

  beforeEach(() => {
    tp = new TransactionPool();
    txAmount = 50;
    recipient = "r3c1p13nt";
    wallet = new Wallet();
    transaction = Transaction.newTransaction(wallet, recipient, txAmount);
    tp.addOrUpdateTransaction(transaction);
  });

  it("add a transaction to the pool", () => {
    expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(
      transaction
    );
  });

  it("updates a transaction in the pool", () => {
    const transactionInPool = tp.transactions.find(
      t => t.id === transaction.id
    );
    const idx = tp.transactions.indexOf(transactionInPool);
    const nextRecipient = "n3xt-4ddr355";
    const newTx = transaction.update(wallet, nextRecipient, 20);

    tp.addOrUpdateTransaction(newTx);
    // console.log(`transaction pool test:\n${JSON.stringify(tp.transactions, null, 2)}`)

    expect(
      tp.transactions[idx].outputs.find(op => op.address === nextRecipient)
        .amount
    ).toEqual(20);
  });
});
