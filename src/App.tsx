import { useState } from "react";
import Navbar from "./components/Navbar";

export default function VehicleReportPage() {
  const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`
        mb-6 
        rounded-lg 
        overflow-hidden 
        border border-[rgba(57,255,20,0.2)] 
        bg-[rgba(18,18,18,0.8)]
        transition-all duration-300
        ${open ? "border-(--neon-green) shadow-[0_0_15px_rgba(57,255,20,0.2)]" : ""}
      `}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`
          w-full 
          px-8 py-6 
          text-left 
          flex justify-between items-center 
          font-semibold 
          text-white 
          text-lg
          bg-transparent
          cursor-pointer
          transition-colors duration-300
          hover:text-(--neon-green)
        `}
      >
        {question}
        <span className="text-(--neon-green) text-2xl">
          {open ? "−" : "+"}
        </span>
      </button>

      <div
        className={`
          overflow-hidden 
          bg-[rgba(30,30,30,0.5)]
          transition-all duration-300
          ${open ? "max-h-[500px] px-8 py-6" : "max-h-0 px-0 py-0"}
        `}
      >
        <p className="text-[#e0e0e0] leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const faqs = [
    {
      question: "How Can My CarReport Help Me?",
      answer:
        "CarReport provides comprehensive vehicle history information that can help you avoid buying a car with hidden problems like accidents, flood damage, or odometer rollbacks. Our reports give you the confidence to make an informed purchasing decision.",
    },
    {
      question: "What is CarReport?",
      answer:
        "CarReport is a vehicle history reporting service that compiles data from various sources including DMVs, insurance companies, and auto auctions to provide a complete history of a vehicle. We help buyers make informed decisions when purchasing used cars.",
    },
    {
      question: "How accurate is the information in the report?",
      answer:
        "Our reports are compiled from reliable sources including state DMVs, insurance companies, and auto auctions. While we strive for 100% accuracy, we cannot guarantee that all information is complete as some incidents may go unreported to official sources.",
    },
    {
      question: "What if I can't find the VIN number?",
      answer:
        "The VIN can typically be found on the driver's side dashboard visible through the windshield, on the driver's side door jamb, or on vehicle registration and insurance documents. If you're having trouble locating it, contact the seller or dealer for assistance.",
    },
  ];

  return (
    <div>

      <Navbar />

      <section
        className="
          relative overflow-hidden text-white text-center
          bg-[linear-gradient(135deg,#0a0a0a_0%,#121212_100%)]
          px-[5%] pt-24 pb-32
          max-md:px-6 max-md:pt-20 max-md:pb-24
          before:content-[''] before:absolute before:bottom-0 before:left-0 before:right-0 
          before:h-0.5 
          before:bg-[linear-gradient(90deg,transparent,var(--neon-green),transparent)]
        "
      >
        <div className="relative z-1 max-w-[800px] mx-auto">
          <h1
            className="
              text-[3.5rem] font-extrabold mb-6 leading-[1.2]
              max-md:text-[2.5rem]
              text-transparent bg-clip-text bg-[linear-gradient(to_right,#fff,#e0e0e0)]
              drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]
              relative inline-block
              after:content-[''] after:absolute after:-bottom-2.5 
              after:left-1/2 after:-translate-x-1/2 
              after:w-[100px] after:h-[3px]
              after:bg-(--neon-green)
              after:shadow-[0_0_10px_var(--neon-green)]
            "
          >
            Get Your Complete Vehicle History Report
          </h1>

          <p
            className="
              text-[1.5rem] text-[#b3b3b3] leading-[1.6]
              max-w-[700px] mx-auto mb-10
              max-md:text-[1.2rem]
            "
          >
            Unlock the full history of any vehicle with our comprehensive reports. Make informed decisions with confidence.
          </p>

          {/* Buttons */}
          <div
            className="
              flex justify-center gap-4 flex-wrap
              max-md:flex-col max-md:items-center
            "
          >
            {/* Primary Button */}
            <a
              href="#"
              className="
                bg-(--neon-green) text-[#121212]
                py-[0.9rem] px-8 rounded-full font-semibold
                uppercase text-[0.9rem] tracking-[1px]
                border-2 border-transparent
                shadow-[0_0_15px_rgba(57,255,20,0.3)]
                transition-all duration-300
                hover:bg-transparent hover:text-(--neon-green)
                hover:border-(--neon-green)
                hover:shadow-[0_0_25px_rgba(57,255,20,0.5)]
                hover:-translate-y-[3px]
                max-md:w-full max-md:max-w-[300px] max-md:text-center
              "
            >
              Get Report Now
            </a>

            {/* Secondary Button */}
            <a
              href="#"
              className="
                bg-transparent text-(--neon-green)
                py-[0.9rem] px-8 rounded-full font-semibold
                uppercase text-[0.9rem] tracking-[1px]
                border-2 border-(--neon-green)
                transition-all duration-300
                hover:bg-[rgba(57,255,20,0.1)]
                hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]
                hover:-translate-y-[3px]
                max-md:w-full max-md:max-w-[300px] max-md:text-center
              "
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section
        className="
          py-16 px-4 text-center
          bg-(--primary-light) text-(--text-dark)
        "
      >
        <div className="container mx-auto pb-4">
          <h2
            className="
              text-[2.5rem] max-md:text-[2rem]
              text-(--neon-green)
              mb-2
              drop-shadow-(--neon-glow)
            "
          >
            Choose Your Report
          </h2>

          <p
            className="
              text-[1.1rem] max-md:text-[1rem]
              text-(--text-light)
              mb-12
            "
          >
            Select the perfect report that matches your needs and budget
          </p>

          {/* Pricing Cards */}
          <div
            className="
              flex flex-wrap justify-center gap-8
              max-w-[1200px] mx-auto px-4
            "
          >
            {/* Card 1 */}
            <div
              className="
                bg-(--bg-white)
                rounded-[15px]
                shadow-[0_10px_30px_rgba(0,0,0,0.3)]
                p-10 w-full max-w-[350px]
                border border-[#333]
                transition-all duration-300
                relative overflow-hidden
                hover:-translate-y-2.5
                hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)]
                max-md:max-w-full
              "
            >
              <div
                className="
                  mb-8 pb-6 relative
                  after:content-[''] after:absolute
                  after:bottom-0 after:left-1/2 after:-translate-x-1/2
                  after:w-[50px] after:h-[3px]
                  after:bg-[#3498db] after:rounded-[3px]
                "
              >
                <h3 className="text-[1.8rem] text-[#2c3e50] mb-2">
                  Bronze Report
                </h3>

                <div
                  className="
                    text-[2.8rem] font-bold
                    text-(--neon-green)
                    drop-shadow-(--neon-glow)
                    relative inline-block
                    before:content-['$'] before:relative
                    before:text-[1.5rem] before:top-[-0.8rem]
                    before:mr-0.5
                    max-md:text-[2.5rem]
                  "
                >
                  40
                </div>

                <p className="text-gray-500 mt-1">One-time payment</p>
              </div>

              <ul className="text-left mb-8 list-none pl-0">
                {[
                  "Basic Vehicle History",
                  "Title Information",
                  "Odometer Check",
                  "Theft Records",
                  "30-Day Money Back",
                ].map((item) => (
                  <li
                    key={item}
                    className="
                      py-3 pl-8 text-[#555]
                      text-[1rem] max-md:text-[0.95rem]
                      border-b border-[#eee]
                      relative
                    "
                  >
                    <i
                      className="
                        fas fa-check text-[#2ecc71]
                        absolute left-0 top-4
                      "
                    ></i>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                className="
                  py-3 px-8 rounded-full w-[80%]
                  bg-(--neon-green) text-black font-semibold
                  uppercase tracking-[1px]
                  shadow-[0_0_15px_rgba(57,255,20,0.5)]
                  relative overflow-hidden
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)]
                  before:content-[''] before:absolute before:top-0
                  before:-left-full before:w-full before:h-full
                  before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)]
                  before:transition-all before:duration-500
                  hover:before:left-full
                  max-md:w-[90%]
                "
              >
                Get Started
              </button>
            </div>

            {/* Card 2 — Featured */}
            <div
              className="
                bg-(--bg-white)
                rounded-[15px]
                p-10 w-full max-w-[350px]
                border-2 border-(--neon-green)
                shadow-[0_0_20px_rgba(57,255,20,0.3)]
                scale-[1.05]
                relative overflow-hidden
                max-md:max-w-full max-md:scale-100
              "
            >
              {/* Top Gradient Strip */}
              <div
                className="
                  absolute top-0 left-0 right-0 h-[5px]
                  bg-[linear-gradient(90deg,#3498db,#2ecc71)]
                "
              ></div>

              {/* Tag */}
              <div
                className="
                  absolute top-4 -right-8
                  rotate-45 bg-[#2ecc71] text-white
                  py-[0.3rem] px-8 w-[150px]
                  text-[0.8rem] font-semibold
                  shadow-md
                  text-center
                "
              >
                Most Popular
              </div>

              <div
                className="
                  mb-8 pb-6 relative
                  after:content-[''] after:absolute
                  after:bottom-0 after:left-1/2 after:-translate-x-1/2
                  after:w-[50px] after:h-[3px]
                  after:bg-[linear-gradient(90deg,#3498db,#2ecc71)]
                  after:rounded-[3px]
                "
              >
                <h3 className="text-[1.8rem] text-[#2c3e50] mb-2">
                  Silver Report
                </h3>

                <div
                  className="
                    text-[2.8rem] font-bold
                    text-(--neon-green)
                    drop-shadow-(--neon-glow)
                    relative inline-block
                    before:content-['$'] before:relative
                    before:text-[1.5rem] before:top-[-0.8rem]
                    before:mr-0.5
                  "
                >
                  60
                </div>

                <p className="text-gray-500 mt-1">One-time payment</p>
              </div>

              <ul className="text-left mb-8">
                {[
                  "Everything in Bronze",
                  "+ Accident History",
                  "+ Service Records",
                  "+ Recall Information",
                  "60-Day Money Back",
                ].map((item) => (
                  <li
                    key={item}
                    className="
                      py-3 pl-8 text-[#555]
                      text-[1rem]
                      border-b border-[#eee]
                      relative
                    "
                  >
                    <i
                      className="
                        fas fa-check text-[#2ecc71]
                        absolute left-0 top-4
                      "
                    ></i>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                className="
                  py-3 px-8 rounded-full w-[80%]
                  text-white font-semibold
                  uppercase tracking-[1px]
                  bg-[linear-gradient(90deg,#3498db,#2ecc71)]
                  shadow-[0_4px_15px_rgba(46,204,113,0.4)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  relative overflow-hidden
                  before:content-[''] before:absolute before:top-0
                  before:-left-full before:w-full before:h-full
                  before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)]
                  before:transition-all before:duration-500
                  hover:before:left-full
                "
              >
                Choose Plan
              </button>
            </div>

            {/* Card 3 */}
            <div
              className="
                bg-(--bg-white)
                rounded-[15px]
                shadow-[0_10px_30px_rgba(0,0,0,0.3)]
                p-10 w-full max-w-[350px]
                border border-[#333]
                transition-all duration-300
                relative overflow-hidden
                hover:-translate-y-2.5
                hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)]
                max-md:max-w-full
              "
            >
              <div
                className="
                  mb-8 pb-6 relative
                  after:content-[''] after:absolute
                  after:bottom-0 after:left-1/2 after:-translate-x-1/2
                  after:w-[50px] after:h-[3px]
                  after:bg-[#3498db] after:rounded-[3px]
                "
              >
                <h3 className="text-[1.8rem] text-[#2c3e50] mb-2">
                  Golden Report
                </h3>

                <div
                  className="
                    text-[2.8rem] font-bold
                    text-(--neon-green)
                    drop-shadow-(--neon-glow)
                    relative inline-block
                    before:content-['$'] before:relative
                    before:text-[1.5rem] before:top-[-0.8rem]
                    before:mr-0.5
                  "
                >
                  90
                </div>

                <p className="text-gray-500 mt-1">One-time payment</p>
              </div>

              <ul className="text-left mb-8">
                {[
                  "Everything in Silver",
                  "+ Market Value",
                  "+ Ownership Cost",
                  "+ Buy or Avoid Verdict",
                  "90-Day Money Back",
                ].map((item) => (
                  <li
                    key={item}
                    className="
                      py-3 pl-8 text-[#555]
                      text-[1rem]
                      border-b border-[#eee]
                      relative
                    "
                  >
                    <i
                      className="
                        fas fa-check text-[#2ecc71]
                        absolute left-0 top-4
                      "
                    ></i>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                className="
                  py-3 px-8 rounded-full w-[80%]
                  bg-(--neon-green) text-black font-semibold
                  uppercase tracking-[1px]
                  shadow-[0_0_15px_rgba(57,255,20,0.5)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  relative overflow-hidden
                  before:content-[''] before:absolute before:top-0
                  before:-left-full before:w-full before:h-full
                  before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)]
                  before:transition-all before:duration-500
                  hover:before:left-full
                "
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <p
            className="
              inline-flex items-center gap-3
              bg-[rgba(57,255,20,0.1)]
              px-6 py-3 rounded-full
              text-(--neon-green)
              border border-[rgba(57,255,20,0.3)]
              shadow-[0_0_15px_rgba(57,255,20,0.2)]
              mt-8 text-[1rem]
              max-md:flex-col max-md:max-w-[320px]
              max-md:text-center max-md:rounded-[10px]
              max-md:py-4
            "
          >
            <i
              className="
                fas fa-shield-alt text-(--neon-green)
                text-[1.2rem] p-2 w-[34px] h-[34px]
                rounded-full inline-flex items-center justify-center
                bg-[rgba(57,255,20,0.2)]
                shadow-[0_0_10px_var(--neon-green)]
                max-md:mb-2
              "
            ></i>
            All plans come with our 100% satisfaction guarantee
          </p>
        </div>
      </section>

      <section className="bg-black py-24 px-[5%] relative overflow-hidden border-t border-[rgba(57,255,20,0.2)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 max-w-[1200px] mx-auto relative z-1">

          {/* Service Card 1 */}
          <div className="group bg-[rgba(18,18,18,0.8)] p-10 rounded-lg text-center transition-all duration-300 border border-[rgba(57,255,20,0.1)] relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(57,255,20,0.1)] hover:border-(--neon-green)">
            <span className="w-20 h-20 bg-[rgba(57,255,20,0.1)] rounded-full flex items-center justify-center text-[2rem] text-(--neon-green) mb-6 border-2 border-(--neon-green) shadow-[0_0_15px_rgba(57,255,20,0.2)] transition-all duration-300 group-hover:bg-(--neon-green) group-hover:text-black group-hover:rotate-y-180 icon-float-1">
              <i className="fa-solid fa-file-alt"></i>
            </span>

            <h4 className="text-white text-[1.5rem] font-semibold mb-4 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-0.5 after:bg-(--neon-green) after:shadow-[0_0_8px_var(--neon-green)] after:transition-all group-hover:after:w-20">
              Comprehensive History
            </h4>

            <p className="text-[#b3b3b3] leading-relaxed text-[1rem]">
              Our reports give you a detailed view of the car's title, accident history, and service records.
            </p>
          </div>

          {/* Service Card 2 */}
          <div className="group bg-[rgba(18,18,18,0.8)] p-10 rounded-lg text-center transition-all duration-300 border border-[rgba(57,255,20,0.1)] relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(57,255,20,0.1)] hover:border-(--neon-green)">
            <span className="w-20 h-20 bg-[rgba(57,255,20,0.1)] rounded-full flex items-center justify-center text-[2rem] text-(--neon-green) mb-6 border-2 border-(--neon-green) shadow-[0_0_15px_rgba(57,255,20,0.2)] transition-all duration-300 group-hover:bg-(--neon-green) group-hover:text-black group-hover:rotate-y-180 icon-float-2">
              <i className="fa-solid fa-shield-alt"></i>
            </span>

            <h4 className="text-white text-[1.5rem] font-semibold mb-4 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-0.5 after:bg-(--neon-green) after:shadow-[0_0_8px_var(--neon-green)] after:transition-all group-hover:after:w-20">
              Buy or Avoid Verdict
            </h4>

            <p className="text-[#b3b3b3] leading-relaxed text-[1rem]">
              Our unique rating system gives you a verdict that considers history and condition.
            </p>
          </div>

          {/* Service Card 3 */}
          <div className="group bg-[rgba(18,18,18,0.8)] p-10 rounded-lg text-center transition-all duration-300 border border-[rgba(57,255,20,0.1)] relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(57,255,20,0.1)] hover:border-(--neon-green)">
            <span className="w-20 h-20 bg-[rgba(57,255,20,0.1)] rounded-full flex items-center justify-center text-[2rem] text-(--neon-green) mb-6 border-2 border-(--neon-green) shadow-[0_0_15px_rgba(57,255,20,0.2)] transition-all duration-300 group-hover:bg-(--neon-green) group-hover:text-black group-hover:rotate-y-180 icon-float-3">
              <i className="fa-solid fa-chart-line"></i>
            </span>

            <h4 className="text-white text-[1.5rem] font-semibold mb-4 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-0.5 after:bg-(--neon-green) after:shadow-[0_0_8px_var(--neon-green)] after:transition-all group-hover:after:w-20">
              Market Comparison
            </h4>

            <p className="text-[#b3b3b3] leading-relaxed text-[1rem]">
              Gain insights and compare your vehicle to similar vehicles by pricing and reliability.
            </p>
          </div>

        </div>
      </section>

      <section className="bg-black py-24 px-[5%] relative overflow-hidden border-t border-[rgba(57,255,20,0.2)]">
        <div className="max-w-[1200px] mx-auto relative z-1">

          {/* Title */}
          <h2 className="relative text-center text-[2.5rem] mb-12 text-(--neon-green) shadow-neon inline-block left-1/2 -translate-x-1/2 after:content-[''] after:absolute after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-0.5 after:bg-(--neon-green) after:shadow-[0_0_10px_var(--neon-green)]">
            What Our Users Say
          </h2>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 mb-16">

            {/* Card 1 */}
            <div className="group testimonial-card bg-[rgba(18,18,18,0.8)] p-8 rounded-lg border border-[rgba(57,255,20,0.1)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(57,255,20,0.1)] hover:border-(--neon-green)">
              <span className="text-[#ffc107] text-[1.2rem] tracking-[3px] mb-4 block">★★★★★</span>
              <p className="text-[#e0e0e0] italic leading-relaxed mb-4">
                "The report revealed critical information including a lien on the vehicle. This saved me a major headache and thousands of dollars."
              </p>
              <p className="text-[#b3b3b3]">
                <strong className="text-white font-semibold">David A.</strong>, Gilbert, AZ
              </p>
            </div>

            {/* Card 2 */}
            <div className="group testimonial-card bg-[rgba(18,18,18,0.8)] p-8 rounded-lg border border-[rgba(57,255,20,0.1)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(57,255,20,0.1)] hover:border-(--neon-green)">
              <span className="text-[#ffc107] text-[1.2rem] tracking-[3px] mb-4 block">★★★★★</span>
              <p className="text-[#e0e0e0] italic leading-relaxed mb-4">
                "I was about to buy a used car that seemed perfect, but the CarReport showed it had been in a major accident. Thank you!"
              </p>
              <p className="text-[#b3b3b3]">
                <strong className="text-white font-semibold">Sarah M.</strong>, Austin, TX
              </p>
            </div>

            {/* Card 3 */}
            <div className="group testimonial-card bg-[rgba(18,18,18,0.8)] p-8 rounded-lg border border-[rgba(57,255,20,0.1)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(57,255,20,0.1)] hover:border-(--neon-green)">
              <span className="text-[#ffc107] text-[1.2rem] tracking-[3px] mb-4 block">★★★★★</span>
              <p className="text-[#e0e0e0] italic leading-relaxed mb-4">
                "The market comparison feature helped me negotiate a better price. I saved $1,500 on my purchase!"
              </p>
              <p className="text-[#b3b3b3]">
                <strong className="text-white font-semibold">James K.</strong>, Miami, FL
              </p>
            </div>

          </div>

          {/* Partners Title */}
          <h2 className="partners-title relative text-center text-[2.5rem] mb-12 text-(--neon-green) shadow-neon inline-block left-1/2 -translate-x-1/2 after:content-[''] after:absolute after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-0.5 after:bg-(--neon-green) after:shadow-[0_0_10px_var(--neon-green)]">
            Premium Partners
          </h2>

          {/* Partners Logos */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-6">
            {["AutoTrader", "Cars.com", "CarMax", "CarGurus", "TrueCar", "Edmunds"].map((partner) => (
              <div
                key={partner}
                className="text-center py-6 border border-[rgba(57,255,20,0.1)] bg-[rgba(18,18,18,0.5)] rounded-lg text-[#b3b3b3] font-medium tracking-wide shadow-[0_0_10px_rgba(57,255,20,0.1)]"
              >
                {partner}
              </div>
            ))}
          </div>

        </div>
      </section>

      <section
        className="
            bg-black 
            px-[5%] 
            py-20
            flex 
            justify-between 
            items-center 
            gap-12 
            border-t border-b border-[rgba(57,255,20,0.2)]
            relative 
            overflow-hidden
            max-lg:flex-col
            max-lg:text-center
        "
      >
        {/* Top neon gradient bar */}
        <div
            className="
                absolute top-0 left-0 right-0 h-0.5
                bg-[linear-gradient(90deg,transparent,var(--neon-green),transparent)]
            "
        />

        {/* LEFT CONTENT */}
        <div className="flex-1 max-w-[600px] max-lg:max-w-full max-lg:mb-8">
            <h2
                className="
                    text-(--neon-green) 
                    text-5xl 
                    mb-4 
                    drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]
                "
            >
                Only $40.00
            </h2>

            <h3 className="text-white text-2xl font-semibold mb-6">
                for a vehicle history report
            </h3>

            <p className="text-[#b3b3b3] text-[1.1rem] leading-[1.6] mb-8">
                Get a comprehensive vehicle history report, title and service history,
                accident details, and current market value.
            </p>
        </div>

        {/* RIGHT CONTENT */}
        <div
            className="
                flex-1 max-w-[500px]
                bg-[rgba(18,18,18,0.8)]
                p-10
                rounded-lg
                border border-[rgba(57,255,20,0.2)]
                shadow-[0_10px_30px_rgba(0,0,0,0.5)]
                animate-[glow_3s_infinite]
                max-lg:max-w-full
            "
        >
            {/* Glow Animation Keyframes */}
            <style>
                {`
                    @keyframes glow {
                        0% { box-shadow: 0 0 5px var(--neon-green); }
                        50% { box-shadow: 0 0 20px var(--neon-green); }
                        100% { box-shadow: 0 0 5px var(--neon-green); }
                    }
                `}
            </style>

            <h3
                className="
                    text-(--neon-green)
                    text-xl 
                    mb-2
                    drop-shadow-[0_0_10px_rgba(57,255,20,0.2)]
                "
            >
                Enter Your VIN
            </h3>

            <p className="text-[#b3b3b3] mb-6 text-[0.95rem]">
                17-digit Vehicle Identification Number
            </p>

            {/* VIN FORM */}
            <form
                className="
                    flex 
                    flex-wrap
                    gap-4
                    max-lg:flex-col
                "
            >
                <input
                    type="text"
                    placeholder="Enter 17-digit VIN here"
                    required
                    className="
                        flex-1 
                        min-w-[250px]
                        px-5 
                        py-3.5
                        rounded-full
                        bg-[rgba(255,255,255,0.03)]
                        border border-[rgba(255,255,255,0.1)]
                        text-white
                        text-[1rem]
                        transition-all duration-300
                        focus:outline-none
                        focus:border-(--neon-green)
                        focus:shadow-[0_0_15px_rgba(57,255,20,0.2)]
                    "
                />

                {/* BUTTON */}
                <button
                    type="submit"
                    className="
                        bg-(--neon-green)
                        text-black
                        font-semibold
                        px-8 
                        py-3.5
                        rounded-full
                        text-[1rem]
                        uppercase
                        tracking-[1px]
                        shadow-[0_0_15px_rgba(57,255,20,0.3)]
                        transition-all 
                        duration-300
                        cursor-pointer

                        hover:bg-black
                        hover:text-(--neon-green)
                        hover:-translate-y-0.5
                        hover:shadow-[0_5px_20px_rgba(57,255,20,0.4)]

                        max-lg:w-full
                    "
                >
                    Get Report
                </button>
            </form>
        </div>
      </section>

      <section className="bg-black py-24 px-[5%] border-t border-[rgba(57,255,20,0.2)] relative overflow-hidden">
        <h2 className="text-(--neon-green) text-4xl md:text-5xl text-center mb-12 relative inline-block left-1/2 -translate-x-1/2 drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]">
          Frequently Asked Questions
          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-(--neon-green) drop-shadow-[0_0_10px_var(--neon-green)]"></span>
        </h2>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      <footer className="bg-[rgba(18,18,18,0.98)] text-white pt-16 pb-8 px-[5%] border-t border-[rgba(57,255,20,0.2)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-(--neon-green) to-transparent"></div>

        <div className="max-w-[1200px] mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="footer-about">
            <div className="flex items-center gap-2 text-(--neon-green) font-bold text-xl mb-4 drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
              <i className="fas fa-car"></i> DigitalWorhtyReports
            </div>
            <p className="text-[#b3b3b3] mb-4">
              Providing comprehensive vehicle history reports to help you make informed decisions when buying or selling a car.
            </p>
            <div className="flex justify-center gap-6 mt-4">
              <a href="#" className="text-[#b3b3b3] hover:text-(--neon-green) transition-all duration-300 text-xl"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-[#b3b3b3] hover:text-(--neon-green) transition-all duration-300 text-xl"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-[#b3b3b3] hover:text-(--neon-green) transition-all duration-300 text-xl"><i className="fab fa-instagram"></i></a>
              <a href="#" className="text-[#b3b3b3] hover:text-(--neon-green) transition-all duration-300 text-xl"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>

          <div className="footer-links">
            <h3 className="text-(--neon-green) uppercase tracking-wider mb-4 relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-(--neon-green) drop-shadow-[0_0_5px_var(--neon-green)]"></span>
            </h3>
            <ul className="list-none p-0 m-0">
              {["Home", "Car History", "Car Report", "Dealer Pricing", "About Us", "Contact"].map((link, idx) => (
                <li key={idx} className="mb-2">
                  <a href="#" className="relative pl-5 text-[#b3b3b3] hover:text-(--neon-green) hover:pl-8 transition-all duration-300">
                    <span className="absolute left-0 opacity-0 text-(--neon-green) transition-all duration-300">→</span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-contact">
            <h3 className="text-(--neon-green) uppercase tracking-wider mb-4 relative inline-block">
              Contact Us
              <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-(--neon-green) drop-shadow-[0_0_5px_var(--neon-green)]"></span>
            </h3>
            <div className="flex items-start gap-2 text-[#b3b3b3] mb-2"><i className="fas fa-map-marker-alt text-(--neon-green) mt-1"></i><span>123 Auto Street, Motor City, MC 12345</span></div>
            <div className="flex items-start gap-2 text-[#b3b3b3] mb-2"><i className="fas fa-phone-alt text-(--neon-green) mt-1"></i><span>+1 (555) 123-4567</span></div>
            <div className="flex items-start gap-2 text-[#b3b3b3] mb-2"><i className="fas fa-envelope text-(--neon-green) mt-1"></i><span>info@digitalworthyreports.com</span></div>
          </div>

          <div className="footer-newsletter">
            <h3 className="text-(--neon-green) uppercase tracking-wider mb-4 relative inline-block">
              Newsletter
              <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-(--neon-green) drop-shadow-[0_0_5px_var(--neon-green)]"></span>
            </h3>
            <p className="text-[#b3b3b3] mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
            <form className="flex gap-2 flex-col sm:flex-row mt-4">
              <input type="email" placeholder="Your email address" required className="flex-1 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-(--neon-green) focus:shadow-[0_0_10px_rgba(57,255,20,0.3)]"/>
              <button type="submit" className="bg-(--neon-green) text-black px-4 py-2 rounded-full font-semibold uppercase text-xs tracking-wide hover:bg-[#3ae60d] hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] hover:-translate-y-1 transition-all">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.1)] text-center text-gray-500 text-sm">
          &copy; 2023 DigitalWorthyReports. All rights reserved. | <a href="#" className="hover:text-(--neon-green)">Privacy Policy</a> | <a href="#" className="hover:text-(--neon-green)">Terms of Service</a>
        </div>
      </footer>


    {/* <script>
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const nav = document.querySelector('.nav');
        
        if (mobileMenuBtn && nav) {
            mobileMenuBtn.addEventListener('click', () => {
                nav.classNameList.toggle('active');
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav') && !e.target.closest('.mobile-menu-btn')) {
                nav.classNameList.remove('active');
            }
        });
        
        // FAQ toggle functionality
        document.querySelectorAll('.faq-question').forEach(button => {
            button.addEventListener('click', () => {
                const answer = button.nextElementSibling;
                const isActive = answer.classNameList.contains('active');
                
                // Close all answers
                document.querySelectorAll('.faq-answer').forEach(ans => {
                    ans.classNameList.remove('active');
                });
                document.querySelectorAll('.faq-question').forEach(btn => {
                    btn.classNameList.remove('active');
                });
                
                // Open clicked answer if it wasn't already active
                if (!isActive) {
                    answer.classNameList.add('active');
                    button.classNameList.add('active');
                }
            });
        });
    </script>
    <script src="assets/js/script.js"></script>
    
    <!--Start of Tawk.to Script-->
    <script type="text/javascript">
    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
    (function(){
    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
    s1.async=true;
    s1.src='https://embed.tawk.to/6925eccd8d697a195b3559f6/1jau2a0t8';
    s1.charset='UTF-8';
    s1.setAttribute('crossorigin','*');
    s0.parentNode.insertBefore(s1,s0);
    })();
    </script>
    <!--End of Tawk.to Script--> */}
</div>
  );
}
