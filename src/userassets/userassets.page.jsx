import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { MoonLoader } from "react-spinners";
import { MdClear } from "react-icons/md";
import { AccountContext, OceanConfigContext } from "../App";
import AssetCard from "../marketplace/asset-card.component";
import { NavLink } from "react-router-dom";

const UserAssetsPage = () => {
    const [dids, setDids] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { oceanConfig } = useContext(OceanConfigContext);
    const { currentAccount, setCurrentAccount } = useContext(AccountContext);

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
        setIsLoading(true);
        console.log(oceanConfig);
        post_body.query.bool.filter[1].terms.chainId = [oceanConfig.chainId];

        post_body.query.bool.must = [
            {
                match: {
                    "nft.owner": currentAccount,
                },
            },
        ];

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
    }, []);
    return (
        <div className="bg-white rounded-md h-full overflow-y-scroll">
            {" "}
            <h1 className="font-light text-xl p-5 text-center">Profile</h1>
            <h1>Assets</h1>
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
    );
};

export default UserAssetsPage;
