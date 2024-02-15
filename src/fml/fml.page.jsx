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
import FMLAlgorithm from "./algorithm.component";
import FMLDataset from "./dataset.component";
import axios from "axios";
import { toast } from "react-toastify";
import { MoonLoader } from "react-spinners";

const FMLPage = () => {
    const { oceanConfig } = useContext(OceanConfigContext);
    const { currentAccount, _ } = useContext(AccountContext);

    const [startCompute, setStartCompute] = useState(false);

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
        algorithm: {
            algorithmDID: "",
            confirmAlgorithmDID: false,
            algorithmDDO: null,
            algorithmBalance: null,
            algorithmService: null,
        },
    });

    const setAlgorithmDetails = (e) => {
        console.log(e.target);
        const { name, value } = e.target;
        setComputeData((prevData) => ({
            ...prevData,
            algorithm: {
                ...prevData.algorithm,
                [name]: value,
            },
        }));
    };

    const setDatasetDetails = (e, index) => {
        const { name, value } = e.target;
        console.log({ name, value, index });

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
        setStartCompute(true);
        const web3 = new Web3(window.ethereum);

        // create new fml request id in the backend database using axios post request

        const fmlRequest = await axios.post(
            `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/fmlRequests`,
            {
                userAddress: currentAccount,
            }
        );

        console.log(fmlRequest);

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
            console.log({ algoddo: computeData.algorithm.algorithmDDO });
            const algo = {
                documentId: computeData.algorithm.algorithmDDO.id,
                serviceId:
                    computeData.algorithm.algorithmDDO.services[
                        computeData.algorithm.algorithmService
                    ].id,
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
                computeData.algorithm.algorithmDDO.services[0].datatokenAddress,
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
                computeData.datasets[i].datasetDDO.id
            );

            console.log("Current status of the compute job: ", jobStatus);

            let fmlRequestUpdate = await axios.put(
                `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/fmlRequests/${fmlRequest.data._id}`,
                {
                    jobId: computeJobId,
                }
            );

            console.log(fmlRequestUpdate);
            // setInitiatedJobId(jobStatus[0].jobId);
            toast.success(`Compute job for dataset:${i} created`, {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
        setStartCompute(false);
    };

    console.log(computeData);

    return (
        <div className="bg-white rounded-md h-full overflow-y-scroll">
            <h1 className="font-light text-xl p-5 text-center">
                Create FML Request
            </h1>

            <div>
                <FMLAlgorithm
                    computeData={computeData}
                    setAlgorithmDetails={setAlgorithmDetails}
                />
                <div>Add Datasets:</div>
                <div>
                    {computeData.datasets.map((dataset, index) => (
                        <FMLDataset
                            key={index}
                            computeData={computeData}
                            index={index}
                            setDatasetDetails={setDatasetDetails}
                            handleDeleteDataset={handleDeleteDataset}
                        />
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
                    disabled={startCompute}
                >
                    {startCompute ? (
                        <div className="flex items-center justify-center">
                            <MoonLoader color="#ffffff" size={30} />
                        </div>
                    ) : (
                        "Create FML Compute"
                    )}
                </button>
            </div>
        </div>
    );
};

export default FMLPage;
