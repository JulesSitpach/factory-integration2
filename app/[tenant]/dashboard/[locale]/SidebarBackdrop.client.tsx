'use client';
import React from 'react';

export default function SidebarBackdrop() {
  const handleClick = () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.add('-translate-x-full');
    }
    document.getElementById('sidebar-backdrop')?.classList.add('hidden');
  };

  React.useEffect(() => {
    const btn = document.getElementById('mobile-menu-button');
    if (btn) {
      btn.addEventListener('click', () => {
        document.getElementById('sidebar-backdrop')?.classList.remove('hidden');
      });
    }
    return () => {
      if (btn) {
        btn.removeEventListener('click', () => {
          document
            .getElementById('sidebar-backdrop')
            ?.classList.remove('hidden');
        });
      }
    };
  }, []);

  return (
    <div
      id="sidebar-backdrop"
      className="fixed inset-0 bg-slate/50 lg:hidden z-30 hidden"
      onClick={handleClick}
    ></div>
  );
}
