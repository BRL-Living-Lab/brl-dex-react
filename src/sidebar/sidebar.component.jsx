import { NavLink, Outlet } from "react-router-dom";
import SidebarItem from "./sidebar-item.component";

const Sidebar = () => {
    return (
        <div className="flex flex-col justify-start text-left h-full bg-white shadow-lg rounded-lg items-center pt-5">
            <SidebarItem to="/" text="Marketplace" />
            <SidebarItem to="publish" text="Publish Assets" />
            <SidebarItem to="lab" text="Initialize Compute" />
            <SidebarItem to="lab" text="My Computes" />
            <SidebarItem to="lab" text="Federated Learning" />
        </div>
    );
};

export default Sidebar;
