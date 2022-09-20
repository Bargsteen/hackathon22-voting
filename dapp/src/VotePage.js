import React, {useEffect, useMemo, useState} from 'react';
import {useParams} from "react-router-dom";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
import Wallet, {getVotes, init} from "./Wallet";
import {decodeVotingView} from "./buffer";
import {AccountTransactionType, GtuAmount} from "@concordium/web-sdk";
import {RAW_SCHEMA_BASE64} from "./config";

async function castVote(client, contractIndex, vote, senderAddress){

    console.log(vote);
    console.log(typeof vote);
    const parameter = Number.parseInt(vote);
    console.log(typeof parameter);
    console.log(parameter);

    const txHash = await client.sendTransaction(
        senderAddress,
        AccountTransactionType.UpdateSmartContractInstance,
        {
            amount: new GtuAmount(0),
            contractAddress: {index: BigInt(contractIndex), subindex: BigInt(0)},
            receiveName: "voting.vote",
            maxContractExecutionEnergy: BigInt(30000),
        },
        vote,
        RAW_SCHEMA_BASE64,
    );
    console.log({txHash});
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
                return decodeVotingView(getvotesResult.returnValue);
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
                                key={v}
                                id={`default-radio-`+v}
                                onChange={() => setSelectionOption(v)}
                                checked={selectedOption === v}
                            />
                        )}
                    <Button
                        className="w-100"
                        onClick={() => castVote(client, electionId, votes?.opts.indexOf(selectedOption).toString(), connectedAccount)}
                    >Cast Vote</Button>

                    </Form>
                    <ul>
                    </ul>
                </Col>
            </Row>
        </Container>
    );
};

export default VotePage;
