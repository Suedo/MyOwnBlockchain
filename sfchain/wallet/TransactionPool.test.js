const TransactionPool = require("./TransactionPool");
const Transaction = require("./Transaction");
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

  it('clears the transaction pool', () => {
    tp.clear();
    expect(tp.transactions).toEqual([])
  })

  describe("Mix valid and invalid Transactions", () => {
    let validTxs;

    beforeEach(() => {
      validTxs = [...tp.transactions]; // without this spread, equality test fails below
      for (let i = 0; i < 6; i++) {
        wallet = new Wallet();
        tx = wallet.createTransaction("abcdefgh", 30, tp);
        if (i % 2 == 0) {
          tx.input.amount = 99999;
        } else {
          validTxs.push(tx);
        }
      }
    });

    // the course has one more extra test here, about validTxs !== tp.transactions

    it("filters only valid transactions", () => {
      expect(tp.getValidTxs()).toEqual(validTxs);
    });
  });
});
