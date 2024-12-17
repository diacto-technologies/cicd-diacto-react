import { XMarkIcon } from "@heroicons/react/20/solid";

const Header = ({label,onClose}) => {
    return ( 
        <>
        <div className="border-b rounded-t-lg bg-gray-50 flex justify-between py-2 px-3">
                  <h3
                    className="text-xl p-4 font-semibold leading-6 text-gray-900"
                    id="modal-title"
                  >
                    {label}
                  </h3>
                  <button onClick={() => onClose()}>
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
        </>
     );
}
 
export default Header;