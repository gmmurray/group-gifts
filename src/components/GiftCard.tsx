import React, { FunctionComponent } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import { GiftStatus } from '../models/gift';

//#region constants
const statusColors: { [status: string]: string } = {
    [GiftStatus.Available.toString()]: 'success',
    [GiftStatus.Claimed.toString()]: 'info',
    [GiftStatus.Purchased.toString()]: 'secondary',
};
//#endregion

//#region types
export type GiftCardProps = {
    id: string;
    userDisplayName?: string;
    name: string;
    webUrl: string;
    price: string;
    note: string;
    bg?: string;
    status?: GiftStatus;
    actions?: Array<GiftCardAction>;
    statusText?: string;
};

export type GiftCardAction = {
    name: string;
    onClick: () => Promise<void> | void;
    disabled?: boolean;
    variant?: string;
};
//#endregion

const GiftCard: FunctionComponent<GiftCardProps> = ({
    id,
    userDisplayName,
    name,
    webUrl,
    price,
    note,
    status,
    actions,
    bg,
    statusText,
}) => {
    const border = status ? statusColors[status] : 'light';
    const url =
        webUrl.toLowerCase().includes('http') ||
        webUrl.toLowerCase().includes('https')
            ? webUrl
            : `https://${webUrl}`;
    const showStatusText =
        status &&
        statusText &&
        status in GiftStatus &&
        status !== GiftStatus.Available;
    const statusTextColor = showStatusText ? statusColors[status!] : undefined;
    return (
        <Card border={border} key={id} className="mb-2" bg={bg}>
            {userDisplayName && <Card.Header>{userDisplayName}</Card.Header>}
            {status && (
                <ListGroup className="list-group-flush">
                    <ListGroupItem variant={border}>{status}</ListGroupItem>
                </ListGroup>
            )}
            <Card.Body>
                <Card.Title>
                    <a href={url} rel="noopener noreferrer" target="_blank">
                        {name}
                    </a>
                </Card.Title>
                <Card.Text>${price}</Card.Text>
            </Card.Body>
            <Card.Body>
                <Card.Text>{note}</Card.Text>
                {actions &&
                    actions.map(
                        ({
                            name,
                            onClick,
                            disabled = false,
                            variant,
                        }: GiftCardAction): React.ReactNode => (
                            <Button
                                key={name}
                                type="button"
                                onClick={onClick}
                                disabled={disabled}
                                variant={variant}
                                className="mr-2"
                            >
                                {name}
                            </Button>
                        ),
                    )}
                {showStatusText && (
                    <Card.Text>
                        <span className={statusTextColor}>
                            <em>{statusText}</em>
                        </span>
                    </Card.Text>
                )}
            </Card.Body>
        </Card>
    );
};

export default GiftCard;
