import React, { useContext, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { BsFillRocketTakeoffFill, BsFillRocketFill } from "react-icons/bs";
import { AutomationContext } from "../App";

const Dropdown = ({ openModal, automation }) => {
    const { usingAutomation, setUsingAutomation } =
        useContext(AutomationContext);
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative inline-block bg-pink-600 text-white text-base rounded-r-full p-1">
            <button
                onClick={toggleDropdown}
                className="text-gray-600 hover:text-gray-800 focus:outline-none focus:text-gray-800 align-bottom"
            >
                <IoMdArrowDropdown className="text-white text-2xl" />
                {/* <div className="text-white">{"+"}</div> */}
            </button>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-xl bg-gray-50 border ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <button
                        className="pr-2 flex justify-evenly align-bottom w-full"
                        onClick={openModal}
                    >
                        {!usingAutomation ? (
                            <>
                                <div className="pl-4 pr-2 py-2 text-base text-gray-700 hover:bg-gray-100">
                                    Enable Automation
                                </div>
                                <BsFillRocketFill className="text-red-700 text-base my-auto" />
                            </>
                        ) : (
                            <>
                                <div className="pl-4 pr-2 py-2 text-base text-gray-700 hover:bg-gray-100">
                                    Disable Automation
                                </div>
                                <BsFillRocketTakeoffFill className="text-green-700 text-base my-auto" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dropdown;
