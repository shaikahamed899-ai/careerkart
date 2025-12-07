"use client";

// Shared left-side collage panel used by Login & SignUp

export function AuthLeftPanel() {
  return (
    <div className="hidden md:flex md:w-[420px] lg:w-[440px] bg-primary-800 rounded-[32px] px-10 py-10 items-center justify-center">
      <div className="w-full max-w-[371.99px] h-[500.31px] space-y-[12.96px]">
        {/* Top wide image */}
        <div className="flex items-center justify-between w-full gap-[13px]">
          <div className="w-[243.67px] h-[115.35px] rounded-[57.68px] overflow-hidden bg-white/10">
            <img
              src="/assets/handshake.jpg"
              alt="Job interview handshake"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-shrink-0 w-[115.36px] h-[115.36px] rounded-[57.68px] bg-[#0B4DB0]" />
        </div>

        <div className="grid grid-cols-2">
          {/* Middle left image */}
          <div className="w-[152.94px] h-[115.35px] rounded-tl-[5.18px] rounded-tr-[25.92px] rounded-br-[25.92px] rounded-bl-[25.92px] overflow-hidden bg-white/10">
            <img
              src="/assets/women.jpg"
              alt="Professional"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle right text card */}
          <div className="w-[206.08px] h-[115.35px] rounded-[25.92px] bg-[#0453C8] flex items-center justify-center gap-[6.48px] pt-[13.61px] pr-[17.5px] pb-[13.61px] pl-[17.5px] text-white text-sm leading-relaxed">
            <p className="text-center">
              Glow Up Your Job Search with Our World Best Recruiter Donna &amp; Harvey
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 w-[371.99px] h-[115.35px] gap-[12.96px] items-center">
          {/* Circles row */}
          <div className="w-[115.36px] h-[115.36px] rounded-[66.1px] bg-[#0B4DB0]" />
          <div className="w-[115.36px] h-[115.36px] rounded-[66.1px] bg-[#579AFF]" />

          {/* Avatar circle card */}
          <div className="w-[115.36px] h-[115.36px] rounded-tl-[5.18px] rounded-tr-[57.68px] rounded-br-[57.68px] rounded-bl-[57.68px] bg-primary-400 flex items-center justify-center pt-[22.68px] pr-[18.79px] pb-[22.68px] pl-[18.79px] gap-[6.48px]">
            <div className="w-full h-full rounded-full bg-[#FBEBB2]" />
          </div>
        </div>

        {/* Bottom row: left card + right image pill */}
        <div className="flex w-[371.99px] h-[115.35px] gap-[12.96px]">
          {/* Left rounded card */}
          <div className="w-[115.36px] h-[115.36px] rounded-[57.68px] flex items-center justify-center gap-[6.48px] pt-[22.68px] pr-[18.79px] pb-[22.68px] pl-[18.79px] bg-[#579AFF]">
            <div className="w-full h-full rounded-full bg-[#FBEBB2]" />
          </div>

          {/* Right image pill */}
          <div className="w-[243.67px] h-[115.35px] rounded-tl-[5.18px] rounded-tr-[57.68px] rounded-br-[57.68px] rounded-bl-[57.68px] overflow-hidden bg-white/10">
            <img
              src="/assets/smilingleader.jpg"
              alt="Handshake"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
