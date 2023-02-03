import axios from "axios";
import { useNavigate , useHistory} from 'react-router-dom';
import { useEffect, useState } from "react";

const MarketplacePage = () => {
    const navigate = useNavigate();
    // const history = useHistory();
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

    const navToAsset= (event) => {
        // event.data
        const nft_id = event.target.parentElement.parentElement.id;
        navigate('asset', { state: { id:nft_id }});
    };

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
                <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {nfts.map((nft) => (

                        <div id={nft.id} class="card text-black block p-6 rounded-lg shadow-lg bg-white max-w-sm">
                            <div class="card-header">{nft.symbol}</div>
                            <div class="card-body">
                                <div class="text-center">
                                    <h6 class="card-title" >{nft.name}</h6>
                                </div>
                                <div class="d-flex justify-content-between truncate">
                                    <span>Address </span><span>{nft.address}</span>
                                </div>
                                <div class="d-flex justify-content-between truncate">
                                    <span>Creator </span><span>{nft.creator.id}</span>
                                </div>
                                <div class="d-flex justify-content-between truncate">
                                    <span>Owner </span><span>{nft.owner.id}</span>

                                </div>
                                <button onClick={navToAsset} type="button" class=" inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">Buy</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MarketplacePage;
