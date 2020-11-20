import React, { FunctionComponent, useContext } from 'react';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
import Button from 'react-bootstrap/Button';

type ContextualToggleType = {
    openText: string;
    closedText: string;
    eventKey: string;
    callback?: any;
    as: any;
};

type AccordionDropdownType = {
    openText: string;
    closedText: string;
    defaultActiveKey?: string;
    children: React.ReactNode;
    [rest: string]: any;
};

const ContextualToggle: FunctionComponent<ContextualToggleType> = ({
    openText,
    closedText,
    eventKey,
    callback,
    as,
}) => {
    const currentEventKey = useContext(AccordionContext);

    const toggleClick = useAccordionToggle(
        eventKey,
        () => callback && callback(eventKey),
    );

    const isCurrentEventKey = currentEventKey === eventKey;

    return (
        <Button variant="link" onClick={toggleClick} as={as}>
            {isCurrentEventKey ? openText : closedText}
        </Button>
    );
};

const AccordionDropdown: FunctionComponent<AccordionDropdownType> = ({
    openText,
    closedText,
    defaultActiveKey,
    children,
    rest,
}) => {
    return (
        <Accordion defaultActiveKey={defaultActiveKey} {...rest}>
            <Card>
                <ContextualToggle
                    openText={openText}
                    closedText={closedText}
                    eventKey="0"
                    as={Card.Header}
                />
                <Accordion.Collapse eventKey="0">
                    <Card.Body>{children}</Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    );
};

export default AccordionDropdown;
