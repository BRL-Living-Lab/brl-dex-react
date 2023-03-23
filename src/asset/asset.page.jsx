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
                    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={handleModifyAsset}
    >
      Modify Asset
    </button>

    <button
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      onClick={handleDownloadAsset}
    >
      Download Asset
    </button>
                    
                    <h1>Asset details</h1>
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
                        </div>
                    ))}
                    <form>
                        <input
                            value={receiver_address}
                            onChange={setMintDetails}
                            type="text"
                            name="receiver_address"
                            id="receiver_address"
                            placeholder="Receiver Address"
                        />

                    </form>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            type="submit"
                            onClick={mintDatatoken}
                        // disabled={!this.input.value}
                        >
                            Mint
                        </button>
                </div>
            )}
        </div>
    );
};

export default AssetPage;
