import { Aquarius, Datatoken, ProviderInstance, approveWei } from "@oceanprotocol/lib";
import { useContext, useEffect, useState } from "react";
import { AiFillCheckSquare, AiOutlineCheckSquare } from "react-icons/ai";
import Web3 from "web3";
import { AccountContext, OceanConfigContext } from "../App";

const CreateCompute = () => {
    const { oceanConfig } = useContext(OceanConfigContext);

    const [isDatasetDDOLoading, setIsDatasetDDOLoading] = useState(true);
    const [isAlgorithmDDOLoading, setIsAlgorithmDDOLoading] = useState(true);

    const [datasetService, setDatasetService] = useState(null);
    const [algorithmService, setAlgorithmService] = useState(null);

    const [datasetBalance, setDatasetBalance] = useState(null);
    const [algorithmBalance, setAlgorithmBalance] = useState(null);

    const { currentAccount, _ } = useContext(AccountContext);

    const [computeData, setComputeData] = useState({
        datasetDID: "",
        algorithmDID: "",
        confirmDatasetDID: false,
        confirmAlgorithmDID: false,
        datasetDDO: null,
        algorithmDDO: null,
    });

    const setComputeDetails = (e) => {
        setComputeData({
            ...computeData,
            [e.target.name]: e.target.value,
        });
    };

    const getDDOs = async (assetType) => {
        const aquarius = new Aquarius(oceanConfig.metadataCacheUri);
        const ddo = await aquarius.resolve(computeData[assetType]);

        if (assetType === "datasetDID") {
            setComputeData({
                ...computeData,
                datasetDDO: ddo,
            });
        } else if (assetType === "algorithmDID") {
            setComputeData({
                ...computeData,
                algorithmDDO: ddo,
            });
        }
        console.log(ddo);
    };

    useEffect(() => {
        if (computeData.confirmDatasetDID) getDDOs("datasetDID");
        if (computeData.confirmAlgorithmDID) getDDOs("algorithmDID");
    }, [computeData.confirmDatasetDID, computeData.confirmAlgorithmDID]);

    const getBalance = async (assetType) => {
        const datatoken = new Datatoken(new Web3(window.ethereum));
        const balance = await datatoken.balance(computeData[assetType].datatokens[0].address, currentAccount);
        if (assetType === "datasetDDO") {
            setDatasetBalance(balance);
        } else if (assetType === "algorithmDDO") {
            setAlgorithmBalance(balance);
        }
    };

    useEffect(() => {
        if (datasetService !== null) getBalance("datasetDDO");
        if (algorithmService !== null) getBalance("algorithmDDO");
    }, [datasetService, algorithmService]);

    async function handleOrder(order, datatokenAddress, payerAccount, consumerAccount, serviceIndex, consumeMarkerFee) {
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
            const tx = await datatoken.reuseOrder(datatokenAddress, payerAccount, order.validOrder, order.providerFee);
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
        const computeEnvs = await ProviderInstance.getComputeEnvironments(oceanConfig.providerUri);
        console.log(computeEnvs);

        const computeEnv = computeEnvs[oceanConfig.chainId.toString()].find((ce) => ce.priceMin === 0);
        console.log("Free compute environment = ", computeEnv);

        const paidComputeEnv = computeEnvs[oceanConfig.chainId.toString()].find((ce) => ce.priceMin != 0);
        console.log("Paid compute environment = ", paidComputeEnv);

        const mytime = new Date();
        const computeMinutes = 10;
        mytime.setMinutes(mytime.getMinutes() + computeMinutes);
        const computeValidUntil = Math.floor(mytime.getTime() / 1000);

        const assets = [
            {
                documentId: computeData.datasetDDO.id,
                serviceId: computeData.datasetDDO.services[datasetService].id,
            },
        ];
        const dtAddressArray = [computeData.datasetDDO.services[datasetService].datatokenAddress];
        const algo = {
            documentId: computeData.algorithmDDO.id,
            serviceId: computeData.algorithmDDO.services[algorithmService].id,
        };

        const providerInitializeComputeResults = await ProviderInstance.initializeCompute(
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
            computeData.algorithmDDO.services[algorithmService].datatokenAddress,
            currentAccount,
            computeEnv.consumerAddress,
            0
        );

        console.log({ algo });

        for (let i = 0; i < providerInitializeComputeResults.datasets.length; i++) {
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
    };

    return (
        <div className="bg-white rounded-md h-full overflow-y-scroll">
            <h1 className="font-light text-xl p-5 text-center">Create Compute </h1>

            <div className="grid grid-cols-2 gap-1">
                <div>
                    <h2 className="font-light text-xl p-5">Dataset</h2>
                    <label className="font-semibold p-5">Dataset DID:</label>
                    <div className="flex items-center space-x-2 p-5">
                        <input
                            type="text"
                            className="w-1/2 rounded-md border-gray-400 border-solid border-2 px-3 py-2 bg-gray-50"
                            value={computeData.datasetDID}
                            onChange={setComputeDetails}
                            name="datasetDID"
                            disabled={computeData.confirmDatasetDID}
                            placeholder="Enter dataset DID"
                        />
                        {computeData.datasetDID === "" ? (
                            ""
                        ) : (
                            <button
                                onClick={() => {
                                    console.log(computeData.confirmDatasetDID);
                                    setComputeData({
                                        ...computeData,
                                        confirmDatasetDID: !computeData.confirmDatasetDID,
                                    });
                                }}
                                className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none"
                            >
                                {computeData.confirmDatasetDID ? <AiFillCheckSquare /> : <AiOutlineCheckSquare />}
                            </button>
                        )}
                    </div>
                    {computeData.datasetDDO === null ? (
                        ""
                    ) : (
                        <div className="mt-1">
                            <h2 className="font-light p-1">Select Service</h2>
                            {computeData.datasetDDO.services.map((service, index) => {
                                return (
                                    <div className="flex items-center mt-1">
                                        <input
                                            type="radio"
                                            name="datasetService"
                                            value={index}
                                            onChange={(e) => setDatasetService(e.target.value)}
                                            id={`service-${index}`}
                                            className="mr-2"
                                        />
                                        <label>
                                            {service.type} - {service.id} - {index}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {datasetService === null ? (
                        ""
                    ) : (
                        <div className="p-1">
                            <p>
                                Service Datatoken: {computeData.datasetDDO.datatokens[datasetService].name} (
                                {computeData.datasetDDO.datatokens[datasetService].symbol}) Balance: {datasetBalance}
                            </p>
                        </div>
                    )}
                </div>

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
                                    console.log(computeData.confirmAlgorithmDID);
                                    setComputeData({
                                        ...computeData,
                                        confirmAlgorithmDID: !computeData.confirmAlgorithmDID,
                                    });
                                }}
                                className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none"
                            >
                                {computeData.confirmAlgorithmDID ? <AiFillCheckSquare /> : <AiOutlineCheckSquare />}
                            </button>
                        )}
                    </div>

                    {computeData.algorithmDDO === null ? (
                        ""
                    ) : (
                        <div className="mt-1">
                            <h2 className="font-light p-1">Select Service</h2>
                            {computeData.algorithmDDO.services.map((service, index) => {
                                return (
                                    <div className="flex items-center mt-1">
                                        <input
                                            type="radio"
                                            name="algorithmService"
                                            value={index}
                                            onChange={(e) => setAlgorithmService(e.target.value)}
                                            id={`service-${index}`}
                                            className="mr-2"
                                        />
                                        <label>
                                            {service.type} - {service.id} - {index}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {algorithmService === null ? (
                        ""
                    ) : (
                        <div>
                            <p>
                                Service Datatoken: {computeData.algorithmDDO.datatokens[algorithmService].name} (
                                {computeData.algorithmDDO.datatokens[algorithmService].symbol}) Balance:{" "}
                                {algorithmBalance}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {datasetBalance > 0 && algorithmBalance > 0 ? (
                <div className="flex justify-center mt-1">
                    <button
                        className="bg-purple-700 items-center mt-6 hover:bg-purple-800 text-white  py-2 px-4 rounded w-1/7"
                        onClick={createCompute}
                    >
                        Create Compute
                    </button>
                </div>
            ) : computeData.datasetDDO !== null &&
              computeData.algorithmDDO !== null &&
              datasetService !== null &&
              algorithmService != null ? (
                <p className="mt-8 text-center font-bold">Insufficient Balance</p>
            ) : (
                ""
            )}
        </div>
    );
};

export default CreateCompute;
