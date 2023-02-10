import { NavLink, Outlet } from "react-router-dom";

const Sidebar = () => {
    return (
        <div>
            <div className="flex justify-start w-1/6 text-left p-5 space-x-2">
                <NavLink to="/">Marketplace</NavLink> <NavLink to="publish">Publish</NavLink>{" "}
                <NavLink to="lab">Lab</NavLink>
                <Outlet />
            </div>
        </div>
    );
};

export default Sidebar;
