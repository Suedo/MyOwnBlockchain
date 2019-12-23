const express = require("express");
const bodyparser = require("body-parser");
const Blockchain = require("../blockchain");
const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const bc = new Blockchain();

app.use(bodyparser.json());

app.get("/blocks", (req, res) => {
  res.json(bc.chain);
});

app.post("/mine", (req, res) => {
  const block = bc.addBlock(req.body.data);
  console.log(`new block added: ${block.toString()}`);

  // get the new and updated blockchain
  res.redirect("/blocks");
});

app.listen(HTTP_PORT, () => console.log(`Listening on port: ${HTTP_PORT}`));
