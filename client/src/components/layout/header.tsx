import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";

export default function Header() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/gallery", label: "Gallery" },
    { href: "/analysis", label: "Analysis" },
    { href: "/template-preview", label: "Templates" },
    { href: "/upload-apply", label: "Upload" },
    { href: "/comparison-export", label: "Preview" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2" data-testid="logo">
            <button onClick={() => setLocation("/")} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold text-gray-900">
                Skify
              </h1>
              <span className="text-sm text-gray-500 font-medium">
                AI Video Transform
              </span>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => setLocation(item.href)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location === item.href
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* User Avatar */}
          <div className="flex items-center">
            <Avatar className="h-8 w-8" data-testid="user-avatar">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
