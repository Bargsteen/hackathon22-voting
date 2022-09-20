import React, {useEffect, useMemo, useState} from 'react';
import QRCode from "react-qr-code";
import {Badge, Button, Col, Form, InputGroup, ListGroupItem, Row} from "react-bootstrap";
import ListGroup from 'react-bootstrap/ListGroup';
import {useParams} from "react-router-dom";
import {decodeVotingView} from "./buffer";
import {getVotes, init} from "./Wallet";
import {BASE_URL} from "./config";


const Results = (props) => {
    const params = useParams();
    const {electionId} = params;

    const [client, setClient] = useState();
    const [connectedAccount, setConnectedAccount] = useState();
    const [getvotesResult, setGetvotesResult] = useState();

    // Attempt to initialize Browser Wallet Client.
    useEffect(
        () => {
            init(setConnectedAccount)
                .then(setClient)
                .catch(console.error);
        },
        [],
    );

    // Fetch votes from contract.
    useEffect(
        () => {
            if (client) {
                getVotes(client, electionId)
                    .then(setGetvotesResult)
                    .catch(console.error)
            }
        },
        [client]
    );
    const votes = useMemo(
        () => {
            if (getvotesResult) {
                return decodeVotingView(getvotesResult.returnValue);
            }
        },
        [getvotesResult],
    );
    console.log({votes})
    return (
        <div>
            <div className="d-flex flex-row">
                <div className="p-2"><h1>Results for election {electionId}</h1></div>
                <div className="p-2" style={{ height: "auto", maxWidth: 64, width: "100%" }}>
                    <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={`${BASE_URL}/vote/${electionId}`}
                        viewBox={`0 0 256 256`}
                    />
                </div>
                <div className="p-2">
                    <Button>
                        Vote
                    </Button>
                </div>
            </div>
            <br/>
            <div>
                <Row>
                    <Col sm={10}>
                        <ListGroup numbered className="mb-3">
                            {votes && Object.entries(votes.tally).map(
                                ([name, count]) =>
                                    <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                        <div className="ms-2 me-auto">{name}</div>
                                        <Badge bg="primary" pill>{count}</Badge>
                                    </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Col>
                </Row>
            </div>
            <br/>
            <div className="d-flex flex-row">
                <div className="p-2">Time until election ends:</div>
            </div>
        </div>
    );
};

export default Results;
