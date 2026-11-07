import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wishly — a wish they can unlock",
    short_name: "Wishly",
    description:
      "Password-protected wish pages for birthdays, anniversaries, weddings and everything in between.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#121212",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
