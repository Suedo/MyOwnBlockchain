const Wallet = require(".");
const TransactionPool = require("./TransactionPool");

describe("Wallet", () => {
  let wallet, tp, transaction, amountToSend, recipient;

  beforeEach(() => {
    wallet = new Wallet();
    tp = new TransactionPool();
    amountToSend = 50;
    recipient = "r4nd0m-4ddr355";
    transaction = wallet.createTransaction(recipient, amountToSend, tp);
  });

  it("balance doubles down when doing the same tx twice", () => {
    wallet.createTransaction(recipient, amountToSend, tp);

    // console.log(`double spend test:\n${JSON.stringify(transaction, null, 2)}`);
    console.log(`double spend test:\n${JSON.stringify(tp, null, 2)}`);

    expect(
      transaction.outputs.find(op => op.address === wallet.publicKey).amount
    ).toEqual(wallet.balance - amountToSend * 2);
  });

  it("clones the sent amount for the recipient", () => {
    wallet.createTransaction(recipient, amountToSend, tp);

    expect(
      transaction.outputs
        .filter(op => op.address === recipient)
        .map(op => op.amount)
    ).toEqual([amountToSend, amountToSend]);
  });
});
