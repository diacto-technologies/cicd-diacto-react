const SidebarTest = ({ isSidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen }) => {
    return ( 
        <>
        <div className={`fixed  top-0 left-0 z-20  h-screen pt-20 transition-transform ${!mobileSidebarOpen && '-translate-x-full'} ${isSidebarOpen ? 'w-64 max-w-72 z-0' : 'w-20 '} bg-white border-r border-gray-200 sm:translate-x-0`}>
            Sidebar
        </div>
        </>
     );
}
 
export default SidebarTest;