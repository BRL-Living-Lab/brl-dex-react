import { Aquarius, Datatoken, Nft, NftFactory, ProviderInstance, ZERO_ADDRESS, generateDid } from "@oceanprotocol/lib";
import { useContext, useState } from "react";
import { AccountContext, OceanConfigContext } from "../App";
import Web3 from "web3";

const PublishPage = () => {
    const { oceanConfig } = useContext(OceanConfigContext);
    const { currentAccount } = useContext(AccountContext);

    const [formData, setFormData] = useState({
        name: "",
        symbol: "",
        description: "",
        author: "",
        fileUrl: "",
        providerURL: "",
        sampleFileURL: "",
    });

    const { name, symbol, description, author, fileUrl, providerURL, sampleFileURL, denyAccnts } = formData;

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
            name: name,
            description: description,
            author: author,
            license: "https://market.oceanprotocol.com/terms",
            link: sampleFileURL,
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

    const createAsset = async (name, symbol, owner, assetUrl, ddo, providerUrl, sampleFileURL) => {
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
                name: "BRL Data NFT",
                symbol: "BRL-NFT",
                templateIndex: 1,
                tokenURI: "",
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

            // handle deny permissions to accounts
            if (denyAccnts !== "") {
                const cred = {
                    deny: [
                        {
                            type: "address",
                            values: [denyAccnts]
                        }
                    ]
                }
                ddo.credentials = cred;
        }
                

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

            //created and updated date in UTC
            const currTime = new Date().toISOString();
            ddo.metadata.created = currTime;
            ddo.metadata.updated = currTime;

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

        <div className=" w-full flex flex-col justify-center items-center lg:mx-auto lg:max-w-[58.75rem] lg:mt-20 lg:flex-col grow lg:p-4 lg:rounded-lg lg:bg-white lg:shadow">
            <form className="w-full justify-center bg-neutral-alabaster px-6 py-9 rounded-[0.625rem] -translate-y-[4.5rem] flex grow [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-primary-marine-blue [&_h3]:font-medium [&_h3]:text-primary-marine-blue lg:bg-transparent lg:translate-y-0">
                <div className="w-full shadow sm:rounded-md">
                    <div className="space-y-6 bg-white px-4 py-5 sm:p-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data Asset Name</label>
                            <div className="mt-1 flex rounded-md  shadow-sm">
                                <input value={name} onChange={setPublishDetails} type="text" name="name" id="name" className=" w-full flex-1 rounded-none rounded-r-md border-grey-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Sample Data Name" />
                            </div>
                        </div>

                        <div >
                            <label className="block text-sm font-medium text-gray-700">Author</label>
                            <div className=" flex rounded-md shadow-sm">
                                <input value={author} onChange={setPublishDetails} type="text" name="author" id="author" className=" w-full flex-1 rounded-none rounded-r-md border-grey-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Sample Data Name" />
                            </div>
                        </div>

                        <div >
                            <label className="block text-sm font-medium text-gray-700">NFT Symbol Name</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input value={symbol} onChange={setPublishDetails} type="text" name="symbol" id="symbol" className=" mt-1 w-full flex rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div >
                            <label className="block text-sm font-medium text-gray-700">Data Asset URL</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">http://</span>
                                <input value={fileUrl} onChange={setPublishDetails} type="text" name="fileUrl" id="fileUrl" className=" mt-1 w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="www.example.com" />
                            </div>
                        </div>

                        <div >
                            <label className="block text-sm font-medium text-gray-700">Provider URL</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">http://</span>
                                <input value={providerURL} onChange={setPublishDetails} type="text" name="providerURL" id="providerURL" className=" w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="www.example.com" />
                            </div>
                        </div>

                        <div >
                            <label className="block text-sm font-medium text-gray-700">Sample File URL</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">http://</span>
                                <input value={sampleFileURL} onChange={setPublishDetails} type="text" name="sampleFileURL" id="sampleFileURL" className=" w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="www.example.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <div className="mt-1">
                                <textarea value={description} onChange={setPublishDetails} id="description" name="description" rows="3" className="mt-1  w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="you@example.com"></textarea>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Deny Account</label>
                            <div className="mt-1">
                                <input value={denyAccnts} onChange={setPublishDetails} id="denyAccnts" name="denyAccnts" className="mt-1  w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="you@example.com"></input>
                            </div>
                        </div>

                    </div>

                </div>

            </form>
            <div className="bg-gray-50 px-4 py-3 text-center sm:px-6">
                <button onClick={createNft} type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Publish</button>
            </div>

        </div>

    );
};

export default PublishPage;
