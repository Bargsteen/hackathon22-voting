import React from 'react';
import {useParams} from "react-router-dom";

const Results = (props) => {
    const params = useParams();
    const {electionId} = params;
    return (
        <div>
            <h1>Results for election {electionId}</h1>
        </div>
    );
};

export default Results;
