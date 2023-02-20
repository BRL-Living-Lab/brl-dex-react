import { useContext } from "react";
import { AccountContext, OceanConfigContext } from "../App";

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
            setCurrentAccount(accounts[0]);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="flex justify-between p-5 relative top-0">
            <h1>Decentralized Data Marketplace</h1>
            {currentAccount ?? <button onClick={connectWalletHandler}>Connect Wallet</button>}
        </div>
    );
};

export default Header;
