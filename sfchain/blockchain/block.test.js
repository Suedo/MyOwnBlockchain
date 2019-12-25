const Block = require("./block");

describe("Block", () => {
  let data, lastBlock, block;
  beforeEach(() => {
    data = "bar";
    lastBlock = Block.genesis();
    block = Block.mineBlock(lastBlock, data);
  });

  it("sets the `data` to match the input", () => {
    expect(block.data).toEqual(data);
  });

  it("sets the `lastHash` to match the hash of the last block", () => {
    expect(block.lastHash).toEqual(lastBlock.hash);
  });

  /**
   * 36000 ms == 1 hour
   * current MINE_RATE is 300 ms, i.e we expect a block to be mined in 300 ms
   * if the delta between last block's timestamp, and the current timestamp
   * passed to adjustDifficulty is greater than MINE_RATE, meaning the process of finding a hash
   * has exceeded the expected mining time, then we lower the difficulty.
   * Vice versa for delta timestamp lower than MINE_RATE
   */

  it("lowers the difficulty for slowly mined blocks", () => {
    const timeToMine = 36000;
    expect(Block.adjustDifficulty(block, block.timestamp + timeToMine)).toEqual(
      block.difficulty - 1
    );
  });

  it("raises the difficulty for quickly mined blocks", () => {
    const timeToMine = 1;
    expect(Block.adjustDifficulty(block, block.timestamp + timeToMine)).toEqual(
      block.difficulty + 1
    );
  });

  it("expects a hash that matches the difficulty", () => {
    // console.log(`block:\n${JSON.stringify(block, null, 2)}`);
    expect(block.hash.substring(0, block.difficulty)).toEqual(
      "0".repeat(block.difficulty)
    );
  });
});
