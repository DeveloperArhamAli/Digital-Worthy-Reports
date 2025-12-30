import LogoImage from "../assets/images/logo.png";

function Logo() {
    return (
        <div className="flex items-center space-x-2">
            <div className="w-10 h-10 flex items-center justify-center bg-neon-green/10 rounded-lg">
                <img src={LogoImage} alt="Digital Worthy Reports Logo" />
            </div>
            <span className="text-xl font-bold text-neon-green tracking-tight">
                DigitalWorthyReports
            </span>
        </div>
    )
}
export default Logo