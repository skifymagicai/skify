export const RAZORPAY_CONFIG = {
  WATERMARK_REMOVAL_LINK: "https://rzp.io/rzp/Q5OwNLf",
  PRO_SUBSCRIPTION_LINK: "https://rzp.io/rzp/WbGPsmn",
  WATERMARK_REMOVAL_PRICE: 49,
  PRO_SUBSCRIPTION_PRICE: 199,
};

export const TEMPLATE_CATEGORIES = [
  { id: "cinematic", name: "Cinematic", icon: "fas fa-video" },
  { id: "neon", name: "Neon Vibes", icon: "fas fa-bolt" },
  { id: "minimal", name: "Clean Minimal", icon: "fas fa-circle" },
  { id: "dynamic", name: "Dynamic Sport", icon: "fas fa-running" },
];

export const PROCESSING_STAGES = [
  { id: "upload", name: "Video Upload", icon: "fas fa-upload" },
  { id: "analysis", name: "AI Analysis", icon: "fas fa-brain" },
  { id: "extraction", name: "Style Extraction", icon: "fas fa-magic" },
  { id: "application", name: "Style Application", icon: "fas fa-palette" },
  { id: "rendering", name: "Final Render", icon: "fas fa-cog" },
];

export const VIDEO_FORMATS = [
  { id: "mp4", name: "MP4", extension: ".mp4" },
  { id: "mov", name: "MOV", extension: ".mov" },
  { id: "gif", name: "GIF", extension: ".gif" },
];

export const PLATFORM_OPTIMIZATIONS = [
  { id: "tiktok", name: "TikTok", icon: "fab fa-tiktok", ratio: "9:16" },
  { id: "instagram", name: "Instagram", icon: "fab fa-instagram", ratio: "9:16" },
  { id: "youtube", name: "YouTube", icon: "fab fa-youtube", ratio: "16:9" },
  { id: "universal", name: "Universal", icon: "fas fa-globe", ratio: "9:16" },
];
