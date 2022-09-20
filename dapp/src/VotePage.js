import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {Alert, Button, Col, Container, Row} from "react-bootstrap";
import Wallet, {connect, init} from "./Wallet";

const VotePage = (props) => {
    const params = useParams();
    const {electionId} = params;

    const [client, setClient] = useState();
    const [connectedAccount, setConnectedAccount] = useState();
    const [votes, setVotes] = useState();

    // Attempt to initialize Browser Wallet Client.
    useEffect(
        () => {
            init(setConnectedAccount)
                .then(setClient)
                .catch(console.error);
        }, []);

    // // Fetch votes from contract.
    // useEffect(
    //     () => {
    //         if (client) {
    //             client.invokeContract()
    //         }
    //     },
    //     [client]
    // )

    return (
        <Container>
            <Row>
                <Col>
                    <Wallet
                        client={client}
                        connectedAccount={connectedAccount}
                        setConnectedAccount={setConnectedAccount}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <h1>Vote in non-fraudulent election {electionId}</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    {votes}
                </Col>
            </Row>
        </Container>
    );
};

export default VotePage;
