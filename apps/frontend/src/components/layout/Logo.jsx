export default function Logo({ variant = 'dark', size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  }

  const textColor = variant === 'light' ? 'text-on-primary' : 'text-primary'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeMap[size]} aspect-square rounded-lg bg-secondary flex items-center justify-center`}>
        <svg viewBox="0 0 24 24" fill="none" className={`${sizeMap[size]} p-1`}>
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-headline font-bold text-body-md ${textColor}`}>LUDEBRA</span>
        <span className={`font-headline text-label-sm ${textColor} opacity-70`}>LABS</span>
      </div>
    </div>
  )
}
