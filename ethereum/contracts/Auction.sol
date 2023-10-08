// SPDX-License-Identifier: MIT
 
pragma solidity ^0.8.9;

contract AuctionFactory {
    address payable[] public deployedAuctions;

    function createAuction(uint minimumBid, string memory auctionDescription) public {
        address newAuction = address(new Auction(minimumBid, auctionDescription, msg.sender));
        deployedAuctions.push(payable(newAuction));
    }

    function getDeployedAuctions() public view returns (address payable[] memory) {
        return deployedAuctions;
    }
}

contract Auction {
    address public manager;
    uint public initialBid; 
    string public description;
    mapping(address => uint) public bids;
    address public currentWinner;
    uint public currentBid;        
    bool public finalized;
    bool public customerApproval;
    bool public closed;

    modifier restrictedBidCreation() {       
        uint currentCustomerBidAmount = getCurrentCustomerBidAmount();

        require(!closed && !finalized && !customerApproval && currentCustomerBidAmount > initialBid && currentCustomerBidAmount > currentBid && msg.sender != manager);
        _;
    }

    constructor (uint minimumBid, string memory auctionDescription, address creator) {
        manager = creator;
        initialBid = minimumBid;
        description = auctionDescription;
    }

    function getSummary() public view returns (
        uint, string memory, address, address, uint, bool, bool, bool
        ) {
            return (
                initialBid,
                description,
                manager,
                currentWinner,
                currentBid,
                finalized,
                customerApproval,
                closed
            );
    }

    function getCurrentCustomerBidAmount() private view returns(uint) {
        uint currentCustomerBidAmount = 0;
        currentCustomerBidAmount = bids[msg.sender] + msg.value;

        return currentCustomerBidAmount;
    }

    function createBid() public payable restrictedBidCreation {
        uint currentCustomerBidAmount = getCurrentCustomerBidAmount();
        currentWinner = msg.sender;
        currentBid = currentCustomerBidAmount;
        bids[msg.sender] = currentCustomerBidAmount;
    }

    function closeBid() public {
        require(msg.sender == manager && !closed && !finalized && !customerApproval);
        closed = true;
    }

    function customerConfirmation() public {
        require(msg.sender == currentWinner && !finalized && !customerApproval && closed);
        customerApproval = true;
    }

    function finalizeAuction() public {
        require(msg.sender == manager && customerApproval && closed);
        payable(manager).transfer(bids[currentWinner]);
        finalized = true;
    }

    function getMoneyBack() public {
        require(msg.sender != currentWinner && msg.sender != manager && bids[msg.sender] > 0);    
        payable(msg.sender).transfer(bids[msg.sender]);
        bids[msg.sender] = 0;
    }
}