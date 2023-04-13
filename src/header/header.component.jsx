import { useContext } from "react";
import { AccountContext, OceanConfigContext } from "../App";
import Web3 from "web3";
import { toast } from "react-toastify";

const Header = () => {
    const { currentAccount, setCurrentAccount } = useContext(AccountContext);
    const { oceanConfig } = useContext(OceanConfigContext);

    const connectWalletHandler = async () => {
        console.log(currentAccount, setCurrentAccount, oceanConfig);
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure metamask is installed");
            return;
        } else {
            console.log("Wallet exists");
        }

        try {
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });

            console.log("Found addresses", accounts);
            setCurrentAccount(Web3.utils.toChecksumAddress(accounts[0]));

            toast.success("Wallet connected", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            ethereum.on("accountsChanged", function (accounts) {
                console.log("accountsChanged", accounts);
                setCurrentAccount(Web3.utils.toChecksumAddress(accounts[0]));
                toast.info("Wallet Address Changed", {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            });

            ethereum.on("chainChanged", function (chainId) {
                console.log("chainChanged", chainId);
            });

            ethereum.on("disconnect", function (error) {
                console.log("disconnect", error);
                setCurrentAccount(null);
            });
        } catch (err) {
            console.log(err);
        }
    };

    const disconnectWalletHandler = async () => {
        setCurrentAccount(null);

        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure metamask is installed");
            return;
        } else {
            const provider = ethereum;
            provider.diconnect();
        }
    };

    return (
        <div className="flex justify-between p-5 relative top-0 bg-white rounded-xl shadow-sm items-baseline h-10v">
            <div className="flex justify-start space-x-2 items-baseline">
                <h1 className="text-2xl font-thin">Decentralized Data Marketplace</h1>
                <h1 className="text-sm italic font-extralight">using</h1>
                <h1 className="text-base font-semibold">Ocean Protocol</h1>
            </div>
            <div>
                {" "}
                {currentAccount ? (
                    <div className="flex justify-end space-x-2 items-baseline">
                        <div className="text-base font-semibold">Connected Address:</div>
                        <div className="text-sm italic">{currentAccount} </div>
                        {/* <button
                            onClick={disconnectWalletHandler}
                            className="bg-white text-black p-1 w-40 text-base font-semibold rounded-full border-2 border-black"
                        >
                            Disconnect
                        </button> */}
                    </div>
                ) : (
                    <button
                        onClick={connectWalletHandler}
                        className="bg-gradient-to-r from-purple-500 mid to-pink-600 text-white p-1 w-40 text-base rounded-full"
                    >
                        Connect Wallet
                    </button>
                )}
            </div>
        </div>
    );
};

export default Header;
