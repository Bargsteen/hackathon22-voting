import React, {useEffect, useMemo, useState} from 'react';
import {useParams} from "react-router-dom";
import {Col, Container, Form, Row} from "react-bootstrap";
import Wallet, {init} from "./Wallet";
import {toBuffer} from "@concordium/web-sdk";
import {decodeString, decodeStringIntMap, decodeStrings} from "./buffer";

async function getVotes(client, contractIndex) {
    console.log('getting votes', {contractIndex})
    return client.getJsonRpcClient().invokeContract({
        contract: {index: BigInt(contractIndex), subindex: BigInt(0)},
        method: "voting.getvotes",
    });
}

const VotePage = (props) => {
    const params = useParams();
    const {electionId} = params;

    const [client, setClient] = useState();
    const [connectedAccount, setConnectedAccount] = useState();
    const [getvotesResult, setGetvotesResult] = useState();

    const [selectedOption, setSelectionOption] = useState();

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
                const offset0 = 0;
                const buffer = toBuffer(getvotesResult.returnValue, 'hex');
                const [descriptionText, offset1] = decodeString(buffer, offset0);
                const [opts, offset2] = decodeStrings(buffer, offset1);
                const [tally, _] = decodeStringIntMap(buffer, offset2);
                return {
                    descriptionText,
                    opts,
                    tally,
                };
            }
        }
    );

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
                    <h1>Vote in non-fraudulent election #{electionId}</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form>

                        {votes?.opts.map(
                            v =>
                            <Form.Check
                                type="radio"
                                label={v}
                                id={`default-radio`}
                                onChange={() => setSelectionOption(v)}
                                checked={selectedOption === v}
                            />
                        )}
                    </Form>
                    <ul>
                    </ul>
                </Col>
            </Row>
        </Container>
    );
};

export default VotePage;
