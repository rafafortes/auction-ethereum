const HDWalletProvider = require('@truffle/hdwallet-provider');
const { Web3 } = require('web3');
const compiledFactory = require('./build/AuctionFactory.json');

const provider = new HDWalletProvider(
  'YOUR_SECRET_WORDS',
  'YOUR_API_URL'
);
const web3 = new Web3(provider);

const deploy = async () => {
    try { 
      const accounts = await web3.eth.getAccounts();

      console.log('Attempting to deploy from account', accounts[0]);

      const result = await new web3.eth.Contract(compiledFactory.abi)
          .deploy({ data: compiledFactory.evm.bytecode.object })
          .send({ gas: "3000000", from: accounts[0] });

      console.log("Contract deployed to", result.options.address);
      provider.engine.stop();
    } catch (err) {
      console.log(err);
    }
};
deploy();
