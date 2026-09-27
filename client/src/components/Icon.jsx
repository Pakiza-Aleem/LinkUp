// A tiny set of outline icons drawn as inline SVG.
// Using our own icons means no extra icon library to install.
const paths = {
  home: (<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h5v-6h4v6h5V9.5" /></>),
  compass: (<><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>),
  plus: <path d="M12 5v14M5 12h14" />,
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" /></>),
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 19c0-3.3 2.9-5 6.5-5s6.5 1.7 6.5 5" /><circle cx="17" cy="9" r="2.5" /><path d="M17.5 14c2.5.2 4 1.6 4 4" /></>),
  settings: (<><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>),
  logout: (<><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" /><path d="m16 8 4 4-4 4M20 12H9" /></>),
  heart: <path d="M12 20.5C7 17 3 13.5 3 9.2 3 6.7 4.9 5 7.1 5c1.9 0 3.6 1 4.9 2.8C13.3 6 15 5 16.9 5 19.1 5 21 6.7 21 9.2c0 4.3-4 7.8-9 11.3z" />,
  comment: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  image: (<><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="1.5" /><path d="m21 16-5-5-8 8" /></>),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevronLeft: <path d="m15 5-7 7 7 7" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  alert: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.5" /></>),
  send: <path d="M4 12 20 4l-4 16-4-6.5z" />,
  refresh: <path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" />,
};

export default function Icon({ name, size = 20, filled = false, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
