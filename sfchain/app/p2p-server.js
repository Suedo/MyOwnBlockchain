const Websocket = require("ws");

const P2P_PORT = process.env.P2P_PORT || 5001;
const PEERS = process.env.PEERS ? process.env.PEERS.split(",") : [];

// HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev

class P2PServer {
  constructor(blockChain) {
    this.blockChain = blockChain;
    this.sockets = [];
  }

  listen() {
    const server = new Websocket.Server({ port: P2P_PORT });
    this.connectPeers();
    // async event handler
    server.on("connection", socket => this.connectSocket(socket));
    console.log(`P2PServer listening on port: ${P2P_PORT}`);
  }

  connectPeers() {
    PEERS.forEach(peer => {
      const socket = new Websocket(peer); // peer is like "ws://localhost:5001"
      // async event handler
      socket.on("open", () => this.connectSocket(socket));
    });
  }

  // all sockets will go through this connector
  connectSocket(socket) {
    this.sockets.push(socket);
    console.log(`Socket connected...`);
    this.messageHandler(socket);
    socket.send(JSON.stringify(this.blockChain.chain));
  }

  messageHandler(socket) {
    // async event handler
    socket.on("message", message => {
      const data = JSON.parse(message);
      console.log(`socket::${P2P_PORT}: message:\n${JSON.stringify(data, null, 2)}`);
    });
  }
}

module.exports = P2PServer;
