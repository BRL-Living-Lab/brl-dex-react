import { Aquarius, Datatoken } from "@oceanprotocol/lib";
import { AccountContext, OceanConfigContext } from "../App";
import { useContext, useEffect } from "react";
import Web3 from "web3";

const FMLAlgorithm = ({ computeData, setAlgorithmDetails }) => {
    const { oceanConfig } = useContext(OceanConfigContext);
    const { currentAccount, _ } = useContext(AccountContext);

    console.log(computeData.algorithm.algorithmDID);

    const getDDOs = async (did) => {
        const aquarius = new Aquarius(oceanConfig.metadataCacheUri);
        const ddo = await aquarius.resolve(computeData.algorithm.algorithmDID);
        setAlgorithmDetails({ target: { name: "algorithmDDO", value: ddo } });
    };

    const getBalance = async () => {
        const datatoken = new Datatoken(new Web3(window.ethereum));
        const balance = await datatoken.balance(
            computeData.algorithm.algorithmDDO.datatokens[0].address,
            currentAccount
        );

        setAlgorithmDetails({
            target: { name: `algorithmBalance`, value: balance },
        });
    };

    useEffect(() => {
        if (computeData.algorithm.algorithmService !== null)
            getBalance("algorithmDDO");
    }, [computeData.algorithm.algorithmService]);
    return (
        <div>
            <div>
                <h2 className="font-light text-xl text p-5">Algorithm</h2>

                <label className="font-semibold p-5">Algorithm DID:</label>
                <div className="flex items-center space-x-2 p-5">
                    <input
                        type="text"
                        className="w-1/2 rounded-md border-gray-400 border-solid border-2 px-3 py-2 bg-gray-50"
                        value={computeData.algorithm.algorithmDID}
                        onChange={setAlgorithmDetails}
                        name="algorithmDID"
                        placeholder="Enter Algorithm DID"
                    />
                    {computeData.algorithm.algorithmDID === "" ? (
                        ""
                    ) : (
                        <button
                            onClick={() => {
                                console.log(computeData.algorithm);
                                getDDOs(computeData.algorithm.algorithmDID);
                            }}
                            className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none"
                        >
                            {" "}
                            Get DDO
                        </button>
                    )}
                </div>

                {computeData.algorithm.algorithmDDO === null ? (
                    ""
                ) : (
                    <div className="mt-1">
                        <h2 className="font-light p-1">Select Service</h2>
                        {computeData.algorithm.algorithmDDO.services.map(
                            (service, index) => {
                                return (
                                    <div className="flex items-center mt-1">
                                        <input
                                            type="radio"
                                            name="algorithmService"
                                            value={index}
                                            onChange={(e) =>
                                                setAlgorithmDetails(e)
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
                {computeData.algorithm.algorithmService === null ? (
                    ""
                ) : (
                    <div>
                        <p>
                            Service Datatoken:{" "}
                            {
                                computeData.algorithm.algorithmDDO.datatokens[
                                    computeData.algorithm.algorithmService
                                ].name
                            }{" "}
                            (
                            {
                                computeData.algorithm.algorithmDDO.datatokens[
                                    computeData.algorithm.algorithmService
                                ].symbol
                            }
                            ) Balance: {computeData.algorithm.algorithmBalance}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FMLAlgorithm;
