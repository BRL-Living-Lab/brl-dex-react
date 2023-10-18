import { Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./header/header.component";
import Sidebar from "./sidebar/sidebar.component";
import MarketplacePage from "./marketplace/marketplace.page";
import PublishPage from "./publish/publish.page";
import MyComputesPage from "./compute/my-computes.page";
import { createContext, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ConfigHelper } from "@oceanprotocol/lib";
import AssetPage from "./asset/asset.page";
import DataAssetRequestForm from "./assetRequest/assetRequest.page";
import AssetRequestDetailPage from "./assetRequest/assetRequestDetail.page";
import DataRequestsPage from "./assetRequest/assetRequestList.page";
import AssetEdit from "./asset/assetEdit.page";
import CreateCompute from "./compute/create-compute.page";
import ComputeDetails from "./compute/computeDetails.page";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserAssetsPage from "./userassets/userassets.page";

let oceanConfig = new ConfigHelper().getConfig(
    process.env.REACT_APP_OCEAN_NETWORK
);
oceanConfig.providerUri = "https://v4.provider.mumbai.oceanprotocol.com";

export const AccountContext = createContext({
    currentAccount: null,
    setCurrentAccount: () => {},
});
export const OceanConfigContext = createContext(oceanConfig);
export const AutomationContext = createContext({
    usingAutomation: false,
    setUsingAutomation: () => {},
});

const queryClient = new QueryClient();

function App() {
    const [currentAccount, setCurrentAccount] = useState(null);
    const [usingAutomation, setUsingAutomation] = useState(false);

    return (
        <div className="bg-gray-100">
            <AccountContext.Provider
                value={{ currentAccount, setCurrentAccount }}
            >
                <OceanConfigContext.Provider value={{ oceanConfig }}>
                    <AutomationContext.Provider
                        value={{ usingAutomation, setUsingAutomation }}
                    >
                        <QueryClientProvider client={queryClient}>
                            <Header />
                            <div className="flex h-90v">
                                <div className="w-1/8 pt-2">
                                    <Sidebar />
                                </div>
                                <div className="w-7/8 pt-2 pl-2">
                                    <Routes>
                                        <Route
                                            path="/"
                                            exact
                                            element={<MarketplacePage />}
                                        ></Route>
                                        <Route
                                            path="publish"
                                            element={<PublishPage />}
                                        ></Route>
                                        <Route
                                            path="request"
                                            element={<DataAssetRequestForm />}
                                        ></Route>
                                        <Route
                                            path="datarequests"
                                            element={<DataRequestsPage />}
                                        ></Route>
                                        <Route
                                            path="assetRequestDetail/:id"
                                            element={<AssetRequestDetailPage />}
                                        ></Route>
                                        <Route
                                            path="computeStatus"
                                            element={<MyComputesPage />}
                                        ></Route>
                                        <Route
                                            path="createCompute"
                                            element={<CreateCompute />}
                                        ></Route>
                                        <Route
                                            path="asset/:id"
                                            element={<AssetPage />}
                                        ></Route>
                                        <Route
                                            path="assetEdit/:id"
                                            element={<AssetEdit />}
                                        ></Route>
                                        <Route
                                            path="computeDetails/:jobId"
                                            element={<ComputeDetails />}
                                        ></Route>
                                        <Route
                                            path="profile"
                                            element={<UserAssetsPage />}
                                        ></Route>
                                    </Routes>
                                </div>
                            </div>
                        </QueryClientProvider>
                    </AutomationContext.Provider>
                </OceanConfigContext.Provider>
            </AccountContext.Provider>
            <ToastContainer />
        </div>
    );
}

export default App;
