const assert = require('assert');
const ganache = require('ganache');
const { Web3 } = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/AuctionFactory.json');
const compiledAuction = require('../ethereum/build/Auction.json');
const { before } = require('mocha');

let accounts;
let factory;
let auctionAddress;
let auction;
let manager;
let customerWinner;
let customerLoser;

async function createBid(amount, bidder) {
  await auction.methods.createBid().send({
    value: web3.utils.toWei(amount, "ether"),
    from: bidder,
    gas: '1000000'
  });
}

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  manager = accounts[0];
  customerWinner = accounts[1];
  customerLoser = accounts[2];

  factory = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ data: compiledFactory.evm.bytecode.object })
    .send({ from: manager, gas: '4000000' });

  await factory.methods.createAuction(web3.utils.toWei("1", "ether"), 'Auction of a Ferrari GT4').send({
    from: manager,
    gas: '1000000'
  });

  [auctionAddress] = await factory.methods.getDeployedAuctions().call();
  auction = await new web3.eth.Contract(compiledAuction.abi, auctionAddress);
});

describe('Auctions', () => {
  it('deploys a factory and an auction', () => {
    assert.ok(factory.options.address);
    assert.ok(auction.options.address);
  });

  it('marks caller as the auction manager', async () => {
    const manager = await auction.methods.manager().call();
    assert.equal(manager, manager);
  });

  it('ensure initial bid is 1 eth and it\'s an auction of a Ferrai GT4', async () => {
    const initialBid = await auction.methods.initialBid().call();
    const description = await auction.methods.description().call();
    assert.equal(web3.utils.toWei("1", "ether"), initialBid);
    assert.equal('Auction of a Ferrari GT4', description);
  });

  it('requires a minimum bid', async () => {
    try {
      await createBid(".9", customerWinner);
      assert(false);
    } catch (err) {
      assert(err.code == 405);
    }
  });

  it('allows people to bid', async () => {
    await createBid("2", customerWinner);
    const isBidAdded = await auction.methods.bids(customerWinner).call();
    assert(isBidAdded);

    const currentWinner = await auction.methods.currentWinner().call();
    assert.equal(customerWinner, currentWinner);
  });

  it('requires bid greater than 2 eth', async () => {
    try {
      await createBid("2", customerWinner);
      await createBid("1.9", customerLoser);
      assert(false);
    } catch (err) {
      assert(err.code == 405);
    }
  });

  it('creates a higher bid and make as the current winner', async () => {
    let isBidAdded;
    let currentWinner;

    await createBid("2", customerWinner);

    isBidAdded = await auction.methods.bids(customerWinner).call();
    assert.equal(web3.utils.toWei("2", "ether"), isBidAdded);
    currentWinner = await auction.methods.currentWinner().call();
    assert.equal(customerWinner, currentWinner);

    await createBid("3", customerLoser);

    isBidAdded = await auction.methods.bids(customerLoser).call();
    assert.equal(web3.utils.toWei("3", "ether"), isBidAdded);
    currentWinner = await auction.methods.currentWinner().call();
    assert.equal(customerLoser, currentWinner);
  });

  it('ensure people is able to increment bid to become the current winner', async () => {
    let isBidAdded;
    let currentBid;
    let currentWinner;

    await createBid("2", customerWinner);
    
    isBidAdded = await auction.methods.bids(customerWinner).call();
    assert.equal(web3.utils.toWei("2", "ether"), isBidAdded);
    currentBid = await auction.methods.currentBid().call();
    assert.equal(web3.utils.toWei("2", "ether"), currentBid);
    currentWinner = await auction.methods.currentWinner().call();
    assert.equal(customerWinner, currentWinner);

    await createBid("3", customerLoser);

    isBidAdded = await auction.methods.bids(customerLoser).call();
    assert.equal(web3.utils.toWei("3", "ether"), isBidAdded);
    currentBid = await auction.methods.currentBid().call();
    assert.equal(web3.utils.toWei("3", "ether"), currentBid);
    currentWinner = await auction.methods.currentWinner().call();
    assert.equal(customerLoser, currentWinner);
    
    await createBid("2", customerWinner);

    isBidAdded = await auction.methods.bids(customerWinner).call();
    assert.equal(web3.utils.toWei("4", "ether"), isBidAdded);
    currentBid = await auction.methods.currentBid().call();
    assert.equal(web3.utils.toWei("4", "ether"), currentBid);
    currentWinner = await auction.methods.currentWinner().call();
    assert.equal(customerWinner, currentWinner);
  });

  it('allows current losers to get money back', async () => {
    let balanceBeforeMoneyBack;
    let balanceAfterMoneyBack;
    let customerBidAfterMoneyBack;
    
    await createBid("2", customerLoser);
    await createBid("3", customerWinner);

    balanceBeforeMoneyBack = await web3.eth.getBalance(customerLoser);
    balanceBeforeMoneyBack = web3.utils.fromWei(balanceBeforeMoneyBack, "ether");
    balanceBeforeMoneyBack = parseFloat(balanceBeforeMoneyBack);

    await auction.methods.getMoneyBack().send({
      from: customerLoser,
      gas: '100000'
    });

    balanceAfterMoneyBack = await web3.eth.getBalance(customerLoser);
    balanceAfterMoneyBack = web3.utils.fromWei(balanceAfterMoneyBack, "ether");
    balanceAfterMoneyBack = parseFloat(balanceAfterMoneyBack);

    customerBidAfterMoneyBack = await auction.methods.bids(customerLoser).call();
    assert(customerBidAfterMoneyBack == 0);
    assert(balanceAfterMoneyBack > balanceBeforeMoneyBack);
  });

  it('allows manager to close bids', async () => {
    let isClosed;

    await createBid("2", customerLoser);
    await createBid("3", customerWinner);

    await auction.methods.closeBid().send({
      from: manager,
      gas: '100000'
    });
    
    isClosed = await auction.methods.closed().call();
    assert(isClosed);
  });
  
  it('ensure no bids are allowed when auction is closed', async () => {
    await createBid("2", customerLoser);
    await createBid("3", customerWinner);

    await auction.methods.closeBid().send({
      from: manager,
      gas: '100000'
    });

    try {
      await auction.methods.createBid().send({
        value: web3.utils.toWei("2", "ether"),
        from: customerWinner,
        gas: '1000000',
      });
      assert(false);
    } catch (err) {
      assert(err.code == 405);
    }
  });

  it('allows customer to confirm receipt of item', async () => {
    await createBid("2", customerLoser);
    await createBid("3", customerWinner);

    await auction.methods.closeBid().send({
      from: manager,
      gas: '100000'
    });

    await auction.methods.customerConfirmation().send({
      from: customerWinner,
      gas: '100000'
    });

    const customerApproval = await auction.methods.customerApproval().call();
    assert(customerApproval);
  });

  it('allows manager to finalize auction and get the money', async () => {
    let balanceBeforeGettingMoney = await web3.eth.getBalance(manager);
    balanceBeforeGettingMoney = web3.utils.fromWei(balanceBeforeGettingMoney, "ether");
    balanceBeforeGettingMoney = parseFloat(balanceBeforeGettingMoney);

    await createBid("2", customerLoser);
    await createBid("3", customerWinner);

    await auction.methods.closeBid().send({
      from: manager,
      gas: '100000'
    });

    await auction.methods.customerConfirmation().send({
      from: customerWinner,
      gas: '100000'
    });

    await auction.methods.finalizeAuction().send({
      from: manager,
      gas: '1000000'
    });

    const finalized = await auction.methods.finalized().call();
    assert(finalized);

    let balanceAfterGettingMoney = await web3.eth.getBalance(manager);
    balanceAfterGettingMoney = web3.utils.fromWei(balanceAfterGettingMoney, "ether");
    balanceAfterGettingMoney = parseFloat(balanceAfterGettingMoney);

    assert(balanceAfterGettingMoney > balanceBeforeGettingMoney);
  });

  it('ensure no bids are allowed when auction is finalized', async () => {

    await createBid("2", customerLoser);
    await createBid("3", customerWinner);

    await auction.methods.closeBid().send({
      from: manager,
      gas: '100000'
    });

    await auction.methods.customerConfirmation().send({
      from: customerWinner,
      gas: '100000'
    });

    await auction.methods.finalizeAuction().send({
      from: manager,
      gas: '1000000'
    });

    try {
      await createBid("4", customerLoser);
      assert(false);
    } catch (err) {
      assert(err.code == 405);
    }
  });

  it('ensure manager can\'t bid', async () => {
    try {
      await createBid("2", manager);
      assert(false);
    } catch (err) {
      assert(err.code == 405);
    }
  });

  it ('process bids', async () => {  
    await createBid("2", customerWinner);
    await createBid("3", customerLoser);
    await createBid("2", customerWinner);
  
    // current loser to get money back
    await auction.methods.getMoneyBack().send({
      from: customerLoser,
      gas: '100000'
    });

    // manager to close bids
    await auction.methods.closeBid().send({
      from: manager,
      gas: '100000'
    });

    // customer to confirm receipt of item
    await auction.methods.customerConfirmation().send({
      from: customerWinner,
      gas: '100000'
    });

    // manager to finalize auction and get the money
    await auction.methods.finalizeAuction().send({
      from: manager,
      gas: '1000000'
    });

    const finalized = await auction.methods.finalized().call();
    assert(finalized);
  });
});