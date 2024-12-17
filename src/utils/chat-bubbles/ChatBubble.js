import "./ChatBubble.css"
import DefaultImg from "../../assets/user-blue.png"
import { CheckBadgeIcon } from "@heroicons/react/20/solid";

const ChatBubble = ({ question, index, submitted }) => {
    return (
        <>
            {
                question &&
                <li key={index} className="chat__message chat__message_A  flex justify-between gap-x-6 py-2 w-5/6 ">
                    <div className=" flex items-center min-w-0 gap-x-4 w-full">
                        <img className="h-9 w-9  flex-none rounded-full border p-1 bg-gray-50 shadow-lg" src={DefaultImg} alt="" />
                        <div className="w-full chat__content">
                            <label className="w-full flex justify-between">
                                <span className="me-2 text-sm font-medium ">Axel <span className="text-xs text-slate-600/50 ms-1">11:15pm</span></span>
                                
                            </label>
                            <div  className="mt-1 relative min-w-0 flex-auto border rounded-ss-none rounded-2xl px-3 py-2 bg-brand-purple shadow-md ">

                                <label className="mt-1 text-sm block font-normal  text-white"><span className="me-2 font-medium">{index + 1}.</span>{question.text}</label>

                            </div>
                            
                        </div>

                    </div>

                </li>
            }

        </>
    );
}

export default ChatBubble;