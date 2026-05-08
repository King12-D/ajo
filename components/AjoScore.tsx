'use client'

interface AjoScoreProps {
  score: number
  size?: 'sm' | 'lg'
}

export function AjoScore({ score, size = 'lg' }: AjoScoreProps) {
  const percentage = (score - 300) / (850 - 300)
  const circumference = 2 * Math.PI * 45

  const sizeClasses = {
    sm: 'w-32 h-32',
    lg: 'w-48 h-48',
  }

  const textSizeClasses = {
    sm: 'text-3xl',
    lg: 'text-6xl',
  }

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]}`}>
      <svg className="w-full h-full" viewBox="0 0 120 120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-accent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - percentage * circumference}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.3s ease',
          }}
        />
        {/* Text in center */}
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dy="0.3em"
          className={`${textSizeClasses[size]} font-bold fill-foreground`}
        >
          {score}
        </text>
      </svg>
    </div>
  )
}
