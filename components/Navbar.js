'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react'; // For hamburger icons, install with: npm i lucide-react

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();

        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <Link href="/">
          <h1 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition">
            Skill Swap Platform
          </h1>
        </Link>

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-800"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
              >
                Profile
              </Link>
              <Link
                href="/swap-requests"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
              >
                Swap Requests
              </Link>
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
              >
                Home
              </Link>
              <img
                src={user.profilePhoto || '/images/avatar.png'}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
            </>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4">
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/swap-requests"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                onClick={() => setMenuOpen(false)}
              >
                Swap Requests
              </Link>
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <div className="flex items-center gap-2">
                <img
                  src={user.profilePhoto || '/images/avatar.png'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border border-gray-300"
                />
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
