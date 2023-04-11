import axios from "axios";
import { Datatoken, ProviderInstance, } from "@oceanprotocol/lib";
import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    const [formData, setFormData] = useState({
        receiver_address: "",
    });

    const {
        receiver_address,
    } = formData;


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
                    "https://v4.subgraph.mumbai.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph",
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

    const mintDatatoken = async () => {

        if (window.ethereum) {
            const web3 = new Web3(window.ethereum);

            const datatokenAddress = ddo.services[0].datatokenAddress
            const receiverAddress = receiver_address;

            const publisherAccount = ddo.nft.owner;
            const datatoken = new Datatoken(web3);

            await datatoken.mint(
                datatokenAddress,
                publisherAccount,
                '4', // number of datatokens sent to the receiver
                receiverAddress
            );
            let receiverBalance = await datatoken.balance(
                datatokenAddress,
                receiverAddress
            );
            alert(`Receiver Balance : ${receiverBalance}`);
            console.log(`Receiver balance after mint: ${receiverBalance}`);
        }
    };

    const handleDownloadAsset = async () => {
        const web3 = new Web3(window.ethereum);
        const datatoken = new Datatoken(web3);
        const datatokenAddress = ddo.services[0].datatokenAddress
        if (window.ethereum) {
            let receiverBalance = await datatoken.balance(
                datatokenAddress,
                currentAccount
            );

            const initializeData = await ProviderInstance.initialize(
                ddo.id,
                ddo.services[0].id,
                0,
                currentAccount,
                oceanConfig.providerUri
            );
            if (initializeData.error) {
                alert(initializeData.error);
            } else {

                const providerFees = {
                    providerFeeAddress: initializeData.providerFee.providerFeeAddress,
                    providerFeeToken: initializeData.providerFee.providerFeeToken,
                    providerFeeAmount: initializeData.providerFee.providerFeeAmount,
                    v: initializeData.providerFee.v,
                    r: initializeData.providerFee.r,
                    s: initializeData.providerFee.s,
                    providerData: initializeData.providerFee.providerData,
                    validUntil: initializeData.providerFee.validUntil,
                };

                const txid = await datatoken.startOrder(
                    datatokenAddress,
                    currentAccount,
                    currentAccount,
                    0,
                    providerFees
                );

                const downloadURL = await ProviderInstance.getDownloadUrl(
                    ddo.id,
                    currentAccount,
                    ddo.services[0].id,
                    0,
                    txid.transactionHash,
                    oceanConfig.providerUri,
                    web3
                );

                // const asset_file = await downloadFile(downloadURL);

                const link = document.createElement('a');
                link.href = downloadURL;
                link.download = 'Asset.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log(downloadURL);
            }
        }
    };

    const setMintDetails = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };
    const navigate = useNavigate();
    function handleModifyAsset() {
        navigate("/assetEdit/" + ddo.id); // change '/new-page' to the path of the page you want to navigate to
    }

    // this.can_mint = ddo.nft.owner === currentAccount;

    return (
        <div>
            {isLoading ? (
                <p>Loading</p>
            ) : (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex">
                                <button
                                    className="border border-blue-500 hover:bg-blue-100 text-blue-500 hover:text-blue-700 font-bold py-2 px-4 rounded shadow mr-2"
                                    onClick={handleModifyAsset}
                                >
                                    Modify Asset
                                </button>

                                <button
                                    className="border border-blue-800 hover:bg-blue-200 text-blue-800 hover:text-blue-900 font-bold py-2 px-4 rounded shadow mr-2"
                                    onClick={handleDownloadAsset}
                                >
                                    Download Asset
                                </button>


                                <div className="flex items-center">
                                    <input
                                        value={receiver_address}
                                    onChange={setMintDetails}
                                    type="text"
                                    name="receiver_address"
                                    id="receiver_address"
                                    placeholder="Receiver Address"
                                    className="w-64 px-3 py-2 mr-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                                />
                                <button
                                    className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded"
                                    type="submit"
                                    onClick={mintDatatoken}
                                // disabled={!this.input.value}
                                >
                                    Mint
                                </button>
                            </div>
                        </div>
                    </div>


                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold mb-4">Asset details</h1>
                        <div className="flex items-center mb-2">
                            <label className="w-32 font-bold">DID:</label>
                            <div className="text-gray-600">{ddo.id}</div>
                        </div>
                        <div className="flex items-center mb-2">
                            <label className="w-32 font-bold">NFT Address:</label>
                            <div className="text-gray-600">{ddo.nftAddress}</div>
                        </div>
                        <div className="flex flex-col mt-6">
                            <label className="font-bold mb-2">Metadata:</label>
                            <ul className="list-disc ml-6">
                                <li className="flex items-center">
                                    <label className="w-32 font-bold">Created:</label>
                                    <div className="text-gray-600">{ddo.metadata.created}</div>
                                </li>
                                <li className="flex items-center">
                                    <label className="w-32 font-bold">Updated:</label>
                                    <div className="text-gray-600">{ddo.metadata.updated}</div>
                                </li>
                                <li className="flex items-center">
                                    <label className="w-32 font-bold">Type:</label>
                                    <div className="text-gray-600">{ddo.metadata.type}</div>
                                </li>
                                <li className="flex items-center">
                                    <label className="w-32 font-bold">Name:</label>
                                    <div className="text-gray-600">{ddo.metadata.name}</div>
                                </li>
                                <li className="flex items-center">
                                    <label className="w-32 font-bold">Description:</label>
                                    <div className="text-gray-600 truncate w-64" title={ddo.metadata.description}>{ddo.metadata.description}</div>
                                </li>
                                <li className="flex items-center">
                                    <label className="w-32 font-bold">Author:</label>
                                    <div className="text-gray-600">{ddo.metadata.author}</div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <br></br>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold mb-4">Services</h1>

                        {ddo.services.map((service) => (
                            <div key={service.id} className="rounded-lg p-4">
                                <div className="flex flex-col mb-4">
                                    <label className="text-gray-700 font-bold mb-2">Type:</label>
                                    <p className="text-gray-700">{service.type}</p>
                                </div>
                                <div className="flex flex-col mb-4">
                                    <label className="text-gray-700 font-bold mb-2">Files:</label>
                                    <p className="text-gray-700">{service.files.slice(0, 50)}</p>
                                </div>
                                <div className="flex flex-col mb-4">
                                    <label className="text-gray-700 font-bold mb-2">Data Token Address:</label>
                                    <p className="text-gray-700">{service.datatokenAddress}</p>
                                </div>
                                <div className="flex flex-col mb-4">
                                    <label className="text-gray-700 font-bold mb-2">Service Endpoint:</label>
                                    <p className="text-gray-700">{service.serviceEndpoint}</p>
                                </div>
                            </div>
                        ))}
                    </div>



                    <br />
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold mb-4">NFT Details</h1>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-gray-700 font-bold mb-2">
                                    Address:
                                </label>
                                <p id="address" className="text-gray-700">{ddo.nft.address}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-gray-700 font-bold mb-2">
                                    Name:
                                </label>
                                <p id="name" className="text-gray-700">{ddo.nft.name}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-gray-700 font-bold mb-2">
                                    Symbol:
                                </label>
                                <p id="symbol" className="text-gray-700">{ddo.nft.symbol}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-gray-700 font-bold mb-2">
                                    State:
                                </label>
                                <p id="state" className="text-gray-700">{ddo.nft.state}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-gray-700 font-bold mb-2">
                                    Token URI:
                                </label>
                                <p id="tokenURI" className="text-gray-700">{ddo.nft.tokenURI}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-gray-700 font-bold mb-2">
                                    Owner:
                                </label>
                                <p id="owner" className="text-gray-700">{ddo.nft.owner}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-gray-700 font-bold mb-2">
                                    Created:
                                </label>
                                <p id="created" className="text-gray-700">{ddo.nft.created}</p>
                            </div>
                        </div>
                    </div>
                    <br />
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold mb-4">Data Tokens</h1>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {ddo.datatokens.map((datatoken) => (
                                <div key={datatoken.address}>
                                    <div className="flex flex-col mb-4">
                                        <label className="text-gray-700 font-bold mb-2">Address:</label>
                                        <p className="text-gray-700">{datatoken.address}</p>
                                    </div>
                                    <div className="flex flex-col mb-4">
                                        <label className="text-gray-700 font-bold mb-2">Name:</label>
                                        <p className="text-gray-700">{datatoken.name}</p>
                                    </div>
                                    <div className="flex flex-col mb-4">
                                        <label className="text-gray-700 font-bold mb-2">Symbol:</label>
                                        <p className="text-gray-700">{datatoken.symbol}</p>
                                    </div>
                                    <div className="flex flex-col mb-4">
                                        <label className="text-gray-700 font-bold mb-2">Service ID:</label>
                                        <p className="text-gray-700">{datatoken.serviceId}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>




                </div>
            )}
        </div>
    );
};

export default AssetPage;
