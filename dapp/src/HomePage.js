import React, {useState} from 'react';
import {Button, Image, Col, Container, Row} from "react-bootstrap";
import {Link} from "react-router-dom";

const HomePage = (props) => {
    const [electionId, setElectionId] = useState(15);
    return (
        <Container>
          <Row>
            <Col class="text-center m-4">
              <Row>
                <h1>Voting 3000</h1>
              </Row>
              <Row>
                <h3 class="text-muted">Making voting great again</h3>
              </Row>
            </Col>
          </Row>
          <Row>
            <img src="static/img/trump-voting.jpg"/>
          </Row>
          <Row>
            <Col class="text-center mt-5">
              <Link to="/create"><Button class="btn bg-success text-white font-weight-bold py-3 px-4"><strong>Create a <u>HUGE</u> election!</strong></Button></Link>
            </Col>
          </Row>
        </Container>
    );
};

export default HomePage;
