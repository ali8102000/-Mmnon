import Constants from "expo-constants";

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  Constants.expoConfig?.extra?.supabaseUrl ||
  "https://hvfiwjryffjwaynkpgar.supabase.co";

export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  (Constants.expoConfig?.extra?.googleMapsApiKey as string) ||
  "";

export const APP_NAME = "ممنون";
export const APP_DESCRIPTION =
  "منصة النقل والخدمات الفاخرة — طلب سيارات وخدمات منزلية في مكان واحد";

export const BAGHDAD_CENTER = { lat: 33.3152, lng: 44.3661 };

export const OFFER_EXPIRY_SECONDS = 45;
export const DISPATCH_RADII = [2, 5, 10];
export const RETRY_RADII = [3, 6, 12];

export const VEHICLE_PRICING = {
  economy: { base: 1500, perKm: 400, label: "اقتصادية" },
  premium: { base: 2500, perKm: 650, label: "بريميوم" },
  luxury: { base: 4500, perKm: 1100, label: "فاخرة" },
} as const;

export const REPUTATION_THRESHOLDS = {
  bronze: 0,
  silver: 150,
  gold: 400,
  platinum: 800,
  max: 1000,
} as const;
