import React from 'react'
import { Check, X } from 'lucide-react'

export const evaluatePassword = (password = '') => {
  const hasMinLength = password.length >= 8
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  let score = 0
  if (hasMinLength) score += 1
  if (hasLower && hasUpper) score += 1
  if (hasNumber) score += 1
  if (hasSpecial) score += 1

  let label = 'Very Weak'
  let color = 'bg-rose-500'
  let textColor = 'text-rose-400'

  if (password.length === 0) {
    label = ''
    color = 'bg-slate-700'
    textColor = 'text-slate-500'
  } else if (score === 1) {
    label = 'Weak'
    color = 'bg-rose-500'
    textColor = 'text-rose-400'
  } else if (score === 2) {
    label = 'Fair'
    color = 'bg-amber-500'
    textColor = 'text-amber-400'
  } else if (score === 3) {
    label = 'Good'
    color = 'bg-emerald-500'
    textColor = 'text-emerald-400'
  } else if (score >= 4) {
    label = 'Strong'
    color = 'bg-teal-400'
    textColor = 'text-teal-300'
  }

  return {
    score,
    label,
    color,
    textColor,
    criteria: [
      { text: 'At least 8 characters', met: hasMinLength },
      { text: 'Uppercase and lowercase letters', met: hasLower && hasUpper },
      { text: 'At least one number (0-9)', met: hasNumber },
      { text: 'At least one special character (!@#$...)', met: hasSpecial },
    ],
  }
}

export const PasswordStrength = ({ password = '' }) => {
  if (!password) return null

  const { score, label, color, textColor, criteria } = evaluatePassword(password)

  return (
    <div className="mt-2 space-y-2 text-xs">
      {/* Strength Bar */}
      <div className="flex items-center justify-between">
        <span className="text-slate-400 font-medium">Password strength</span>
        <span className={`font-semibold ${textColor}`}>{label}</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              score >= step ? color : 'bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Criteria Checklist */}
      <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
        {criteria.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 transition-colors duration-150 ${
              item.met ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            {item.met ? (
              <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
            ) : (
              <X className="w-3.5 h-3.5 flex-shrink-0 text-slate-600" />
            )}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
