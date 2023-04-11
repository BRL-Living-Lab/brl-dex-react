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
        nftName: "",
        description: "",
        author: "",
        fileUrl: "",
        providerURL: "https://v4.provider.mumbai.oceanprotocol.com/",
        sampleFileURL: "",
        assetType: "",
        timeout: 0,
        serviceType: "",
        serviceName: "",
        entryPoint: "node $ALGO",
        image: "node",
        tag: "alpine:3.16",
        checksum: "sha256:d7c1c5566f2eb09a6f16044174f285f3e0d0073a58bfd2f188c71a6decb5fc15",
    });

    const {
        name,
        symbol,
        nftName,
        description,
        author,
        fileUrl,
        providerURL,
        sampleFileURL,
        denyAccnts,
        assetType,
        timeout,
        serviceType,
        serviceName,
        entryPoint,
        image,
        tag,
        checksum,
    } = formData;

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
        chainId: 80001,
        nftAddress: "0x0",
        metadata: {
            created: "2021-12-20T14:35:20Z",
            updated: "2021-12-20T14:35:20Z",
            type: "dataset", // dataset or algorithm
            name: name, // title of the asset
            description: description,
            copyrightHolder: "",
            author: author,
            license: "https://market.oceanprotocol.com/terms",
            links: sampleFileURL, // array of sample urls
            additionalInformation: {
                termsAndConditions: true,
            },
        },
        services: [
            {
                id: "notAnId", //unique id
                type: "compute", // access service - compute, download
                files: "", // encrypted file urls
                name: "", //service friendly name
                description: "", //service description
                datatokenAddress: "0xa15024b732A8f2146423D14209eFd074e61964F3",
                serviceEndpoint: "https://v4.provider.mumbai.oceanprotocol.com/", // Provider URL (schema + host)
                timeout: 3000,
                compute: {
                    // for compute assets only
                    publisherTrustedAlgorithmPublishers: [],
                    publisherTrustedAlgorithms: [],
                    allowRawAlgorithm: true,
                    allowNetworkAccess: true,
                },
            },
        ],
    };

    const ALGORITHM_ASSET_URL = {
        datatokenAddress: "0x0",
        nftAddress: "0x0",
        files: [
            {
                type: "url",
                url: "https://raw.githubusercontent.com/oceanprotocol/test-algorithm/master/javascript/algo.js",
                method: "GET",
            },
        ],
    };

    const ALGORITHM_DDO = {
        "@context": ["https://w3id.org/did/v1"],
        id: "",
        version: "4.1.0",
        chainId: 80001,
        nftAddress: "0x0",
        metadata: {
            created: "2021-12-20T14:35:20Z",
            updated: "2021-12-20T14:35:20Z",
            type: "algorithm",
            name: "algorithm-name",
            description: "Ocean protocol test algorithm description",
            author: "oceanprotocol-team",
            license: "https://market.oceanprotocol.com/terms",
            additionalInformation: {
                termsAndConditions: true,
            },
            algorithm: {
                container: {
                    entrypoint: "node $ALGO",
                    image: "node",
                    tag: "alpine:3.16",
                    checksum: "sha256:d7c1c5566f2eb09a6f16044174f285f3e0d0073a58bfd2f188c71a6decb5fc15",
                },
            },
        },
        services: [
            {
                id: "notAnId",
                type: "access",
                files: "",
                datatokenAddress: "0xa15024b732A8f2146423D14209eFd074e61964F3",
                serviceEndpoint: "https://v4.provider.mumbai.oceanprotocol.com/",
                timeout: 3000,
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
            console.log({ chain });
            ddo.chainId = chain;

            const nftParamsAsset = {
                name: nftName, //Name of NFT set in contract
                symbol: symbol, //Symbol of NFT set in contract
                templateIndex: 1,
                tokenURI: "",
                state: 0,
                created: "2000-10-31T01:30:00",
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

            console.log("here");

            const result = await Factory.createNftWithDatatoken(owner, nftParamsAsset, datatokenParams);
            console.log({ result });

            const nftAddress = result.events.NFTCreated.returnValues[0];
            const datatokenAddressAsset = result.events.TokenCreated.returnValues[0];

            // // Define metadata as per data set type
            // if (assetType === "algorithmRadio") {
            //     ddo.metadata.algorithm = {
            //         language: "",
            //         version: "",
            //         consumerParameters: {},
            //         conatiner: {},
            //     };
            // }
            // // handle deny permissions to accounts
            // if (denyAccnts !== "") {
            //     const cred = {
            //         deny: [
            //             {
            //                 type: "address",
            //                 values: [denyAccnts],
            //             },
            //         ],
            //     };
            //     ddo.credentials = cred;
            // }

            ddo.nftAddress = web3.utils.toChecksumAddress(nftAddress);
            console.log({ nftAddress });

            assetUrl.datatokenAddress = datatokenAddressAsset;
            assetUrl.nftAddress = ddo.nftAddress;
            let providerResponse = await ProviderInstance.encrypt(assetUrl, chain, providerUrl);

            // define ddo service

            if (serviceType === "computeRadio") {
                ddo.services[0].compute = {
                    // for compute assets only
                    publisherTrustedAlgorithmPublishers: [],
                    publisherTrustedAlgorithms: [],
                    allowRawAlgorithm: true,
                    allowNetworkAccess: true,
                };
            }
            ddo.services[0].type = serviceType === "computeRadio" ? "compute" : "access";
            ddo.services[0].files = await providerResponse;
            ddo.services[0].name = serviceName;
            ddo.services[0].datatokenAddress = datatokenAddressAsset;
            ddo.services[0].serviceEndpoint = providerUrl;
            ddo.services[0].timeout = parseInt(timeout, 10);

            ddo.nftAddress = web3.utils.toChecksumAddress(nftAddress);
            ddo.id = generateDid(nftAddress, chain);
            providerResponse = await ProviderInstance.encrypt(ddo, chain, providerUrl);
            const encryptedResponse = await providerResponse;
            const validateResult = await aquarius.validate(ddo);

            // // Next you can check if if the ddo is valid by checking if validateResult.valid returned true

            if (validateResult) {
                await nft.setMetadata(
                    nftAddress,
                    owner,
                    0,
                    providerUrl,
                    "",
                    "0x2",
                    encryptedResponse,
                    validateResult.hash
                );
                alert("Your data asset is created!");
                return ddo.id;
            } else {
                alert("Invalid DDO");
                return null;
            }
        }
    };

    const createNft = async (e) => {
        e.preventDefault();

        let assetId;

        if (assetType === "algorithmRadio") {
            ALGORITHM_ASSET_URL.files[0].url = fileUrl;
            assetId = await createAsset(
                name,
                symbol,
                currentAccount,
                ALGORITHM_ASSET_URL,
                ALGORITHM_DDO,
                oceanConfig.providerUri
            );
        } else if (assetType === "datasetRadio") {
            DATASET_ASSET_URL.files[0].url = fileUrl;
            assetId = await createAsset(
                name,
                symbol,
                currentAccount,
                DATASET_ASSET_URL,
                DATASET_DDO,
                oceanConfig.providerUri
            );
        }

        console.log(`asset id: ${assetId}`);
    };

    const setPublishDetails = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="w-full justify-center ">
            <form className=" flex flex-col w-full">
                <div className="grid grid-cols-2 gap-1">

                    {/* Column 1 */}
                    <div>
                        {/* Data Asset details */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block font-bold mb-1">Data Asset Name</label>

                                <input
                                    value={name}
                                    onChange={setPublishDetails}
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                    placeholder="Sample Data Name"
                                />
                            </div>
                        </div>

                        {/* Author */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block font-bold mb-1">Author</label>

                                <input
                                    value={author}
                                    onChange={setPublishDetails}
                                    type="text"
                                    name="author"
                                    id="author"
                                    className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                    placeholder="Sample Author Name"
                                />
                            </div>
                        </div>

                        {/* NFT Name */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block font-bold mb-1">NFT Name</label>
                                <input
                                    value={nftName}
                                    onChange={setPublishDetails}
                                    type="text"
                                    name="nftName"
                                    id="nftName"
                                    className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                />
                            </div>
                        </div>

                        {/* NFT symbol */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block font-bold mb-1">
                                    NFT Symbol Name
                                </label>
                                <input
                                    value={symbol}
                                    onChange={setPublishDetails}
                                    type="text"
                                    name="symbol"
                                    id="symbol"
                                    className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                />
                            </div>
                        </div>
                        {/* Data Asset URL */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block font-bold mb-1">Data Asset URL</label>
                                {/* <div>
                                https://raw.githubusercontent.com/oceanprotocol/test-algorithm/master/javascript/algo.js
                            </div>
                            <div>
                                https://raw.githubusercontent.com/oceanprotocol/testdatasets/main/shs_dataset_test.txt
                            </div> */}
                                <input
                                    value={fileUrl}
                                    onChange={setPublishDetails}
                                    type="text"
                                    name="fileUrl"
                                    id="fileUrl"
                                    className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                    placeholder="www.example.com"
                                />
                            </div>
                        </div>

                        {/* Provider URL */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block font-bold mb-1">Provider URL</label>

                                <input
                                    value={providerURL}
                                    onChange={setPublishDetails}
                                    type="text"
                                    name="providerURL"
                                    id="providerURL"
                                    className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                    placeholder="www.example.com"
                                />
                            </div>
                        </div>

                        {/* Sample File URL */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block font-bold mb-1">Sample File URL</label>
                                <input
                                    value={sampleFileURL}
                                    onChange={setPublishDetails}
                                    type="text"
                                    name="sampleFileURL"
                                    id="sampleFileURL"
                                    className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                    placeholder="www.example.com"
                                />
                            </div>
                        </div>

                        {/* Timeout */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block font-bold mb-1">Timeout</label>
                                <input
                                    onChange={setPublishDetails}
                                    type="number"
                                    className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                    id="timeout"
                                    name="timeout"
                                    placeholder="e.g 3000"
                                />
                            </div>
                        </div>

                    </div>







                    {/* Column 2 */}
                    <div>


                        {/* DESCRIPTION */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block font-bold mb-1">Description</label>
                                <div className="mt-1">
                                    <textarea
                                        value={description}
                                        onChange={setPublishDetails}
                                        id="description"
                                        name="description"
                                        rows="3"
                                        className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                        placeholder="you@example.com"
                                    ></textarea>
                                </div>
                            </div>
                        </div>



                        {/* service details */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block font-bold mb-1">Service Name</label>
                                <input
                                    type="text"
                                    className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                    id="serviceName"
                                    placeholder="Service Name"
                                    name="serviceName"
                                />
                            </div>
                        </div>



                        {/* Asset Type radio buttons */}
                        <div className="flex justify-center">
                            <label className="block font-bold mt-2">Asset Type : </label>
                            <span>
                                <div className="form-check form-check-inline">
                                    <input
                                        onChange={setPublishDetails}
                                        className="form-check-input form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                                        type="radio"
                                        name="assetType"
                                        id="datasetRadio"
                                        value="datasetRadio"
                                    />
                                    <label className="form-check-label inline-block text-gray-800">Dataset</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <input
                                        onChange={setPublishDetails}
                                        className="form-check-input form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                                        type="radio"
                                        name="assetType"
                                        id="algorithmRadio"
                                        value="algorithmRadio"
                                    />
                                    <label className="form-check-label inline-block text-gray-800">Algorithm</label>
                                </div>
                            </span>
                        </div>



                        {assetType === "datasetRadio" ? (
                            <div></div>
                        ) : assetType === "algorithmRadio" ? (
                            <div>
                                <div className="flex justify-center">
                                    <div className="mb-3 xl:w-96">
                                        <label className="block font-bold mb-1">
                                            Container Entry Point
                                        </label>
                                        <input
                                            onChange={setPublishDetails}
                                            type="text"
                                            className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                            id="entryPoint"
                                            name="entryPoint"
                                            value={entryPoint}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <div className="mb-3 xl:w-96">
                                        <label className="block font-bold mb-1">
                                            Container Image
                                        </label>
                                        <input
                                            onChange={setPublishDetails}
                                            type="text"
                                            className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                            id="image"
                                            name="image"
                                            value={image}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <div className="mb-3 xl:w-96">
                                        <label className="block font-bold mb-1">Container Tag</label>
                                        <input
                                            onChange={setPublishDetails}
                                            type="text"
                                            className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                            id="tag"
                                            name="tag"
                                            value={tag}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <div className="mb-3 xl:w-96">
                                        <label className="block font-bold mb-1">
                                            Container Checksum
                                        </label>
                                        <input
                                            onChange={setPublishDetails}
                                            type="text"
                                            className="mb-1 block w-full rounded-md border-blue-400 border-solid border-2 px-3 py-2 mt-1"
                                            id="checksum"
                                            name="checksum"
                                            value={checksum}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center">Select an asset type</div>
                        )}

                        <div className="flex justify-center">
                            <label className="block font-bold mt-2">Service Type : </label>
                            <span>
                                <div className="form-check form-check-inline">
                                    <input
                                        onChange={setPublishDetails}
                                        className="form-check-input form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                                        type="radio"
                                        name="serviceType"
                                        id="accessRadio"
                                        value="accessRadio"
                                    />
                                    <label className="form-check-label inline-block text-gray-800">Access</label>
                                </div>

                                <div className="form-check form-check-inline">
                                    <input
                                        onChange={setPublishDetails}
                                        className="form-check-input form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                                        type="radio"
                                        name="serviceType"
                                        id="computeRadio"
                                        value="computeRadio"
                                    />
                                    <label className="form-check-label inline-block text-gray-800">Compute</label>
                                </div>
                            </span>
                        </div>

                    </div>

                    {/* <div className="flex justify-center">
                        <div className="mb-3 xl:w-96">
                            <label className="form-label inline-block mb-1 text-gray-700 text-sm">Deny Account</label>
                            <div className="mt-1">
                                <input
                                    value={denyAccnts}
                                    onChange={setPublishDetails}
                                    id="denyAccnts"
                                    name="denyAccnts"
                                    className="
                                 form-control
                                 block
                                 w-full
                                 px-2
                                 py-1
                                 text-sm
                                 font-normal
                                 text-gray-700
                                 bg-white bg-clip-padding
                                 border border-solid border-gray-300
                                 rounded
                                 transition
                                 ease-in-out
                                 m-0
                                 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
                               "
                                    placeholder="you@example.com"
                                ></input>
                            </div>
                        </div>
                    </div> */}

                </div>

                <div className="flex justify-center mt-1">
                    <button
                        onClick={createNft}
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Publish
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PublishPage;
