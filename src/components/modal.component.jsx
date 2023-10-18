import React, { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import { Wallet } from "ethers";
import { GrClose } from "react-icons/gr";
import { CgDanger } from "react-icons/cg";
import { MdOutlineDangerous } from "react-icons/md";
import { set } from "mongoose";
import { AutomationContext } from "../App";

const Modal = ({
    isModalOpen,
    setIsModalOpen,
    closeModal,
    storedWallet,
    setStoredWallet,
}) => {
    const [loading, setLoading] = useState(true);
    const { usingAutomation, setUsingAutomation } =
        useContext(AutomationContext);
    useEffect(() => {
        console.log("useeffect");
        if (isModalOpen) {
            console.log("modal is open");
            const privateKey = localStorage.getItem("privateKey");
            const address = localStorage.getItem("address");

            console.log("privateKey: ", privateKey);
            console.log("address: ", address);

            setStoredWallet({ privateKey, address });
        } else {
        }
    }, [isModalOpen]);

    useEffect(() => {
        console.log(storedWallet);
        console.log("useeffect2");
    }, [storedWallet]);

    const createKeyPair = () => {
        const randomPrivateKey = Wallet.createRandom().privateKey;
        const wallet = new Wallet(randomPrivateKey);
        const privateKey = wallet.privateKey;
        const address = wallet.address;

        localStorage.setItem("privateKey", privateKey);
        localStorage.setItem("address", address);

        setStoredWallet({ privateKey, address });
    };

    const resetWallet = () => {
        localStorage.removeItem("privateKey");
        localStorage.removeItem("address");

        setStoredWallet({ privateKey: null, address: null });
        setUsingAutomation(false);
    };

    return (
        <div>
            {isModalOpen ? (
                <div className="fixed  inset-0 flex items-center justify-center z-50 right-0 bottom-0">
                    <div className=" w-1/2 h-1/2 bg-white shadow-gray-600 shadow-lg">
                        <div className="modal-content">
                            <button
                                onClick={closeModal}
                                className="close-button absolute top-1/4 right-1/4 p-5 text-gray-600 hover:text-gray-800 focus:outline-none"
                            >
                                <GrClose className="text-black text-xl m-2" />
                            </button>
                            {loading ? (
                                <>
                                    <h2 className="text-2xl font-bold mb-4 p-5">
                                        Automate Transaction Signing
                                    </h2>

                                    <div className="p-5">
                                        {!storedWallet ||
                                        !storedWallet.privateKey ||
                                        !storedWallet.address ? (
                                            <>
                                                <div className="text-red-500 mb-4 p-5">
                                                    {
                                                        "No wallet found. Please create a new wallet."
                                                    }
                                                </div>
                                                <div className="flex flex-col p-5 gap-5 items-center">
                                                    <button
                                                        onClick={createKeyPair}
                                                        className="bg-blue-500 text-white p-2 rounded-xl w-1/2"
                                                    >
                                                        Create a new Key Pair
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-green-500 mb-4 px-5">
                                                    {"Wallet found."}
                                                </div>
                                                <div className="text-green-500 mb-4 px-5">
                                                    Address:{" "}
                                                    {storedWallet.address}
                                                </div>

                                                <div className="text-green-500 mb-4 px-5">
                                                    Private Key:{" "}
                                                    {storedWallet.address}
                                                </div>
                                                <div className="flex flex-col p-5 gap-5 items-center">
                                                    <button
                                                        onClick={resetWallet}
                                                        className="bg-red-500 text-white p-2 rounded-xl w-1/2 flex justify-center gap-x-2 items-center"
                                                    >
                                                        Reset Wallet{" "}
                                                        <CgDanger className="text-xl" />
                                                    </button>
                                                    {!usingAutomation ? (
                                                        <button
                                                            className="bg-green-500 text-white p-2 rounded-xl w-1/2 "
                                                            onClick={() => {
                                                                setUsingAutomation(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            Enable Automation
                                                            with this Wallet
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="bg-black text-white p-2 rounded-xl w-1/2 flex  justify-center gap-x-2 items-center"
                                                            onClick={() => {
                                                                setUsingAutomation(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            Disable Automation
                                                            with this Wallet{" "}
                                                            <MdOutlineDangerous className="text-xl" />
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div>loading...</div>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Modal;
