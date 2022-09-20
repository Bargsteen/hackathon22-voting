import React, {useState} from 'react';
import {Col, Container, FloatingLabel, Form, Row} from "react-bootstrap";

const CreateElectionPage = () => {
    const [description, setDescription] = useState();
    return (
        <Container>
            <Row>
                <Col>
                    <Form>
                        <FloatingLabel label="Enter description of election.">
                            <Form.Control
                                as="textarea"
                                style={{height: '100px'}}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </FloatingLabel>
                    </Form>
                    <div>{description}</div>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateElectionPage;
