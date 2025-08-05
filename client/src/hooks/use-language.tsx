import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "ta";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    "app.title": "Skify",
    "landing.hero.title": "Transform Your Videos with AI",
    "landing.hero.subtitle": "Analyze viral content and recreate stunning video styles in one click. No editing skills required.",
    "landing.upload.title": "Upload Viral Video",
    "landing.upload.subtitle": "Drop your TikTok, Reel, or YouTube Short here",
    "landing.features.ai.title": "AI Style Analysis",
    "landing.features.ai.desc": "Automatically extracts effects, transitions, and color grading from any video",
    "landing.features.transform.title": "One-Click Transform",
    "landing.features.transform.desc": "Apply professional styles to your videos instantly, no editing skills needed",
    "landing.features.viral.title": "Viral Ready",
    "landing.features.viral.desc": "Export broadcast-quality content optimized for social media platforms",
    "nav.home": "Home",
    "nav.analysis": "Analysis",
    "nav.templates": "Templates",
    "nav.upload": "Upload",
    "nav.preview": "Preview",
    "auth.signin": "Sign In",
    "auth.signup": "Sign Up",
    "payment.remove_watermark": "Remove Watermark",
    "payment.pro_plan": "Pro Plan"
  },
  ta: {
    "app.title": "ஸ்கைஃபி",
    "landing.hero.title": "AI உடன் உங்கள் வீடியோக்களை மாற்றுங்கள்",
    "landing.hero.subtitle": "வைரல் உள்ளடக்கத்தை பகுப்பாய்வு செய்து அற்புதமான வீடியோ பாணிகளை ஒரே கிளிக்கில் மீண்டும் உருவாக்குங்கள். எடிட்டிங் திறன்கள் தேவையில்லை.",
    "landing.upload.title": "வைரல் வீடியோவை பதிவேற்றுங்கள்",
    "landing.upload.subtitle": "உங்கள் TikTok, Reel அல்லது YouTube Short ஐ இங்கே இடுங்கள்",
    "landing.features.ai.title": "AI பாணி பகுப்பாய்வு",
    "landing.features.ai.desc": "எந்தவொரு வீடியோவிலிருந்தும் விளைவுகள், மாற்றங்கள் மற்றும் நிற கிரேடிங்கை தானாக பிரித்தெடுக்கிறது",
    "landing.features.transform.title": "ஒரே கிளிக் மாற்றம்",
    "landing.features.transform.desc": "தொழில்முறை பாணிகளை உங்கள் வீடியோக்களுக்கு உடனடியாக பயன்படுத்துங்கள், எடிட்டிங் திறன்கள் தேவையில்லை",
    "landing.features.viral.title": "வைரல் தயார்",
    "landing.features.viral.desc": "சமூக ஊடக தளங்களுக்கு உகந்த ஒளிபரப்பு தரமான உள்ளடக்கத்தை ஏற்றுமதி செய்யுங்கள்",
    "nav.home": "முகப்பு",
    "nav.analysis": "பகுப்பாய்வு",
    "nav.templates": "டெம்ப்ளேட்கள்",
    "nav.upload": "பதிவேற்று",
    "nav.preview": "முன்னோட்டம்",
    "auth.signin": "உள்நுழைக",
    "auth.signup": "பதிவு செய்க",
    "payment.remove_watermark": "வாட்டர்மார்க் அகற்று",
    "payment.pro_plan": "ப்ரோ திட்டம்"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
