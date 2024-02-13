import { Aquarius, Datatoken } from "@oceanprotocol/lib";
import { useContext } from "react";
import { AccountContext, OceanConfigContext } from "../App";
import Web3 from "web3";

const FMLDataset = ({
    computeData,
    index,
    setDatasetDetails,
    handleDeleteDataset,
}) => {
    const { oceanConfig } = useContext(OceanConfigContext);
    const { currentAccount, _ } = useContext(AccountContext);

    const getDDOs = async (index) => {
        const aquarius = new Aquarius(oceanConfig.metadataCacheUri);

        const ddo = await aquarius.resolve(
            computeData.datasets[index].datasetDID
        );
        console.log(index, ddo);
        setDatasetDetails(
            {
                target: { name: "datasetDDO", value: ddo },
            },
            index
        );

        console.log(ddo);
    };

    const getBalance = async (index) => {
        const datatoken = new Datatoken(new Web3(window.ethereum));
        const balance = await datatoken.balance(
            computeData.datasets[index].datasetDDO.datatokens[0].address,
            currentAccount
        );

        setDatasetDetails(
            {
                target: { name: `datasetBalance`, value: balance },
            },
            index
        );
    };

    console.log(computeData.datasets[index].datasetDDO);

    return (
        <div>
            <div key={index}>
                <h2 className="font-light text-xl p-5">Dataset {index + 1}</h2>
                {/* ... Other dataset fields ... */}
                <input
                    type="text"
                    className="w-1/2 rounded-md border-gray-400 border-solid border-2 px-3 py-2 bg-gray-50"
                    value={computeData.datasets[index].datasetDID}
                    onChange={(e) => setDatasetDetails(e, index)}
                    name="datasetDID"
                    placeholder={`Enter dataset ${index + 1} DID`}
                />
                {!computeData.datasets[index].datasetDID ? (
                    ""
                ) : (
                    <>
                        {computeData.datasets[index].datasetDDO ? (
                            ""
                        ) : (
                            <button
                                onClick={() => {
                                    getDDOs(index);
                                }}
                                className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none"
                            >
                                Get DDO
                            </button>
                        )}
                    </>
                )}
                {!computeData.datasets[index].datasetDDO ? (
                    ""
                ) : (
                    <div className="mt-1">
                        <h2 className="font-light p-1">Select Service</h2>
                        {computeData.datasets[index].datasetDDO.services.map(
                            (service, serviceIndex) => {
                                return (
                                    <div
                                        key={serviceIndex}
                                        className="flex items-center mt-1"
                                    >
                                        <input
                                            type="checkbox"
                                            name="datasetService"
                                            value={serviceIndex}
                                            onChange={(e) => getBalance(index)}
                                            id={`service-${index}`}
                                            className="mr-2"
                                        />
                                        <label>
                                            {service.type} - {service.id} -{" "}
                                            {serviceIndex}
                                        </label>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}
                {computeData.datasets[index].datasetDDO === null ||
                computeData.datasets[index].datasetBalance === null ? (
                    ""
                ) : (
                    <div className="p-1">
                        <p>
                            Service Datatoken:{" "}
                            {
                                computeData.datasets[index].datasetDDO
                                    .datatokens[0].name
                            }{" "}
                            (
                            {
                                computeData.datasets[index].datasetDDO
                                    .datatokens[0].symbol
                            }
                            ) Balance:{" "}
                            {computeData.datasets[index].datasetBalance}
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
        </div>
    );
};

export default FMLDataset;
