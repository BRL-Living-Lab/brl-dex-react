import { Aquarius, Datatoken, Nft, NftFactory, ProviderInstance, ZERO_ADDRESS, generateDid } from "@oceanprotocol/lib";
import { useContext, useState } from "react";
import { AccountContext, OceanConfigContext } from "../App";
import Web3 from "web3";

const PublishPage = () => {
    const { oceanConfig } = useContext(OceanConfigContext);
    const { currentAccount, _ } = useContext(AccountContext);

    const [formData, setFormData] = useState({
        name: "",
        symbol: "",
        description: "",
        author: "",
        fileUrl: "",
    });

    const { name, symbol, description, author, fileUrl } = formData;

    const DATASET_ASSET_URL = {
        datatokenAddress: "0x0",
        nftAddress: "0x0",
        files: [
            {
                type: "url",
                url: "https://raw.githubusercontent.com/oceanprotocol/testdatasets/main/shs_dataset_test.txt",
                method: "GET",
            },
        ],
    };

    const DATASET_DDO = {
        "@context": ["https://w3id.org/did/v1"],
        id: "",
        version: "4.1.0",
        chainId: 5,
        nftAddress: "0x0",
        metadata: {
            created: "2021-12-20T14:35:20Z",
            updated: "2021-12-20T14:35:20Z",
            type: "dataset",
            name: "dataset-name",
            description: "Ocean protocol test dataset description",
            author: "oceanprotocol-team",
            license: "https://market.oceanprotocol.com/terms",
            additionalInformation: {
                termsAndConditions: true,
            },
        },
        services: [
            {
                id: "notAnId",
                type: "compute",
                files: "",
                datatokenAddress: "0xa15024b732A8f2146423D14209eFd074e61964F3",
                serviceEndpoint: "https://v4.provider.goerli.oceanprotocol.com/",
                timeout: 3000,
                compute: {
                    publisherTrustedAlgorithmPublishers: [],
                    publisherTrustedAlgorithms: [],
                    allowRawAlgorithm: true,
                    allowNetworkAccess: true,
                },
            },
        ],
    };

    const createAsset = async (name, symbol, owner, assetUrl, ddo, providerUrl) => {
        console.log(owner);
        if (window.ethereum) {
            const aquarius = new Aquarius(oceanConfig.metadataCacheUri);
            const web3 = new Web3(window.ethereum);
            const nft = new Nft(web3);
            const Factory = new NftFactory(oceanConfig.nftFactoryAddress, web3);
            const datatoken = new Datatoken(web3);

            console.log(web3, nft, Factory, oceanConfig);
            const chain = oceanConfig.chainId;
            ddo.chainId = chain;

            const nftParamsAsset = {
                name,
                symbol,
                templateIndex: 1,
                tokenURI: "aaa",
                transferable: true,
                owner,
            };
            const datatokenParams = {
                templateIndex: 1,
                cap: "100000",
                feeAmount: "0",
                paymentCollector: ZERO_ADDRESS,
                feeToken: ZERO_ADDRESS,
                minter: owner,
                mpFeeAddress: ZERO_ADDRESS,
            };

            const result = await Factory.createNftWithDatatoken(owner, nftParamsAsset, datatokenParams);

            // // console.log(web3.eth.abi.decodeLog);

            // // console.log(result.events[0]);

            const nftAddress = result.events.NFTCreated.returnValues[0];
            const datatokenAddressAsset = result.events.TokenCreated.returnValues[0];
            ddo.nftAddress = web3.utils.toChecksumAddress(nftAddress);
            console.log({ nftAddress });

            assetUrl.datatokenAddress = datatokenAddressAsset;
            assetUrl.nftAddress = ddo.nftAddress;
            let providerResponse = await ProviderInstance.encrypt(assetUrl, providerUrl);
            ddo.services[0].files = await providerResponse;
            ddo.services[0].datatokenAddress = datatokenAddressAsset;
            ddo.services[0].serviceEndpoint = providerUrl;

            ddo.nftAddress = web3.utils.toChecksumAddress(nftAddress);
            ddo.id = generateDid(nftAddress, chain);
            providerResponse = await ProviderInstance.encrypt(ddo, providerUrl);
            const encryptedResponse = await providerResponse;
            const validateResult = await aquarius.validate(ddo);

            // // Next you can check if if the ddo is valid by checking if validateResult.valid returned true

            await nft.setMetadata(nftAddress, owner, 0, providerUrl, "", "0x2", encryptedResponse, validateResult.hash);
            return ddo.id;
        }
    };

    const createNft = async () => {
        DATASET_ASSET_URL.files[0].url = fileUrl;
        let datasetId = await createAsset(
            name,
            symbol,
            currentAccount,
            DATASET_ASSET_URL,
            DATASET_DDO,
            oceanConfig.providerUri
        );

        // console.log(`dataset id: ${datasetId}`);
    };

    const setPublishDetails = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div>
            <p>Enter Data Details</p>
            <form>
                <label>Name:</label>{" "}
                <input className="border" type="text" name={"name"} value={name} onChange={setPublishDetails}></input>
                <br />
                <label>Symbol:</label>
                <input
                    className="border"
                    type="text"
                    name={"symbol"}
                    value={symbol}
                    onChange={setPublishDetails}
                ></input>
                <br />
                <label>Description:</label>
                <input
                    className="border"
                    type="text"
                    name={"description"}
                    value={description}
                    onChange={setPublishDetails}
                ></input>
                <br />
                <label>Author:</label>
                <input
                    className="border"
                    type="text"
                    name={"author"}
                    value={author}
                    onChange={setPublishDetails}
                ></input>
                <br />
                <label>File URL:</label>{" "}
                <input
                    className="border"
                    type="text"
                    name={"fileUrl"}
                    value={fileUrl}
                    onChange={setPublishDetails}
                ></input>
                <br />
            </form>
            <button onClick={createNft}>Publish</button>
        </div>
    );
};

export default PublishPage;
