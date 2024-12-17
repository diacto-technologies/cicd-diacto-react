import { useState } from "react";

const AlertBuilder = () => {

    const [showModal,setShowModal] = useState(false)

    const fetchAlerts = () => {
        
    }

    return ( 
        <>

        {
            showModal &&
            <label>Modal Open</label>
        }
        </>
     );
}
 
export default AlertBuilder;