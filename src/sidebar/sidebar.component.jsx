import { NavLink, Outlet } from "react-router-dom";
import SidebarItem from "./sidebar-item.component";

const Sidebar = () => {
    return (
        <div className="h-full flex flex-col justify-between bg-white shadow-lg rounded-lg items-center pt-5">
            <div className="flex flex-col justify-start text-left w-full ">
                <SidebarItem to="/" text="Marketplace" />
                <SidebarItem to="publish" text="Publish Assets" />
                <SidebarItem to="request" text="Request Asset Form" />
                <SidebarItem to="dataRequests" text="Request Assets" />
                <SidebarItem to="createCompute" text="New Compute Job" />
                <SidebarItem to="computeStatus" text="Compute Status" />
                <SidebarItem to="fml" text="Federated Learning" />
                <SidebarItem to="fmlStatus" text="My FML Computes" />
            </div>
            <div className="flex flex-col justify-start text-left w-full mb-5">
                <SidebarItem to="profile" text="Profile" />
            </div>
        </div>
    );
};

export default Sidebar;
