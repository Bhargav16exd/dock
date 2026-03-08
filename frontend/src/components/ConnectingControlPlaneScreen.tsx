function ConnectingControlPlaneScreen(){
    return(
        <div className="bg-[#0A0A0A] h-screen flex flex-col justify-center items-center font-mono">

            <div className="animate-spin h-4 bg-white w-4 my-4"></div>
            <h1 className="text-gray-200 text-4xl tracking-tighter my-4">
                Connecting to Control Plane
            </h1>
            <p className="text-gray-400 my-1 flex">
                checking control plane health <p className="mx-2 animate-pulse">❤️</p>
            </p>
        </div>
    )
}

export default ConnectingControlPlaneScreen