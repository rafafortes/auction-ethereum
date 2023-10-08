import React, { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';

class AuctionIndex extends Component {
    static async getInitialProps() {
        const auctions = await factory.methods.getDeployedAuctions().call();

        return { auctions };
    }

    renderAuctions() {
        const items = this.props.auctions.map(address => {
            return {
                header: address,
                description: (
                    <Link route={`/auctions/${address}`}>
                        <a>View Auction</a>
                    </Link>
                ),
                fluid: true
            };
        });

        return <Card.Group items={items} />;
    }

    render() {
        return  (
            <Layout>
                <div>                    
                    <h3>Open Auctions</h3>

                    <Link route="/auctions/new">
                        <a>
                            <Button floated="right"
                                content="Create Auction"
                                icon="add circle"
                                primary
                            />
                        </a>
                    </Link>
                    {this.renderAuctions()}
                </div>
            </Layout>
        );
    }
}

export default AuctionIndex;