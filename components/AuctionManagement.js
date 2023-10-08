import React, { Component } from "react";
import { Button, Form, Message } from 'semantic-ui-react';
import Auction from '../ethereum/auction';
import web3 from '../ethereum/web3';

class AuctionManagement extends Component {
    state = {
        errorMessage: "",
        loading: false
    };

    manageAuction = async (action) => {
        try {
            const auction = Auction(this.props.address);
            const accounts = await web3.eth.getAccounts();

            await auction.methods[action]().send({
                from: accounts[0],
                gas: '100000'
            });
        } catch (err) {
            this.setState({ errorMessage: err.message });
        }
    }

    render() {  
        return (
            <div style={{ marginTop: '20px' }} >
                <h3>Auction Management</h3>
                <Form error={!!this.state.errorMessage}>
                    <Button onClick={() => this.manageAuction('closeBid')} primary>Close Bids</Button>
                    <Button onClick={() => this.manageAuction('customerConfirmation')} primary>Winner Confirmation</Button>
                    <Button onClick={() => this.manageAuction('finalizeAuction')} style={{ marginTop: '10px' }} primary>Finalize Auction</Button>                
                    <Button onClick={() => this.manageAuction('getMoneyBack')} style={{ marginTop: '10px' }} primary>Get Money Back</Button>
                    <Message error header="Oops!" content={this.state.errorMessage} />
                </Form>
            </div>
        );
    };
}

export default AuctionManagement;
