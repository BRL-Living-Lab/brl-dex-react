import axios from "axios";
import { Datatoken, Aquarius, Nft, ProviderInstance, getHash } from "@oceanprotocol/lib";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AccountContext, OceanConfigContext } from "../App";
import Web3 from "web3";
// import { gql } from "graphql-tag";


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
    const { oceanConfig } = useContext(OceanConfigContext);

    const [data, setData] = useState({});
    const [formValues, setFormValues] = useState({});




    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [ddo, setDdo] = useState(null);
    const [tokens, setTokens] = useState({});
    const { currentAccount, _ } = useContext(AccountContext);

    const endpoint = "https://v4.aquarius.oceanprotocol.com/api/aquarius/assets/ddo/";

    function handleInputChange(e) {
        const { name, value } = e.target;
        // const newValue = value === '' ? "" : value;
        setFormValues({ ...formValues, [name]: value });
    }

    useEffect(() => {
        const getDDO = async () => {
            const response1 = await axios.get(endpoint + id);
            console.log(response1.data);

            for (let i = 0; i < response1.data.datatokens.length; i++) {
                const response2 = await axios.post(
                    "https://v4.subgraph.mumbai.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph",
                    {
                        query: GET_TOKEN_MINTER,
                        variables: { id: response1.data.datatokens[i].address.toLowerCase() },
                    }
                );


                console.log(response2.data);
                // setTokens((tokens) => ({ ...tokens, [response2.data.data.token.address]: response2.data.data.token }));
                // console.log(tokens);
            }
            setData(response1.data);
        };
        getDDO();
    }, []);

    useEffect(() => {
        if (Object.keys(data).length > 0) setIsLoading(false);
    }, [data]);



    const updateAsset = async () => {
        const aquarius = new Aquarius(oceanConfig.metadataCacheUri);
        const web3 = new Web3(window.ethereum);
        const publisherAccount = currentAccount;
        const consumerAccount = formValues.denyAccountId;
        const nft = new Nft(web3);

        // Fetch ddo from Aquarius
        const ddo = data;

        // update the ddo here
        ddo.metadata.name = formValues.name ? formValues.name : ddo.metadata.name;
        ddo.metadata.description = formValues.description ? formValues.description : ddo.metadata.description;
        if (formValues.denyAccountId) {
            ddo.credentials = {

                deny: [
                    {
                        type: "address",
                        values: [formValues.denyAccountId]
                    }
                ]
            }
        }

        const providerResponse = await ProviderInstance.encrypt(ddo, oceanConfig.chainId, oceanConfig.providerUri);
        const encryptedResponse = await providerResponse;
        const metadataHash = getHash(JSON.stringify(ddo));

        const validateResult = await aquarius.validate(ddo);

        if (validateResult.valid) {
            // Update the data NFT metadata
            const res = await nft.setMetadata(
                ddo.nftAddress,
                publisherAccount,
                0,
                oceanConfig.providerUri,
                "",
                '0x2',
                encryptedResponse,
                validateResult.hash
            );
            alert("Your data asset is updated!");
            return ddo.id;
        } else {
            alert("Invalid DDO");
            return null;
        }

    };

    const handleSubmit = async () => {
        let datasetId = await updateAsset();

        // console.log(`dataset id: ${datasetId}`);
    };

    // this.can_mint = ddo.nft.owner === currentAccount;


    return (
        <div>
            {isLoading ? (
                <p>Loading</p>
            ) : (
                <div>
                    <h2>Modify Asset</h2>

                    <form>

                        <div>
                            <label>
                                Name:
                                <input type="text" name="name" value={formValues.name !== null && formValues.name !== undefined ? formValues.name : data.metadata.name || ""} onChange={handleInputChange} />
                            </label>
                        </div>
                        <div>
                            <label>
                                Description:
                                <input type="text" name="description" value={formValues.description !== null && formValues.description !== undefined ? formValues.description : data.metadata.description || ""} onChange={handleInputChange} />
                            </label>
                        </div>
                        <div>
    <label>
        Deny Account ID:
        <input
            type="text"
            name="denyAccountId"
            value={!data.credentials ? formValues.denyAccountId !== null && formValues.denyAccountId !== undefined ? formValues.denyAccountId : "" : data.credentials.deny[0].values[0]}
            onChange={handleInputChange}
        />
    </label>
</div>


                        <br></br>
                        <div>
                            <h1>NFT Details</h1>
                            <p>Address: {data.nft.address}</p>
                            <p>Name: {data.nft.name}</p>
                            <p>Symbol: {data.nft.symbol}</p>
                            <p>State: {data.nft.state}</p>
                            <p>TokenURI: {data.nft.tokenURI}</p>
                            <p>Owner: {data.nft.owner}</p>
                            <p>Created: {data.nft.created}</p>
                        </div>




                    </form>
                    <div>
                        <button onClick={handleSubmit} type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Modify
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetPage;
