import './App.css';
import {Navbar} from "react-bootstrap";
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import CreateElectionPage from "./CreateElectionPage";
import VotePage from "./VotePage";
import Results from "./Results";

function App() {
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
  );
}

export default App;
