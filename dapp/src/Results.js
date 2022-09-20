import React, {useState} from 'react';
import QRCode from "react-qr-code";
import {Badge, Button, Col, Form, InputGroup, ListGroupItem, Row} from "react-bootstrap";
import ListGroup from 'react-bootstrap/ListGroup';


const Results = (props) => {
    const [electionId, setElectionId] = useState(51);
    return (
        <div>
            <div className="d-flex flex-row">
                <div className="p-2"><h1>Results for election {electionId}</h1></div>
                <div className="p-2" style={{ height: "auto", maxWidth: 64, width: "100%" }}>
                    <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={`/vote/${electionId}`}
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
                            <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                <div className="ms-2 me-auto">Election Item</div>
                                <Badge bg="primary" pill>14</Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between align-items-start">
                                <div className="ms-2 me-auto">Election Item</div>
                                <Badge bg="primary" pill>14</Badge>
                            </ListGroup.Item>
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
