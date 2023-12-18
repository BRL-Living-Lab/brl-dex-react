import {
    Aquarius,
    Datatoken,
    ProviderInstance,
    approveWei,
} from "@oceanprotocol/lib";
import { useContext, useEffect, useState } from "react";
import { AiFillCheckSquare, AiOutlineCheckSquare } from "react-icons/ai";
import Web3 from "web3";
import { AccountContext, OceanConfigContext } from "../App";
import { NavLink } from "react-router-dom";
import { set } from "mongoose";

const FMLPage = () => {
    const { oceanConfig } = useContext(OceanConfigContext);

    const [isDatasetDDOLoading, setIsDatasetDDOLoading] = useState(true);
    const [isAlgorithmDDOLoading, setIsAlgorithmDDOLoading] = useState(true);
    const [initiatedJobId, setInitiatedJobId] = useState(null);

    const [datasetService, setDatasetService] = useState(null);
    const [algorithmService, setAlgorithmService] = useState(null);

    const [datasetBalance, setDatasetBalance] = useState(null);
    const [algorithmBalance, setAlgorithmBalance] = useState(null);

    const { currentAccount, _ } = useContext(AccountContext);

    const [computeData, setComputeData] = useState({
        datasets: [
            {
                datasetDID: "",
                confirmDatasetDID: false,
                datasetDDO: null,
                datasetService: null,
                datasetBalance: null,
            },
        ],
        algorithmDID: "",
        confirmDatasetDID: false,
        confirmAlgorithmDID: false,
        datasetDDO: null,
        algorithmDDO: null,
        algorithmBalance: null,
    });

    const setComputeDetails = (e, index) => {
        const { name, value } = e.target;

        if (index === undefined) {
            setComputeData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        } else {
            setComputeData((prevData) => ({
                ...prevData,
                datasets: prevData.datasets.map((dataset, i) =>
                    i === index ? { ...dataset, [name]: value } : dataset
                ),
            }));
        }
    };

    const handleAddDataset = () => {
        setComputeData((prevData) => ({
            ...prevData,
            datasets: [
                ...prevData.datasets,
                {
                    datasetDID: "",
                    confirmDatasetDID: false,
                    datasetDDO: null,
                    datasetService: null,
                    datasetBalance: null,
                },
            ],
        }));
    };

    const handleDeleteDataset = (index) => {
        setComputeData((prevData) => ({
            ...prevData,
            datasets: prevData.datasets.filter((_, i) => i !== index),
        }));
    };

    const getDDOs = async (assetType, index) => {
        const aquarius = new Aquarius(oceanConfig.metadataCacheUri);
        let ddo;

        if (assetType === "datasets") {
            ddo = await aquarius.resolve(
                computeData[assetType][index].datasetDID
            );
            setComputeData((prevData) => ({
                ...prevData,
                datasets: prevData.datasets.map((dataset, i) =>
                    i === index ? { ...dataset, datasetDDO: ddo } : dataset
                ),
            }));
        } else {
            ddo = await aquarius.resolve(computeData[assetType]);
            setComputeData((prevData) => ({
                ...prevData,
                algorithmDDO: ddo,
            }));
        }

        // if (assetType === "datasetDID") {
        //     setComputeData({
        //         ...computeData,
        //         datasetDDO: ddo,
        //     });
        // } else if (assetType === "algorithmDID") {
        //     setComputeData({
        //         ...computeData,
        //         algorithmDDO: ddo,
        //     });
        // }
        console.log(ddo);
    };

    useEffect(() => {
        if (computeData.confirmAlgorithmDID) getDDOs("algorithmDID");
    }, [computeData.confirmAlgorithmDID]);

    const getBalance = async (assetType, index) => {
        const datatoken = new Datatoken(new Web3(window.ethereum));
        let balance;
        console.log(assetType);
        if (assetType === "datasets") {
            console.log(computeData[assetType][index]);
            balance = await datatoken.balance(
                computeData[assetType][index].datasetDDO.datatokens[0].address,
                currentAccount
            );
        } else
            balance = await datatoken.balance(
                computeData[assetType].datatokens[0].address,
                currentAccount
            );
        if (assetType === "datasets") {
            setComputeData((prevData) => ({
                ...prevData,
                datasets: prevData.datasets.map((dataset, i) =>
                    i === index
                        ? {
                              ...dataset,
                              datasetBalance: balance,
                          }
                        : dataset
                ),
            }));
        } else if (assetType === "algorithmDDO") {
            console.log(computeData[assetType], balance);
            setComputeData((prevData) => ({
                ...prevData,
                algorithmBalance: balance,
            }));
        }
    };

    useEffect(() => {
        if (datasetService !== null) getBalance("datasetDDO");
        if (algorithmService !== null) getBalance("algorithmDDO");
    }, [datasetService, algorithmService]);

    async function handleOrder(
        order,
        datatokenAddress,
        payerAccount,
        consumerAccount,
        serviceIndex,
        consumeMarkerFee
    ) {
        /* We do have 3 possible situations:
           - have validOrder and no providerFees -> then order is valid, providerFees are valid, just use it in startCompute
           - have validOrder and providerFees -> then order is valid but providerFees are not valid, we need to call reuseOrder and pay only providerFees
           - no validOrder -> we need to call startOrder, to pay 1 DT & providerFees
        */
        const datatoken = new Datatoken(new Web3(window.ethereum));
        if (order.providerFee && order.providerFee.providerFeeAmount) {
            await approveWei(
                new Web3(window.ethereum),
                oceanConfig,
                payerAccount,
                order.providerFee.providerFeeToken,
                datatokenAddress,
                order.providerFee.providerFeeAmount
            );
        }
        if (order.validOrder) {
            if (!order.providerFee) return order.validOrder;
            const tx = await datatoken.reuseOrder(
                datatokenAddress,
                payerAccount,
                order.validOrder,
                order.providerFee
            );
            return tx.transactionHash;
        }
        const tx = await datatoken.startOrder(
            datatokenAddress,
            payerAccount,
            consumerAccount,
            serviceIndex,
            order.providerFee,
            consumeMarkerFee
        );
        return tx.transactionHash;
    }

    const createCompute = async () => {
        const web3 = new Web3(window.ethereum);

        console.log("Compute Environments:", oceanConfig.providerUri);
        const computeEnvs = await ProviderInstance.getComputeEnvironments(
            oceanConfig.providerUri
        );
        console.log(computeEnvs);

        const computeEnv = computeEnvs[oceanConfig.chainId.toString()].find(
            (ce) => ce.priceMin === 0
        );
        console.log("Free compute environment = ", computeEnv);

        const paidComputeEnv = computeEnvs[oceanConfig.chainId.toString()].find(
            (ce) => ce.priceMin != 0
        );
        console.log("Paid compute environment = ", paidComputeEnv);

        for (let i = 0; i < computeData.datasets.length; i++) {
            let datasetService = computeData.datasets[i].datasetService;
            let datasetBalance = computeData.datasets[i].datasetBalance;
            let datasetDDO = computeData.datasets[i].datasetDDO;

            const mytime = new Date();
            const computeMinutes = 10;
            mytime.setMinutes(mytime.getMinutes() + computeMinutes);
            const computeValidUntil = Math.floor(mytime.getTime() / 1000);

            const assets = [
                {
                    documentId: datasetDDO.id,
                    serviceId: datasetDDO.services[0].id,
                },
            ];
            const dtAddressArray = [datasetDDO.services[0].datatokenAddress];
            const algo = {
                documentId: computeData.algorithmDDO.id,
                serviceId:
                    computeData.algorithmDDO.services[algorithmService].id,
            };

            const providerInitializeComputeResults =
                await ProviderInstance.initializeCompute(
                    assets,
                    algo,
                    computeEnv.id,
                    computeValidUntil,
                    oceanConfig.providerUri,
                    currentAccount
                );

            console.log({ providerInitializeComputeResults });

            algo.transferTxId = await handleOrder(
                providerInitializeComputeResults.algorithm,
                computeData.algorithmDDO.services[0].datatokenAddress,
                currentAccount,
                computeEnv.consumerAddress,
                0
            );

            console.log({ algo });

            for (
                let i = 0;
                i < providerInitializeComputeResults.datasets.length;
                i++
            ) {
                assets[i].transferTxId = await handleOrder(
                    providerInitializeComputeResults.datasets[i],
                    dtAddressArray[i],
                    currentAccount,
                    computeEnv.consumerAddress,
                    0
                );
            }

            console.log({ assets });

            const computeJobs = await ProviderInstance.computeStart(
                oceanConfig.providerUri,
                web3,
                currentAccount,
                computeEnv.id,
                assets[0],
                algo
            );

            const computeJobId = computeJobs[0].jobId;

            console.log({ providerInitializeComputeResults });
            console.log({ computeJobId });
            console.log({ computeJobs });

            let jobStatus = await ProviderInstance.computeStatus(
                oceanConfig.providerUri,
                currentAccount,
                computeJobId,
                computeData.datasetDDO.id
            );

            console.log("Current status of the compute job: ", jobStatus);
            // setInitiatedJobId(jobStatus[0].jobId);
        }
    };

    const removeDDO = (assetType, index) => {
        if (assetType === "datasets") {
            setComputeData((prevData) => ({
                ...prevData,
                datasets: prevData.datasets.map((dataset, i) =>
                    i === index
                        ? {
                              ...dataset,
                              datasetDDO: null,
                          }
                        : dataset
                ),
            }));
        } else if (assetType === "algorithmDDO") {
            setComputeData((prevData) => ({
                ...prevData,
                algorithmDDO: null,
            }));
        }
    };

    return (
        <div className="bg-white rounded-md h-full overflow-y-scroll">
            <h1 className="font-light text-xl p-5 text-center">
                Create FML Request
            </h1>

            <div>
                <div>
                    <h2 className="font-light text-xl text p-5">Algorithm</h2>

                    <label className="font-semibold p-5">Algorithm DID:</label>
                    <div className="flex items-center space-x-2 p-5">
                        <input
                            type="text"
                            className="w-1/2 rounded-md border-gray-400 border-solid border-2 px-3 py-2 bg-gray-50"
                            value={computeData.algorithmDID}
                            onChange={setComputeDetails}
                            name="algorithmDID"
                            disabled={computeData.confirmAlgorithmDID}
                            placeholder="Enter Algorithm DID"
                        />
                        {computeData.algorithmDID === "" ? (
                            ""
                        ) : (
                            <button
                                onClick={() => {
                                    console.log(
                                        computeData.confirmAlgorithmDID
                                    );
                                    setComputeData({
                                        ...computeData,
                                        confirmAlgorithmDID:
                                            !computeData.confirmAlgorithmDID,
                                    });
                                }}
                                className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none"
                            >
                                {computeData.confirmAlgorithmDID ? (
                                    <AiFillCheckSquare />
                                ) : (
                                    <AiOutlineCheckSquare />
                                )}
                            </button>
                        )}
                    </div>

                    {computeData.algorithmDDO === null ? (
                        ""
                    ) : (
                        <div className="mt-1">
                            <h2 className="font-light p-1">Select Service</h2>
                            {computeData.algorithmDDO.services.map(
                                (service, index) => {
                                    return (
                                        <div className="flex items-center mt-1">
                                            <input
                                                type="radio"
                                                name="algorithmService"
                                                value={index}
                                                onChange={(e) =>
                                                    setAlgorithmService(
                                                        e.target.value
                                                    )
                                                }
                                                id={`service-${index}`}
                                                className="mr-2"
                                            />
                                            <label>
                                                {service.type} - {service.id} -{" "}
                                                {index}
                                            </label>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                    {algorithmService === null ? (
                        ""
                    ) : (
                        <div>
                            <p>
                                Service Datatoken:{" "}
                                {
                                    computeData.algorithmDDO.datatokens[
                                        algorithmService
                                    ].name
                                }{" "}
                                (
                                {
                                    computeData.algorithmDDO.datatokens[
                                        algorithmService
                                    ].symbol
                                }
                                ) Balance: {computeData.algorithmBalance}
                            </p>
                        </div>
                    )}
                </div>

                <div>Add Datasets:</div>
                <div>
                    {computeData.datasets.map((dataset, index) => (
                        <div key={index}>
                            <h2 className="font-light text-xl p-5">
                                Dataset {index + 1}
                            </h2>
                            {/* ... Other dataset fields ... */}
                            <input
                                type="text"
                                className="w-1/2 rounded-md border-gray-400 border-solid border-2 px-3 py-2 bg-gray-50"
                                value={dataset.datasetDID}
                                onChange={(e) => setComputeDetails(e, index)}
                                name="datasetDID"
                                disabled={dataset.confirmDatasetDID}
                                placeholder={`Enter dataset ${index + 1} DID`}
                            />
                            {dataset.datasetDID === "" ? (
                                ""
                            ) : (
                                <>
                                    {dataset.datasetDDO ? (
                                        <button
                                            onClick={() => {
                                                removeDDO("datasets", index);
                                                // console.log(
                                                //     "here",
                                                //     dataset.confirmDatasetDID
                                                // );
                                                // setComputeData({
                                                //     ...computeData,
                                                //     confirmDatasetDID:
                                                //         !computeData.confirmDatasetDID,
                                                // });
                                            }}
                                            className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none"
                                        >
                                            <AiFillCheckSquare />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                getDDOs("datasets", index);
                                                // console.log(
                                                //     "here",
                                                //     dataset.confirmDatasetDID
                                                // );
                                                // setComputeData({
                                                //     ...computeData,
                                                //     confirmDatasetDID:
                                                //         !computeData.confirmDatasetDID,
                                                // });
                                            }}
                                            className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none"
                                        >
                                            <AiOutlineCheckSquare />
                                        </button>
                                    )}
                                </>
                            )}
                            {dataset.datasetDDO === null ? (
                                ""
                            ) : (
                                <div className="mt-1">
                                    <h2 className="font-light p-1">
                                        Select Service
                                    </h2>
                                    {dataset.datasetDDO.services.map(
                                        (service, serviceIndex) => {
                                            return (
                                                <div className="flex items-center mt-1">
                                                    <input
                                                        type="checkbox"
                                                        name="datasetService"
                                                        value={serviceIndex}
                                                        onChange={(e) =>
                                                            getBalance(
                                                                "datasets",
                                                                index
                                                            )
                                                        }
                                                        id={`service-${index}`}
                                                        className="mr-2"
                                                    />
                                                    <label>
                                                        {service.type} -{" "}
                                                        {service.id} -{" "}
                                                        {serviceIndex}
                                                    </label>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                            {dataset.datasetBalance === null ? (
                                ""
                            ) : (
                                <div className="p-1">
                                    <p>
                                        Service Datatoken:{" "}
                                        {dataset.datasetDDO.datatokens[0].name}{" "}
                                        (
                                        {
                                            dataset.datasetDDO.datatokens[0]
                                                .symbol
                                        }
                                        ) Balance: {dataset.datasetBalance}
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={() => handleDeleteDataset(index)}
                                className="p-1 rounded-md bg-red-500 hover:bg-red-600 focus:outline-none text-white"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={handleAddDataset}
                        className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none"
                    >
                        +
                    </button>
                </div>
            </div>
            <div className="flex justify-center mt-1">
                <button
                    className="bg-purple-700 items-center mt-6 hover:bg-purple-800 text-white  py-2 px-4 rounded w-1/7"
                    onClick={createCompute}
                >
                    Create FML Compute
                </button>
            </div>
        </div>
    );
};

export default FMLPage;
