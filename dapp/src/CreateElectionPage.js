import React, {useEffect, useState} from 'react';
import {Alert, Button, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {detectConcordiumProvider, WalletApi} from "@concordium/browser-wallet-api-helpers";

async function addOption(options, setOptions, newOption, setOptionInput) {
    if (options.includes(newOption)) {
        throw new Error(`duplicate option ${newOption}`);
    }
    if (newOption) {
        setOptions([...options, newOption]);
        setOptionInput("");
    }
}

async function connect(client: WalletApi, setConnectedAccount) {
    const account = await client.connect();
    return setConnectedAccount(account);
}

const CreateElectionPage = () => {
    const [description, setDescription] = useState();
    const [options, setOptions] = useState([]);
    const [optionInput, setOptionInput] = useState("");
    const [deadlineMinutesInput, setDeadlineMinutesInput] = useState("30");

    const [client, setClient] = useState();
    const [connectedAccount, setConnectedAccount] = useState();

    // Attempt to initialize Browser Wallet Client.
    useEffect(
        () => {
            detectConcordiumProvider()
                .then(client => {
                    setClient(client);
                    // Listen for relevant events from the wallet.
                    client.on('accountChanged', account => {
                        console.debug('browserwallet event: accountChange', {account});
                        setConnectedAccount(account);
                    });
                    client.on('accountDisconnected', () => {
                        console.debug('browserwallet event: accountDisconnected');
                        client.getMostRecentlySelectedAccount().then(setConnectedAccount);
                    });
                    client.on('chainChanged', (chain) => {
                        console.debug('browserwallet event: chainChanged', {chain});
                    });
                    // Check if you are already connected
                    client.getMostRecentlySelectedAccount().then(setConnectedAccount);
                    return client;
                })
                .catch(console.error);
        }, []);

    return (
        <Container>
            <Row>

                <Col>
                    {!connectedAccount && (
                        <>
                            <p>No wallet connection</p>
                            <Button onClick={() => connect(client, setConnectedAccount).catch(console.error)}>
                                Connect
                            </Button>
                        </>
                    )}
                    {connectedAccount && (
                        <Alert variant="success">
                            Connected to account <code>{connectedAccount}</code>.
                        </Alert>
                    )}
                </Col>
            </Row>
            <Row>
                <Col>
                    <FloatingLabel label="Enter description of election.">
                        <Form.Control
                            as="textarea"
                            style={{height: '100px'}}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </FloatingLabel>
                    <h2>Options</h2>
                    <ul>{options?.map(opt => <li>{opt}</li>)}</ul>
                    <Form onSubmit={e => {
                        e.preventDefault();
                        addOption(options, setOptions, optionInput, setOptionInput).catch(console.error);
                    }}>
                        <InputGroup className="mb-3">
                            <Form.Control
                                placeholder="Option"
                                value={optionInput}
                                onChange={e => setOptionInput(e.target.value)}
                            />
                            <Button type="submit" variant="outline-secondary">Add</Button>
                        </InputGroup>
                        <Button type="text" variant="outline-secondary" onClick={() => setOptions([])}>Clear</Button>
                    </Form>
                    <h2>Deadline</h2>
                    <InputGroup className="mb-3">
                        <Form.Control
                            placeholder="Number of minutes."
                            value={deadlineMinutesInput}
                            onChange={e => setDeadlineMinutesInput(e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateElectionPage;
