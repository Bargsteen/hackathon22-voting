import React, {useState} from 'react';
import {Button, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";

async function addOption(options, setOptions, newOption, setOptionInput) {
    if (options.includes(newOption)) {
        throw new Error(`duplicate option ${newOption}`);
    }
    if (newOption) {
        setOptions([...options, newOption]);
        setOptionInput("");
    }
}

const CreateElectionPage = () => {
    const [description, setDescription] = useState();
    const [options, setOptions] = useState([]);
    const [optionInput, setOptionInput] = useState("");

    return (
        <Container>
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
                </Col>
            </Row>
        </Container>
    );
};

export default CreateElectionPage;
