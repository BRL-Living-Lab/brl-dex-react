import { Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./header/header.component";
import Sidebar from "./sidebar/sidebar.component";
import MarketplacePage from "./marketplace/marketplace.page";
import PublishPage from "./publish/publish.page";
import LabPage from "./lab/lab.page";
import { createContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ConfigHelper } from "@oceanprotocol/lib";
import AssetPage from "./asset/asset.page";
import AssetEdit from "./asset/assetEdit.page"

let oceanConfig = new ConfigHelper().getConfig(process.env.REACT_APP_OCEAN_NETWORK);

export const AccountContext = createContext();
export const OceanConfigContext = createContext(oceanConfig);

const queryClient = new QueryClient();

function App() {
    const [currentAccount, setCurrentAccount] = useState(null);

    return (
        <div>
            <AccountContext.Provider value={{ currentAccount, setCurrentAccount }}>
                <OceanConfigContext.Provider value={{ oceanConfig }}>
                    <QueryClientProvider client={queryClient}>
                        <Header />
                        <div className="flex">
                            <div className="w-1/6">
                                <Sidebar />
                            </div>
                            <div className="w-5/6">
                                <Routes>
                                    <Route path="/" exact element={<MarketplacePage />}></Route>
                                    <Route path="publish" element={<PublishPage />}></Route>
                                    <Route path="lab" element={<LabPage />}></Route>
                                    <Route path="asset/:id" element={<AssetPage />}></Route>
                                    <Route path="assetEdit/:id" element={<AssetEdit />}></Route>
                                </Routes>
                            </div>
                        </div>
                    </QueryClientProvider>
                </OceanConfigContext.Provider>
            </AccountContext.Provider>
        </div>
    );
}

export default App;
