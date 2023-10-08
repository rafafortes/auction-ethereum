import React, { Component } from 'react';
import { Button, Card, Grid } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import Auction from '../../ethereum/auction';
import PlaceBidForm from '../../components/PlaceBidForm';
import { Link } from '../../routes';
import AuctionManagement from '../../components/AuctionManagement';

class AuctionShow extends Component {
    static async getInitialProps(props) {
        const auction = Auction(props.query.address);
        const summary = await auction.methods.getSummary().call();

        return {
            address: props.query.address,
            initialBid: summary[0].toString(),
            description: summary[1],
            manager: summary[2],
            currentWinner: summary[3],
            currentBid: summary[4].toString(),
            finalized: summary[5],
            customerApproval: summary[6],
            closed: summary[7]
        };
    }

    renderCards() {
        const {
            initialBid,
            description,
            manager,
            currentWinner,
            currentBid,
            finalized,
            customerApproval,
            closed
        } = this.props;

        const items = [
            {
                header: manager,
                meta: 'Address of Auctioner',
                description: 'The auctioner created this auction and can close bids and finalize the auction.',
                style: { overflowWrap: 'break-word' }
            },
            {
                header: initialBid.toString(),
                meta: 'Initial Bid (wei)',
                description: 'The initial bid amount set by the auctioner.'
            },
            {
                header: description,
                meta: 'Description',
                description: 'The description of the auction.'
            },
            {
                header: currentWinner,
                meta: 'Current Winner',
                description: 'The current winner of the auction.',
                style: { overflowWrap: 'break-word' }
            },
            {
                header: currentBid.toString(),
                meta: 'Current Bid (wei)',
                description: 'The current highest bid.'
            }
        ];

        return <Card.Group items={items} />;
    }

    render() {
        return (
            <Layout>
                <h3>Auction Details</h3>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={10}>
                        {this.renderCards()}
                        </Grid.Column>

                        <Grid.Column width={6}>
                            <PlaceBidForm address={this.props.address} />
                            <AuctionManagement address={this.props.address} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>                                
            </Layout>
        );
    }
}

export default AuctionShow;