import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AccountContext, OceanConfigContext } from "../App";
import Web3 from "web3";
import { ProviderInstance } from "@oceanprotocol/lib";
import { BsDownload } from "react-icons/bs";
import { MoonLoader } from "react-spinners";
import { toast } from "react-toastify";

const ComputeDetails = () => {
    const { currentAccount, _ } = useContext(AccountContext);
    const { oceanConfig } = useContext(OceanConfigContext);
    const { jobId } = useParams();

    const [computeJob, setComputeJob] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    const endpoint = "https://v4.provider.mumbai.oceanprotocol.com/api/services/compute/";

    useEffect(() => {
        const getDDO = async () => {
            console.log(oceanConfig);
            // const exampleMessage = "Example `personal_sign` message.";
            // let signedmessage = "";
            // try {
            //     const from = currentAccount;
            //     const msg = `0x${Buffer.from(exampleMessage, "utf8").toString("hex")}`;
            //     const sign = await window.ethereum.request({
            //         method: "personal_sign",
            //         params: [msg, from, "Example password"],
            //     });
            //     console.log(sign);
            //     signedmessage = sign;
            // } catch (err) {
            //     console.error(err);
            // }
            if (currentAccount === null)
                toast.error("Please connect wallet", {
                    position: "top-center",
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            Web3.utils.toChecksumAddress(currentAccount);
            const response = await ProviderInstance.computeStatus(
                oceanConfig.providerUri,
                Web3.utils.toChecksumAddress(currentAccount),
                jobId
            );

            console.log({ response });
            setComputeJob(response[0]);
        };

        getDDO();
    }, [currentAccount]);

    useEffect(() => {
        if (computeJob) {
            console.log({ computeJob });
            setIsLoading(false);
        }
    }, [computeJob]);

    const downloadResults = async (jobId, index, filename) => {
        console.log(jobId, index);
        const resultsURL = await ProviderInstance.getComputeResultUrl(
            oceanConfig.providerUri,
            new Web3(window.ethereum),
            Web3.utils.toChecksumAddress(currentAccount),
            jobId,
            index
        );
        console.log(resultsURL);

        const downloadResponse = await fetch(resultsURL);
        const resultsBlob = await downloadResponse.blob();
        console.log(resultsBlob);
        const url = URL.createObjectURL(resultsBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="bg-white rounded-md h-full">
            {" "}
            {isLoading ? (
                <div className="flex justify-center align-middle items-center h-80v">
                    <MoonLoader color="#000000" size={30} />
                </div>
            ) : (
                <div>
                    <h1 className="font-light text-xl p-5 text-center">Compute Job Details</h1>
                    <div className="grid grid-cols-2 gap-4 p-5">
                        <div>
                            <p className="text-gray-600 font-medium">Agreement ID:</p>
                            <p className="text-gray-800">{computeJob.agreementId}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Job ID:</p>
                            <p className="text-gray-800">{computeJob.jobId}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Owner:</p>
                            <p className="text-gray-800">{computeJob.owner}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Status:</p>
                            <p className="text-gray-800">{computeJob.statusText}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Date Created:</p>
                            <p className="text-gray-800">{Date(computeJob.dateCreated)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Date Finished:</p>
                            <p className="text-gray-800">{Date(computeJob.dateFinished)}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-600 font-medium">Results:</p>
                            {computeJob.results?.map((result, index) => (
                                <div key={index} className="flex justify-start space-x-2">
                                    <p className="text-gray-800">{result.filename}</p>
                                    <p className="text-gray-800">({result.filesize} bytes)</p>
                                    <button
                                        className=""
                                        onClick={() => downloadResults(computeJob.jobId, index, result.filename)}
                                    >
                                        <BsDownload className="text-lg" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* <div>
                            <p className="text-gray-600 font-medium">Stop Requested:</p>
                            <p className="text-gray-800">{computeJob.stopreq}</p>
                        </div> */}
                        {/* <div>
                            <p className="text-gray-600 font-medium">Removed:</p>
                            <p className="text-gray-800">{computeJob.removed}</p>
                        </div> */}
                        <div>
                            <p className="text-gray-600 font-medium">Algo DID:</p>
                            <p className="text-gray-800">{computeJob.algoDID}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-600 font-medium">Dateset DIDs:</p>
                            {computeJob.inputDID.map((input, index) => (
                                <p key={index} className="text-gray-800">
                                    {input}
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-center p-5"></div>
                </div>
            )}
        </div>
    );
};

export default ComputeDetails;
