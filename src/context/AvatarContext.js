// AvatarContext.js
import React, { createContext, useContext, useState } from 'react';
import AuthContext from './AuthContext';

const AvatarContext = createContext();

export default AvatarContext;

export const AvatarProvider = ({ children }) => {
    const {authTokens } = useContext(AuthContext)
    const [avatars, setAvatars] = useState({});

    

    const fetchAvatar = async (userId) => {
        try {
            // Check if the avatar already exists in the cache
            const existingAvatar = avatars[parseInt(userId)];
           //console.log("existingAvatar : ",existingAvatar,userId)
            if (existingAvatar) {
               //console.log("Avatars exists - returning existing avatar")
                return existingAvatar;
            }
            // else{
            //    //console.log("----------------------------------------------------------------",avatars,userId)
            //     setAvatars((prev) => ({...prev,[userId] : null}))
            // }

            // Fetch the avatar from the server
            const response = await fetch(`/accounts/avatar/${userId}/`, {
                method: 'GET',
                headers: {
                    Authorization: "Bearer " + String(authTokens.access),
                }
            });

            if (!response.ok) {
               //console.log('Failed to download profile picture');
                return null;
            }

            const blobData = await response.blob();
            if (blobData.type === 'image/jpeg' || blobData.type === "image/png") {
                const imageUrl = URL.createObjectURL(blobData);
                // Update the cache
               //console.log("Fetched avatar - updating cache",userId)
                 setAvatars((prevAvatars) => ({
                    ...prevAvatars,
                    [userId]: imageUrl,
                }));
                return imageUrl;
            } else {
               //console.log("null",blobData)
                return null;
            }
        } catch (error) {
            console.error('Error downloading Pic:', error);
            return null;
        }

    };

    return (
        <AvatarContext.Provider value={{ avatars, fetchAvatar }}>
            {children}
        </AvatarContext.Provider>
    );
};
