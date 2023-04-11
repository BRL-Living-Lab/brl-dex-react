import { ProviderInstance, signHash } from "@oceanprotocol/lib";
import axios from "axios";
import { AccountContext, OceanConfigContext } from "../App";
import { useContext, useEffect, useState } from "react";
import Web3 from "web3";

const StatusPage = () => {
    const { oceanConfig } = useContext(OceanConfigContext);
    const { currentAccount, _ } = useContext(AccountContext);

    const [isLoading, setIsLoading] = useState(true);

    const endpoint = "https://v4.provider.mumbai.oceanprotocol.com/api/services/compute/";

    useEffect(() => {
        const getDDO = async () => {
            console.log(oceanConfig);
            // const exampleMessage = "Example `personal_sign` message.";
            // let signedmessage = "";
            // try {
            //     const from = currentAccount;
            //     const msg = `0x${Buffer.from(exampleMessage, "utf8").toString("hex")}`;
            //     const sign = await window.ethereum.request({
            //         method: "personal_sign",
            //         params: [msg, from, "Example password"],
            //     });
            //     console.log(sign);
            //     signedmessage = sign;
            // } catch (err) {
            //     console.error(err);
            // }
            Web3.utils.toChecksumAddress(currentAccount);
            const response = await ProviderInstance.computeStatus(
                oceanConfig.providerUri,
                Web3.utils.toChecksumAddress(currentAccount)
            );

            console.log(response);
        };

        getDDO();
    }, []);
    return (
        <div>
            <p>Compute Status</p>
            {isLoading ? <p>Loading...</p> : <div></div>}
        </div>
    );
};

export default StatusPage;
