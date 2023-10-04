
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DataRequestsPage = ({ dataRequests }) => {
    const [dataRequest, setDataRequests] = React.useState([]);
    const history = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/dataRequests`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => setDataRequests(data))
            .catch(error => console.error('Fetch Error:', error));
    }, []);

    
    useEffect(() => {
        if (dataRequest === null) {
            return <div>Loading...</div>;
        }
    }, [dataRequest]);

    const handleCreateDataClick = (dataRequestObj) => {
        history('/publish', { state: { dataRequestId: dataRequestObj._id, isLinkedToRequestAsset: "true" } });
    };
    const handleCardClick = (dataRequestObj) => {
        history(`/assetRequestDetail/${dataRequestObj._id}`);
    };

    return (
        <div className="container px-4">
            <h1 className="text-2xl font-bold mb-4">Data Asset Request List</h1>
          {dataRequest.map((dataRequest, index) => (
            <li key={index} className="flex justify-between gap-x-6 py-5 border-b border-gray-200 bg-gray-100 hover:bg-gray-200 cursor-pointer" onClick={() => handleCardClick(dataRequest)}>
              <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-gray-900">{index + 1}. {dataRequest.title}</p>
                  <p className="mt-1 truncate text-xs leading-5 text-gray-500">{dataRequest.description}</p>
                </div>
              </div>
              <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                <button onClick={(e) => {e.stopPropagation(); handleCreateDataClick(dataRequest);}} className="text-sm leading-6 text-white bg-blue-500 px-4 py-2 rounded">
                  Create Asset
                </button>
              </div>
            </li>
          ))}
        </div>
      );
};

export default DataRequestsPage;