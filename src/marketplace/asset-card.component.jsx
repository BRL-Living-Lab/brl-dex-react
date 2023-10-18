import {
    AiFillSetting,
    AiOutlineCloudDownload,
    AiOutlineFileText,
} from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const AssetCard = ({ did }) => {
    const navigate = useNavigate();
    return (
        <div className="bg-white m-2 p-2 shadow-md h-36">
            <div className="flex justify-between pt-2 px-2 border-b border-gray-200">
                <div className="font-normal text-lg overflow-hidden text-ellipsis h-7 w-80 whitespace-nowrap">
                    {did.metadata.name}
                </div>{" "}
                <div
                    className={
                        did.metadata.type === "dataset"
                            ? "bg-purple-500 h-6 text-white px-2 rounded-md font-semibold shadow-sm shadow-black"
                            : "bg-pink-600 h-6 text-white px-2 rounded-md font-semibold shadow-sm shadow-black"
                    }
                >
                    {did.metadata.type}
                </div>
            </div>
            <div className="flex justify-between p-2 items-baseline">
                <div className="space-x-2 italic">
                    <div className="text-sm">{did.metadata.author}</div>{" "}
                </div>
                <div className="flex items-center space-x-1">
                    <AiOutlineFileText />
                    <div> {did.nft.name}</div>
                </div>
            </div>
            <div className="flex justify-between px-2 py-1">
                <div className="space-x-2 text-sm">
                    <div>{new Date(did.metadata.created).toLocaleString()}</div>{" "}
                </div>
                <div className="flex space-x-1 text-sm">
                    {" "}
                    {did.services
                        .map((service) => service.type)
                        .filter(
                            (type, index, array) =>
                                array.indexOf(type) === index
                        )
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
            <div className="flex justify-between p-2 border-t border-gray-200 max-h-10 overflow-hidden text-ellipsis">
                <div className="font-normal text-xs overflow-hidden text-ellipsis h-5 whitespace-nowrap">
                    {did.metadata.description}
                </div>{" "}
            </div>
        </div>
    );
};

export default AssetCard;
