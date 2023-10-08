import React, { Component } from "react";
import { Button, Step } from "semantic-ui-react";
import Layout from "../components/Layout";

class AuctionManagement extends Component {
  render() {
    return (
      <Layout>
        <h3>The auction works as follows:</h3>
        <Step.Group vertical>
          <Step completed>
            <Step.Content>
              <Step.Title>1 - Auction</Step.Title>
              <Step.Description>An Auction is created by an auctioneer</Step.Description>
            </Step.Content>
          </Step>
    
          <Step completed>
            <Step.Content>
              <Step.Title>2 - Opening Bids</Step.Title>
              <Step.Description>Bids are placed</Step.Description>
            </Step.Content>
          </Step>
      
          <Step completed>
            <Step.Content>
              <Step.Title>3 - Closing bids</Step.Title>
              <Step.Description>The auctioneer closes the bids</Step.Description>
            </Step.Content>
          </Step>

          <Step completed>
            <Step.Content>
              <Step.Title>4 - Winner</Step.Title>
              <Step.Description>The winner receives the merchandise</Step.Description>
            </Step.Content>
          </Step>

          <Step completed>
            <Step.Content>
              <Step.Title>5 - Auction finalization</Step.Title>
              <Step.Description>The auctioner finalizes auction</Step.Description>
            </Step.Content>
          </Step>

          <Step completed>
            <Step.Content>
              <Step.Title>6 - Losers get money back</Step.Title>
              <Step.Description>Losers can get their money back at any time</Step.Description>
            </Step.Content>
          </Step>
        </Step.Group>
      </Layout>
    );
  }
}

export default AuctionManagement;