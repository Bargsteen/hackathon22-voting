import React, {useState} from 'react';

const VotePage = (props) => {
    const [electionId, setElectionId] = useState(15);
    return (
        <div>
            <h1>Vote in election {electionId}</h1>
        </div>
    );
};

export default VotePage;
