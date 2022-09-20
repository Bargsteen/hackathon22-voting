import {detectConcordiumProvider} from "@concordium/browser-wallet-api-helpers";
import {Alert, Button} from "react-bootstrap";

export async function init(setConnectedAccount) {
    const client = await detectConcordiumProvider()
    // Listen for relevant events from the wallet.
    client.on('accountChanged', account => {
        console.debug('browserwallet event: accountChange', {account});
        setConnectedAccount(account);
    });
    client.on('accountDisconnected', () => {
        console.debug('browserwallet event: accountDisconnected');
        client.getMostRecentlySelectedAccount().then(setConnectedAccount);
    });
    client.on('chainChanged', (chain) => {
        console.debug('browserwallet event: chainChanged', {chain});
    });
    client.getMostRecentlySelectedAccount().then(setConnectedAccount);
    return client;
}

export async function connect(client, setConnectedAccount) {
    const account = await client.connect();
    return setConnectedAccount(account);
}

export async function getVotes(client, contractIndex) {
    return client.getJsonRpcClient().invokeContract({
        contract: {index: BigInt(contractIndex), subindex: BigInt(0)},
        method: "voting.getvotes",
    });
}


export default function Wallet(props) {
    const {client, connectedAccount, setConnectedAccount} = props;
    return (
        <>
            {!connectedAccount && (
                <>
                    <p>No wallet connection</p>
                    <Button onClick={() => connect(client, setConnectedAccount).catch(console.error)}>
                        Connect
                    </Button>
                </>
            )}
            {connectedAccount && (
                <Alert variant="success">
                    Connected to account <code>{connectedAccount}</code>.
                </Alert>
            )}
        </>
    );
}