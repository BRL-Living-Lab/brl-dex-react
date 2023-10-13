import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AccountContext, OceanConfigContext } from "../App";
import AssetCard from "./asset-card.component";
import { MoonLoader } from "react-spinners";


const MarketplacePage = () => {
    const [dids, setDids] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [useNextButton, setUseNextButton] = useState(true);
    const [usePrevButton, setUsePrevButton] = useState(false);
    const [pageFrom, setPageFrom] = useState(0);
    const { oceanConfig } = useContext(OceanConfigContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [showUserAssets, setShowUserAssets] = useState(false);
    const { currentAccount, setCurrentAccount } = useContext(AccountContext);

    const endpoint = "https://v4.aquarius.oceanprotocol.com/api/aquarius/assets/query";
    const post_body = {
        from: 0,
        size: 12,
        query: {
            bool: {
                filter: [
                    {
                        term: {
                            _index: "aquarius",
                        },
                    },
                    {
                        terms: {
                            chainId: [80001],
                        },
                    },
                    {
                        term: {
                            "purgatory.state": false,
                        },
                    },
                    {
                        terms: {
                            "services.type": ["access", "compute", "metadata"],
                        },
                    },
                ],
            },
        },
        sort: {
            "metadata.created": {
                "order": "desc"
              }
        },
    };

    const getDids = async (from) => {
        console.log(oceanConfig);
        post_body.query.bool.filter[1].terms.chainId = [oceanConfig.chainId];

        // check if there is a search query
        if (searchQuery) {
            post_body.query.bool.filter.push({
                query_string: {
                    default_field: "metadata.name",
                    query: `"${searchQuery}"`,
                },
            });
        }

        // check if there is a filter type
        if (filterType) {
            post_body.query.bool.filter.push({
                term: {
                    "metadata.type": filterType,
                },
            });
        }
        console.log(filterType);
        const response = await axios.post(endpoint, { ...post_body, from });

        setDids(response.data.hits.hits.map((data) => data._source));
    };   

    useEffect(() => {
        try {
            getDids();
        } catch (error) {
            setError(error);
        }
    }, []);

    useEffect(() => {
        if (dids) {
            console.log({ dids });
            setIsLoading(false);
        }
    }, [dids]);
    // update search query and filter from user input
    useEffect(() => {
    try {
        getDids();
    } catch (error) {
        setError(error);
    }
    }, [searchQuery, filterType]);

    const nextButtonClick = (pageFrom) => {
        setIsLoading(true);
        getDids(pageFrom);
        setPageFrom(pageFrom);
        if (pageFrom > 0) setUsePrevButton(true);
    };

    const prevButtonClick = (pageFrom) => {
        setIsLoading(true);
        getDids(pageFrom);
        setPageFrom(pageFrom);
        if (pageFrom <= 0) setUsePrevButton(false);
    };

    const handleShowUserAssetsChange = () => {
        setShowUserAssets(!showUserAssets);
    };

    const filteredDids = showUserAssets
        ? dids.filter((did) => did.nft.owner === currentAccount )
        : dids;

    return (
        <div>
            {isLoading ? (
                <div className="flex justify-center align-middle items-center h-80v">
                    <MoonLoader color="#000000" size={30} />
                </div>
            ) : (
                // </div>
                <div>
                    <div className="grid grid-cols-3 gap-x-4">
                        <input
                            type="text"
                            className="border p-2 m-2 rounded-md col-span-2 row-span-2"
                            placeholder="Search for assets..."s
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="flex items-center">
                            <label>
                                <input
                                type="checkbox"
                                checked={showUserAssets}
                                onChange={handleShowUserAssetsChange}
                            />
                                <span className="ml-2">Show My Assets</span>
                            </label>
                            <select 
                                value={filterType} 
                                onChange={(e) => setFilterType(e.target.value)}
                                className="border p-2 m-2 rounded-md"
                            >
                                <option value="">Assest Type</option>
                                <option value="algorithm">algorithm</option>
                                <option value="dataset">dataset</option>
                            </select>
                        </div>

                    

                    </div>

                    <div className="grid grid-cols-3 gap-x-4">
                        {filteredDids.map((did) => (
                            <NavLink to={"/asset/" + did.id}>
                                <AssetCard key={did.id} did={did} />
                            </NavLink>
                            // <div key={did.id} className="border p-2 m-2">
                            //     Symbol: {did.nft.symbol} <br />
                            //     Name: {did.nft.name} <br />
                            //     Address: <span className="text-sm">{did.nft.address}</span>
                            //     <br />
                            //     Created: {did.nft.created}
                            //     <br />
                            //     Owner: <span className="text-sm">{did.nft.owner}</span>
                            //     <br />
                            //     Type: <span>{did.metadata.type}</span>
                            //     <br />
                            //     Services:{" "}
                            //     {did.services.map((service) => (
                            //         <span key={service.datatokenAddress}>{service.type + " "} </span>
                            //     ))}
                            //     <br />
                            //     <div className="w-full items-center text-center">
                            //         <button className="items-center">
                            //             <NavLink to={"/asset/" + did.id}>Go to Asset</NavLink>
                            //         </button>
                            //     </div>
                            // </div>
                        ))}
                    </div>
                    <div className="w-full flex justify-center gap-5">
                        <button disabled={!usePrevButton} onClick={() => prevButtonClick(pageFrom - 9)}>
                            Prev
                        </button>
                        <button disabled={!useNextButton} onClick={() => nextButtonClick(pageFrom + 9)}>
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketplacePage;
