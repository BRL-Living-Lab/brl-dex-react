import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const MarketplacePage = () => {
    const [dids, setDids] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const endpoint = "https://v4.aquarius.oceanprotocol.com/api/aquarius/assets/query";
    const post_body = {
        from: 0,
        size: 10,
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
                            chainId: [5],
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
            "nft.created": "desc",
        },
    };

    useEffect(() => {
        try {
            const getDids = async () => {
                const response = await axios.post(endpoint, post_body);
                setDids(response.data.hits.hits.map((data) => data._source));
            };

            getDids();
        } catch (error) {
            setError(error);
        }
    }, []);

    useEffect(() => {
        if (dids) {
            console.log(dids);
            setIsLoading(false);
        }
    }, [dids]);

    return (
        <div>
            {isLoading ? (
                <p>Loading</p>
            ) : (
                <div>
                    {dids.map((did) => (
                        <div key={did.id} className="w-1/4 inline-block border p-2">
                            Symbol: {did.nft.symbol} <br />
                            Name: {did.nft.name} <br />
                            Address: {did.nft.address}
                            <br />
                            Created: {did.nft.created}
                            <br />
                            Owner: {did.nft.owner}
                            <br />
                            Services:{" "}
                            {did.services.map((service) => (
                                <span key={service.datatokenAddress}>{service.type},</span>
                            ))}
                            <br />
                            <button>
                                <NavLink to={"/asset/" + did.id}>Go to Asset</NavLink>
                            </button>
                            <br />
                            <br />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MarketplacePage;
