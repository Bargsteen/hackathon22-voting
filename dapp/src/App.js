import logo from './logo.svg';
import './App.css';
import {useState} from "react";
import {Col, Container, Form, Nav, Navbar, Row} from "react-bootstrap";
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import CreateElectionPage from "./CreateElectionPage";
import VotePage from "./VotePage";
import Results from "./Results";

function App() {
  const [description, setDescription] = useState();

  return (
      <Router>
        <Navbar />
        <Routes>
          {/*<Route exact path='/' exact element={<Home />} />*/}
          <Route path='/create' element={<CreateElectionPage/>} />
          <Route path='/vote' element={<VotePage/>} />
          <Route path='/results' element={<Results/>} />
        </Routes>
      </Router>

      // <>
      //   <Nav>
      //     <NavMenu>
      //       <NavLink to="/create" activeStyle>Create</NavLink>
      //       <NavLink to="/vote" activeStyle>Vote</NavLink>
      //       <NavLink to="/results" activeStyle>Results</NavLink>
      //     </NavMenu>
      //   </Nav>
      // </>

      // <Container>
      //   <Row>
      //     <Col>
      //         <Form>
      //           <Form.Group className="mb-3">
      //             <Form.Label>Description</Form.Label>
      //             <Form.Control type="" placeholder="Enter email" />
      //             <Form.Text className="text-muted">
      //               We'll never share your email with anyone else.
      //             </Form.Text>
      //           </Form.Group>
      //         </Form>
      //     </Col>
      //   </Row>
      // </Container>
  );
}

export default App;
