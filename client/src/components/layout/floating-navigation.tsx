import { Button } from "@/components/ui/button";
import { Home, Search, Video, Settings } from "lucide-react";
import { useLocation } from "wouter";

export default function FloatingNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Search, path: "/analysis", label: "Analyze" },
    { icon: Video, path: "/upload-apply", label: "Create" },
    { icon: Settings, path: "/template-preview", label: "Templates" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-full px-4 py-2 flex items-center gap-2 border border-gray-700">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant={location === item.path ? "default" : "ghost"}
            size="sm"
            onClick={() => setLocation(item.path)}
            className={`rounded-full w-10 h-10 p-0 ${
              location === item.path
                ? "bg-purple-600 hover:bg-purple-700"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            <item.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  );
}