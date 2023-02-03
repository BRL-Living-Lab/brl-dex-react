import {useLocation} from 'react-router-dom';
const AssetPage = () => {
    const location = useLocation();
    const state = location.state;
    return (
        <div>
            <p>Display Details of data NFT {state.id}</p>
        </div>

    );
};

export default AssetPage;