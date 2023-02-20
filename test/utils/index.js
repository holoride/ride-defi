const mineBlocks = async (numberOfBlocks) => {
  for (let i = 0; i < numberOfBlocks; i++) {
    await ethers.provider.send("evm_mine");
  }
}   

module.exports = {
  mineBlocks
}