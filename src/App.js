import { Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./header/header.component";
import Sidebar from "./sidebar/sidebar.component";
import MarketplacePage from "./marketplace/marketplace.page";
import PublishPage from "./publish/publish.page";
import LabPage from "./lab/lab.page";
import AssetPage from "./Consume/asset.page";
import { createContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ConfigHelper } from "@oceanprotocol/lib";

let oceanConfig = new ConfigHelper().getConfig(process.env.REACT_APP_OCEAN_NETWORK);

export const AccountContext = createContext();
export const OceanConfigContext = createContext(oceanConfig);

const queryClient = new QueryClient();

function App() {
    const [currentAccount, setCurrentAccount] = useState(null);

    return (
        <div className="App">
            <AccountContext.Provider value={{ currentAccount, setCurrentAccount }}>
                <OceanConfigContext.Provider value={{ oceanConfig }}>
                    <QueryClientProvider client={queryClient}>
                        <Header />
                        <Sidebar />
                        <Routes>
                            <Route path="/" element={<MarketplacePage />}></Route>
                            <Route path="publish" element={<PublishPage />}></Route>
                            <Route path="lab" element={<LabPage />}></Route>
                            <Route path="asset" element={<AssetPage />}></Route>
                        </Routes>
                    </QueryClientProvider>
                </OceanConfigContext.Provider>
            </AccountContext.Provider>
        </div>
    );
}

export default App;
