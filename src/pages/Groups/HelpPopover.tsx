import React from 'react';
import Popover from 'react-bootstrap/Popover';

const HelpPopover = (
    <Popover id="help-popover">
        <Popover.Title as="h3">What does each status mean?</Popover.Title>
        <Popover.Content>
            <ul className="list-styled">
                <li>
                    <span className="text-success">
                        <u>Available</u>
                    </span>{' '}
                    - someone is able to claim this gift for purchase
                </li>
                <li>
                    <span className="text-info">
                        <u>Claimed</u>
                    </span>{' '}
                    - someone has pledged to buy this gift, but they haven't
                    made the purchase
                </li>
                <li>
                    <span className="text-secondary">
                        <u>Purchased</u>
                    </span>{' '}
                    - this gift has been purchased!
                </li>
            </ul>
        </Popover.Content>
    </Popover>
);

export default HelpPopover;
