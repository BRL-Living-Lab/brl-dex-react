import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const AssetPage = () => {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [ddo, setDdo] = useState(null);

    const endpoint = "https://v4.aquarius.oceanprotocol.com/api/aquarius/assets/ddo/";

    useEffect(() => {
        const getDDO = async () => {
            const response = await axios.get(endpoint + id);
            setDdo(response.data);
        };
        getDDO();
    }, []);

    useEffect(() => {
        if (ddo) setIsLoading(false);
    }, [ddo]);

    return <div>{isLoading ? <p>Loading</p> : <div>Asset DDO: {JSON.stringify(ddo)}</div>}</div>;
};

export default AssetPage;
