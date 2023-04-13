import axios from "axios";
import { Datatoken, Aquarius, Nft, ProviderInstance, getHash } from "@oceanprotocol/lib";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AccountContext, OceanConfigContext } from "../App";
import Web3 from "web3";
import { MoonLoader } from "react-spinners";

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
                        values: [formValues.denyAccountId],
                    },
                ],
            };
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
                "0x2",
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        let datasetId = await updateAsset();

        // console.log(`dataset id: ${datasetId}`);
    };

    // this.can_mint = ddo.nft.owner === currentAccount;

    return (
        <div>
            {isLoading ? (
                <div className="flex justify-center align-middle items-center h-80v">
                    <MoonLoader color="#000000" size={30} />
                </div>
            ) : (
                <div>
                    <h1 className="font-light text-xl p-5 text-center">Modify Asset </h1>

                    <form>
                        <div className=" mb-4">
                            <label className="block  mb-2">
                                Name:
                                <input
                                    className="block w-1/2 rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1"
                                    type="text"
                                    name="name"
                                    value={
                                        formValues.name !== null && formValues.name !== undefined
                                            ? formValues.name
                                            : data.metadata.name || ""
                                    }
                                    onChange={handleInputChange}
                                />
                            </label>
                        </div>

                        <div className="mb-4">
                            <label className="block  mb-2">
                                Description:
                                <input
                                    className="block w-1/2 rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1"
                                    type="text"
                                    name="description"
                                    value={
                                        formValues.description !== null && formValues.description !== undefined
                                            ? formValues.description
                                            : data.metadata.description || ""
                                    }
                                    onChange={handleInputChange}
                                />
                            </label>
                        </div>

                        <div className="mb-4">
                            <label className="block  mb-2">
                                Deny Account ID:
                                <input
                                    className="block w-1/2 rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1"
                                    type="text"
                                    name="denyAccountId"
                                    value={
                                        !data.credentials
                                            ? formValues.denyAccountId !== null &&
                                              formValues.denyAccountId !== undefined
                                                ? formValues.denyAccountId
                                                : ""
                                            : data.credentials.deny[0].values[0]
                                    }
                                    onChange={handleInputChange}
                                />
                            </label>
                        </div>

                        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                            <h1 className="text-2xl  mb-4">NFT Details</h1>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-gray-700  mb-2">Address:</label>
                                    <p id="address" className="text-gray-700">
                                        {data.nft.address}
                                    </p>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-gray-700  mb-2">Name:</label>
                                    <p id="name" className="text-gray-700">
                                        {data.nft.name}
                                    </p>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-gray-700  mb-2">Symbol:</label>
                                    <p id="symbol" className="text-gray-700">
                                        {data.nft.symbol}
                                    </p>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-gray-700  mb-2">State:</label>
                                    <p id="state" className="text-gray-700">
                                        {data.nft.state}
                                    </p>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-gray-700  mb-2">Token URI:</label>
                                    <p id="tokenURI" className="text-gray-700">
                                        {data.nft.tokenURI}
                                    </p>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-gray-700  mb-2">Owner:</label>
                                    <p id="owner" className="text-gray-700">
                                        {data.nft.owner}
                                    </p>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-gray-700  mb-2">Created:</label>
                                    <p id="created" className="text-gray-700">
                                        {data.nft.created}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center mt-1">
                            <button
                                onClick={handleSubmit}
                                className="bg-purple-500 hover:bg-purple-700 text-white  py-2 px-4 rounded"
                            >
                                Modify
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AssetPage;
