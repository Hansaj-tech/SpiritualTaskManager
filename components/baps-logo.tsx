interface BapsLogoProps {
  className?: string
}

// temporarily showing app icon instead of BAPS logo
export function BapsLogo({ className = 'w-12 h-12 object-contain' }: BapsLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icon.svg"
      alt="Aahanik"
      className={className}
    />
  )
}
