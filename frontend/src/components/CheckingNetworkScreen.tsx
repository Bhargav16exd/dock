import CheckNetworkLogo from "../assets/images/network.png"

function CheckingNetworkScreen(){
    return(
        <div className="bg-[#0A0A0A] h-screen flex flex-col justify-center items-center font-mono">

            <img src={CheckNetworkLogo} alt="Logo" className="rounded-full animate-pulse h-80"/>
            <div className="animate-spin h-4 bg-white w-4"></div>
            <h1 className="text-gray-200 text-2xl tracking-tighter my-4">
                Checking Network Connections
            </h1>
            <p className="text-gray-400 text-sm my-2">
                Scanning available networks
            </p>
        </div>
    )
}

export default CheckingNetworkScreen