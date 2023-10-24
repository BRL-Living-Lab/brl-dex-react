import React, { useState } from "react";
import { toast } from "react-toastify";
import Switch from "@material-ui/core/Switch";
const DataAssetRequestForm = () => {
    const [formData, setFormData] = useState({
        status: "open",
        title: "",
        description: "",
        schema: "",
        instructions: "",
        dataValidation: false,
    });

    const handleChange = (e) => {
        const value =
            e.target.type === "checkbox" ? e.target.checked : e.target.value;
        if (e.target.name === "schema" && e.target.value === undefined) {
            toast.error("Invalid JSON input", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
            });
            return;
        }
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);


        try {
            if (formData.dataValidation)
                JSON.parse(formData.schema);
        } catch (error) {
            toast.error("Invalid JSON input", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
            });
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/dataRequests`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                toast.error("Request creation failed", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                });
                throw new Error("HTTP error " + response.status);
            }

            toast.success("Request created successfully", {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="rounded-md h-full overflow-y-scroll">
            <h1 className="font-light text-xl p-5 text-center">
                Request Asset{" "}
            </h1>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg"
            >
                <label className="flex flex-col">
                    Title:
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />
                </label>
                <label className="flex flex-col">
                    Description:
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />
                </label>
                <label className="flex items-center">
                    <div className="relative">
                        <Switch
                            checked={formData.dataValidation}
                            onChange={handleChange}
                            name="dataValidation"
                            inputProps={{ "aria-label": "secondary checkbox" }}
                        />
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">
                        Enable JSON Schema Validation
                    </div>
                </label>
                {formData.dataValidation && (
                    <label className="flex flex-col">
                        Schema:
                        <textarea
                            name="schema"
                            value={formData.schema}
                            onChange={handleChange}
                            className="border p-2 rounded"
                        />
                    </label>
                )}
                <label className="flex flex-col">
                    Instructions:
                    <textarea
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />
                </label>
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded mx-auto w-auto"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default DataAssetRequestForm;
