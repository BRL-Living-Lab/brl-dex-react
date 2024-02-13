import { ProviderInstance, signHash } from "@oceanprotocol/lib";
import axios from "axios";
import { AccountContext, OceanConfigContext } from "../App";
import { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import ComputeCard from "../compute/computeCard.component";
import { NavLink } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { toast } from "react-toastify";

const MyFMLComputesPage = () => {
    const { oceanConfig } = useContext(OceanConfigContext);
    const [computeJobs, setComputeJobs] = useState(null);
    const { currentAccount, _ } = useContext(AccountContext);

    const [isLoading, setIsLoading] = useState(true);

    const endpoint =
        "https://v4.provider.mumbai.oceanprotocol.com/api/services/compute/";

    useEffect(() => {
        const getDDO = async () => {
            if (currentAccount === null) {
                toast.error("Please connect wallet", {
                    position: "top-center",
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                return;
            }

            let fmlRequestsList = [];

            let fmlRequests = await axios.get(
                `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/fmlRequests/`,
                {
                    params: {
                        userAddress: currentAccount,
                    },
                }
            );

            console.log({ fmlRequests });

            for (let i = 0; i < fmlRequests.data.length; i++) {
                let fmlRequest = fmlRequests.data[i];
                let fmlRequestObj = {};
                fmlRequestObj.requestId = fmlRequest._id;
                fmlRequestObj.fmlComputeJobs = [];

                for (let i = 0; i < fmlRequest.jobIds.length; i++) {
                    let jobId = fmlRequest.jobIds[i];
                    try {
                        const fmlComputeDetails = await axios.get(
                            `https://v4.provider.mumbai.oceanprotocol.com/api/services/compute`,
                            {
                                params: {
                                    jobId: jobId,
                                    consumerAddress: currentAccount,
                                },
                            }
                        );

                        // console.log({ fmlComputeDetails });
                        if (fmlComputeDetails.data.length > 0)
                            fmlRequestObj.fmlComputeJobs.push(
                                fmlComputeDetails.data[0]
                            );
                    } catch (error) {
                        // console.log(error);
                    }
                }
                fmlRequestsList.push(fmlRequestObj);
            }
            setComputeJobs(fmlRequestsList);

            // const response = await ProviderInstance.computeStatus(
            //     oceanConfig.providerUri,
            //     Web3.utils.toChecksumAddress(currentAccount)
            // );

            // console.log({ response });
            // setComputeJobs(response);
        };

        getDDO();
    }, [currentAccount]);

    useEffect(() => {
        if (computeJobs) {
            console.log("set");
            console.log({ computeJobs });
            setIsLoading(false);
        }
    }, [computeJobs, currentAccount]);
    return (
        <div className="bg-white rounded-md h-full overflow-y-scroll">
            <h1 className="font-light text-xl p-5 text-center">
                FML Compute Status
            </h1>
            {isLoading ? (
                <div className="flex justify-center align-middle items-center h-80v">
                    <MoonLoader color="#000000" size={30} />
                </div>
            ) : (
                <div className="p-5">
                    {computeJobs.length > 0 ? (
                        computeJobs.map((computeJob) => {
                            return (
                                <div className="border border-gray-300 m-2 p-2">
                                    <h1>
                                        FML Request ID: {computeJob.requestId}
                                    </h1>
                                    {computeJob.fmlComputeJobs
                                        .sort(
                                            (job1, job2) =>
                                                Date(job2.created) -
                                                Date(job1.created)
                                        )
                                        .map((computeJob) => (
                                            <NavLink
                                                to={
                                                    "/computeDetails/" +
                                                    computeJob.jobId
                                                }
                                            >
                                                <ComputeCard
                                                    computeJob={computeJob}
                                                    key={computeJob.jobId}
                                                />
                                            </NavLink>
                                        ))}
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex justify-center align-middle items-center h-80v">
                            <h1 className="font-light text-xl p-5 text-center">
                                No computes found
                            </h1>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyFMLComputesPage;
