// just to demo block mining takes time
const BlockChain = require('./BlockChain')

const bc = new BlockChain()

for (let i = 0; i <= 10; i++ ) {
  console.log(bc.addBlock(`block_${i}`).toString())
}