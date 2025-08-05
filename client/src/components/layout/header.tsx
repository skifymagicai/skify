import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="gradient-bg px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <i className="fas fa-video text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-bold" data-testid="app-title">{t("app.title")}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={language} onValueChange={(value: "en" | "ta") => setLanguage(value)}>
              <SelectTrigger className="w-32 bg-card border-border" data-testid="language-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ta">தமிழ்</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-testid="signin-button"
            >
              <i className="fab fa-google mr-2"></i>
              {t("auth.signin")}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
