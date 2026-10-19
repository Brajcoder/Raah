import React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden bg-[#faf8ff]">
      {/* Ambient Background Raah Logo Watermark & Glow (Same as Login page) */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center z-0">
        <div className="absolute w-[800px] h-[800px] sm:w-[950px] sm:h-[950px] bg-gradient-to-tr from-[#4f46e5]/7 via-[#fea619]/6 to-transparent rounded-full blur-3xl pointer-events-none" />
        <img
          src="/logo.png"
          alt=""
          className="w-[620px] sm:w-[780px] md:w-[880px] lg:w-[980px] xl:w-[1080px] max-w-none opacity-[0.08] object-contain transition-all duration-700"
        />
      </div>

      <div className="text-center max-w-md backdrop-blur-xl bg-white border border-[#c7c4d8]/70 rounded-2xl p-8 shadow-xl relative z-10">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#131b2e]">404</h1>
        <p className="mt-2 text-sm text-[#777587]">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
