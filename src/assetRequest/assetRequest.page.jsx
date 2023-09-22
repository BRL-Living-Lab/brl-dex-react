import React, { useState } from 'react';
import { toast } from "react-toastify";
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

const DataAssetRequestForm = () => {
  const [formData, setFormData] = useState({
    status: 'open',
    title: '',
    description: '',
    schema: '',
    instructions: '',
  });

  const handleChange = (e) => {
    if (e.target.name === 'schema' && e.target.value === undefined) {
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
      [e.target.name]: e.target.value,
    });
  };

  const handleJSONChange = (change) => {
    if (!change.jsObject) {
      toast.error("Invalid JSON input", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
      });
      return;
    }
  
    setFormData({
      ...formData,
      schema: JSON.stringify(change.jsObject),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    
    try {
      const response = await fetch('http://localhost:3000/api/dataRequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        toast.error("Request creation failed", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
      });
        throw new Error('HTTP error ' + response.status);
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
    <div className="flex justify-center  bg-gray-100">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-1 mx-auto lg:w-1/2">
      <label className="flex flex-col">
  Title:
  <input type="text" name="title" value={formData.title} onChange={handleChange} className="border p-2 rounded" />
</label>
<label className="flex flex-col">
  Description:
  <textarea name="description" value={formData.description} onChange={handleChange} className="border p-2 rounded" />
</label>
<label className="flex flex-col">
  Schema:
  {/* <textarea name="schema" value={formData.schema} onChange={handleChange} className="border p-2 rounded" /> */}
  <JSONInput
                        
                        
                        value={formData.schema}
                        onChange={handleJSONChange}
                        locale={locale}
                        height='550px'
                        width='100%'
                        style={{body: {border: '5px solid pink'}}}
                    />
</label>
<label className="flex flex-col">
  Instructions:
  <textarea name="instructions" value={formData.instructions} onChange={handleChange} className="border p-2 rounded" />
</label>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mx-auto w-auto">Submit</button>
      </form>
    </div>
  );
};

export default DataAssetRequestForm;