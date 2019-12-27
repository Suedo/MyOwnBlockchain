// node dev-test.js

const Wallet = require("./wallet");
const TransactionPool = require("./wallet/TransactionPool");

wallet = new Wallet();
tp = new TransactionPool();
amountToSend = 50;
recipient = "r4nd0m-4ddr355";
transaction = wallet.createTransaction(recipient, amountToSend, tp);

validTxs = tp.transactions;
for (let i = 0; i < 6; i++) {
  wallet = new Wallet();
  tx = wallet.createTransaction("abcdefgh", 30, tp);
  if (i % 2 == 0) {
    tx.input.amount = 99999;
  } else {
    validTxs.push(tx);
  }
}

console.log(JSON.stringify(tp, null, 2));
console.log(`\n----------------------\n${JSON.stringify(validTxs, null, 2)}`);
