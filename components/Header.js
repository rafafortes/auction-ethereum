import React from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '../routes';

export default () => {
    return (
        <Menu style={{ marginTop: '10px' }}>
            <Link route="/">
                <a className="item">Block Chain Auctions</a>
            </Link>

            <Menu.Menu position='right'>
                <Link route="/">
                    <a className="item">Auctions</a>
                </Link>
                <Link route="/how-it-works">
                    <a className="item">How it works</a>
                </Link>
                <Link route="/auctions/new">
                    <a className="item">+</a>
                </Link>
            </Menu.Menu>
        </Menu>
    );
}