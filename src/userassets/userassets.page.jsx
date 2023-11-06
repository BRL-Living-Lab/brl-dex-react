import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { MoonLoader } from "react-spinners";
import { MdClear } from "react-icons/md";
import { AccountContext, OceanConfigContext } from "../App";
import AssetCard from "../marketplace/asset-card.component";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";

const UserAssetsPage = () => {
    const [dids, setDids] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { oceanConfig } = useContext(OceanConfigContext);
    const { currentAccount, setCurrentAccount } = useContext(AccountContext);
    const [searchQuery, setSearchQuery] = useState("");

    const endpoint =
        "https://v4.aquarius.oceanprotocol.com/api/aquarius/assets/query";

    const post_body = {
        from: 0,
        size: 1000,
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
                order: "desc",
            },
        },
    };
    const getDids = async (from) => {
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

        // setIsLoading(true);
        console.log(oceanConfig);
        post_body.query.bool.filter[1].terms.chainId = [oceanConfig.chainId];

        post_body.query.bool.must = [
            {
                match: {
                    "nft.owner": currentAccount,
                },
            },
        ];

        if (searchQuery) {
            post_body.query.bool.filter.push({
                query_string: {
                    default_field: "metadata.name",
                    query: `"${searchQuery}"`,
                },
            });
        }

        const response = await axios.post(endpoint, { ...post_body, from });

        setDids(response.data.hits.hits.map((data) => data._source));
        console.log(response.data.hits.hits.map((data) => data._source));
    };

    useEffect(() => {
        try {
            getDids();
        } catch (error) {
            setError(error);
        }
    }, [currentAccount, searchQuery]);

    useEffect(() => {
        if (dids) {
            console.log(dids);
            setIsLoading(false);
        }
    }, [dids]);
    return (
        <>
            {!isLoading ? (
                <div className="bg-white rounded-md h-full overflow-y-scroll">
                    {" "}
                    <h1 className="font-light text-xl p-5 text-center">
                        Profile
                    </h1>
                    <h1>Assets</h1>
                    <input
                        type="text"
                        className="w-full border p-2 m-2 rounded-md col-span-2 row-span-2"
                        placeholder="Search for assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="absolute right-0 top-0 m-2 p-2"
                            onClick={() => setSearchQuery("")}
                        >
                            <MdClear className="text-2xl text-gray-500" />
                        </button>
                    )}
                    
                    <div className="flex flex-row justify-center items-center overflow-x-scroll p-5 mx-5">
                        {dids &&
                            dids.map((did) => (
                                <NavLink to={"/asset/" + did.id}>
                                    <AssetCard key={did.id} did={did} />
                                </NavLink>
                            ))}
                    </div>
                    <h1>Data Requests</h1>
                </div>
            ) : (
                <div className="flex justify-center align-middle items-center h-80v">
                    <MoonLoader color="#000000" size={30} />
                </div>
            )}
        </>
    );
};

export default UserAssetsPage;
