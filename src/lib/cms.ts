import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "src/data/cms-config.json");

export interface CMSConfig {
  brand: {
    siteName: string;
    tagline: string;
    description: string;
    primaryColor: string;
    supportEmail: string;
    socialLinks: {
      instagram: string;
      telegram: string;
      youtube: string;
      facebook: string;
      twitter: string;
    };
  };
  homepage: {
    hero: {
      headline: string;
      subtext: string;
      ctaText: string;
      ctaLink: string;
      bgMode: "image" | "video";
      bgImage: string;
      mobileBgImage: string;
      bgVideo: string;
      focalPoint: string;
      overlayBrightness: number;
      overlayBlur: number;
    };
    blocks: Array<{
      id: string;
      type: string;
      enabled: boolean;
      title: string;
    }>;
  };
  navigation: {
    main: Array<{ label: string; href: string }>;
    footer: Array<{ label: string; href: string }>;
  };
}

export function getCMSConfig(): CMSConfig {
  try {
    const data = fs.readFileSync(CONFIG_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read CMS config:", error);
    // Return default empty-ish config if read fails
    return {
      brand: { siteName: "TheNahj", tagline: "", description: "", primaryColor: "#c1a46b", supportEmail: "", socialLinks: { instagram: "", telegram: "", youtube: "", facebook: "", twitter: "" } },
      homepage: { hero: { headline: "", subtext: "", ctaText: "", ctaLink: "", bgMode: "video", bgImage: "", mobileBgImage: "", bgVideo: "", focalPoint: "center", overlayBrightness: 60, overlayBlur: 0 }, blocks: [] },
      navigation: { main: [], footer: [] }
    };
  }
}

export async function updateCMSConfig(config: CMSConfig) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
    return { success: true };
  } catch (error) {
    console.error("Failed to update CMS config:", error);
    return { success: false, error };
  }
}
