import Logo from "./Logo"

function Navbar() {
    const navLinks = [
        {
            title: "Car History",
            slug: ""
        },
        {
            title: "Car Report",
            slug: ""
        },
        {
            title: "Report Pricing",
            slug: ""
        },
    ]
    
    return (
        <div className="flex justify-between items-center bg-[rgba(18,18,18,0.98)] sticky z-1000 backdrop-blur-[10px] px-[5%] py-4 border-b-[rgba(57,255,20,0.2)] border-b border-solid top-0 -webkit-backdrop-filter: blur(10px);">
            <Logo />
            <button className="hidden text-(--neon-green) text-2xl cursor-pointer z-1001 p-2 border-[none]; background: none;" id="mobileMenuBtn">
                <i className="ri-menu-line"></i>
            </button>
            <nav className="flex items-center gap-8">
                {navLinks.map((link, index) => (
                    <a key={index} href={link.slug} 
                        className={`relative no-underline text-(--text-dark) font-medium text-[0.95rem] py-2 transition-all duration-300 uppercase tracking-[1px]after:content-[''] after:absolute after:w-0 after:h-0.5 after:left-0 after:bottom-0 after:bg-(--neon-green) after:shadow-[0_0_5px_var(--neon-green)] after:transition-[width] after:duration-300 hover:text-(--neon-green) hover:text-shadow-[0_0_8px_rgba(57,255,20,0.7)] hover:after:w-full`}
                    >
                        {link.title}
                    </a>
                ))}
                <a href="#" 
                    className="bg-transparent text-(--neon-green) px-6 py-[0.6rem] border border-(--neon-green) rounded-[40px] font-medium transition-all  duration-300 relative overflow-hidden z-1 uppercase tracking-[1px] text-[0.6rem] hover:bg-[rgba(57,255,20,0.1)] hover:shadow-[0_0_10px_rgba(57,255,20,0.5)] hover:-translate-y-0.5"
                >Log In</a>
            </nav>
        </div>
    )
}
export default Navbar