import axios from "axios";
import { useEffect, useState } from "react";

const MarketplacePage = () => {
    const [nfts, setNfts] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const endpoint = "https://v4.subgraph.goerli.oceanprotocol.com/subgraphs/name/oceanprotocol/ocean-subgraph";
    const NFTs_QUERY = `
        {
            nfts(first: 10, orderBy: createdTimestamp, orderDirection: desc) {
                id
                symbol
                name
                address
                owner {
                    id
                }
                creator {
                    id
                }
                providerUrl
            }
        }
    `;

    useEffect(() => {
        try {
            const getNfts = async () => {
                const response = await axios.post(endpoint, { query: NFTs_QUERY });
                setNfts(response.data.data.nfts);
            };

            getNfts();
        } catch (error) {
            setError(error);
        }
    }, []);

    useEffect(() => {
        if (nfts) {
            setIsLoading(false);
        }
    }, [nfts]);

    return (
        <div>
            {isLoading ? (
                <p>Loading</p>
            ) : (
                <div className="float-right">
                    {nfts.map((nft) => (
                        <div key={nft.id} className="w-1/4 inline-block">
                            Symbol: {nft.symbol} <br />
                            Name: {nft.name} <br />
                            Address: {nft.address}
                            <br />
                            Creator: {nft.creator.id}
                            <br />
                            Owner: {nft.owner.id}
                            <br />
                            ProviderURL: {nft.providerUrl}
                            <br />
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
