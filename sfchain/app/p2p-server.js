const Websocket = require("ws");

const P2P_PORT = process.env.P2P_PORT || 5001;
const PEERS = process.env.PEERS ? process.env.PEERS.split(",") : [];

const MESSAGE_TYPES = {
  chain: "CHAIN",
  transaction: "TRANSACTION"
};

// HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev

class P2PServer {
  constructor(blockChain, transactionPool) {
    this.blockChain = blockChain;
    this.transactionPool = transactionPool;
    this.sockets = [];
  }

  listen() {
    const server = new Websocket.Server({ port: P2P_PORT });
    this.connectPeers();
    server.on("connection", socket => this.connectSocket(socket));
    console.log(`P2PServer listening on port: ${P2P_PORT}`);
  }

  // connect this node to the peer nodes provided at execution time via env props
  connectPeers() {
    PEERS.forEach(peer => {
      // connection is established via a new websocket
      const peerSocket = new Websocket(peer); // peer is like "ws://localhost:5001"
      peerSocket.on("open", () => this.connectSocket(peerSocket));
    });
  }

  // all sockets will go through this connector
  connectSocket(peerSocket) {
    this.sockets.push(peerSocket);
    console.log(`Socket connected...`);
    this.handleMessageFrom(peerSocket);
    this.sendChainTo(peerSocket);
  }

  // when a new block is mined, broadcast new updated blockchain to all connected peers
  broadcastUpdatedChain() {
    this.sockets.forEach(socket => this.sendChainTo(socket));
  }

  broadcastTransaction(tx) {
    console.log(
      `in broadcastTransaction:\nSocket count: ${this.sockets.length}`
    );

    this.sockets.forEach(s => this.sendTransactionTo(s, tx));
  }

  // each node in blockchain will emit its blockchain in its message
  handleMessageFrom(socket) {
    socket.on("message", message => {
      // console.log(
      //   `Message received:\n${JSON.stringify(JSON.parse(message), null, 2)}`
      // );
      const data = JSON.parse(message); // all messages will be an object with a 'type' and a 'value'
      switch (data.type) {
        case MESSAGE_TYPES.chain:
          this.blockChain.replaceChain(data.value);
          break;
        case MESSAGE_TYPES.transaction:
          // console.log("received a transaction message..");
          this.transactionPool.addOrUpdateTransaction(data.value);
          break;
      }
    });
  }

  // send this blockchain to connected peer via the connecting socket
  sendChainTo(socket) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.chain,
        value: this.blockChain.chain
      })
    );
  }

  sendTransactionTo(socket, tx) {
    console.log("sending transaction..");
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.transaction,
        value: tx
      })
    );
  }
}

module.exports = P2PServer;
