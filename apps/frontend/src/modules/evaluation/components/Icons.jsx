const paths = {
  arrowLeft: <path d="m15 18-6-6 6-6" />,
  award: (
    <>
      <circle cx="12" cy="8" r="5" />
      <path d="M8.5 12 7 22l5-3 5 3-1.5-10" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  clipboard: (
    <>
      <rect width="14" height="16" x="5" y="5" rx="2" />
      <path d="M9 5V3h6v2M9 12l2 2 4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.75 3h10.5A2 2 0 0 0 19 18l-5-9V3" />
      <path d="M7.5 16h9" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13 6.5 5h11L20 13v6H4Z" />
      <path d="M4 13h5l1 2h4l1-2h5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  x: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
};

export function Icon({ name, className = "h-5 w-5" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}
