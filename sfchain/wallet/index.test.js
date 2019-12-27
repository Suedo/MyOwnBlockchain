const Wallet = require(".");
const TransactionPool = require("./TransactionPool");
const Blockchain = require("../blockchain");
const { INITIAL_BALANCE } = require("../config");

describe("Wallet", () => {
  let wallet, tp, transaction, amountToSend, recipient, bc;

  beforeEach(() => {
    wallet = new Wallet();
    tp = new TransactionPool();
    amountToSend = 50;
    recipient = "r4nd0m-4ddr355";
    bc = new Blockchain();
    transaction = wallet.createTransaction(recipient, amountToSend, bc, tp);
  });

  it("balance doubles down when doing the same tx twice", () => {
    wallet.createTransaction(recipient, amountToSend, bc, tp);

    // console.log(`double spend test:\n${JSON.stringify(transaction, null, 2)}`);
    // console.log(`double spend test:\n${JSON.stringify(tp, null, 2)}`);

    expect(
      transaction.outputs.find(op => op.address === wallet.publicKey).amount
    ).toEqual(wallet.balance - amountToSend * 2);
  });

  it("clones the sent amount for the recipient", () => {
    wallet.createTransaction(recipient, amountToSend, bc, tp);

    expect(
      transaction.outputs
        .filter(op => op.address === recipient)
        .map(op => op.amount)
    ).toEqual([amountToSend, amountToSend]);
  });

  describe("calculating a balance", () => {
    let addBalance, repeatAdd, senderWallet;

    beforeEach(() => {
      senderWallet = new Wallet();
      wallet = new Wallet(); // without this init, calculate balance for recipient was failing
      addBalance = 100;
      repeatAdd = 3;
      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
      }
      bc.addBlock(tp.transactions);
    });

    
    it("calculates the balance for blockchain transactions matching the recipient", () => {
      // console.log(JSON.stringify(bc,null,2));
      expect(wallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE + (addBalance * repeatAdd));
    });

    
    it("calculates the balance for blockchain transactions matching the sender", () => {
      expect(senderWallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE - (addBalance * repeatAdd));
    });
  });
});
