interface Props {
  className?: string
}

export function LogoIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Page body — subtle fill */}
      <rect x="2" y="2" width="20" height="20" rx="3.5" fillOpacity="0.15" />

      {/* Header bar — filled top section */}
      <rect x="2" y="2" width="20" height="7" rx="3.5" />
      {/* Square off the bottom corners of the header */}
      <rect x="2" y="6" width="20" height="3" />

      {/* Task line 1 — full width */}
      <rect x="5" y="13" width="14" height="1.75" rx="0.875" />

      {/* Task line 2 — full width */}
      <rect x="5" y="16.5" width="14" height="1.75" rx="0.875" />

      {/* Task line 3 — shorter, visual rhythm */}
      <rect x="5" y="20" width="8.5" height="1.75" rx="0.875" />
    </svg>
  )
}
