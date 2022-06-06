var DiamondHands = artifacts.require("./DiamondHands.sol");

module.exports = function(deployer) {
  deployer.deploy(DiamondHands);
};
