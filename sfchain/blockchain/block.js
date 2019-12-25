const { DIFFICULTY, MINE_RATE } = require("../config"); // as more miners join the pool, difficulty needs to be increased
const ChainUtil = require("../chain.util");

class Block {
  constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty || DIFFICULTY;
  }

  static genesis() {
    return new this("Genesis time", "-----", "f1r57-h45h", [], 0, DIFFICULTY);
  }

  static mineBlock(lastBlock, data) {
    const lastHash = lastBlock.hash;
    let timestamp = 0;
    let nonce = 0;
    let hash = 0;
    let { difficulty } = lastBlock;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty(lastBlock, timestamp);
      hash = Block.generateHash(timestamp, lastHash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));

    /* 
    // idea was to have the next block be mined with the new difficulty
    // but this makes `isValidChain` return false, as the generated hash was with the old difficulty
    // might get solved if we remove difficulty from the hash params
       let newDifficulty = Block.adjustDifficulty(lastBlock, timestamp);
    */

    const newBlock = new this(
      timestamp,
      lastHash,
      hash,
      data,
      nonce,
      difficulty
    );
    // console.log(`mined block:\n${JSON.stringify(newBlock, null, 2)}`);
    return newBlock;
  }

  static blockHash(block) {
    const { timestamp, lastHash, data, nonce, difficulty } = block;
    return Block.generateHash(timestamp, lastHash, data, nonce, difficulty);
  }

  static generateHash(timestamp, lastHash, data, nonce, difficulty) {
    return ChainUtil.hash(
      `${timestamp}${lastHash}${data}${nonce}${difficulty}`
    );
  }

  static adjustDifficulty(lastBlock, currentTime) {
    let { difficulty } = lastBlock;
    difficulty =
      lastBlock.timestamp + MINE_RATE > currentTime
        ? difficulty + 1
        : difficulty - 1;
    return difficulty;
  }

  toString() {
    return `Block -
            Timestamp   : ${this.timestamp}
            Last Hash   : ${this.lastHash.substring(0, 10)}
            Hash        : ${this.hash.substring(0, 10)}
            Nonce       : ${this.nonce}
            Difficulty  : ${this.difficulty}
            Data        : ${this.data}`;
  }
}

module.exports = Block;
