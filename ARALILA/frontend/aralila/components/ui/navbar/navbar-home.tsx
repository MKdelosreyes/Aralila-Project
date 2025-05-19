'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed left-1/2 top-0 z-50 w-11/12 max-w-7xl -translate-x-1/2 backdrop-blur-md bg-white/10 border-b border-white/20 rounded-full m-7 h-20 px-6">
      <div className="flex items-center justify-between h-full text-white text-sm font-medium">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image
              src="images/aralila-logo-exp1.svg"
              alt="Aralila Logo"
              width={120}
              height={80}
              className="object-contain mt-3 ml-3"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#">HOME</Link>
          <Link href="#about">ABOUT</Link>
          <Link href="#pricing">PRICING</Link>
          <Link href="/login">
            <Button variant="ghost" className="ml-3 hover:text-purple-700 hover:bg-transparent rounded-full cursor-pointer">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" className="mr-3 bg-purple-700 text-white border-transparent hover:bg-white hover:text-purple-700 rounded-full cursor-pointer">
              Sign up
            </Button>
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <Button onClick={() => setIsOpen(!isOpen)} variant="ghost" size="icon">
            <Menu className="size-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="flex flex-col md:hidden items-center mt-3 space-y-3 text-white">
          <Link href="#" onClick={() => setIsOpen(false)}>HOME</Link>
          <Link href="#about" onClick={() => setIsOpen(false)}>ABOUT</Link>
          <Link href="#pricing" onClick={() => setIsOpen(false)}>PRICING</Link>
          <Link href="/login" onClick={() => setIsOpen(false)}>
            <Button variant="outline" className="w-full text-white border-white hover:bg-white hover:text-purple-700">
              Login
            </Button>
          </Link>
          <Link href="/signup" onClick={() => setIsOpen(false)}>
            <Button variant="outline" className="w-full text-white border-white hover:bg-white hover:text-purple-700">
              Sign up
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
