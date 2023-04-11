import { NavLink } from "react-router-dom";

const SidebarItem = ({ to, text }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                isActive
                    ? " p-2 bg-gray-50 w-full text-center border-l-4 border-r-4 border-red-500"
                    : "p-2 w-full text-center"
            }
        >
            {text}
        </NavLink>
    );
};

export default SidebarItem;
