export type CanvaVideoAspectRatio = "16:9" | "9:16" | "1:1";
export type CanvaPlanTier = "FREE" | "PRO";

export interface CanvaVideoTemplate {
  id: string;
  title: string;
  category: string;
  categoryName: string;
  aspect_ratio: CanvaVideoAspectRatio;
  plan_tier: CanvaPlanTier;
  /** Deep link to customize this template on Canva. */
  url: string;
  /** Canva-hosted preview image. */
  thumb: string;
}

export interface CanvaVideoCategory {
  key: string;
  name: string;
}

/**
 * Live Canva video template catalog (scraped from Canva's public template galleries).
 * Preview images are served by Canva; each card links out to Canva for customization.
 */
export const CANVA_VIDEO_TEMPLATES: CanvaVideoTemplate[] = [
  {
    "id": "EAGi6qx_bBE",
    "title": "Pink White Elegant Festive Happy Birthday Greeting Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGi6qx_bBE-pink-white-elegant-festive-happy-birthday-greeting-video/",
    "thumb": "/canva-video-templates/EAGi6qx_bBE.jpg"
  },
  {
    "id": "EAHCmsIFtyI",
    "title": "Pink Green and White Playful Birthday Greetings Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHCmsIFtyI-pink-green-and-white-playful-birthday-greetings-video/",
    "thumb": "/canva-video-templates/EAHCmsIFtyI.jpg"
  },
  {
    "id": "EAFW8asjx6o",
    "title": "Yellow and Brown Playful Happy Birthday Celebration Message Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFW8asjx6o-yellow-and-brown-playful-happy-birthday-celebration-message-video/",
    "thumb": "/canva-video-templates/EAFW8asjx6o.jpg"
  },
  {
    "id": "EAGgoz0bk4k",
    "title": "Orange and White Simple Happy Birthday Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGgoz0bk4k-orange-and-white-simple-happy-birthday-video/",
    "thumb": "/canva-video-templates/EAGgoz0bk4k.jpg"
  },
  {
    "id": "EAGhDjCZB5s",
    "title": "Blue Gradient Simple Birthday Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGhDjCZB5s-blue-gradient-simple-birthday-video/",
    "thumb": "/canva-video-templates/EAGhDjCZB5s.jpg"
  },
  {
    "id": "EAHMndF9ank",
    "title": "Purple Neon Glitch Birthday Party Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHMndF9ank-purple-neon-glitch-birthday-party-video/",
    "thumb": "/canva-video-templates/EAHMndF9ank.jpg"
  },
  {
    "id": "EAGe5Gsf5sw",
    "title": "Pink and Silver Retro Y2K Cute Aesthetic Scrapbook Happy Birthday Message Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGe5Gsf5sw-pink-and-silver-retro-y2k-cute-aesthetic-scrapbook-happy-birthday-message-video/",
    "thumb": "/canva-video-templates/EAGe5Gsf5sw.jpg"
  },
  {
    "id": "EAFVyvQ0Rhk",
    "title": "Violet Animated Happy Birthday Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFVyvQ0Rhk-violet-animated-happy-birthday-video/",
    "thumb": "/canva-video-templates/EAFVyvQ0Rhk.jpg"
  },
  {
    "id": "EAGW9PpZxqc",
    "title": "Pink And White Watercolor Cute Doodle Happy Birthday Greeting Slideshow Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGW9PpZxqc-pink-and-white-watercolor-cute-doodle-happy-birthday-greeting-slideshow-video/",
    "thumb": "/canva-video-templates/EAGW9PpZxqc.jpg"
  },
  {
    "id": "EAGqeCntZ6g",
    "title": "Beige Brown and Green Abstract Happy Birthday Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGqeCntZ6g-beige-brown-and-green-abstract-happy-birthday-video/",
    "thumb": "/canva-video-templates/EAGqeCntZ6g.jpg"
  },
  {
    "id": "EAGWspsIW0Y",
    "title": "White Purple Aesthetic Happy Birthday Greeting Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGWspsIW0Y-white-purple-aesthetic-happy-birthday-greeting-video/",
    "thumb": "/canva-video-templates/EAGWspsIW0Y.jpg"
  },
  {
    "id": "EAHAJP2RKhY",
    "title": "Yellow Blue and Pink Playful Family Memories Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHAJP2RKhY-yellow-blue-and-pink-playful-family-memories-video/",
    "thumb": "/canva-video-templates/EAHAJP2RKhY.jpg"
  },
  {
    "id": "EAGnVIc12f4",
    "title": "Purple Pink and White Happy Birthday Celebration Mobile Video With Photo",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGnVIc12f4-purple-pink-and-white-happy-birthday-celebration-mobile-video-with-photo/",
    "thumb": "/canva-video-templates/EAGnVIc12f4.jpg"
  },
  {
    "id": "EAGpCMRhvlk",
    "title": "Yellow Pink Playful Birthday Greeting Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGpCMRhvlk-yellow-pink-playful-birthday-greeting-video/",
    "thumb": "/canva-video-templates/EAGpCMRhvlk.jpg"
  },
  {
    "id": "EAGkQfXiXx0",
    "title": "Pink Purple Cute Dreamy Happy Birthday Greeting Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGkQfXiXx0-pink-purple-cute-dreamy-happy-birthday-greeting-video/",
    "thumb": "/canva-video-templates/EAGkQfXiXx0.jpg"
  },
  {
    "id": "EAHXkTNUWjk",
    "title": "Blue White and Navy Minimalist Happy Birthday Landscape Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHXkTNUWjk-blue-white-and-navy-minimalist-happy-birthday-landscape-video/",
    "thumb": "/canva-video-templates/EAHXkTNUWjk.jpg"
  },
  {
    "id": "EAHGzIVxZ14",
    "title": "Pink Purple and White Playful Birthday Celebration Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHGzIVxZ14-pink-purple-and-white-playful-birthday-celebration-video/",
    "thumb": "/canva-video-templates/EAHGzIVxZ14.jpg"
  },
  {
    "id": "EADxgI4XnL0",
    "title": "Cream, Brown, and Pink Modern Elegant Love Story Wedding Slideshow Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADxgI4XnL0-cream-brown-and-pink-modern-elegant-love-story-wedding-slideshow-video/",
    "thumb": "/canva-video-templates/EADxgI4XnL0.jpg"
  },
  {
    "id": "EADscF6qgL0",
    "title": "Gray and Cream Wedding Anniversary Animated Presentation",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADscF6qgL0-gray-and-cream-wedding-anniversary-animated-presentation/",
    "thumb": "/canva-video-templates/EADscF6qgL0.jpg"
  },
  {
    "id": "EAFA1E6wDkM",
    "title": "Dark Olive Watercolor Modern Wedding Invitation Party Video template, 3 pages",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFA1E6wDkM-dark-olive-watercolor-modern-wedding-invitation-party-video/",
    "thumb": "/canva-video-templates/EAFA1E6wDkM.jpg"
  },
  {
    "id": "EAFDL5c7IJA",
    "title": "Champagne Beige Elegant Animated Wedding Invitation Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFDL5c7IJA-champagne-beige-elegant-animated-wedding-invitation-video/",
    "thumb": "/canva-video-templates/EAFDL5c7IJA.jpg"
  },
  {
    "id": "EADppg4DRuw",
    "title": "Maroon and Gold Wedding Save The Date Slideshow Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EADppg4DRuw-maroon-and-gold-wedding-save-the-date-slideshow-video/",
    "thumb": "/canva-video-templates/EADppg4DRuw.jpg"
  },
  {
    "id": "EADpo9gRgE4",
    "title": "Black and Gold Marble Wedding Save the Date Slideshow Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EADpo9gRgE4-black-and-gold-marble-wedding-save-the-date-slideshow-video/",
    "thumb": "/canva-video-templates/EADpo9gRgE4.jpg"
  },
  {
    "id": "EAFKGo8PqGQ",
    "title": "Light Green Pastel Pink Scrapbook Wedding Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFKGo8PqGQ-light-green-pastel-pink-scrapbook-wedding-video/",
    "thumb": "/canva-video-templates/EAFKGo8PqGQ.jpg"
  },
  {
    "id": "EAFKGRtBjwM",
    "title": "Gold Black Celegoldbration Wedding Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFKGRtBjwM-gold-black-celegoldbration-wedding-video/",
    "thumb": "/canva-video-templates/EAFKGRtBjwM.jpg"
  },
  {
    "id": "EAG_SeKxbhI",
    "title": "Gold and Black Dark Modern Marble Texture Save The Date Wedding Invitation Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG_SeKxbhI-gold-and-black-dark-modern-marble-texture-save-the-date-wedding-invitation-video/",
    "thumb": "/canva-video-templates/EAG_SeKxbhI.jpg"
  },
  {
    "id": "EADppndL624",
    "title": "Green and White Tropical Engagement Announcement Slideshow Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADppndL624-green-and-white-tropical-engagement-announcement-slideshow-video/",
    "thumb": "/canva-video-templates/EADppndL624.jpg"
  },
  {
    "id": "EADscNWLoEk",
    "title": "Cream and Gold Wedding Anniversary Animated Presentation",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADscNWLoEk-cream-and-gold-wedding-anniversary-animated-presentation/",
    "thumb": "/canva-video-templates/EADscNWLoEk.jpg"
  },
  {
    "id": "EADscHoxG_M",
    "title": "Pink and Bronze Wedding Anniversary Animated Presentation",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EADscHoxG_M-pink-and-bronze-wedding-anniversary-animated-presentation/",
    "thumb": "/canva-video-templates/EADscHoxG_M.jpg"
  },
  {
    "id": "EAFKG7jFUPc",
    "title": "Beige Pink Watercolor Wedding Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFKG7jFUPc-beige-pink-watercolor-wedding-video/",
    "thumb": "/canva-video-templates/EAFKG7jFUPc.jpg"
  },
  {
    "id": "EAG_NAvUiVQ",
    "title": "Black and Blue Dark Modern Rustic Floral Illustrative Couple Wedding Invitation Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG_NAvUiVQ-black-and-blue-dark-modern-rustic-floral-illustrative-couple-wedding-invitation-video/",
    "thumb": "/canva-video-templates/EAG_NAvUiVQ.jpg"
  },
  {
    "id": "EAGbPzHISDM",
    "title": "Yellow Traditional Indian Wedding Haldi Ceremony Invitation Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGbPzHISDM-yellow-traditional-indian-wedding-haldi-ceremony-invitation-mobile-video/",
    "thumb": "/canva-video-templates/EAGbPzHISDM.jpg"
  },
  {
    "id": "EAGeJzaxnVU",
    "title": "Green and White Floral Indian Wedding Reception Party Invitation Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGeJzaxnVU-green-and-white-floral-indian-wedding-reception-party-invitation-mobile-video/",
    "thumb": "/canva-video-templates/EAGeJzaxnVU.jpg"
  },
  {
    "id": "EAFsAnpj5s8",
    "title": "Dark Blue and White Floral Indian Wedding Save The Date Instagram Post",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "1:1",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFsAnpj5s8-dark-blue-and-white-floral-indian-wedding-save-the-date-instagram-post/",
    "thumb": "/canva-video-templates/EAFsAnpj5s8.jpg"
  },
  {
    "id": "EAHQpu7csJI",
    "title": "Orange And Green Illustrated Indian Wedding Invitation Instagram Story",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHQpu7csJI-orange-and-green-illustrated-indian-wedding-invitation-instagram-story/",
    "thumb": "/canva-video-templates/EAHQpu7csJI.jpg"
  },
  {
    "id": "EAF1dmuAzCg",
    "title": "Red And White Elegant Indian Wedding Jewellery Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAF1dmuAzCg-red-and-white-elegant-indian-wedding-jewellery-mobile-video/",
    "thumb": "/canva-video-templates/EAF1dmuAzCg.jpg"
  },
  {
    "id": "EAGaDSfHRvk",
    "title": "Beige and Green Traditional Vintage Indian Wedding Virtual Invitation",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGaDSfHRvk-beige-and-green-traditional-vintage-indian-wedding-virtual-invitation/",
    "thumb": "/canva-video-templates/EAGaDSfHRvk.jpg"
  },
  {
    "id": "EAGfdl5xiME",
    "title": "Green and Orange Traditional Indian Wedding Mehndi Ceremony Invitation Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGfdl5xiME-green-and-orange-traditional-indian-wedding-mehndi-ceremony-invitation-mobile-video/",
    "thumb": "/canva-video-templates/EAGfdl5xiME.jpg"
  },
  {
    "id": "EAHDoKwHh1E",
    "title": "Beige Gold and Red Traditional Wedding Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHDoKwHh1E-beige-gold-and-red-traditional-wedding-mobile-video/",
    "thumb": "/canva-video-templates/EAHDoKwHh1E.jpg"
  },
  {
    "id": "EAG4KiZViKs",
    "title": "Red White Traditional Indian Wedding Invitation Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG4KiZViKs-red-white-traditional-indian-wedding-invitation-mobile-video/",
    "thumb": "/canva-video-templates/EAG4KiZViKs.jpg"
  },
  {
    "id": "EAGWPc1iUf4",
    "title": "Red and Pink Floral Indian Wedding Invitation Animated Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGWPc1iUf4-red-and-pink-floral-indian-wedding-invitation-animated-mobile-video/",
    "thumb": "/canva-video-templates/EAGWPc1iUf4.jpg"
  },
  {
    "id": "EAGd4wEAq7Q",
    "title": "Light Blue and Pink Floral Indian Wedding Ring Ceremony Invitation Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGd4wEAq7Q-light-blue-and-pink-floral-indian-wedding-ring-ceremony-invitation-mobile-video/",
    "thumb": "/canva-video-templates/EAGd4wEAq7Q.jpg"
  },
  {
    "id": "EAGB1cj9ETY",
    "title": "Orange Haldi Indian Wedding Invitation",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGB1cj9ETY-orange-haldi-indian-wedding-invitation/",
    "thumb": "/canva-video-templates/EAGB1cj9ETY.jpg"
  },
  {
    "id": "EAG_gjoucps",
    "title": "Pink and Yellow Traditional Indian Wedding Invitation",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG_gjoucps-pink-and-yellow-traditional-indian-wedding-invitation/",
    "thumb": "/canva-video-templates/EAG_gjoucps.jpg"
  },
  {
    "id": "EAFrrtEfrFc",
    "title": "Blue and Gold Traditional Indian Wedding Save the Date Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFrrtEfrFc-blue-and-gold-traditional-indian-wedding-save-the-date-video/",
    "thumb": "/canva-video-templates/EAFrrtEfrFc.jpg"
  },
  {
    "id": "EAGkkkOPERU",
    "title": "Black and White Gradient Elegant Bold Floral Sparkle Wedding Invitation Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGkkkOPERU-black-and-white-gradient-elegant-bold-floral-sparkle-wedding-invitation-video/",
    "thumb": "/canva-video-templates/EAGkkkOPERU.jpg"
  },
  {
    "id": "EAGoBloXMuA",
    "title": "Beige Gray Classy Elegant Wedding Highlight Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGoBloXMuA-beige-gray-classy-elegant-wedding-highlight-video/",
    "thumb": "/canva-video-templates/EAGoBloXMuA.jpg"
  },
  {
    "id": "EAFaogtnMBo",
    "title": "Beige Simple Minimal Save The Date Wedding Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFaogtnMBo-beige-simple-minimal-save-the-date-wedding-video/",
    "thumb": "/canva-video-templates/EAFaogtnMBo.jpg"
  },
  {
    "id": "EAGscz9etVk",
    "title": "Blue and Pink Floral Wedding Invitation Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGscz9etVk-blue-and-pink-floral-wedding-invitation-video/",
    "thumb": "/canva-video-templates/EAGscz9etVk.jpg"
  },
  {
    "id": "EAGS81q8WVE",
    "title": "Green and Gold Floral Wedding Invitation Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGS81q8WVE-green-and-gold-floral-wedding-invitation-video/",
    "thumb": "/canva-video-templates/EAGS81q8WVE.jpg"
  },
  {
    "id": "EAHCa1wM2FY",
    "title": "Yellow Flower Watercolor Wedding Ceremony Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHCa1wM2FY-yellow-flower-watercolor-wedding-ceremony-video/",
    "thumb": "/canva-video-templates/EAHCa1wM2FY.jpg"
  },
  {
    "id": "EAGi72n4EZ4",
    "title": "Navy and Gold Elegant Wedding Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGi72n4EZ4-navy-and-gold-elegant-wedding-video/",
    "thumb": "/canva-video-templates/EAGi72n4EZ4.jpg"
  },
  {
    "id": "EAFlOHmrag8",
    "title": "Light Pink Rose Floral Animated Illustration Save The Date Wedding Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFlOHmrag8-light-pink-rose-floral-animated-illustration-save-the-date-wedding-video/",
    "thumb": "/canva-video-templates/EAFlOHmrag8.jpg"
  },
  {
    "id": "EAF_YN_C6Xc",
    "title": "Pink and White Simple Wedding Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAF_YN_C6Xc-pink-and-white-simple-wedding-video/",
    "thumb": "/canva-video-templates/EAF_YN_C6Xc.jpg"
  },
  {
    "id": "EAHXZtfS8_A",
    "title": "Gold and Black Dark Modern Marble Texture Save The Date Wedding Invitation Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHXZtfS8_A-gold-and-black-dark-modern-marble-texture-save-the-date-wedding-invitation-video/",
    "thumb": "/canva-video-templates/EAHXZtfS8_A.jpg"
  },
  {
    "id": "EAGRirDCMrs",
    "title": "Purple Watercolor Floral Wedding Invitation Mobile Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGRirDCMrs-purple-watercolor-floral-wedding-invitation-mobile-video/",
    "thumb": "/canva-video-templates/EAGRirDCMrs.jpg"
  },
  {
    "id": "EAGS8gBxov4",
    "title": "Pink White and Light Pink Romantic Floral Wedding Invitation Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGS8gBxov4-pink-white-and-light-pink-romantic-floral-wedding-invitation-video/",
    "thumb": "/canva-video-templates/EAGS8gBxov4.jpg"
  },
  {
    "id": "EAFl3ZU83LQ",
    "title": "Cream Elegant Sunset Save The Date Wedding Slideshow Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFl3ZU83LQ-cream-elegant-sunset-save-the-date-wedding-slideshow-video/",
    "thumb": "/canva-video-templates/EAFl3ZU83LQ.jpg"
  },
  {
    "id": "EAGfbLjfDWw",
    "title": "Green and White Floral Illustration Save The Date Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGfbLjfDWw-green-and-white-floral-illustration-save-the-date-video/",
    "thumb": "/canva-video-templates/EAGfbLjfDWw.jpg"
  },
  {
    "id": "EAFT2XYvdE4",
    "title": "End-of-Life Tribute Video in Blue Pink White Elegant Photocentric Style",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2XYvdE4-end-of-life-tribute-video-in-blue-pink-white-elegant-photocentric-style/",
    "thumb": "/canva-video-templates/EAFT2XYvdE4.jpg"
  },
  {
    "id": "EAG5Fo_dkvs",
    "title": "Beige and Gold Playful Celebration Message For Retirement Video",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG5Fo_dkvs-beige-and-gold-playful-celebration-message-for-retirement-video/",
    "thumb": "/canva-video-templates/EAG5Fo_dkvs.jpg"
  },
  {
    "id": "EAHXNHp7Yq0",
    "title": "Orange Green and White Indian Air Force Day Landscape Video",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHXNHp7Yq0-orange-green-and-white-indian-air-force-day-landscape-video/",
    "thumb": "/canva-video-templates/EAHXNHp7Yq0.jpg"
  },
  {
    "id": "EAFZHp6zG4k",
    "title": "End-of-Life Tribute Instagram Post Video in Red Yellow Elegant Photocentric Style",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFZHp6zG4k-end-of-life-tribute-instagram-post-video-in-red-yellow-elegant-photocentric-style/",
    "thumb": "/canva-video-templates/EAFZHp6zG4k.jpg"
  },
  {
    "id": "EAHW31eucJg",
    "title": "Sky Blue White and Gray Modern Patriotic Indian Air Force Day Landscape Video",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHW31eucJg-sky-blue-white-and-gray-modern-patriotic-indian-air-force-day-landscape-video/",
    "thumb": "/canva-video-templates/EAHW31eucJg.jpg"
  },
  {
    "id": "EAG4maYVbCQ",
    "title": "Purple And White Romantic Couple Wedding Anniversary Video",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG4maYVbCQ-purple-and-white-romantic-couple-wedding-anniversary-video/",
    "thumb": "/canva-video-templates/EAG4maYVbCQ.jpg"
  },
  {
    "id": "EAFT2lML59k",
    "title": "End-of-Life Tribute Video in Yellow Green Natural Photocentric Style",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2lML59k-end-of-life-tribute-video-in-yellow-green-natural-photocentric-style/",
    "thumb": "/canva-video-templates/EAFT2lML59k.jpg"
  },
  {
    "id": "EAFZPgm3pCk",
    "title": "Tribute Mobile Video in Green Grey Illustrative Style",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFZPgm3pCk-tribute-mobile-video-in-green-grey-illustrative-style/",
    "thumb": "/canva-video-templates/EAFZPgm3pCk.jpg"
  },
  {
    "id": "EAG5FmRo7qo",
    "title": "Black and Gold Elegant Tribute Farewell Message For Retirement Video",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG5FmRo7qo-black-and-gold-elegant-tribute-farewell-message-for-retirement-video/",
    "thumb": "/canva-video-templates/EAG5FmRo7qo.jpg"
  },
  {
    "id": "EAFT2ULvCm8",
    "title": "End-of-Life Tribute Video in Black Pink Elegant Informational Style",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFT2ULvCm8-end-of-life-tribute-video-in-black-pink-elegant-informational-style/",
    "thumb": "/canva-video-templates/EAFT2ULvCm8.jpg"
  },
  {
    "id": "EAGRNRapzkw",
    "title": "Red & Gold Traditional Elegant Happy Diwali Greeting Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGRNRapzkw-red-gold-traditional-elegant-happy-diwali-greeting-video/",
    "thumb": "/canva-video-templates/EAGRNRapzkw.jpg"
  },
  {
    "id": "EAGUZQNMqmk",
    "title": "Brown Yellow Minimal Modern Diwali Greeting Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGUZQNMqmk-brown-yellow-minimal-modern-diwali-greeting-video/",
    "thumb": "/canva-video-templates/EAGUZQNMqmk.jpg"
  },
  {
    "id": "EAGQeosvzCY",
    "title": "Orange and Yellow Organic Diwali Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGQeosvzCY-orange-and-yellow-organic-diwali-video/",
    "thumb": "/canva-video-templates/EAGQeosvzCY.jpg"
  },
  {
    "id": "EAGT7PEU9mA",
    "title": "Violet Yellow Modern Minimalist Diwali Greeting Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGT7PEU9mA-violet-yellow-modern-minimalist-diwali-greeting-video/",
    "thumb": "/canva-video-templates/EAGT7PEU9mA.jpg"
  },
  {
    "id": "EAGRmGSG_GY",
    "title": "Red And Yellow Decorative Happy Diwali Greeting Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGRmGSG_GY-red-and-yellow-decorative-happy-diwali-greeting-video/",
    "thumb": "/canva-video-templates/EAGRmGSG_GY.jpg"
  },
  {
    "id": "EAGU3fJjSVs",
    "title": "Purple Orange Illustrated Choti Diwali Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGU3fJjSVs-purple-orange-illustrated-choti-diwali-video/",
    "thumb": "/canva-video-templates/EAGU3fJjSVs.jpg"
  },
  {
    "id": "EAG2D0InbFY",
    "title": "Gold Dynamic Diwali Greetings Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG2D0InbFY-gold-dynamic-diwali-greetings-video/",
    "thumb": "/canva-video-templates/EAG2D0InbFY.jpg"
  },
  {
    "id": "EAG0af60Yb8",
    "title": "Brown and Yellow Illustrated Diwali Greetings Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG0af60Yb8-brown-and-yellow-illustrated-diwali-greetings-video/",
    "thumb": "/canva-video-templates/EAG0af60Yb8.jpg"
  },
  {
    "id": "EAG1RI0MtzQ",
    "title": "Red and Gold Festive Diwali Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG1RI0MtzQ-red-and-gold-festive-diwali-video/",
    "thumb": "/canva-video-templates/EAG1RI0MtzQ.jpg"
  },
  {
    "id": "EAG0qeLFGJw",
    "title": "Red and Yellow Playful Diwali Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG0qeLFGJw-red-and-yellow-playful-diwali-video/",
    "thumb": "/canva-video-templates/EAG0qeLFGJw.jpg"
  },
  {
    "id": "EAGzDcQ8sEI",
    "title": "Yellow and Grey Traditional Diwali Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGzDcQ8sEI-yellow-and-grey-traditional-diwali-video/",
    "thumb": "/canva-video-templates/EAGzDcQ8sEI.jpg"
  },
  {
    "id": "EAGzMxjSqn0",
    "title": "Yellow and Blue Traditional Happy Diwali Greetings Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGzMxjSqn0-yellow-and-blue-traditional-happy-diwali-greetings-video/",
    "thumb": "/canva-video-templates/EAGzMxjSqn0.jpg"
  },
  {
    "id": "EAHV0AYcguk",
    "title": "Gold and Black Festive Happy Diwali Landscape Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHV0AYcguk-gold-and-black-festive-happy-diwali-landscape-video/",
    "thumb": "/canva-video-templates/EAHV0AYcguk.jpg"
  },
  {
    "id": "EAGzMyjPpcI",
    "title": "Pink and Gold Traditional Happy Diwali Greetings Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGzMyjPpcI-pink-and-gold-traditional-happy-diwali-greetings-video/",
    "thumb": "/canva-video-templates/EAGzMyjPpcI.jpg"
  },
  {
    "id": "EAFykOWDAak",
    "title": "Purple Neon Diwali Greeting YouTube Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFykOWDAak-purple-neon-diwali-greeting-youtube-video/",
    "thumb": "/canva-video-templates/EAFykOWDAak.jpg"
  },
  {
    "id": "EAG1X2djQJg",
    "title": "Orange and Purple Illustrated Diwali Greetings Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG1X2djQJg-orange-and-purple-illustrated-diwali-greetings-video/",
    "thumb": "/canva-video-templates/EAG1X2djQJg.jpg"
  },
  {
    "id": "EAFzf7Yn7dA",
    "title": "Yellow Aesthetic Diwali Greeting Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFzf7Yn7dA-yellow-aesthetic-diwali-greeting-video/",
    "thumb": "/canva-video-templates/EAFzf7Yn7dA.jpg"
  },
  {
    "id": "EAHZcy7sXZ4",
    "title": "Red White and Green Playful Christmas Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHZcy7sXZ4-red-white-and-green-playful-christmas-video/",
    "thumb": "/canva-video-templates/EAHZcy7sXZ4.jpg"
  },
  {
    "id": "EAExfU38h1Y",
    "title": "Gold Sparkles Elegant New Year Video Background\"",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAExfU38h1Y-gold-sparkles-elegant-new-year-video-background/",
    "thumb": "/canva-video-templates/EAExfU38h1Y.jpg"
  },
  {
    "id": "EAHVpKmbkKE",
    "title": "Brown and White Elegant Merry Christmas Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHVpKmbkKE-brown-and-white-elegant-merry-christmas-video/",
    "thumb": "/canva-video-templates/EAHVpKmbkKE.jpg"
  },
  {
    "id": "EAF3mQbRomg",
    "title": "Brown and Red Modern Christmas Greetings Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAF3mQbRomg-brown-and-red-modern-christmas-greetings-video/",
    "thumb": "/canva-video-templates/EAF3mQbRomg.jpg"
  },
  {
    "id": "EAGVKcuhNcQ",
    "title": "Brown and Gold Luxury Merry Christmas Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGVKcuhNcQ-brown-and-gold-luxury-merry-christmas-video/",
    "thumb": "/canva-video-templates/EAGVKcuhNcQ.jpg"
  },
  {
    "id": "EAG6Q9sqIf8",
    "title": "Red and Gold Festive Christmas Greetings Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG6Q9sqIf8-red-and-gold-festive-christmas-greetings-video/",
    "thumb": "/canva-video-templates/EAG6Q9sqIf8.jpg"
  },
  {
    "id": "EAFpiI2ddvs",
    "title": "Red and Gold Elegant New Year 2024 Greetings Animated Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFpiI2ddvs-red-and-gold-elegant-new-year-2024-greetings-animated-video/",
    "thumb": "/canva-video-templates/EAFpiI2ddvs.jpg"
  },
  {
    "id": "EAGYZyu5gag",
    "title": "Red and Gold Modern Merry Christmas Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGYZyu5gag-red-and-gold-modern-merry-christmas-video/",
    "thumb": "/canva-video-templates/EAGYZyu5gag.jpg"
  },
  {
    "id": "EAFt11zXZ6Y",
    "title": "Red Gold Animated Merry Christmas and Happy New Year Holiday Greeting Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFt11zXZ6Y-red-gold-animated-merry-christmas-and-happy-new-year-holiday-greeting-video/",
    "thumb": "/canva-video-templates/EAFt11zXZ6Y.jpg"
  },
  {
    "id": "EAGYnT9L9BU",
    "title": "Red Gold 3D Classy Merry Christmas and Happy New Year Greeting Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGYnT9L9BU-red-gold-3d-classy-merry-christmas-and-happy-new-year-greeting-video/",
    "thumb": "/canva-video-templates/EAGYnT9L9BU.jpg"
  },
  {
    "id": "EAGVu273zS8",
    "title": "Red and White Modern Elegant Christmas Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGVu273zS8-red-and-white-modern-elegant-christmas-video/",
    "thumb": "/canva-video-templates/EAGVu273zS8.jpg"
  },
  {
    "id": "EAG5itocO3Q",
    "title": "Black and green simple merry christmas video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG5itocO3Q-black-and-green-simple-merry-christmas-video/",
    "thumb": "/canva-video-templates/EAG5itocO3Q.jpg"
  },
  {
    "id": "EAGyxoKIVDw",
    "title": "Red and Green Illustrated Christmas Greetings Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGyxoKIVDw-red-and-green-illustrated-christmas-greetings-video/",
    "thumb": "/canva-video-templates/EAGyxoKIVDw.jpg"
  },
  {
    "id": "EAFzHx6OKCo",
    "title": "Red and White Sparkling Animated Christmas Greeting Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFzHx6OKCo-red-and-white-sparkling-animated-christmas-greeting-video/",
    "thumb": "/canva-video-templates/EAFzHx6OKCo.jpg"
  },
  {
    "id": "EAGVu9cUFPc",
    "title": "Blue Merry Christmas Greeting Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGVu9cUFPc-blue-merry-christmas-greeting-video/",
    "thumb": "/canva-video-templates/EAGVu9cUFPc.jpg"
  },
  {
    "id": "EAGYlvHsVCA",
    "title": "White and Green Modern Merry Christmas Greeting Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGYlvHsVCA-white-and-green-modern-merry-christmas-greeting-video/",
    "thumb": "/canva-video-templates/EAGYlvHsVCA.jpg"
  },
  {
    "id": "EAHZx3_LK0k",
    "title": "Green Red and Black Elegant Merry Christmas Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHZx3_LK0k-green-red-and-black-elegant-merry-christmas-video/",
    "thumb": "/canva-video-templates/EAHZx3_LK0k.jpg"
  },
  {
    "id": "EAEoq1dO0S0",
    "title": "Blue 10 Seconds Happy New Year Countdown 2022 Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAEoq1dO0S0-blue-10-seconds-happy-new-year-countdown-2022-video/",
    "thumb": "/canva-video-templates/EAEoq1dO0S0.jpg"
  },
  {
    "id": "EAGYob10g1A",
    "title": "Red Gold Vibrant Festive Show Merry Christmas Greeting Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGYob10g1A-red-gold-vibrant-festive-show-merry-christmas-greeting-video/",
    "thumb": "/canva-video-templates/EAGYob10g1A.jpg"
  },
  {
    "id": "EAFy1WqvSoY",
    "title": "Yellow and Brown Greeting New Year Party Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFy1WqvSoY-yellow-and-brown-greeting-new-year-party-video/",
    "thumb": "/canva-video-templates/EAFy1WqvSoY.jpg"
  },
  {
    "id": "EAEoq0iwr1M",
    "title": "Modern Happy New Year 2022 Animated Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAEoq0iwr1M-modern-happy-new-year-2022-animated-video/",
    "thumb": "/canva-video-templates/EAEoq0iwr1M.jpg"
  },
  {
    "id": "EAEvQ0rfyvI",
    "title": "Green and White Merry Christmas & Happy New Year Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAEvQ0rfyvI-green-and-white-merry-christmas-happy-new-year-video/",
    "thumb": "/canva-video-templates/EAEvQ0rfyvI.jpg"
  },
  {
    "id": "EAFR2kF1Ucc",
    "title": "Black Golden and White 3D Realistic Illustrated 2027 New Year Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFR2kF1Ucc-black-golden-and-white-3d-realistic-illustrated-2027-new-year-video/",
    "thumb": "/canva-video-templates/EAFR2kF1Ucc.jpg"
  },
  {
    "id": "EAFVZRh1Bzc",
    "title": "Brown And White Creative Christmas Wish Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFVZRh1Bzc-brown-and-white-creative-christmas-wish-video/",
    "thumb": "/canva-video-templates/EAFVZRh1Bzc.jpg"
  },
  {
    "id": "EAF2LzRQjJo",
    "title": "Light Blue Scrapbook Photo Collage Christmas Greeting Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAF2LzRQjJo-light-blue-scrapbook-photo-collage-christmas-greeting-video/",
    "thumb": "/canva-video-templates/EAF2LzRQjJo.jpg"
  },
  {
    "id": "EAFRPBbDKuo",
    "title": "Brown Minimalist New Year Sale Ads Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFRPBbDKuo-brown-minimalist-new-year-sale-ads-video/",
    "thumb": "/canva-video-templates/EAFRPBbDKuo.jpg"
  },
  {
    "id": "EAGx6OMIn1k",
    "title": "White Black Festive Elegant Happy New Year Greeting Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGx6OMIn1k-white-black-festive-elegant-happy-new-year-greeting-video/",
    "thumb": "/canva-video-templates/EAGx6OMIn1k.jpg"
  },
  {
    "id": "EAEzDJSzy0E",
    "title": "Modern Neon Gradient Happy New Year 2022 Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAEzDJSzy0E-modern-neon-gradient-happy-new-year-2022-video/",
    "thumb": "/canva-video-templates/EAEzDJSzy0E.jpg"
  },
  {
    "id": "EAExLun7bS8",
    "title": "Blue and Pink Creative New Year Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAExLun7bS8-blue-and-pink-creative-new-year-video/",
    "thumb": "/canva-video-templates/EAExLun7bS8.jpg"
  },
  {
    "id": "EAEu1mQHjuA",
    "title": "Red Creative New Year Party Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAEu1mQHjuA-red-creative-new-year-party-video/",
    "thumb": "/canva-video-templates/EAEu1mQHjuA.jpg"
  },
  {
    "id": "EAEzQStqg0Y",
    "title": "Red Creative Greeting Happy Lunar New Year Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAEzQStqg0Y-red-creative-greeting-happy-lunar-new-year-video/",
    "thumb": "/canva-video-templates/EAEzQStqg0Y.jpg"
  },
  {
    "id": "EAFLdA55_X0",
    "title": "Blue Gold Rotating Balls Merry Christmas Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFLdA55_X0-blue-gold-rotating-balls-merry-christmas-video/",
    "thumb": "/canva-video-templates/EAFLdA55_X0.jpg"
  },
  {
    "id": "EAGbNMMdfqc",
    "title": "Red and Yellow Videobased Playfull New Year Vlog Youtube Intro",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGbNMMdfqc-red-and-yellow-videobased-playfull-new-year-vlog-youtube-intro/",
    "thumb": "/canva-video-templates/EAGbNMMdfqc.jpg"
  },
  {
    "id": "EAGSsqtE3zw",
    "title": "Blue and Yellow Playful Illustrative Baby Milestone Presentation template, 15 pages",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGSsqtE3zw-blue-and-yellow-playful-illustrative-baby-milestone-presentation/",
    "thumb": "/canva-video-templates/EAGSsqtE3zw.jpg"
  },
  {
    "id": "EAHNmQ7Plw0",
    "title": "Purple and White Illustrated Product Roadmap Presentation template, 10 pages",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHNmQ7Plw0-purple-and-white-illustrated-product-roadmap-presentation/",
    "thumb": "/canva-video-templates/EAHNmQ7Plw0.jpg"
  },
  {
    "id": "EAHRkFjTECw",
    "title": "Navy Blue and White Modern Business Milestone Instagram Post",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHRkFjTECw-navy-blue-and-white-modern-business-milestone-instagram-post/",
    "thumb": "/canva-video-templates/EAHRkFjTECw.jpg"
  },
  {
    "id": "EAHNqLHKZ50",
    "title": "Green Minimalist Baby Milestone Your Story",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHNqLHKZ50-green-minimalist-baby-milestone-your-story/",
    "thumb": "/canva-video-templates/EAHNqLHKZ50.jpg"
  },
  {
    "id": "EAG5WCIriwc",
    "title": "Orange Modern Milestone Achievement LinkedIn Post",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG5WCIriwc-orange-modern-milestone-achievement-linkedin-post/",
    "thumb": "/canva-video-templates/EAG5WCIriwc.jpg"
  },
  {
    "id": "EAEuc46e08o",
    "title": "Blue and White Playful Milestone LinkedIn Post",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAEuc46e08o-blue-and-white-playful-milestone-linkedin-post/",
    "thumb": "/canva-video-templates/EAEuc46e08o.jpg"
  },
  {
    "id": "EAHLyoVYG6M",
    "title": "Pink and Blue Modern Milestone Celebration Instagram Post",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHLyoVYG6M-pink-and-blue-modern-milestone-celebration-instagram-post/",
    "thumb": "/canva-video-templates/EAHLyoVYG6M.jpg"
  },
  {
    "id": "EAG1GsuxnD4",
    "title": "Black Vintage Work Milestone Recap Instagram Reel",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG1GsuxnD4-black-vintage-work-milestone-recap-instagram-reel/",
    "thumb": "/canva-video-templates/EAG1GsuxnD4.jpg"
  },
  {
    "id": "EAFR8cLCOH0",
    "title": "Black and White Followers Milestone Thank You Instagram Post",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFR8cLCOH0-black-and-white-followers-milestone-thank-you-instagram-post/",
    "thumb": "/canva-video-templates/EAFR8cLCOH0.jpg"
  },
  {
    "id": "EAHQl_bCu1E",
    "title": "LinkedIn Post for SMEs Achieving a Milestone Corporate Purple",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHQl_bCu1E-linkedin-post-for-smes-achieving-a-milestone-corporate-purple/",
    "thumb": "/canva-video-templates/EAHQl_bCu1E.jpg"
  },
  {
    "id": "EAHR2ip09Jg",
    "title": "Blue and White Modern Company Milestones Brainstorm",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHR2ip09Jg-blue-and-white-modern-company-milestones-brainstorm/",
    "thumb": "/canva-video-templates/EAHR2ip09Jg.jpg"
  },
  {
    "id": "EAHLVN1QzFc",
    "title": "Cream and Black Minimalist Communication Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHLVN1QzFc-cream-and-black-minimalist-communication-instagram-reel/",
    "thumb": "/canva-video-templates/EAHLVN1QzFc.jpg"
  },
  {
    "id": "EAGq0z5K_oU",
    "title": "Life Lately Instagram Reel in Statement Style",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGq0z5K_oU-life-lately-instagram-reel-in-statement-style/",
    "thumb": "/canva-video-templates/EAGq0z5K_oU.jpg"
  },
  {
    "id": "EAHKp1iaIC0",
    "title": "Green Minimalist Motivational Quotes Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHKp1iaIC0-green-minimalist-motivational-quotes-instagram-reel/",
    "thumb": "/canva-video-templates/EAHKp1iaIC0.jpg"
  },
  {
    "id": "EAGwBzqbjhs",
    "title": "Travel Day in the Life Instagram Reel in Yellow Film/Analog Style",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGwBzqbjhs-travel-day-in-the-life-instagram-reel-in-yellow-film-analog-style/",
    "thumb": "/canva-video-templates/EAGwBzqbjhs.jpg"
  },
  {
    "id": "EAG0o_BsZ6U",
    "title": "Yellow and Black Modern Party Photo Dump Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG0o_BsZ6U-yellow-and-black-modern-party-photo-dump-instagram-reel/",
    "thumb": "/canva-video-templates/EAG0o_BsZ6U.jpg"
  },
  {
    "id": "EAHNnZR01zs",
    "title": "Orange and White Modern Love Anniversary Date Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHNnZR01zs-orange-and-white-modern-love-anniversary-date-instagram-reel/",
    "thumb": "/canva-video-templates/EAHNnZR01zs.jpg"
  },
  {
    "id": "EAGtxqhTOFc",
    "title": "Montage Montage Instagram Reel in Black Yellow Statement Style",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGtxqhTOFc-montage-montage-instagram-reel-in-black-yellow-statement-style/",
    "thumb": "/canva-video-templates/EAGtxqhTOFc.jpg"
  },
  {
    "id": "EAHK31q8BBg",
    "title": "Black and White Modern Fashion Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHK31q8BBg-black-and-white-modern-fashion-instagram-reel/",
    "thumb": "/canva-video-templates/EAHK31q8BBg.jpg"
  },
  {
    "id": "EAFOHTrab2s",
    "title": "Brown Yellow Green Happy Birthday Greeting Mobile Video",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFOHTrab2s-brown-yellow-green-happy-birthday-greeting-mobile-video/",
    "thumb": "/canva-video-templates/EAFOHTrab2s.jpg"
  },
  {
    "id": "EAGJcJxRqsM",
    "title": "Yellow Grey Modern Bold Sportswear Advertisement Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGJcJxRqsM-yellow-grey-modern-bold-sportswear-advertisement-instagram-reel/",
    "thumb": "/canva-video-templates/EAGJcJxRqsM.jpg"
  },
  {
    "id": "EAGtxvqpxzk",
    "title": "Montage Photo Dump Instagram Reel in Statement Style",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGtxvqpxzk-montage-photo-dump-instagram-reel-in-statement-style/",
    "thumb": "/canva-video-templates/EAGtxvqpxzk.jpg"
  },
  {
    "id": "EAHGZidy8is",
    "title": "Golden Orange Minimalist Sunset Mobile Video",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHGZidy8is-golden-orange-minimalist-sunset-mobile-video/",
    "thumb": "/canva-video-templates/EAHGZidy8is.jpg"
  },
  {
    "id": "EAG1wwUU3G8",
    "title": "Neutral Simple Man Lying Down Mobile Video",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG1wwUU3G8-neutral-simple-man-lying-down-mobile-video/",
    "thumb": "/canva-video-templates/EAG1wwUU3G8.jpg"
  },
  {
    "id": "EAFkXo13zyQ",
    "title": "Olive Green Floral Wedding Invitation Mobile Video",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFkXo13zyQ-olive-green-floral-wedding-invitation-mobile-video/",
    "thumb": "/canva-video-templates/EAFkXo13zyQ.jpg"
  },
  {
    "id": "EAGwBwMFj78",
    "title": "Travel Day in the Life Instagram Reel in Yellow Collage Style",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGwBwMFj78-travel-day-in-the-life-instagram-reel-in-yellow-collage-style/",
    "thumb": "/canva-video-templates/EAGwBwMFj78.jpg"
  },
  {
    "id": "EAHLmTKzn4U",
    "title": "White Modern Motivational Quote Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHLmTKzn4U-white-modern-motivational-quote-instagram-reel/",
    "thumb": "/canva-video-templates/EAHLmTKzn4U.jpg"
  },
  {
    "id": "EAGnBmp5Qig",
    "title": "Blue Orange and Black Dynamic Tunnel Futuristic Intro Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGnBmp5Qig-blue-orange-and-black-dynamic-tunnel-futuristic-intro-video/",
    "thumb": "/canva-video-templates/EAGnBmp5Qig.jpg"
  },
  {
    "id": "EAG6d4f6H3M",
    "title": "Blue Yellow and Black Simple intro Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG6d4f6H3M-blue-yellow-and-black-simple-intro-video/",
    "thumb": "/canva-video-templates/EAG6d4f6H3M.jpg"
  },
  {
    "id": "EAFJK2c8tJ4",
    "title": "Pink & Blue Futuristic Gaming Channel Youtube Intro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFJK2c8tJ4-pink-blue-futuristic-gaming-channel-youtube-intro/",
    "thumb": "/canva-video-templates/EAFJK2c8tJ4.jpg"
  },
  {
    "id": "EAGrsY1TXL8",
    "title": "Red and White Minimal Simple Vlog Subscribe Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGrsY1TXL8-red-and-white-minimal-simple-vlog-subscribe-video/",
    "thumb": "/canva-video-templates/EAGrsY1TXL8.jpg"
  },
  {
    "id": "EAHNu5VVMn4",
    "title": "Red Black and White Modern My Channel Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHNu5VVMn4-red-black-and-white-modern-my-channel-video/",
    "thumb": "/canva-video-templates/EAHNu5VVMn4.jpg"
  },
  {
    "id": "EAFKqympeoY",
    "title": "Colorful Blue and Purple Animated YouTube Outro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFKqympeoY-colorful-blue-and-purple-animated-youtube-outro/",
    "thumb": "/canva-video-templates/EAFKqympeoY.jpg"
  },
  {
    "id": "EAFm6i1Truo",
    "title": "Pink Retro Subscribe Youtube Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFm6i1Truo-pink-retro-subscribe-youtube-video/",
    "thumb": "/canva-video-templates/EAFm6i1Truo.jpg"
  },
  {
    "id": "EAHMtgONOmc",
    "title": "Black and Blue Modern Welcome Landscape Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHMtgONOmc-black-and-blue-modern-welcome-landscape-video/",
    "thumb": "/canva-video-templates/EAHMtgONOmc.jpg"
  },
  {
    "id": "EAGWpzeHjR4",
    "title": "Red and Black Simple Modern Subscribe Button Youtube Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGWpzeHjR4-red-and-black-simple-modern-subscribe-button-youtube-video/",
    "thumb": "/canva-video-templates/EAGWpzeHjR4.jpg"
  },
  {
    "id": "EAGoD1VQm6c",
    "title": "Pink Watercolor Illustrated Fashion Youtube Channel Intro Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGoD1VQm6c-pink-watercolor-illustrated-fashion-youtube-channel-intro-video/",
    "thumb": "/canva-video-templates/EAGoD1VQm6c.jpg"
  },
  {
    "id": "EAFKFtt2XhI",
    "title": "Red and Black Futuristic Gaming Channel YouTube Intro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFKFtt2XhI-red-and-black-futuristic-gaming-channel-youtube-intro/",
    "thumb": "/canva-video-templates/EAFKFtt2XhI.jpg"
  },
  {
    "id": "EAF3_pXHb5A",
    "title": "Black and White Modern Geometric Animation Youtube Channel Intro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAF3_pXHb5A-black-and-white-modern-geometric-animation-youtube-channel-intro/",
    "thumb": "/canva-video-templates/EAF3_pXHb5A.jpg"
  },
  {
    "id": "EAFgP7NJXBo",
    "title": "Black and White Minimalist Animated Grunge Photography Camera YouTube Intro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFgP7NJXBo-black-and-white-minimalist-animated-grunge-photography-camera-youtube-intro/",
    "thumb": "/canva-video-templates/EAFgP7NJXBo.jpg"
  },
  {
    "id": "EAE4aI2_Yjg",
    "title": "Sunset Video Relaxing Destinations Travel Vlog Youtube Intro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE4aI2_Yjg-sunset-video-relaxing-destinations-travel-vlog-youtube-intro/",
    "thumb": "/canva-video-templates/EAE4aI2_Yjg.jpg"
  },
  {
    "id": "EAFriokdgng",
    "title": "Black and White Retro Countdown Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFriokdgng-black-and-white-retro-countdown-video/",
    "thumb": "/canva-video-templates/EAFriokdgng.jpg"
  },
  {
    "id": "EAGtHiXn8cc",
    "title": "Red and White Dynamic Countdown Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGtHiXn8cc-red-and-white-dynamic-countdown-video/",
    "thumb": "/canva-video-templates/EAGtHiXn8cc.jpg"
  },
  {
    "id": "EAFllcNqVao",
    "title": "White and Pastel Kawaii Cute Typography Plaid Video Centric YouTube Intro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFllcNqVao-white-and-pastel-kawaii-cute-typography-plaid-video-centric-youtube-intro/",
    "thumb": "/canva-video-templates/EAFllcNqVao.jpg"
  },
  {
    "id": "EAGKbD2qga0",
    "title": "White Floral Simple Thanks For Watching Youtube Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGKbD2qga0-white-floral-simple-thanks-for-watching-youtube-video/",
    "thumb": "/canva-video-templates/EAGKbD2qga0.jpg"
  },
  {
    "id": "EAEdeVtVJN8",
    "title": "Green and Beige Toys Playful Illustrative Birth Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAEdeVtVJN8-green-and-beige-toys-playful-illustrative-birth-slideshow-video/",
    "thumb": "/canva-video-templates/EAEdeVtVJN8.jpg"
  },
  {
    "id": "EAE9FgBsSAs",
    "title": "Brown Friendship Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE9FgBsSAs-brown-friendship-video/",
    "thumb": "/canva-video-templates/EAE9FgBsSAs.jpg"
  },
  {
    "id": "EADxf01hDtQ",
    "title": "Grey Minimalism Real Estate Residential Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADxf01hDtQ-grey-minimalism-real-estate-residential-slideshow-video/",
    "thumb": "/canva-video-templates/EADxf01hDtQ.jpg"
  },
  {
    "id": "EADpo5k76vo",
    "title": "White and Green Modern Real Estate / Property Listing Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADpo5k76vo-white-and-green-modern-real-estate-property-listing-slideshow-video/",
    "thumb": "/canva-video-templates/EADpo5k76vo.jpg"
  },
  {
    "id": "EADpoxO8aog",
    "title": "Beige and White Minimalist Clothing Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADpoxO8aog-beige-and-white-minimalist-clothing-slideshow-video/",
    "thumb": "/canva-video-templates/EADpoxO8aog.jpg"
  },
  {
    "id": "EAFBwRKWGug",
    "title": "Stop Motion Gaming Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFBwRKWGug-stop-motion-gaming-video/",
    "thumb": "/canva-video-templates/EAFBwRKWGug.jpg"
  },
  {
    "id": "EAEdeS5Y5xk",
    "title": "Green and Gold Delicate Flowers Watercolor Christening Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAEdeS5Y5xk-green-and-gold-delicate-flowers-watercolor-christening-slideshow-video/",
    "thumb": "/canva-video-templates/EAEdeS5Y5xk.jpg"
  },
  {
    "id": "EAEdedrQiM0",
    "title": "Green and Peach Delicate Watercolor Flowers Christening Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAEdedrQiM0-green-and-peach-delicate-watercolor-flowers-christening-slideshow-video/",
    "thumb": "/canva-video-templates/EAEdedrQiM0.jpg"
  },
  {
    "id": "EAEOljyiZmA",
    "title": "Black and Yellow Woman Film Frames All About Me Slideshow",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAEOljyiZmA-black-and-yellow-woman-film-frames-all-about-me-slideshow/",
    "thumb": "/canva-video-templates/EAEOljyiZmA.jpg"
  },
  {
    "id": "EAElh99WBlM",
    "title": "Colorful Quirky Will You Be My Boyfriend Proposal Slideshow Video template, 6 pages",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAElh99WBlM-colorful-quirky-will-you-be-my-boyfriend-proposal-slideshow-video/",
    "thumb": "/canva-video-templates/EAElh99WBlM.jpg"
  },
  {
    "id": "EAE9Fi5kcPc",
    "title": "Brown Minimalist Moodboard Home Decor Inspiration Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE9Fi5kcPc-brown-minimalist-moodboard-home-decor-inspiration-video/",
    "thumb": "/canva-video-templates/EAE9Fi5kcPc.jpg"
  },
  {
    "id": "EADom4zfWgw",
    "title": "Orange and White Cultural Travel Documentary Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADom4zfWgw-orange-and-white-cultural-travel-documentary-slideshow-video/",
    "thumb": "/canva-video-templates/EADom4zfWgw.jpg"
  },
  {
    "id": "EAE9FnZKh5o",
    "title": "Cream Polaroid Modern Beauty of Beach Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE9FnZKh5o-cream-polaroid-modern-beauty-of-beach-video/",
    "thumb": "/canva-video-templates/EAE9FnZKh5o.jpg"
  },
  {
    "id": "EAEZt6UxAHw",
    "title": "Purple Pink and Turquoise Minimalist Delicate Funeral Slideshow Video template, 5 pages",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAEZt6UxAHw-purple-pink-and-turquoise-minimalist-delicate-funeral-slideshow-video/",
    "thumb": "/canva-video-templates/EAEZt6UxAHw.jpg"
  },
  {
    "id": "EAE9FvVdx5k",
    "title": "White Aesthetic Collage Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE9FvVdx5k-white-aesthetic-collage-video/",
    "thumb": "/canva-video-templates/EAE9FvVdx5k.jpg"
  },
  {
    "id": "EAFuPdt4TnA",
    "title": "Yellow and Black Vintage Outdoor Adventure Trip Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFuPdt4TnA-yellow-and-black-vintage-outdoor-adventure-trip-video/",
    "thumb": "/canva-video-templates/EAFuPdt4TnA.jpg"
  },
  {
    "id": "EAElh_4n01c",
    "title": "Colorful Speckles Quirky Be Mine Gender Neutral Proposal Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAElh_4n01c-colorful-speckles-quirky-be-mine-gender-neutral-proposal-slideshow-video/",
    "thumb": "/canva-video-templates/EAElh_4n01c.jpg"
  },
  {
    "id": "EAGSSk1DOVQ",
    "title": "Red White Aesthetic Lipstick Promo Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGSSk1DOVQ-red-white-aesthetic-lipstick-promo-video/",
    "thumb": "/canva-video-templates/EAGSSk1DOVQ.jpg"
  },
  {
    "id": "EAE7pWP4Oe0",
    "title": "White & Yellow Modern Restaurant Food Menu For Fast Food Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAE7pWP4Oe0-white-yellow-modern-restaurant-food-menu-for-fast-food-video/",
    "thumb": "/canva-video-templates/EAE7pWP4Oe0.jpg"
  },
  {
    "id": "EAHG1UVATy4",
    "title": "Brown Modern Bold Cookies Promo Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHG1UVATy4-brown-modern-bold-cookies-promo-video/",
    "thumb": "/canva-video-templates/EAHG1UVATy4.jpg"
  },
  {
    "id": "EAFzZxRpBPo",
    "title": "Pink and Black New Single Promo Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFzZxRpBPo-pink-and-black-new-single-promo-video/",
    "thumb": "/canva-video-templates/EAFzZxRpBPo.jpg"
  },
  {
    "id": "EAE8TlIrW20",
    "title": "Pink Neon Restaurant Food Menu For Fast Food Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAE8TlIrW20-pink-neon-restaurant-food-menu-for-fast-food-video/",
    "thumb": "/canva-video-templates/EAE8TlIrW20.jpg"
  },
  {
    "id": "EAGxFg5A_Pg",
    "title": "Blue and Gold Modern Coming Soon Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGxFg5A_Pg-blue-and-gold-modern-coming-soon-video/",
    "thumb": "/canva-video-templates/EAGxFg5A_Pg.jpg"
  },
  {
    "id": "EAHUIb2uOKY",
    "title": "Orange and BlackModern Thank You For Watching Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHUIb2uOKY-orange-and-blackmodern-thank-you-for-watching-video/",
    "thumb": "/canva-video-templates/EAHUIb2uOKY.jpg"
  },
  {
    "id": "EAGsCZI0bvs",
    "title": "Red and Yellow Modern Indian Food Menu Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGsCZI0bvs-red-and-yellow-modern-indian-food-menu-video/",
    "thumb": "/canva-video-templates/EAGsCZI0bvs.jpg"
  },
  {
    "id": "EAFqMueM_pQ",
    "title": "Blue White Modern Bold Digital Marketing Expert Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFqMueM_pQ-blue-white-modern-bold-digital-marketing-expert-video/",
    "thumb": "/canva-video-templates/EAFqMueM_pQ.jpg"
  },
  {
    "id": "EAHV_gmWQ1I",
    "title": "Blue and Red Breaking News Intro Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHV_gmWQ1I-blue-and-red-breaking-news-intro-video/",
    "thumb": "/canva-video-templates/EAHV_gmWQ1I.jpg"
  },
  {
    "id": "EAGSj0bq4HU",
    "title": "Pink Cream Aesthetic Lipstick Promo Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGSj0bq4HU-pink-cream-aesthetic-lipstick-promo-video/",
    "thumb": "/canva-video-templates/EAGSj0bq4HU.jpg"
  },
  {
    "id": "EAGKsXMJk_w",
    "title": "White Black Minimalist Watch Product Showcase Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGKsXMJk_w-white-black-minimalist-watch-product-showcase-video/",
    "thumb": "/canva-video-templates/EAGKsXMJk_w.jpg"
  },
  {
    "id": "EAE1qRb58vg",
    "title": "Neon New Articles Fashion Gradient Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE1qRb58vg-neon-new-articles-fashion-gradient-video/",
    "thumb": "/canva-video-templates/EAE1qRb58vg.jpg"
  },
  {
    "id": "EAD3hwBc2tc",
    "title": "White Croissant Photo Food Retail In-Stream Video Ad",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAD3hwBc2tc-white-croissant-photo-food-retail-in-stream-video-ad/",
    "thumb": "/canva-video-templates/EAD3hwBc2tc.jpg"
  },
  {
    "id": "EAGebUK8rFo",
    "title": "Black Yellow Fitness Centre Promo Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGebUK8rFo-black-yellow-fitness-centre-promo-video/",
    "thumb": "/canva-video-templates/EAGebUK8rFo.jpg"
  },
  {
    "id": "EAF3Vv3hJBE",
    "title": "Black Yellow Modern Spicy Food Promo Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAF3Vv3hJBE-black-yellow-modern-spicy-food-promo-video/",
    "thumb": "/canva-video-templates/EAF3Vv3hJBE.jpg"
  },
  {
    "id": "EAE18i_zCVI",
    "title": "Black This Or That Urban Streetwear Fashion Grayscale Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE18i_zCVI-black-this-or-that-urban-streetwear-fashion-grayscale-video/",
    "thumb": "/canva-video-templates/EAE18i_zCVI.jpg"
  },
  {
    "id": "EAFT2QgQ_lo",
    "title": "End-of-Life Tribute Video in Beige White Elegant Informational Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2QgQ_lo-end-of-life-tribute-video-in-beige-white-elegant-informational-style/",
    "thumb": "/canva-video-templates/EAFT2QgQ_lo.jpg"
  },
  {
    "id": "EAFT2UDO_mE",
    "title": "End-of-Life Tribute Video in Beige Dark Red Elegant Photocentric Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2UDO_mE-end-of-life-tribute-video-in-beige-dark-red-elegant-photocentric-style/",
    "thumb": "/canva-video-templates/EAFT2UDO_mE.jpg"
  },
  {
    "id": "EAFT2fczJ1g",
    "title": "End-of-Life Tribute Video in Grey White Natural Photocentric Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2fczJ1g-end-of-life-tribute-video-in-grey-white-natural-photocentric-style/",
    "thumb": "/canva-video-templates/EAFT2fczJ1g.jpg"
  },
  {
    "id": "EAFT2uPY6HM",
    "title": "Tribute Video in Grey Purple Watercolor Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2uPY6HM-tribute-video-in-grey-purple-watercolor-style/",
    "thumb": "/canva-video-templates/EAFT2uPY6HM.jpg"
  },
  {
    "id": "EAFT9t8l6IY",
    "title": "Tribute Video in Black White Film Frames Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT9t8l6IY-tribute-video-in-black-white-film-frames-style/",
    "thumb": "/canva-video-templates/EAFT9t8l6IY.jpg"
  },
  {
    "id": "EAFZJU0CWK0",
    "title": "End-of-Life Tribute Instagram Post Video in White Beige Elegant Informational Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFZJU0CWK0-end-of-life-tribute-instagram-post-video-in-white-beige-elegant-informational-style/",
    "thumb": "/canva-video-templates/EAFZJU0CWK0.jpg"
  },
  {
    "id": "EAFZPpXA4Kw",
    "title": "Tribute Instagram Post Video in Beige Pink Watercolor Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFZPpXA4Kw-tribute-instagram-post-video-in-beige-pink-watercolor-style/",
    "thumb": "/canva-video-templates/EAFZPpXA4Kw.jpg"
  },
  {
    "id": "EAFZOvFuYvA",
    "title": "End-of-Life Tribute Instagram Post Video in Black Green Natural Photocentric Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFZOvFuYvA-end-of-life-tribute-instagram-post-video-in-black-green-natural-photocentric-style/",
    "thumb": "/canva-video-templates/EAFZOvFuYvA.jpg"
  },
  {
    "id": "EAFT2WaNhqA",
    "title": "End-of-Life Tribute Video in Pink Blue White Femme Florals Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2WaNhqA-end-of-life-tribute-video-in-pink-blue-white-femme-florals-style/",
    "thumb": "/canva-video-templates/EAFT2WaNhqA.jpg"
  },
  {
    "id": "EAFYuuTzdVo",
    "title": "Tribute Video in Green Beige Scrapbook Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFYuuTzdVo-tribute-video-in-green-beige-scrapbook-style/",
    "thumb": "/canva-video-templates/EAFYuuTzdVo.jpg"
  },
  {
    "id": "EAFT2iArqwA",
    "title": "Tribute Video in Beige Grey Scrapbook Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2iArqwA-tribute-video-in-beige-grey-scrapbook-style/",
    "thumb": "/canva-video-templates/EAFT2iArqwA.jpg"
  },
  {
    "id": "EAFT2tdN5eE",
    "title": "Tribute Video in Black Yellow White Film Frames Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFT2tdN5eE-tribute-video-in-black-yellow-white-film-frames-style/",
    "thumb": "/canva-video-templates/EAFT2tdN5eE.jpg"
  },
  {
    "id": "EAFY0fvz9Vs",
    "title": "End-of-Life Tribute Mobile Video in Grey Orange Elegant Informational Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFY0fvz9Vs-end-of-life-tribute-mobile-video-in-grey-orange-elegant-informational-style/",
    "thumb": "/canva-video-templates/EAFY0fvz9Vs.jpg"
  },
  {
    "id": "EAFT2TGU_qs",
    "title": "End-of-Life Tribute Video in Black and White Natural Photocentric Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2TGU_qs-end-of-life-tribute-video-in-black-and-white-natural-photocentric-style/",
    "thumb": "/canva-video-templates/EAFT2TGU_qs.jpg"
  }
];


export const CANVA_VIDEO_CATEGORIES: CanvaVideoCategory[] = [
  {
    "key": "birthdays",
    "name": "Birthdays"
  },
  {
    "key": "weddings",
    "name": "Weddings"
  },
  {
    "key": "indian-wedding",
    "name": "Indian Wedding"
  },
  {
    "key": "save-the-date",
    "name": "Save the Date"
  },
  {
    "key": "anniversaries",
    "name": "Anniversaries"
  },
  {
    "key": "festivals",
    "name": "Festivals & Diwali"
  },
  {
    "key": "christmas",
    "name": "Christmas"
  },
  {
    "key": "new-year",
    "name": "New Year"
  },
  {
    "key": "milestones",
    "name": "Milestones"
  },
  {
    "key": "reels",
    "name": "Reels & Shorts"
  },
  {
    "key": "youtube",
    "name": "YouTube Intros"
  },
  {
    "key": "slideshows",
    "name": "Slideshows"
  },
  {
    "key": "marketing",
    "name": "Marketing & Promos"
  },
  {
    "key": "tributes",
    "name": "Tributes"
  }
];

const CANVA_VIDEO_MAP = new Map(
  CANVA_VIDEO_TEMPLATES.map((template) => [template.id, template]),
);

export function getCanvaVideoTemplate(id: string): CanvaVideoTemplate | null {
  return CANVA_VIDEO_MAP.get(id) ?? null;
}
