const crypto = require('crypto');

class MerkleTree {
  constructor(leaves) {
    this.leaves = leaves;
    this.levels = this.getLevels(leaves);
    this.root = this.levels[this.levels.length - 1][0];
  }

  getLevels(leaves) {
    if (leaves.length === 0) {
      throw new Error('Can not create Merkle tree with no leaves');
    }

    const levels = [];
    levels.push(leaves.map(leaf => this.hash(leaf)));

    while (levels[levels.length - 1].length > 1) {
      const currentLevel = levels[levels.length - 1];
      const parentLevel = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const leftChildHash = currentLevel[i];
        const rightChildHash = i + 1 < currentLevel.length ? currentLevel[i + 1] : leftChildHash;
        const parentHash = this.hash(leftChildHash + rightChildHash);
        parentLevel.push(parentHash);
      }

      levels.push(parentLevel);
    }

    return levels;
  }

  getMerkleRoot() {
    return this.root;
  }

  getProof(leaf) {
    const index = this.leaves.indexOf(leaf);

    if (index === -1) {
      throw new Error('Leaf not found');
    }

    const proof = [];
    let levelIndex = 0;
    let siblingIndex = 0;

    for (let i = 0; i < this.levels.length - 1; i++) {
      const level = this.levels[i];
      const isLeftNode = index % 2 === 0;
      siblingIndex = isLeftNode ? index + 1 : index - 1;

      if (siblingIndex < level.length) {
        proof.push({
          data: level[siblingIndex],
          position: isLeftNode ? 'right' : 'left'
        });
      }

      index = Math.floor(index / 2);
    }

    return proof;
  }

  verifyProof(leaf, proof, root) {
    let currentHash = this.hash(leaf);

    for (let i = 0; i < proof.length; i++) {
      const proofElement = proof[i];
      const dataToHash = proofElement.position === 'left' ? proofElement.data + currentHash : currentHash + proofElement.data;
      currentHash = this.hash(dataToHash);
    }

    return currentHash === root;
  }

  hash(data) {
    return crypto.createHash('sha256').update(data.toString()).digest('hex');
  }
}

// Example usage:
const leaves = ['apple', 'banana', 'cherry', 'date'];
const tree = new MerkleTree(leaves);
console.log('Merkle root hash:', tree.getMerkleRoot());

const proof = tree.getProof('apple');
console.log('Proof of apple: ', proof);

const isVerified = tree.verifyProof('apple', proof, tree.root);
console.log('Is apple verified: ', isVerified);