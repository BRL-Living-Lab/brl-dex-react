import { NavLink, Outlet } from "react-router-dom";

const Sidebar = () => {
    return (
        <div>
            <p>Sidebar Menu</p>
            <div>
                <NavLink to="/">Marketplace</NavLink> <NavLink to="publish">Publish</NavLink>{" "}
                <NavLink to="lab">Lab</NavLink>
                <Outlet />
            </div>
        </div>
    );
};

export default Sidebar;
