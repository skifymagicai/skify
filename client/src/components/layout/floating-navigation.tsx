import { useLocation } from "wouter";

const NAV_ITEMS = [
  { path: "/", icon: "fas fa-home", testId: "nav-home" },
  { path: "/analysis", icon: "fas fa-search", testId: "nav-analysis" },
  { path: "/template-preview", icon: "fas fa-layer-group", testId: "nav-templates" },
  { path: "/upload-apply", icon: "fas fa-upload", testId: "nav-upload" },
  { path: "/comparison-export", icon: "fas fa-play", testId: "nav-preview" },
];

export default function FloatingNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <div className="floating-nav" data-testid="floating-navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.path}
          className={`nav-btn ${location === item.path ? "active" : ""}`}
          onClick={() => setLocation(item.path)}
          data-testid={item.testId}
        >
          <i className={item.icon}></i>
        </button>
      ))}
    </div>
  );
}
