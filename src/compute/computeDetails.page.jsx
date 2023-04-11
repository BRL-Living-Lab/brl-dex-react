import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AccountContext, OceanConfigContext } from "../App";
import Web3 from "web3";
import { ProviderInstance } from "@oceanprotocol/lib";

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

    return (
        <div>
            <div className="bg-white rounded-md shadow-md">
                <h2 className="font-light text-xl p-5 text-center">Compute Job Details</h2>
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 p-4">
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
                            {computeJob.results.map((result, index) => (
                                <div key={index} className="flex justify-start space-x-2">
                                    <p className="text-gray-800">{result.filename}</p>
                                    <p className="text-gray-800">({result.filesize} bytes)</p>
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
                            <p className="text-gray-600 font-medium">Input DID:</p>
                            {computeJob.inputDID.map((input, index) => (
                                <p key={index} className="text-gray-800">
                                    {input}
                                </p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComputeDetails;
