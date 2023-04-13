import axios from "axios";
import { useEffect, useState } from "react";
import { MoonLoader } from "react-spinners";

const ComputeCard = ({ computeJob }) => {
    const [algoDDO, setAlgoDDO] = useState(null);
    const [datasetDDO, setDatasetDDO] = useState(null);
    const [tokens, setTokens] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const endpoint = "https://v4.aquarius.oceanprotocol.com/api/aquarius/assets/ddo/";
    const GET_TOKEN_MINTER = `
    query ($id: ID!) {
        token(id: $id) {
            id
            symbol
            name
            nft {
                id
            }
            address
            minter
        }
    }
`;

    useEffect(() => {
        const getDDO = async () => {
            const response1 = await axios.get(endpoint + computeJob.algoDID);
            console.log(response1.data);
            const response2 = await axios.get(endpoint + computeJob.inputDID[0]);
            console.log(response2.data);

            // for (let i = 0; i < response1.data.datatokens.length; i++) {
            //     const response2 = await axios.post(
            //         "https://v4.subgraph.mumbai.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph",
            //         {
            //             query: GET_TOKEN_MINTER,
            //             variables: { id: response1.data.datatokens[i].address.toLowerCase() },
            //         }
            //     );
            //     console.log(response2.data.data.token.address);
            //     setTokens((tokens) => ({ ...tokens, [response2.data.data.token.address]: response2.data.data.token }));
            //     console.log(tokens);
            // }
            setAlgoDDO(response1.data);
            setDatasetDDO(response2.data);
        };
        getDDO();
    }, []);

    useEffect(() => {
        if (algoDDO && datasetDDO) {
            setIsLoading(false);
        }
    }, [algoDDO, datasetDDO]);
    return (
        <div className="w-full border-b border-t p-5">
            {isLoading ? (
                <div className="flex justify-center align-middle items-center h-80v">
                    <MoonLoader color="#000000" size={30} />
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center ">
                        <div>
                            <div>
                                <label className="text-base font-semibold">Algorithm:</label> {algoDDO.metadata.name}
                            </div>
                            <div>
                                <label className="text-base font-semibold">Dataset:</label> {datasetDDO.metadata.name}
                            </div>
                            <div>
                                {" "}
                                <label className="text-base font-semibold">Created:</label>{" "}
                                {new Date(Date(computeJob.dateCreated)).toDateString() +
                                    " " +
                                    new Date(Date(computeJob.dateCreated)).toLocaleTimeString()}
                            </div>
                            <div>
                                {" "}
                                <label className="text-base font-semibold">Finished:</label>{" "}
                                {new Date(Date(computeJob.dateFinished)).toDateString() +
                                    " " +
                                    new Date(Date(computeJob.dateFinished)).toLocaleTimeString()}
                            </div>
                        </div>
                        <div className="w-1/7 text-center bg-gray-200 p-5">
                            <div className="text-xl">{computeJob.status}</div>
                            <div className="text-sm italic">{computeJob.statusText}</div>
                        </div>
                    </div>
                    <br />

                    <div className="text-sm">
                        <label>Job ID:</label> <span className="italic">{computeJob.jobId} </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComputeCard;
