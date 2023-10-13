import { NavLink, Outlet } from "react-router-dom";
import SidebarItem from "./sidebar-item.component";

const Sidebar = () => {
    return (
        <div className="flex flex-col justify-start text-left h-full bg-white shadow-lg rounded-lg items-center pt-5">
            <SidebarItem to="/" text="Marketplace" />
            <SidebarItem to="publish" text="Publish Assets" />
            <SidebarItem to="userassets" text="User Assets" />
            <SidebarItem to="createCompute" text="New Compute Job" />
            <SidebarItem to="computeStatus" text="Compute Status" />
            <SidebarItem to="fml" text="Federated Learning" />
        </div>
    );
};

export default Sidebar;
