'use client';
import React from 'react';

export default function SidebarCloseButton() {
  const handleClick = () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.add('-translate-x-full');
    }
  };

  return (
    <button
      className="lg:hidden text-slate focus:outline-none"
      aria-label="Close sidebar"
      onClick={handleClick}
      type="button"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    </button>
  );
}
