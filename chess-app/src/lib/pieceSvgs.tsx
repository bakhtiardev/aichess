import React from 'react'

export const PieceComponents: Record<
  string,
  React.FC<{ style?: React.CSSProperties }>
> = {
  wP: ({ style }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      style={{ ...style, width: '100%', height: '100%' }}
    >
      <path
        d="M22.5 9c-3.85 0-7.02 2.763-7.02 6.193h1.053c0-2.83 2.08-5.14 5.967-5.14 3.887 0 5.968 2.31 5.968 5.14h1.053C29.52 11.763 26.35 9 22.5 9z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 17c-2.21 0-4 1.79-4 4v4c0 2.21 1.79 4 4 4h15c2.21 0 4-1.79 4-4v-4c0-2.21-1.79-4-4-4H15z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bP: ({ style }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      style={{ ...style, width: '100%', height: '100%' }}
    >
      <path
        d="M22.5 9c-3.85 0-7.02 2.763-7.02 6.193h1.053c0-2.83 2.08-5.14 5.967-5.14 3.887 0 5.968 2.31 5.968 5.14h1.053C29.52 11.763 26.35 9 22.5 9z"
        fill="black"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 17c-2.21 0-4 1.79-4 4v4c0 2.21 1.79 4 4 4h15c2.21 0 4-1.79 4-4v-4c0-2.21-1.79-4-4-4H15z"
        fill="black"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  wN: ({ style }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      style={{ ...style, width: '100%', height: '100%' }}
    >
      <path
        d="M32.5 21c0-3.5-1.5-7-4-9l-4-8h-7v4l-2-2v8h7l2 2c2 2 3 4 3 7v2h4v-4z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bN: ({ style }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      style={{ ...style, width: '100%', height: '100%' }}
    >
      <path
        d="M32.5 21c0-3.5-1.5-7-4-9l-4-8h-7v4l-2-2v8h7l2 2c2 2 3 4 3 7v2h4v-4z"
        fill="black"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  wB: ({ style }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      style={{ ...style, width: '100%', height: '100%' }}
    >
      <path
        d="M22.5 9c3 0 5 2 5 5s-2 4-5 4-5-1-5-4 2-5 5-5z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.5 18c-3 0-8 4-8 8v9h16v-9c0-4-5-8-8-8z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bB: ({ style }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      style={{ ...style, width: '100%', height: '100%' }}
    >
      <path
        d="M22.5 9c3 0 5 2 5 5s-2 4-5 4-5-1-5-4 2-5 5-5z"
        fill="black"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.5 18c-3 0-8 4-8 8v9h16v-9c0-4-5-8-8-8z"
        fill="black"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  wR: ({ style }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      style={{ ...style, width: '100%', height: '100%' }}
    >
      <path
        d="M15 9h30v6h-3v20h-24v-20h-3V9z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 9v3h3v-3h3v3h3v-3h3v3h3v-3z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bR: ({ style }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      style={{ ...style, width: '100%', height: '100%' }}
    >
      <path
        d="M15 9h30v6h-3v20h-24v-20h-3V9z"
        fill="black"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 9v3h3v-3h3v3h3v-3h3v3h3v-3z"
        fill="black"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  wQ: ({ style }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      style={{ ...style, width: '100%', height: '100%' }}
    >
      <path
        d="M22.5 10c1.656 0 3 1.344 3 3s-1.344 3-3 3-3-1.344-3-3 1.344-3 3-3z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 28c0 2.21 1.79 4 4 4h3l-4-8h-3v4z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 28c0 2.21-1.79 4-4 4h-3l4-8h3v4z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bQ: ({ style }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      style={{ ...style, width: '100%', height: '100%' }}
    >
      <path
        d="M22.5 10c1.656 0 3 1.344 3 3s-1.344 3-3 3-3-1.344-3-3 1.344-3 3-3z"
        fill="black"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 28c0 2.21 1.79 4 4 4h3l-4-8h-3v4z"
        fill="black"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 28c0 2.21-1.79 4-4 4h-3l4-8h3v4z"
        fill="black"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  wK: ({ style }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      style={{ ...style, width: '100%', height: '100%' }}
    >
      <path
        d="M22.5 10.5l-3 3h-4v5h1l2 2v3h-3v5h15v-5h-3v-3l2-2h1v-5h-4l-3-3z"
        fill="white"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="14.5" r="1" fill="black" />
    </svg>
  ),
  bK: ({ style }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      style={{ ...style, width: '100%', height: '100%' }}
    >
      <path
        d="M22.5 10.5l-3 3h-4v5h1l2 2v3h-3v5h15v-5h-3v-3l2-2h1v-5h-4l-3-3z"
        fill="black"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="14.5" r="1" fill="white" />
    </svg>
  ),
}
