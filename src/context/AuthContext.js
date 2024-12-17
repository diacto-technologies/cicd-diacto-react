import { createContext, useEffect, useState } from "react";
import { jwtDecode as jwt_decode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";

const AuthContext = createContext()

export default AuthContext;

export const AuthProvider = ({ children }) => {

    // localStorage.getItem('authTokens') 

    const [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null)
    const [user, setUser] = useState(() => localStorage.getItem('authTokens') ? jwt_decode(localStorage.getItem('authTokens')) : null)
    const [userDetails, setUserDetails] = useState(null);
    const [teamMembersAvatars , setTeamMembersAvatars] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [orgServices, setOrgServices] = useState([])
    const [isSuperUser, setIsSuperUser] = useState(false)
    const history = useNavigate()
    const location = useLocation();
    
    useEffect(() => {
        if (location.pathname === "/") {
            history('/app/user/jobs/')
        }
    }, [location])


    useEffect(() => {
        if (loading) {
            setLoading(false)
            if (authTokens) {
            refreshToken()
                
            }
        }
    }, [loading,authTokens])

    useEffect(() => {
        if (authTokens && !userDetails && !loadingDetails) {
            getUserDetails(authTokens)
                .then(details => {
                    if (details) {
                        setIsSuperUser(details?.is_superuser &&
                            details?.org?.org_domain === "candidhr.ai")
                        setUserDetails(details);
                    }
                })
                .catch(error => console.error('Error fetching details:', error));
        }
    }, [authTokens, userDetails, loadingDetails]);

    useEffect(() => {

        const halfHour = 1000 * 60 * 28 * 1
        let interval = setInterval(() => {
            if (authTokens) {
               //console.log("interval refresh token run")
                refreshToken()
            }
        }, halfHour)
        return () => clearInterval(interval)

    }, [authTokens])

   

    const getUserDetails = async (token) => {
        setLoadingDetails(true)
        if (!userDetails ) {
            let response = await fetch('/accounts/user/', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(token.access),
                }

            })

            let data = await response.json()
            if (response.status === 200) {
               //console.log("user details: ", data)
                setOrgServices(data?.org?.services || [])
                setLoadingDetails(false)
                
                return data
                // history('/app/user/jobs')
            } else {
               //console.log("user details not found")
                if (response.statusText === "Unauthorized") {
                    logoutUser();
                    setLoadingDetails(false)
                }
            }
        }
    }

    const loginUser = async (e) => {
        e.preventDefault()
        let response = await fetch('/accounts/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'email': e.target.email.value, 'password': e.target.password.value })
        })
 
        let data = await response.json()
 
        if (response.status === 200) {
            const searchParams = new URLSearchParams(location.search);
 
            const redirectTo = searchParams.get('redirectTo');
           //console.log("recieved tokens")
            setAuthTokens(data)
 
            // console.log("user : ", jwt_decode(data.access))
            setUser(jwt_decode(data.access))
            localStorage.setItem('authTokens', JSON.stringify(data))
            if (redirectTo) {
                history(redirectTo)
 
            } else {
                history('/app/user/jobs/')
 
            }
        } else {
            throw data;
        }
    }

    const logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        setUserDetails(null)
        localStorage.removeItem('authTokens')
        history('/app/login')
    }

    const refreshToken = async () => {
        // console.log("refresh called")

        

        let response = await fetch('/accounts/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'refresh': authTokens?.refresh })
        })
        //console.log(response)

        // let data = await response.json();
        if (response.status === 200) {
            let data = await response.json();
            // console.log("user : ", jwt_decode(data.access))
            setAuthTokens(data)
            setUser(jwt_decode(data.access))
            localStorage.setItem('authTokens', JSON.stringify(data))
            setLoading(false)
        } else {
           //console.log(" token not refreshed")
           //console.log(response.statusText)
           setLoading(false)
            if (response.status === 401) {
               //console.log("User not authenticated")
                logoutUser()
            }
        }
    };



    let userContextData = {
        user: user,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
        userDetails: userDetails,
        setUserDetails : setUserDetails,
        teamMembersAvatars : teamMembersAvatars,
        setTeamMembersAvatars, setTeamMembersAvatars,
        orgServices : orgServices,
        isSuperUser: isSuperUser
        // domain : "http://localhost:3000"
        // domain : "https://candidhr.ai"
    }


    return (

       
            <AuthContext.Provider value={userContextData}>
                {loading ? null : children} {/* Render children if not loading */}
            </AuthContext.Provider>
     

    )
}