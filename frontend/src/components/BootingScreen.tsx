import Logo from "../assets/images/8129668.png"

function BootingScreen(){
    return(
        <div className="bg-[#0A0A0A] h-screen flex flex-col justify-center items-center font-mono ">

            <img src={Logo} alt="Logo" className="h-48"/>
            <p className="text-gray-300 my-4">
                DOCK
            </p>
            <div className="animate-spin h-4 bg-white w-4"></div>
            <h1 className="text-gray-200 text-2xl tracking-tighter my-4">
                Initializing System
            </h1>
            <p className="text-gray-400 text-sm my-2">
                v1.0.0
            </p>
        </div>
    )
}

export default BootingScreen