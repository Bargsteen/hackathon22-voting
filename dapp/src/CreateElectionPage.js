/* global BigInt */
import React, {useEffect, useState} from 'react';
import {Alert, Button, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {detectConcordiumProvider, WalletApi} from "@concordium/browser-wallet-api-helpers";
import {AccountTransactionType, GtuAmount, ModuleReference} from "@concordium/web-sdk";
import {CONTRACT_NAME, MODULE_REF, RAW_SCHEMA_BASE64} from "./config";
import moment from "moment";

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

async function initContract(client, contractName, description, options, deadlineMinutesInput, moduleRef, senderAddress) {
    const deadlineMinutes = Number.parseInt(deadlineMinutesInput);
    const deadlineTimestamp = moment().add(deadlineMinutes, 'm').format();

    const parameter = {
        description: {
            description_text: description,
            options,
        },
        end_time: deadlineTimestamp,
    };

    const txHash = await client.sendTransaction(
        senderAddress,
        AccountTransactionType.InitializeSmartContractInstance,
        {
            amount: new GtuAmount(BigInt(0)),
            moduleRef: new ModuleReference(moduleRef),
            contractName,
            maxContractExecutionEnergy: BigInt(30000),
        },
        parameter,
        RAW_SCHEMA_BASE64,
    );
    console.log({txHash});
}

const CreateElectionPage = () => {
    const [description, setDescription] = useState("");
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
                    <h2>Description</h2>
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
                        <Row>
                            <Col sm={10}>
                                <InputGroup className="mb-3">
                                    <Form.Control
                                        placeholder="Option"
                                        value={optionInput}
                                        onChange={e => setOptionInput(e.target.value)}
                                    />
                                    <Button type="submit" variant="outline-secondary">Add</Button>
                                </InputGroup>
                            </Col>
                            <Col sm={1}>
                                <Button type="text" variant="outline-secondary"
                                        onClick={() => setOptions([])}>Clear</Button>
                            </Col>
                        </Row>
                    </Form>
                    <h2>Deadline</h2>
                    <Form.Control
                        placeholder="Number of minutes."
                        value={deadlineMinutesInput}
                        onChange={e => setDeadlineMinutesInput(e.target.value)}
                    />
                    <Button
                        className="w-100"
                        onClick={() => initContract(client, CONTRACT_NAME, description, options, deadlineMinutesInput, MODULE_REF, connectedAccount).catch(console.error)}
                    >Create election</Button>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateElectionPage;
