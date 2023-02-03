import { NavLink, Outlet } from "react-router-dom";

const Sidebar = () => {
    return (
        // <div>
        //     <div className="flex justify-start w-1/6 text-left p-5 space-x-2">
        //         <NavLink to="/">Marketplace</NavLink> <NavLink to="publish">Publish</NavLink>{" "}
        //         <NavLink to="lab">Lab</NavLink>
        //         <Outlet />
        //     </div>
        // </div>
        <div class="w-60 h-full shadow-md bg-white px-1 absolute ">
  <ul class="relative">
    <li class="relative">
      <a class="flex items-center text-sm py-4 px-6 h-12 overflow-hidden text-gray-700 text-ellipsis whitespace-nowrap rounded hover:text-gray-900 hover:bg-gray-100 transition duration-300 ease-in-out" href="/" data-mdb-ripple="true" data-mdb-ripple-color="dark">Marketplace</a>
    </li>
    <li class="relative">
      <a class="flex items-center text-sm py-4 px-6 h-12 overflow-hidden text-gray-700 text-ellipsis whitespace-nowrap rounded hover:text-gray-900 hover:bg-gray-100 transition duration-300 ease-in-out" href="lab" data-mdb-ripple="true" data-mdb-ripple-color="dark">Lab</a>
    </li>
    <li class="relative">
      <a class="flex items-center text-sm py-4 px-6 h-12 overflow-hidden text-gray-700 text-ellipsis whitespace-nowrap rounded hover:text-gray-900 hover:bg-gray-100 transition duration-300 ease-in-out" href="publish" data-mdb-ripple="true" data-mdb-ripple-color="dark">Publish</a>
    </li>
  </ul>
</div>
    );
};


  

export default Sidebar;
