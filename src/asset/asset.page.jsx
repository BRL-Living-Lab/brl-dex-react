import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AccountContext } from "../App";
import { gql } from "graphql-tag";

const GET_TOKEN_MINTER = `
    query ($id: ID!) {
        token(id: $id) {
            id
            symbol
            name
            nft {
                id
            }
            address
            minter
        }
    }
`;

const AssetPage = () => {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [ddo, setDdo] = useState(null);
    const [tokens, setTokens] = useState({});
    const { currentAccount, _ } = useContext(AccountContext);

    const endpoint = "https://v4.aquarius.oceanprotocol.com/api/aquarius/assets/ddo/";

    useEffect(() => {
        const getDDO = async () => {
            const response1 = await axios.get(endpoint + id);
            console.log(response1.data);

            for (let i = 0; i < response1.data.datatokens.length; i++) {
                const response2 = await axios.post(
                    "https://v4.subgraph.goerli.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph",
                    {
                        query: GET_TOKEN_MINTER,
                        variables: { id: response1.data.datatokens[i].address.toLowerCase() },
                    }
                );
                console.log(response2.data.data.token.address);
                setTokens((tokens) => ({ ...tokens, [response2.data.data.token.address]: response2.data.data.token }));
                console.log(tokens);
            }
            setDdo(response1.data);
        };
        getDDO();
    }, []);

    useEffect(() => {
        if (ddo) setIsLoading(false);
    }, [ddo]);

    return (
        <div>
            {isLoading ? (
                <p>Loading</p>
            ) : (
                <div>
                    Asset details
                    <div>DID:</div>
                    <div>{ddo.id}</div>
                    <br />
                    <div>NFT Address:</div>
                    <div>{ddo.nftAddress}</div>
                    <br />
                    <label>metadata:</label>
                    <ul>
                        <li>
                            <label>created:</label> {ddo.metadata.created}
                        </li>
                        <li>
                            <label>updated:</label> {ddo.metadata.updated}
                        </li>
                        <li>
                            <label>type:</label>
                            {ddo.metadata.type}
                        </li>
                        <li>
                            <label>name:</label> {ddo.metadata.name}
                        </li>
                        <li>
                            <label>description:</label> {ddo.metadata.description}
                        </li>
                        <li>
                            <label>author:</label> {ddo.metadata.author}
                        </li>
                    </ul>
                    <br />
                    <div>Services</div>
                    {ddo.services.map((service) => (
                        <div key={service.id}>
                            <label>ID</label>
                            <div>{service.id}</div>
                            <label>Type</label>
                            <div>{service.type}</div>
                            <label>files</label>
                            <div>{service.files}</div>
                            <label>Data Token Address</label>
                            <div>{service.datatokenAddress}</div>
                            <label>Service Endpoint</label>
                            <div>{service.serviceEndpoint}</div>
                        </div>
                    ))}
                    <br />
                    <div>NFT</div>
                    Address: <div>{ddo.nft.address}</div>
                    Name: <div>{ddo.nft.name}</div>
                    Symbol: <div>{ddo.nft.symbol}</div>
                    State: <div>{ddo.nft.state}</div>
                    TokenURI: <div>{ddo.nft.tokenURI}</div>
                    Owner: <div>{ddo.nft.owner}</div>
                    Created: <div>{ddo.nft.created}</div>
                    <br />
                    <div>Data Tokens</div>
                    {ddo.datatokens.map((datatoken) => (
                        <div key={datatoken.address}>
                            <label>Address</label>
                            <div>{datatoken.address}</div>
                            <label>Name</label>
                            <div>{datatoken.name}</div>
                            <label>files</label>
                            <div>{datatoken.symbol}</div>
                            <label>Service ID</label>
                            <div>{datatoken.serviceId}</div>
                            {tokens[datatoken.address.toLowerCase()] ? <button>Mint</button> : ""}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssetPage;
