import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Menu, X } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }: any) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setIsMenuOpen(false)}
        className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
          isActive 
            ? 'bg-ox-gold text-ox-black font-bold' 
            : 'text-ox-gold hover:bg-ox-card'
        }`}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-ox-black text-gray-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-ox-dark/95 backdrop-blur-sm border-b border-ox-gold/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ox-gold rounded flex items-center justify-center">
              <span className="font-serif font-bold text-xl text-ox-black">OX</span>
            </div>
            <h1 className="font-serif text-xl tracking-widest text-ox-gold hidden sm:block">
              OX LOUNGE
            </h1>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-4">
            <NavItem to="/" icon={FileText} label="Biodata Form" />
            <NavItem to="/admin" icon={LayoutDashboard} label="Admin Portal" />
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-ox-gold"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-ox-card border-b border-ox-gold/20 p-4 flex flex-col gap-2">
            <NavItem to="/" icon={FileText} label="Biodata Form" />
            <NavItem to="/admin" icon={LayoutDashboard} label="Admin Portal" />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-ox-gold/20 bg-ox-dark py-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} OX Lounge. All Rights Reserved.</p>
      </footer>
    </div>
  );
};