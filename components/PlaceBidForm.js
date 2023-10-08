import React, { Component } from 'react';
import { Form, Input, Button, Message } from 'semantic-ui-react';
import Auction from '../ethereum/auction';
import web3 from '../ethereum/web3';
import { Router } from '../routes';

class PlaceBidForm extends Component {
    state = {
        value: "",
        errorMessage: "",
        loading: false
    };

    onSubmit = async event => {
        event.preventDefault();
        this.setState({ loading: true, errorMessage: "" });

        const auction = Auction(this.props.address);

        try {
            const accounts = await web3.eth.getAccounts();

            await auction.methods.createBid().send({
                from: accounts[0],
                value: this.state.value
            });

            Router.replaceRoute(`/auctions/${this.props.address}`);
        } catch (err) {
            this.setState({ errorMessage: err.message });
        }

        this.setState({ loading: false });
    }

    render() {
        return (
            <div>
                <h3>Place a bid</h3>
                <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                    <Form.Field>
                        <label>Bid Amount</label>
                        <Input
                            label="wei"
                            labelPosition="right"
                            value={this.state.value}
                            onChange={event => this.setState({ value: event.target.value })}
                        />
                    </Form.Field>
                    <Message error header="Oops!" content={this.state.errorMessage} />
                    <Button primary loading={this.state.loading}>
                        Place Bid!
                    </Button>                                
                </Form>
            </div>
        );
    }
}

export default PlaceBidForm;