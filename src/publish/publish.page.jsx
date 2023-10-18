import {
    Aquarius,
    Datatoken,
    Nft,
    NftFactory,
    ProviderInstance,
    ZERO_ADDRESS,
    generateDid,
} from "@oceanprotocol/lib";
import { useContext, useState, useEffect } from "react";
import { AccountContext, AutomationContext, OceanConfigContext } from "../App";
import { useLocation } from "react-router-dom";
import Web3 from "web3";
import { toast } from "react-toastify";
// import ERC721Factory from "@oceanprotocol/contracts/artifacts/contracts/ERC721Factory.sol/ERC721Factory.json";
// import BigNumber from "bignumber.js";
// import { FEE_HISTORY_NOT_SUPPORTED, generateDtName } from "@oceanprotocol/lib";

const PublishPage = () => {
    const { oceanConfig } = useContext(OceanConfigContext);
    const { currentAccount, _ } = useContext(AccountContext);
    const { usingAutomation, setUsingAutomation } =
        useContext(AutomationContext);
    let location = useLocation();

    console.log({ location });

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
        isLinkedToRequest: false,
        timeout: 0,
        dataRequestID: null,
        serviceType: "",
        serviceName: "",
        entryPoint: "node $ALGO",
        image: "node",
        tag: "alpine:3.16",
        checksum:
            "sha256:d7c1c5566f2eb09a6f16044174f285f3e0d0073a58bfd2f188c71a6decb5fc15",
    });

    useEffect(() => {
        if (location.state) {
            setFormData((prevState) => ({
                ...prevState,
                dataRequestID: location.state.dataRequestId,
                isLinkedToRequest: location.state
                    ? location.state.isLinkedToRequestAsset
                    : undefined,
            }));
        }
    }, []);

    const MIN_GAS_FEE_POLYGON = 30000000000; // minimum recommended 30 gwei polygon main and mumbai fees
    const POLYGON_NETWORK_ID = 137;
    const MUMBAI_NETWORK_ID = 80001;

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
        dataRequestID,
        isLinkedToRequest,
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
                serviceEndpoint:
                    "https://v4.provider.mumbai.oceanprotocol.com/", // Provider URL (schema + host)
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
            name: name,
            description: description,
            author: author,
            license: "https://market.oceanprotocol.com/terms",
            additionalInformation: {
                termsAndConditions: true,
            },
            algorithm: {
                container: {
                    entrypoint: "node $ALGO",
                    image: "node",
                    tag: "alpine:3.16",
                    checksum:
                        "sha256:d7c1c5566f2eb09a6f16044174f285f3e0d0073a58bfd2f188c71a6decb5fc15",
                },
            },
        },
        services: [
            {
                id: "notAnId",
                type: "access",
                files: "",
                datatokenAddress: "0xa15024b732A8f2146423D14209eFd074e61964F3",
                serviceEndpoint:
                    "https://v4.provider.mumbai.oceanprotocol.com/",
                timeout: 3000,
            },
        ],
    };

    const createAsset = async (
        name,
        symbol,
        owner,
        assetUrl,
        ddo,
        providerUrl,
        sampleFileURL
    ) => {
        console.log(owner);

        let web3;
        if (!usingAutomation && window.ethereum) {
            web3 = new Web3(window.ethereum);
        } else {
            web3 = new Web3(
                new Web3.providers.HttpProvider(
                    process.env.REACT_APP_ALCHEMY_KEY
                )
            );
            console.log(web3);
            web3.eth.accounts.wallet.add(localStorage.getItem("privateKey"));
        }
        if (window.ethereum) {
            const aquarius = new Aquarius(oceanConfig.metadataCacheUri);
            const nft = new Nft(web3);
            const Factory = new NftFactory(oceanConfig.nftFactoryAddress, web3);
            const datatoken = new Datatoken(web3);

            console.log(web3, nft, Factory, oceanConfig);
            const chain = oceanConfig.chainId;
            console.log({ chain });
            ddo.chainId = chain;
            const currentDate = new Date().toISOString();

            const nftParamsAsset = {
                name: nftName, //Name of NFT set in contract
                symbol: symbol, //Symbol of NFT set in contract
                templateIndex: 1,
                tokenURI: "",
                state: 0,
                created: currentDate,
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

            ddo.metadata.created = currentDate;
            ddo.metadata.updated = currentDate;
            console.log("here");

            const result = await Factory.createNftWithDatatoken(
                owner,
                nftParamsAsset,
                datatokenParams
            );
            console.log({ result });
            toast.success("NFT Deployed with Datatoken", {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            const nftAddress = result.events.NFTCreated.returnValues[0];
            const datatokenAddressAsset =
                result.events.TokenCreated.returnValues[0];

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
            let providerResponse = await ProviderInstance.encrypt(
                assetUrl,
                chain,
                providerUrl
            );

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

            if (assetType === "algorithmRadio") {
                ddo.metadata.algorithm.container.entrypoint = entryPoint;
                ddo.metadata.algorithm.container.image = image;
                ddo.metadata.algorithm.container.tag = tag;
                ddo.metadata.algorithm.container.checksum = checksum;
            }

            ddo.services[0].type =
                serviceType === "computeRadio" ? "compute" : "access";
            ddo.services[0].files = await providerResponse;
            ddo.services[0].name = serviceName;
            ddo.services[0].datatokenAddress = datatokenAddressAsset;
            ddo.services[0].serviceEndpoint = providerUrl;
            ddo.services[0].timeout = parseInt(timeout, 10);

            ddo.nftAddress = web3.utils.toChecksumAddress(nftAddress);
            ddo.id = generateDid(nftAddress, chain);
            providerResponse = await ProviderInstance.encrypt(
                ddo,
                chain,
                providerUrl
            );
            const encryptedResponse = await providerResponse;
            const validateResult = await aquarius.validate(ddo);

            console.log({ ddo });

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
                toast.success("Successfully set DDO in NFT Metadata", {
                    position: "bottom-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                toast.success("Asset created successfully", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                });
                return ddo.id;
            } else {
                toast.error("Asset creation failed", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                });
                return null;
            }
        }
    };

    const createNft = async (e) => {
        e.preventDefault();

        let assetId;

        const createAssetToast = toast.info(
            "Sign Transaction on wallet when prompted",
            {
                position: "top-center",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: true,
            }
        );

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

        toast.dismiss(createAssetToast);

        console.log(`asset id: ${assetId}`);

        if (
            isLinkedToRequest === "true" &&
            dataRequestID !== null &&
            assetId !== null
        ) {
            linkWithAssetRequest(assetId, dataRequestID);
        }
    };

    const linkWithAssetRequest = async (assetId, dataRequestID) => {
        const response = await fetch(
            `http://localhost:3000/api/dataRequests/${dataRequestID}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ assetAddress: [assetId] }),
            }
        );

        if (!response.ok) {
            console.error(`API request failed: ${response.status}`);
            return;
        }
        toast.success("Asset linked with Request successfully", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
        });
        const dataRequest = await response.json();
        console.log(
            `Linked asset ${assetId} with Asset Request ID ${dataRequestID}`
        );
        console.log(dataRequest);
    };

    const setPublishDetails = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    // const signTransaction = async () => {
    //     const web3 = new Web3(window.ethereum);

    //     const address = currentAccount;

    //     const tokenName = generateDtName();

    //     console.log(Web3.utils.toChecksumAddress(currentAccount));
    //     console.log(currentAccount);

    //     const nftParamsAsset = {
    //         name: "KASH", //Name of NFT set in contract
    //         symbol: "KASH", //Symbol of NFT set in contract
    //         templateIndex: 1,
    //         tokenURI: "",
    //         state: 0,
    //         created: new Date().toISOString(),
    //         transferable: true,
    //         owner: currentAccount,
    //     };
    //     const datatokenParams = {
    //         templateIndex: 1,
    //         cap: "100000",
    //         feeAmount: "0",
    //         paymentCollector: ZERO_ADDRESS,
    //         feeToken: ZERO_ADDRESS,
    //         minter: currentAccount,
    //         mpFeeAddress: ZERO_ADDRESS,
    //         name: tokenName.name,
    //         symbol: tokenName.symbol,
    //     };

    //     const dataTokenParamsUpdated = {
    //         templateIndex: datatokenParams.templateIndex,
    //         strings: [datatokenParams.name, datatokenParams.symbol],
    //         addresses: [
    //             datatokenParams.minter,
    //             datatokenParams.paymentCollector,
    //             datatokenParams.mpFeeAddress,
    //             datatokenParams.feeToken,
    //         ],
    //         uints: [
    //             Web3.utils.toWei(datatokenParams.cap),
    //             Web3.utils.toWei(datatokenParams.feeAmount),
    //         ],
    //         bytess: [],
    //     };

    //     console.log(oceanConfig);
    //     const contract = new web3.eth.Contract(
    //         ERC721Factory.abi,
    //         oceanConfig.nftFactoryAddress
    //     );
    //     console.log(contract);

    //     const estimatedGas = await contract.methods.createNftWithErc20
    //         .apply(null, [nftParamsAsset, dataTokenParamsUpdated])
    //         .estimateGas({ currentAccount }, (err, estGas) =>
    //             err ? 1000000 : estGas
    //         );

    //     console.log(estimatedGas);

    //     const trxReceipt = await sendTx(
    //         currentAccount,
    //         estimatedGas + 1,
    //         web3,
    //         oceanConfig.gasFeeMultiplier,
    //         contract.methods.createNftWithErc20,
    //         nftParamsAsset,
    //         dataTokenParamsUpdated
    //     );

    //     console.log(trxReceipt);
    // };

    // const getFairGasPrice = async (web3, gasFeeMultiplier) => {
    //     const x = new BigNumber(await web3.eth.getGasPrice());
    //     if (gasFeeMultiplier)
    //         return x
    //             .multipliedBy(gasFeeMultiplier)
    //             .integerValue(BigNumber.ROUND_DOWN)
    //             .toString(10);
    //     else return x.toString(10);
    // };

    // const sendTx = async (
    //     from,
    //     estGas,
    //     web3,
    //     gasFeeMultiplier,
    //     functionToSend,
    //     ...args
    // ) => {
    //     const sendTxValue = {
    //         from,
    //         gas: estGas + 1,
    //     };
    //     const networkId = await web3.eth.getChainId();
    //     try {
    //         const feeHistory = await web3.eth.getFeeHistory(1, "latest", [75]);
    //         if (
    //             feeHistory &&
    //             feeHistory?.baseFeePerGas?.[0] &&
    //             feeHistory?.reward?.[0]?.[0]
    //         ) {
    //             let aggressiveFee = new BigNumber(feeHistory?.reward?.[0]?.[0]);
    //             if (gasFeeMultiplier > 1) {
    //                 aggressiveFee =
    //                     aggressiveFee.multipliedBy(gasFeeMultiplier);
    //             }

    //             sendTxValue.maxPriorityFeePerGas = aggressiveFee
    //                 .integerValue(BigNumber.ROUND_DOWN)
    //                 .toString(10);

    //             sendTxValue.maxFeePerGas = aggressiveFee
    //                 .plus(
    //                     new BigNumber(
    //                         feeHistory?.baseFeePerGas?.[0]
    //                     ).multipliedBy(2)
    //                 )
    //                 .integerValue(BigNumber.ROUND_DOWN)
    //                 .toString(10);

    //             // if network is polygon and mumbai and fees is lower than the 30 gwei trashold, sets MIN_GAS_FEE_POLYGON
    //             sendTxValue.maxPriorityFeePerGas =
    //                 (networkId === MUMBAI_NETWORK_ID ||
    //                     networkId === POLYGON_NETWORK_ID) &&
    //                 new BigNumber(sendTxValue.maxPriorityFeePerGas).lte(
    //                     new BigNumber(MIN_GAS_FEE_POLYGON)
    //                 )
    //                     ? new BigNumber(MIN_GAS_FEE_POLYGON)
    //                           .integerValue(BigNumber.ROUND_DOWN)
    //                           .toString(10)
    //                     : sendTxValue.maxPriorityFeePerGas;

    //             sendTxValue.maxFeePerGas =
    //                 (networkId === MUMBAI_NETWORK_ID ||
    //                     networkId === POLYGON_NETWORK_ID) &&
    //                 new BigNumber(sendTxValue.maxFeePerGas).lte(
    //                     new BigNumber(MIN_GAS_FEE_POLYGON)
    //                 )
    //                     ? new BigNumber(MIN_GAS_FEE_POLYGON)
    //                           .integerValue(BigNumber.ROUND_DOWN)
    //                           .toString(10)
    //                     : sendTxValue.maxFeePerGas;
    //         } else {
    //             sendTxValue.gasPrice = await getFairGasPrice(
    //                 web3,
    //                 gasFeeMultiplier
    //             );
    //         }
    //     } catch (err) {
    //         sendTxValue.gasPrice = await getFairGasPrice(
    //             web3,
    //             gasFeeMultiplier
    //         );
    //     }

    //     const trxReceipt = await functionToSend
    //         .apply(null, args)
    //         .send(sendTxValue);
    //     return trxReceipt;
    // };

    return (
        <div className="bg-white rounded-md h-full overflow-y-scroll">
            {" "}
            <h1 className="font-light text-xl p-5 text-center">
                Publish Asset{" "}
            </h1>
            <form className=" flex flex-col w-full">
                <div className="grid grid-cols-2 gap-1">
                    {/* Column 1 */}
                    <div>
                        {/* Data Asset details */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block  mb-1">
                                    Data Asset Name
                                </label>

                                <input
                                    value={name}
                                    onChange={setPublishDetails}
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                    placeholder="e.g Health data asset"
                                />
                            </div>
                        </div>

                        {/* Author */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block  mb-1">Author</label>

                                <input
                                    value={author}
                                    onChange={setPublishDetails}
                                    type="text"
                                    name="author"
                                    id="author"
                                    className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                    placeholder="e.g John"
                                />
                            </div>
                        </div>

                        {/* NFT Name */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block  mb-1">NFT Name</label>
                                <input
                                    value={nftName}
                                    onChange={setPublishDetails}
                                    type="text"
                                    name="nftName"
                                    placeholder="e.g ATLANTEAN"
                                    id="nftName"
                                    className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                />
                            </div>
                        </div>

                        {/* NFT symbol */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block  mb-1">
                                    NFT Symbol Name
                                </label>
                                <input
                                    value={symbol}
                                    onChange={setPublishDetails}
                                    type="text"
                                    name="symbol"
                                    id="symbol"
                                    placeholder="e.g ATN"
                                    className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                />
                            </div>
                        </div>
                        {/* Data Asset URL */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block  mb-1">
                                    Data Asset URL
                                </label>
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
                                    className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                    placeholder="https://api.xyz/asset_url"
                                />
                            </div>
                        </div>

                        {/* Provider URL */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block  mb-1">
                                    Provider URL
                                </label>

                                <input
                                    value={providerURL}
                                    onChange={setPublishDetails}
                                    type="text"
                                    name="providerURL"
                                    id="providerURL"
                                    className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                    placeholder="www.example.com"
                                />
                            </div>
                        </div>

                        {/* Sample File URL */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block  mb-1">
                                    Sample File URL
                                </label>
                                <input
                                    value={sampleFileURL}
                                    onChange={setPublishDetails}
                                    type="text"
                                    name="sampleFileURL"
                                    id="sampleFileURL"
                                    className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                    placeholder="https://api.xyz/sample_file"
                                />
                            </div>
                        </div>

                        {/* Timeout */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block  mb-1">Timeout</label>
                                <input
                                    onChange={setPublishDetails}
                                    type="number"
                                    className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
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
                                <label className="block  mb-1">
                                    Description
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        value={description}
                                        onChange={setPublishDetails}
                                        id="description"
                                        name="description"
                                        rows="3"
                                        className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                        placeholder="This asset ......"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Asset Type radio buttons */}
                        <div className="flex justify-center">
                            <label>Linked to Data Request? : </label>
                            <div>
                                <input
                                    type="radio"
                                    value="true"
                                    onChange={setPublishDetails}
                                    name="isLinkedToRequest"
                                    checked={
                                        isLinkedToRequest === "true"
                                            ? true
                                            : false
                                    }
                                />{" "}
                                Yes
                                <input
                                    type="radio"
                                    value="false"
                                    onChange={setPublishDetails}
                                    name="isLinkedToRequest"
                                    checked={
                                        isLinkedToRequest === "false" ||
                                        !isLinkedToRequest
                                            ? true
                                            : false
                                    }
                                />{" "}
                                No
                            </div>
                        </div>
                        {isLinkedToRequest === "true" && (
                            <div className="flex justify-center">
                                <div className="mb-3 xl:w-96">
                                    <label className="block  mb-1">
                                        Data Request ID
                                    </label>
                                    <input
                                        onChange={setPublishDetails}
                                        type="text"
                                        value={dataRequestID}
                                        className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                        id="dataRequestID"
                                        name="dataRequestID"
                                    />
                                </div>
                            </div>
                        )}

                        {/* service details */}
                        <div className="flex justify-center">
                            <div className="mb-3 xl:w-96">
                                <label className="block  mb-1">
                                    Service Name
                                </label>
                                <input
                                    onChange={setPublishDetails}
                                    type="text"
                                    className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                    id="serviceName"
                                    placeholder="My service 1"
                                    name="serviceName"
                                />
                            </div>
                        </div>

                        {/* Asset Type radio buttons */}
                        <div className="flex justify-center">
                            <label className="block  mt-2">Asset Type : </label>
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
                                    <label className="form-check-label inline-block text-gray-800">
                                        Dataset
                                    </label>
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
                                    <label className="form-check-label inline-block text-gray-800">
                                        Algorithm
                                    </label>
                                </div>
                            </span>
                        </div>

                        {assetType === "datasetRadio" ? (
                            <div></div>
                        ) : assetType === "algorithmRadio" ? (
                            <div>
                                <div className="flex justify-center">
                                    <div className="mb-3 xl:w-96">
                                        <label className="block  mb-1">
                                            Container Entry Point
                                        </label>
                                        <input
                                            onChange={setPublishDetails}
                                            type="text"
                                            className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                            id="entryPoint"
                                            name="entryPoint"
                                            value={entryPoint}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <div className="mb-3 xl:w-96">
                                        <label className="block  mb-1">
                                            Container Image
                                        </label>
                                        <input
                                            onChange={setPublishDetails}
                                            type="text"
                                            className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                            id="image"
                                            name="image"
                                            value={image}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <div className="mb-3 xl:w-96">
                                        <label className="block  mb-1">
                                            Container Tag
                                        </label>
                                        <input
                                            onChange={setPublishDetails}
                                            type="text"
                                            className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                            id="tag"
                                            name="tag"
                                            value={tag}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <div className="mb-3 xl:w-96">
                                        <label className="block  mb-1">
                                            Container Checksum
                                        </label>
                                        <input
                                            onChange={setPublishDetails}
                                            type="text"
                                            className="mb-1 block w-full rounded-md border-gray-400 border-solid border-2 px-3 py-2 mt-1 bg-gray-50"
                                            id="checksum"
                                            name="checksum"
                                            value={checksum}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                Select an asset type
                            </div>
                        )}

                        <div className="flex justify-center">
                            <label className="block  mt-2">
                                Service Type :{" "}
                            </label>
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
                                    <label className="form-check-label inline-block text-gray-800">
                                        Access
                                    </label>
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
                                    <label className="form-check-label inline-block text-gray-800">
                                        Compute
                                    </label>
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
                        className="bg-purple-700 hover:bg-purple-800 text-white  py-2 px-4 rounded w-1/7"
                    >
                        Publish
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PublishPage;
