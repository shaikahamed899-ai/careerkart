"use client";

// Shared left-side collage panel used by Login & SignUp

export function AuthLeftPanel() {
  return (
    <div className="hidden md:block w-1/2 bg-primary-700 p-8 rounded-l-2xl">
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Top wide image */}
        <div className="col-span-2 flex justify-center">
          <div className="w-full max-w-xs h-24 rounded-[40px] overflow-hidden bg-white/10">
            <img
              src="https://images.unsplash.com/photo-1521791055366-0d553872125f?w=600"
              alt="Interview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Middle left image */}
        <div className="rounded-3xl overflow-hidden bg-white/10 h-32">
          <img
            src="https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=400"
            alt="Professional"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Middle right text card */}
        <div className="rounded-3xl bg-primary-500 flex items-center justify-center px-4 text-white text-sm leading-relaxed">
          <p className="text-center">
            Glow Up Your Job Search with Our World Best Recruiter Donna &amp; Harvey
          </p>
        </div>

        {/* Circles row */}
        <div className="w-24 h-24 rounded-full bg-primary-600 self-center" />
        <div className="w-24 h-24 rounded-full bg-primary-400 self-center" />

        {/* Avatar circle */}
        <div className="w-20 h-20 rounded-full bg-primary-400 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white" />
        </div>

        {/* Bottom wide image */}
        <div className="col-span-2 flex justify-center items-end">
          <div className="w-full max-w-xs h-24 rounded-[40px] overflow-hidden bg-white/10">
            <img
              src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=600"
              alt="Handshake"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
