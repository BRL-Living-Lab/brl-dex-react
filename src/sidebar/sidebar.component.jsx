import { NavLink, Outlet } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="flex flex-col justify-start text-left p-5 h-full">
            <NavLink to="/">Marketplace</NavLink>
            <NavLink to="publish">Publish</NavLink>
            <NavLink to="lab">Lab</NavLink>
        </div>
    );
};

export default Sidebar;
