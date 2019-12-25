const EC = require("elliptic").ec;
const uuidV1 = require("uuid/v1");
const ec = new EC("secp256k1"); // same as Bitcoin
const SHA256 = require("crypto-js/sha256");

class ChainUtil {
  static genKeyPair() {
    // Not implemented yet : ec.genKeyPair()
    // will get this error in jest, because it has dependencies that
    // get satisfied when running in browser context, but we are running in node
    // hence, add a "jest" config to `package.json` specifying environment
    return ec.genKeyPair();
  }

  static id() {
    return uuidV1();
  }

  static hash(data) {
    return SHA256(JSON.stringify(data)).toString();
  }

  static verifySignature(signature, publicKey, dataHash) {
    return ec.keyFromPublic(publicKey, "hex").verify(dataHash, signature);
  }
}

module.exports = ChainUtil;
