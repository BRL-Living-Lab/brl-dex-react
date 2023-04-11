import { AiFillSetting, AiOutlineCloudDownload, AiOutlineFileText } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const AssetCard = ({ did }) => {
    const navigate = useNavigate();
    return (
        <div className="bg-white m-2 p-2 shadow-md">
            <div className="flex justify-between p-2 border-b border-gray-200">
                <div className="font-normal text-lg">{did.metadata.name}</div>{" "}
                <div
                    className={
                        did.metadata.type === "dataset"
                            ? "bg-green-800 text-white px-2 rounded-md font-semibold shadow-sm shadow-black"
                            : "bg-red-800 text-white px-2 rounded-md font-semibold shadow-sm shadow-black"
                    }
                >
                    {did.metadata.type}
                </div>
            </div>
            <div className="flex justify-between p-2 items-baseline">
                <div className="space-x-2 italic">
                    <div>{did.metadata.author}</div>{" "}
                </div>
                <div className="flex items-center space-x-1">
                    <AiOutlineFileText />
                    <div> {did.nft.name}</div>
                </div>
            </div>
            <div className="flex justify-between p-2">
                <div className="space-x-2 text-sm">
                    <div>
                        {new Date(did.metadata.created).getMonth() +
                            "/" +
                            new Date(did.metadata.created).getDate() +
                            "/" +
                            new Date(did.metadata.created).getFullYear()}
                    </div>{" "}
                </div>
                <div className="flex space-x-1 text-sm">
                    {" "}
                    {did.services
                        .map((service) => service.type)
                        .filter((type, index, array) => array.indexOf(type) === index)
                        .map((type) => (
                            <div className="flex space-x-1 rounded-2xl bg-gray-200 shadow-sm shadow-black px-2">
                                <div>
                                    {type === "access" ? (
                                        <AiOutlineCloudDownload className="pt-1 text-lg" />
                                    ) : (
                                        <AiFillSetting className="pt-1 text-lg" />
                                    )}
                                </div>
                                <div>{type}</div>
                            </div>
                        ))}
                </div>
            </div>
            <div className="flex justify-between p-2 border-t border-gray-200">
                <div className="font-normal text-xs">{did.metadata.description}</div>{" "}
            </div>
        </div>
    );
};

export default AssetCard;
