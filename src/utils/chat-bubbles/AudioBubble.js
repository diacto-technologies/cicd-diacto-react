import "./ChatBubble.css"
import DefaultImg from "../../assets/user-blue.png"
import { CheckBadgeIcon } from "@heroicons/react/20/solid";

const AudioBubble = ({ question, index, audioURL, submitted }) => {
    return (
        <>
            {
                question &&
                <li key={index} className="chat__message chat__message_B self-end flex justify-between gap-x-6 py-2 w-5/6 ">
                    <div className="flex justify-end items-center min-w-0 gap-x-4 w-full">


                        <div className="w-full flex flex-col items-end chat__content">
                                <span className="me-2 text-sm font-medium text-white">Rakshat <span className="text-xs text-gray-100 ms-1">11:15pm</span></span>
                            <div className="mt-1 w-full relative min-w-0 flex-auto border rounded-tr-none rounded-2xl px-3 py-2 bg-white shadow-md ">
                                <label className="mt-1 text-sm block font-normal  text-white"><audio className="w-full h-10 p-1 border-2 bg-sky-100/50 rounded-3xl border-sky-700/50" controls src={audioURL}></audio></label>
                            </div>
                            {submitted && <span className="mt-1.5 me-2 inline-flex text-xs text-green-600"><CheckBadgeIcon className="w-4 h-4 me-0.5" /> Submitted</span>}
                        </div>
                        <img className="h-12 w-12 flex-none rounded-full border p-1 bg-gray-50 shadow-lg" src={DefaultImg} alt="" />
                    </div>


                </li>
            }

        </>
    );
}

export default AudioBubble;