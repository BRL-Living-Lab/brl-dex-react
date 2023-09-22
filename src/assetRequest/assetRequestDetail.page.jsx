import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

const AssetRequestDetailPage = () => {
    const [dataRequest, setDataRequest] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        fetch(`http://localhost:3000/api/dataRequests/${id}`)
            .then(response => response.json())
            .then(data => setDataRequest(data))
            .catch(error => console.error(error));
    }, [id]);

    if (!dataRequest) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div></div>;
    }

    return (

        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-4xl m-4">
            <div className="md:flex">
                <div className="p-8">
                    <label className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Status:</label>
                    <button className={`mt-2 uppercase tracking-wide text-sm font-semibold py-2 px-4 rounded ${dataRequest.status === 'open' ? 'bg-green-500' : 'bg-brown-500'}`}>
                        {dataRequest.status}
                    </button>
                    <br></br>
                    <label className="mt-2 uppercase tracking-wide text-sm text-indigo-500 font-semibold">Description:</label>
                    <p>{dataRequest.description}</p>
                    <label className="mt-4 uppercase tracking-wide text-sm text-indigo-500 font-semibold">Schema:</label>
                    <JSONInput
                        id='a_unique_id'
                        viewOnly
                        placeholder={JSON.parse(dataRequest.schema)}
                        locale={locale}
                        height='550px'
                        width='130%'
                    />
                    <label className="mt-2 uppercase tracking-wide text-sm text-indigo-500 font-semibold">Instructions:</label>
                    <p>{dataRequest.instructions}</p>
                    <label className="mt-4 uppercase tracking-wide text-sm text-indigo-500 font-semibold">Asset Addresses:</label>
                    {dataRequest.assetAddress && dataRequest.assetAddress.length > 0 ? (
                        <ul className="list-disc list-inside">
                            {dataRequest.assetAddress.map((address, index) => (
                                <li key={index} className="text-gray-500">
                                    <Link to={`/asset/${address}`}>{address}</Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-2 text-gray-500">No assets available for this request</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetRequestDetailPage;