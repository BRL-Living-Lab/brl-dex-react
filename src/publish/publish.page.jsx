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
        entryPoint: "python $ALGO",
        image: "oceanprotocol/algo_dockers",
        tag: "python-branin",
        checksum:
            "sha256:8221d20c1c16491d7d56b9657ea09082c0ee4a8ab1a6621fa720da58b09580e4",
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
                    entrypoint: "python $ALGO",
                    image: "node",
                    tag: "oceanprotocol/algo_dockers",
                    checksum:
                        "sha256:8221d20c1c16491d7d56b9657ea09082c0ee4a8ab1a6621fa720da58b09580e4",
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
            `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/dataRequests/${dataRequestID}`,
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
        <div className="rounded-md h-full overflow-y-scroll">
            <h1 className="font-light text-xl p-5 text-center">
                Publish Asset{" "}
            </h1>
            <form
                onSubmit={createNft}
                className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg"
            >
                <label className="flex flex-col">
                    Data Asset Name:
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={setPublishDetails}
                        className="border p-2 rounded"
                        placeholder="e.g Health data asset"
                    />
                </label>
                <label className="flex flex-col">
                    Author:
                    <input
                        type="text"
                        name="author"
                        id="author"
                        value={formData.author}
                        onChange={setPublishDetails}
                        className="border p-2 rounded"
                        placeholder="e.g John"
                    />
                </label>

                <label className="flex flex-col">
                    NFT Name:
                    <input
                        type="text"
                        name="nftName"
                        id="nftName"
                        value={formData.nftName}
                        onChange={setPublishDetails}
                        className="border p-2 rounded"
                        placeholder="e.g ATLANTEAN"
                    />
                </label>

                <label className="flex flex-col">
                    NFT Symbol Name:
                    <input
                        type="text"
                        name="symbol"
                        id="symbol"
                        value={formData.symbol}
                        onChange={setPublishDetails}
                        className="border p-2 rounded"
                        placeholder="e.g ATN"
                    />
                </label>

                <label className="flex flex-col">
                    Data Asset URL:
                    <input
                        type="text"
                        name="fileUrl"
                        id="fileUrl"
                        value={formData.fileUrl}
                        onChange={setPublishDetails}
                        className="border p-2 rounded"
                        placeholder="https://api.xyz/asset_url"
                    />
                </label>

                <label className="flex flex-col">
                    Provider URL:
                    <input
                        type="text"
                        name="providerURL"
                        id="providerURL"
                        value={formData.providerURL}
                        onChange={setPublishDetails}
                        className="border p-2 rounded"
                        placeholder="www.example.com"
                    />
                </label>

                <label className="flex flex-col">
                    Sample File URL:
                    <input
                        type="text"
                        name="sampleFileURL"
                        id="sampleFileURL"
                        value={formData.sampleFileURL}
                        onChange={setPublishDetails}
                        className="border p-2 rounded"
                        placeholder="https://api.xyz/sample_file"
                    />
                </label>

                <label className="flex flex-col">
                    Timeout:
                    <input
                        type="number"
                        name="timeout"
                        id="timeout"
                        onChange={setPublishDetails}
                        className="border p-2 rounded"
                        placeholder="e.g 3000"
                    />
                </label>

                {/* Column 2 */}

                <label className="flex flex-col">
                    Description:
                    <textarea
                        name="description"
                        id="description"
                        rows="3"
                        value={formData.description}
                        onChange={setPublishDetails}
                        className="border p-2 rounded"
                        placeholder="This asset ......"
                    />
                </label>

                <div className="flex flex-col">
                    <label>Linked to Data Request? :</label>
                    <div>
                        <input
                            type="radio"
                            value="true"
                            onChange={setPublishDetails}
                            name="isLinkedToRequest"
                            checked={
                                formData.isLinkedToRequest === "true"
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
                                formData.isLinkedToRequest === "false" ||
                                !formData.isLinkedToRequest
                                    ? true
                                    : false
                            }
                        />{" "}
                        No
                    </div>
                </div>

                {formData.isLinkedToRequest === "true" && (
                    <label className="flex flex-col">
                        Data Request ID:
                        <input
                            type="text"
                            name="dataRequestID"
                            id="dataRequestID"
                            value={formData.dataRequestID}
                            onChange={setPublishDetails}
                            className="border p-2 rounded"
                        />
                    </label>
                )}

                <label className="flex flex-col">
                    Service Name:
                    <input
                        type="text"
                        name="serviceName"
                        id="serviceName"
                        value={formData.serviceName}
                        onChange={setPublishDetails}
                        className="border p-2 rounded"
                        placeholder="My service 1"
                    />
                </label>

                <div className="flex flex-col">
                    <label>Asset Type:</label>
                    <div>
                        <input
                            type="radio"
                            name="assetType"
                            id="datasetRadio"
                            value="datasetRadio"
                            onChange={setPublishDetails}
                            className="mr-2"
                        />
                        <label htmlFor="datasetRadio">Dataset</label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            name="assetType"
                            id="algorithmRadio"
                            value="algorithmRadio"
                            onChange={setPublishDetails}
                            className="mr-2"
                        />
                        <label htmlFor="algorithmRadio">Algorithm</label>
                    </div>
                </div>

                {formData.assetType === "datasetRadio" ? (
                    <div></div>
                ) : formData.assetType === "algorithmRadio" ? (
                    <div>
                        <label className="flex flex-col">
                            Container Entry Point:
                            <input
                                type="text"
                                name="entryPoint"
                                id="entryPoint"
                                value={formData.entryPoint}
                                onChange={setPublishDetails}
                                className="border p-2 rounded"
                            />
                        </label>

                        <label className="flex flex-col">
                            Container Image:
                            <input
                                type="text"
                                name="image"
                                id="image"
                                value={formData.image}
                                onChange={setPublishDetails}
                                className="border p-2 rounded"
                            />
                        </label>

                        <label className="flex flex-col">
                            Container Tag:
                            <input
                                type="text"
                                name="tag"
                                id="tag"
                                value={formData.tag}
                                onChange={setPublishDetails}
                                className="border p-2 rounded"
                            />
                        </label>

                        <label className="flex flex-col">
                            Container Checksum:
                            <input
                                type="text"
                                name="checksum"
                                id="checksum"
                                value={formData.checksum}
                                onChange={setPublishDetails}
                                className="border p-2 rounded"
                            />
                        </label>
                    </div>
                ) : (
                    <div className="flex flex-col">Select an asset type</div>
                )}

                <div className="flex flex-col">
                    <label>Service Type:</label>
                    <div>
                        <input
                            type="radio"
                            name="serviceType"
                            id="accessRadio"
                            value="accessRadio"
                            onChange={setPublishDetails}
                            className="mr-2"
                        />
                        <label htmlFor="accessRadio">Access</label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            name="serviceType"
                            id="computeRadio"
                            value="computeRadio"
                            onChange={setPublishDetails}
                            className="mr-2"
                        />
                        <label htmlFor="computeRadio">Compute</label>
                    </div>
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
