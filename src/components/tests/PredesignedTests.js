import { useContext, useEffect } from "react";
import { useFetchPreBuiltAssessments } from "../../constants/test/constants";
import GridView from "../../utils/list/GridView";
import AuthContext from "../../context/AuthContext";

const PredesignedTests = () => {

    const { fetchPreBuiltAssessments, loadingPreBuiltAssessments, preBuiltAssessments } = useFetchPreBuiltAssessments();
    const {isSuperUser} = useContext(AuthContext)
    // console.log(preBuiltAssessments)

    useEffect(() => {
        fetchPreBuiltAssessments()
    },[])

    return ( 
        <>
        <div className="w-full h-full p-3">
        {
            preBuiltAssessments?.length && 
            <GridView items={preBuiltAssessments} editable={isSuperUser} />
        }
        </div>
        </>
     );
}
 
export default PredesignedTests;