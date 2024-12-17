import { Link, Outlet } from 'react-router-dom';
import ProfileNavbar from "./ProfileNavbar";

const Profile2 = () => {


    return (
        <>
            <div className='flex'>
                <div className='w-1/6'>
                    <ProfileNavbar />
                </div>
                <div className='w-5/6'>
                    <Outlet />
                </div>
            </div>


        </>
    );
}

export default Profile2;