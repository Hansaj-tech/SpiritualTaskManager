interface BapsLogoProps {
  className?: string
}

export function BapsLogo({ className = 'w-12 h-12' }: BapsLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/baps-logo.png"
      alt="BAPS"
      className={`object-contain ${className}`}
    />
  )
}
