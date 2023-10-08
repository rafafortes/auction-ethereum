import web3 from './web3';
import AuctionFactory from './build/AuctionFactory.json';

const instance = new web3.eth.Contract(
    AuctionFactory.abi,
    'THE_CONTRACT_ADDRESS'
);

export default instance;