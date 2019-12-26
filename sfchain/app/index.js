const express = require("express");
const bodyparser = require("body-parser");
const Blockchain = require("../blockchain");
const P2PServer = require("./p2p-server");

const Wallet = require("../wallet");
const TransactionPool = require("../wallet/TransactionPool");

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2PServer(bc);

app.use(bodyparser.json());

app.get("/blocks", (req, res) => {
  res.json(bc.chain);
});

app.get("/transactions", (req, res) => {
  res.json(tp.transactions);
});

app.post("/transact", (req, res) => {
  const { recipient, amount } = req.body;
  const tx = wallet.createTransaction(recipient, amount, tp);
  // ^^ transaction already updated to pool, so we should now be able to see it
  res.redirect("/transactions");
});

app.post("/mine", (req, res) => {
  const block = bc.addBlock(req.body.data);
  console.log(`new block added: ${block.toString()}`);

  // new block is mined, send word to all connected peers/nodes
  p2pServer.broadcastUpdatedChain();

  // get the new and updated blockchain
  res.redirect("/blocks");
});

app.listen(HTTP_PORT, () => console.log(`Listening on port: ${HTTP_PORT}`));
p2pServer.listen();
