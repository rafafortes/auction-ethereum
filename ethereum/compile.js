const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");
 
const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);
 
const auctionPath = path.resolve(__dirname, "contracts", "Auction.sol");
const source = fs.readFileSync(auctionPath, "utf8");
 
const input = {
  language: "Solidity",
  sources: {
    "Auction.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};
 
const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  "Auction.sol"
];
 
fs.ensureDirSync(buildPath);
 
for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(":", "") + ".json"),
    output[contract]
  );
}