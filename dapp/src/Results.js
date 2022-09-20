import React, {useState} from 'react';

const Results = (props) => {
    const [electionId, setElectionId] = useState(51);
    return (
        <div>
            <h1>Results for election {electionId}</h1>
        </div>
    );
};

export default Results;
