import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import JSONInput from "react-json-editor-ajrm";
import locale from "react-json-editor-ajrm/locale/en";
import ReactJson from "react-json-view";

const AssetRequestDetailPage = () => {
    const [dataRequest, setDataRequest] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        fetch(
            `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/dataRequests/${id}`
        )
            .then((response) => response.json())
            .then((data) => setDataRequest(data))
            .catch((error) => console.error(error));
    }, [id]);

    if (!dataRequest) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="rounded-md h-full overflow-y-scroll">
            <div className="grid grid-cols-3 items-start space-y-2 sm:space-y-0 sm:space-x-2 pl-4 pr-4">
                <label className="col-span-1 uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                    Title:
                </label>
                <div className="col-span-2">
                    <p>{dataRequest.title}</p>
                </div>
            </div>
            <div className="grid grid-cols-3 items-start space-y-2 sm:space-y-0 sm:space-x-2 pl-4 pr-4">
                <label className="col-span-1 uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                    Status:
                </label>
                <div className="col-span-2">
                    <button
                        className={`mt-2 uppercase tracking-wide text-sm font-semibold py-2 px-4 rounded ${
                            dataRequest.status === "open"
                                ? "bg-green-500"
                                : "bg-brown-500"
                        }`}
                    >
                        {dataRequest.status}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-3 items-start space-y-2 sm:space-y-0 sm:space-x-2 pl-4 pr-4">
                <label className="col-span-1 uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                    Description:
                </label>
                <div className="col-span-2">
                    <p>{dataRequest.description}</p>
                </div>
            </div>

            {dataRequest.schema &&
                dataRequest.schema.trim() !== "" &&
                Object.keys(JSON.parse(dataRequest.schema)).length !== 0 && (
                    <div className="grid grid-cols-3 items-start space-y-2 sm:space-y-0 sm:space-x-2 mt-4 pl-4 pr-4">
                        <label className="col-span-1 uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                            Schema:
                        </label>
                        <div className="col-span-2">
                            <ReactJson
                                src={JSON.parse(dataRequest.schema)}
                                style={{
                                    padding: "30px",
                                    width: "100%",
                                    border: "1px solid lightgray",
                                }}
                                theme="yeti"
                                collapsed
                            />
                        </div>
                    </div>
                )}

            <div className="grid grid-cols-3 items-start space-y-2 sm:space-y-0 sm:space-x-2 mt-4 pl-4 pr-4">
                <label className="col-span-1 uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                    Instructions:
                </label>
                <div className="col-span-2">
                    <p>{dataRequest.instructions}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 items-start space-y-2 sm:space-y-0 sm:space-x-2 mt-4 pl-4 pr-4">
                <label className="col-span-1 uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                    Asset Addresses:
                </label>
                <div className="col-span-2">
                    {dataRequest.assetAddress &&
                    dataRequest.assetAddress.length > 0 ? (
                        <ul className="list-disc list-inside">
                            {dataRequest.assetAddress.map((address, index) => (
                                <li key={index} className="text-gray-500">
                                    <Link to={`/asset/${address}`}>
                                        {address}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-2 text-gray-500">
                            No assets available for this request
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetRequestDetailPage;
