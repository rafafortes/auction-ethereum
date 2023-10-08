import React, { Component } from 'react';
import { Form, Button, Input, Message } from 'semantic-ui-react'
import Layout from '../../components/Layout';
import factory from '../../ethereum/factory';
import web3 from '../../ethereum/web3';
import { Router } from '../../routes';

class AuctionNew extends Component {
    state = {
        minimumBid: '',
        description: '',
        errorMessage: '',
        loading: false
    };

    onSubmit = async (event) => {
        event.preventDefault();

        this.setState({ loading: true, errorMessage: '' });

        try {
            const accounts = await web3.eth.getAccounts();
            await factory.methods
                .createAuction(this.state.minimumBid, this.state.description)
                .send({
                    from: accounts[0]
                });
            
            Router.pushRoute('/');
        } catch (err) {
            this.setState({ errorMessage: err.message });
        }

        this.setState({ loading: false });
    };

    render() {
        return (
            <Layout>
                <h3>Create an Auction</h3>
                <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                    <Form.Field>
                        <label>Minimum Bid</label>
                        <Input 
                            label='wei' 
                            labelPosition='right' 
                            value={this.state.minimumBid}
                            onChange={event => 
                                this.setState({ minimumBid: event.target.value })}
                        />                        
                    </Form.Field>
                    <Form.Field>
                        <label>Description</label>
                        <Input 
                            placeholder='What are you auctioning?' 
                            value={this.state.description}
                            onChange={event => 
                                this.setState({ description: event.target.value })}
                        />
                    </Form.Field>

                    <Message error header="Oops!" content={this.state.errorMessage} />
                    <Button loading={this.state.loading} primary type='submit'>Submit</Button>
                </Form>
            </Layout>
        );
    }
}

export default AuctionNew;