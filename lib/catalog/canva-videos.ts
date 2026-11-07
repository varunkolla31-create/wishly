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
    "thumb": "https://template.canva.com/EAGi6qx_bBE/2/0/400w-iLrTj4yJEMk.jpg"
  },
  {
    "id": "EAHCmsIFtyI",
    "title": "Pink Green and White Playful Birthday Greetings Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHCmsIFtyI-pink-green-and-white-playful-birthday-greetings-video/",
    "thumb": "https://template.canva.com/EAHCmsIFtyI/1/0/400w-t8b09csTY18.jpg"
  },
  {
    "id": "EAFW8asjx6o",
    "title": "Yellow and Brown Playful Happy Birthday Celebration Message Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFW8asjx6o-yellow-and-brown-playful-happy-birthday-celebration-message-video/",
    "thumb": "https://template.canva.com/EAFW8asjx6o/1/0/400w-fftighjD2DA.jpg"
  },
  {
    "id": "EAGgoz0bk4k",
    "title": "Orange and White Simple Happy Birthday Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGgoz0bk4k-orange-and-white-simple-happy-birthday-video/",
    "thumb": "https://template.canva.com/EAGgoz0bk4k/1/0/400w-Zf3Tc5Xe_ns.jpg"
  },
  {
    "id": "EAGhDjCZB5s",
    "title": "Blue Gradient Simple Birthday Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGhDjCZB5s-blue-gradient-simple-birthday-video/",
    "thumb": "https://template.canva.com/EAGhDjCZB5s/1/0/400w-fP48W74TxZg.jpg"
  },
  {
    "id": "EAHMndF9ank",
    "title": "Purple Neon Glitch Birthday Party Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHMndF9ank-purple-neon-glitch-birthday-party-video/",
    "thumb": "https://template.canva.com/EAHMndF9ank/1/0/400w-MQzzy2IlEhw.jpg"
  },
  {
    "id": "EAGe5Gsf5sw",
    "title": "Pink and Silver Retro Y2K Cute Aesthetic Scrapbook Happy Birthday Message Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGe5Gsf5sw-pink-and-silver-retro-y2k-cute-aesthetic-scrapbook-happy-birthday-message-video/",
    "thumb": "https://template.canva.com/EAGe5Gsf5sw/1/0/400w-SF5CU6sJ_oQ.jpg"
  },
  {
    "id": "EAFVyvQ0Rhk",
    "title": "Violet Animated Happy Birthday Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFVyvQ0Rhk-violet-animated-happy-birthday-video/",
    "thumb": "https://template.canva.com/EAFVyvQ0Rhk/1/0/400w-3W5dpV8_Rfo.jpg"
  },
  {
    "id": "EAGW9PpZxqc",
    "title": "Pink And White Watercolor Cute Doodle Happy Birthday Greeting Slideshow Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGW9PpZxqc-pink-and-white-watercolor-cute-doodle-happy-birthday-greeting-slideshow-video/",
    "thumb": "https://template.canva.com/EAGW9PpZxqc/2/0/400w-p1ULuYFsLiQ.jpg"
  },
  {
    "id": "EAGqeCntZ6g",
    "title": "Beige Brown and Green Abstract Happy Birthday Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGqeCntZ6g-beige-brown-and-green-abstract-happy-birthday-video/",
    "thumb": "https://template.canva.com/EAGqeCntZ6g/1/0/400w-y6MpjwbjeUk.jpg"
  },
  {
    "id": "EAGWspsIW0Y",
    "title": "White Purple Aesthetic Happy Birthday Greeting Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGWspsIW0Y-white-purple-aesthetic-happy-birthday-greeting-video/",
    "thumb": "https://template.canva.com/EAGWspsIW0Y/2/0/400w-RalUbOHtLzA.jpg"
  },
  {
    "id": "EAHAJP2RKhY",
    "title": "Yellow Blue and Pink Playful Family Memories Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHAJP2RKhY-yellow-blue-and-pink-playful-family-memories-video/",
    "thumb": "https://template.canva.com/EAHAJP2RKhY/1/0/400w-rH8Gqt6McJ4.jpg"
  },
  {
    "id": "EAGnVIc12f4",
    "title": "Purple Pink and White Happy Birthday Celebration Mobile Video With Photo",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGnVIc12f4-purple-pink-and-white-happy-birthday-celebration-mobile-video-with-photo/",
    "thumb": "https://template.canva.com/EAGnVIc12f4/1/0/900w-0xhDCyL9rW0.jpg"
  },
  {
    "id": "EAGpCMRhvlk",
    "title": "Yellow Pink Playful Birthday Greeting Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGpCMRhvlk-yellow-pink-playful-birthday-greeting-video/",
    "thumb": "https://template.canva.com/EAGpCMRhvlk/1/0/400w-9QFei9Qfsz0.jpg"
  },
  {
    "id": "EAGkQfXiXx0",
    "title": "Pink Purple Cute Dreamy Happy Birthday Greeting Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGkQfXiXx0-pink-purple-cute-dreamy-happy-birthday-greeting-video/",
    "thumb": "https://template.canva.com/EAGkQfXiXx0/1/0/400w-2_3XsLtAcGg.jpg"
  },
  {
    "id": "EAHXkTNUWjk",
    "title": "Blue White and Navy Minimalist Happy Birthday Landscape Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHXkTNUWjk-blue-white-and-navy-minimalist-happy-birthday-landscape-video/",
    "thumb": "https://template.canva.com/EAHXkTNUWjk/1/0/400w-PLOkB91RjVs.jpg"
  },
  {
    "id": "EAHGzIVxZ14",
    "title": "Pink Purple and White Playful Birthday Celebration Video",
    "category": "birthdays",
    "categoryName": "Birthdays",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHGzIVxZ14-pink-purple-and-white-playful-birthday-celebration-video/",
    "thumb": "https://template.canva.com/EAHGzIVxZ14/3/0/400w-GURJHlb3ypQ.jpg"
  },
  {
    "id": "EADxgI4XnL0",
    "title": "Cream, Brown, and Pink Modern Elegant Love Story Wedding Slideshow Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADxgI4XnL0-cream-brown-and-pink-modern-elegant-love-story-wedding-slideshow-video/",
    "thumb": "https://template.canva.com/EADxgI4XnL0/1/0/400w-n6Kgk-jn-N0.jpg"
  },
  {
    "id": "EADscF6qgL0",
    "title": "Gray and Cream Wedding Anniversary Animated Presentation",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADscF6qgL0-gray-and-cream-wedding-anniversary-animated-presentation/",
    "thumb": "https://template.canva.com/EADscF6qgL0/2/0/400w-v6tHE7os3AM.jpg"
  },
  {
    "id": "EAFA1E6wDkM",
    "title": "Dark Olive Watercolor Modern Wedding Invitation Party Video template, 3 pages",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFA1E6wDkM-dark-olive-watercolor-modern-wedding-invitation-party-video/",
    "thumb": "https://template.canva.com/EAFA1E6wDkM/1/0/400w-6BofNd9oZD8.jpg"
  },
  {
    "id": "EAFDL5c7IJA",
    "title": "Champagne Beige Elegant Animated Wedding Invitation Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFDL5c7IJA-champagne-beige-elegant-animated-wedding-invitation-video/",
    "thumb": "https://template.canva.com/EAFDL5c7IJA/1/0/400w-iP0GqrFXZlE.jpg"
  },
  {
    "id": "EADppg4DRuw",
    "title": "Maroon and Gold Wedding Save The Date Slideshow Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EADppg4DRuw-maroon-and-gold-wedding-save-the-date-slideshow-video/",
    "thumb": "https://template.canva.com/EADppg4DRuw/4/0/400w-X0ohYhch41o.jpg"
  },
  {
    "id": "EADpo9gRgE4",
    "title": "Black and Gold Marble Wedding Save the Date Slideshow Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EADpo9gRgE4-black-and-gold-marble-wedding-save-the-date-slideshow-video/",
    "thumb": "https://template.canva.com/EADpo9gRgE4/3/0/400w-NsW5ourDeX4.jpg"
  },
  {
    "id": "EAFKGo8PqGQ",
    "title": "Light Green Pastel Pink Scrapbook Wedding Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFKGo8PqGQ-light-green-pastel-pink-scrapbook-wedding-video/",
    "thumb": "https://template.canva.com/EAFKGo8PqGQ/1/0/400w-Bjegg7eEiJ0.jpg"
  },
  {
    "id": "EAFKGRtBjwM",
    "title": "Gold Black Celegoldbration Wedding Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFKGRtBjwM-gold-black-celegoldbration-wedding-video/",
    "thumb": "https://template.canva.com/EAFKGRtBjwM/1/0/400w-gccM4OUq2h8.jpg"
  },
  {
    "id": "EAG_SeKxbhI",
    "title": "Gold and Black Dark Modern Marble Texture Save The Date Wedding Invitation Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG_SeKxbhI-gold-and-black-dark-modern-marble-texture-save-the-date-wedding-invitation-video/",
    "thumb": "https://template.canva.com/EAG_SeKxbhI/2/0/400w-RpCfuapH9ak.jpg"
  },
  {
    "id": "EADppndL624",
    "title": "Green and White Tropical Engagement Announcement Slideshow Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADppndL624-green-and-white-tropical-engagement-announcement-slideshow-video/",
    "thumb": "https://template.canva.com/EADppndL624/3/0/400w-FY9AZmx2p-k.jpg"
  },
  {
    "id": "EADscNWLoEk",
    "title": "Cream and Gold Wedding Anniversary Animated Presentation",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADscNWLoEk-cream-and-gold-wedding-anniversary-animated-presentation/",
    "thumb": "https://template.canva.com/EADscNWLoEk/1/0/400w-xGo21C1RNOo.jpg"
  },
  {
    "id": "EADscHoxG_M",
    "title": "Pink and Bronze Wedding Anniversary Animated Presentation",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EADscHoxG_M-pink-and-bronze-wedding-anniversary-animated-presentation/",
    "thumb": "https://template.canva.com/EADscHoxG_M/1/0/400w-Up46j6AlRJ0.jpg"
  },
  {
    "id": "EAFKG7jFUPc",
    "title": "Beige Pink Watercolor Wedding Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFKG7jFUPc-beige-pink-watercolor-wedding-video/",
    "thumb": "https://template.canva.com/EAFKG7jFUPc/1/0/400w-T6mhuT2AXJY.jpg"
  },
  {
    "id": "EAG_NAvUiVQ",
    "title": "Black and Blue Dark Modern Rustic Floral Illustrative Couple Wedding Invitation Video",
    "category": "weddings",
    "categoryName": "Weddings",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG_NAvUiVQ-black-and-blue-dark-modern-rustic-floral-illustrative-couple-wedding-invitation-video/",
    "thumb": "https://template.canva.com/EAG_NAvUiVQ/1/0/400w-0_1u7H4ZJoc.jpg"
  },
  {
    "id": "EAGbPzHISDM",
    "title": "Yellow Traditional Indian Wedding Haldi Ceremony Invitation Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGbPzHISDM-yellow-traditional-indian-wedding-haldi-ceremony-invitation-mobile-video/",
    "thumb": "https://template.canva.com/EAGbPzHISDM/1/0/900w-bFY9gIonbYw.jpg"
  },
  {
    "id": "EAGeJzaxnVU",
    "title": "Green and White Floral Indian Wedding Reception Party Invitation Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGeJzaxnVU-green-and-white-floral-indian-wedding-reception-party-invitation-mobile-video/",
    "thumb": "https://template.canva.com/EAGeJzaxnVU/1/0/900w-BEw3lID_Kok.jpg"
  },
  {
    "id": "EAFsAnpj5s8",
    "title": "Dark Blue and White Floral Indian Wedding Save The Date Instagram Post",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "1:1",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFsAnpj5s8-dark-blue-and-white-floral-indian-wedding-save-the-date-instagram-post/",
    "thumb": "https://template.canva.com/EAFsAnpj5s8/1/0/400w-UvZnU4RbwFo.jpg"
  },
  {
    "id": "EAHQpu7csJI",
    "title": "Orange And Green Illustrated Indian Wedding Invitation Instagram Story",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHQpu7csJI-orange-and-green-illustrated-indian-wedding-invitation-instagram-story/",
    "thumb": "https://template.canva.com/EAHQpu7csJI/1/0/900w-GkITwCgxQKg.jpg"
  },
  {
    "id": "EAF1dmuAzCg",
    "title": "Red And White Elegant Indian Wedding Jewellery Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAF1dmuAzCg-red-and-white-elegant-indian-wedding-jewellery-mobile-video/",
    "thumb": "https://template.canva.com/EAF1dmuAzCg/1/0/900w-LvN9AQerRmk.jpg"
  },
  {
    "id": "EAGaDSfHRvk",
    "title": "Beige and Green Traditional Vintage Indian Wedding Virtual Invitation",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGaDSfHRvk-beige-and-green-traditional-vintage-indian-wedding-virtual-invitation/",
    "thumb": "https://template.canva.com/EAGaDSfHRvk/1/0/568w-5pDML2WfeR4.jpg"
  },
  {
    "id": "EAGfdl5xiME",
    "title": "Green and Orange Traditional Indian Wedding Mehndi Ceremony Invitation Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGfdl5xiME-green-and-orange-traditional-indian-wedding-mehndi-ceremony-invitation-mobile-video/",
    "thumb": "https://template.canva.com/EAGfdl5xiME/3/0/900w-4ywtoOy4IDA.jpg"
  },
  {
    "id": "EAHDoKwHh1E",
    "title": "Beige Gold and Red Traditional Wedding Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHDoKwHh1E-beige-gold-and-red-traditional-wedding-mobile-video/",
    "thumb": "https://template.canva.com/EAHDoKwHh1E/1/0/900w-2ugWntkh5Uw.jpg"
  },
  {
    "id": "EAG4KiZViKs",
    "title": "Red White Traditional Indian Wedding Invitation Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG4KiZViKs-red-white-traditional-indian-wedding-invitation-mobile-video/",
    "thumb": "https://template.canva.com/EAG4KiZViKs/1/0/900w-q9c61Z6lnm4.jpg"
  },
  {
    "id": "EAGWPc1iUf4",
    "title": "Red and Pink Floral Indian Wedding Invitation Animated Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGWPc1iUf4-red-and-pink-floral-indian-wedding-invitation-animated-mobile-video/",
    "thumb": "https://template.canva.com/EAGWPc1iUf4/1/0/900w-zXbcQOjXsWE.jpg"
  },
  {
    "id": "EAGd4wEAq7Q",
    "title": "Light Blue and Pink Floral Indian Wedding Ring Ceremony Invitation Mobile Video",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGd4wEAq7Q-light-blue-and-pink-floral-indian-wedding-ring-ceremony-invitation-mobile-video/",
    "thumb": "https://template.canva.com/EAGd4wEAq7Q/1/0/900w-yqGCg1yoLwQ.jpg"
  },
  {
    "id": "EAGB1cj9ETY",
    "title": "Orange Haldi Indian Wedding Invitation",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGB1cj9ETY-orange-haldi-indian-wedding-invitation/",
    "thumb": "https://template.canva.com/EAGB1cj9ETY/1/0/571w-O0n-xbDStPM.jpg"
  },
  {
    "id": "EAG_gjoucps",
    "title": "Pink and Yellow Traditional Indian Wedding Invitation",
    "category": "indian-wedding",
    "categoryName": "Indian Wedding",
    "aspect_ratio": "9:16",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG_gjoucps-pink-and-yellow-traditional-indian-wedding-invitation/",
    "thumb": "https://template.canva.com/EAG_gjoucps/2/0/572w-D94moxv6t9U.jpg"
  },
  {
    "id": "EAFrrtEfrFc",
    "title": "Blue and Gold Traditional Indian Wedding Save the Date Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFrrtEfrFc-blue-and-gold-traditional-indian-wedding-save-the-date-video/",
    "thumb": "https://template.canva.com/EAFrrtEfrFc/1/0/400w-byjyb--dohY.jpg"
  },
  {
    "id": "EAGkkkOPERU",
    "title": "Black and White Gradient Elegant Bold Floral Sparkle Wedding Invitation Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGkkkOPERU-black-and-white-gradient-elegant-bold-floral-sparkle-wedding-invitation-video/",
    "thumb": "https://template.canva.com/EAGkkkOPERU/1/0/400w-3TslNRiTPGk.jpg"
  },
  {
    "id": "EAGoBloXMuA",
    "title": "Beige Gray Classy Elegant Wedding Highlight Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGoBloXMuA-beige-gray-classy-elegant-wedding-highlight-video/",
    "thumb": "https://template.canva.com/EAGoBloXMuA/2/0/400w-91LErgPtTYs.jpg"
  },
  {
    "id": "EAFaogtnMBo",
    "title": "Beige Simple Minimal Save The Date Wedding Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFaogtnMBo-beige-simple-minimal-save-the-date-wedding-video/",
    "thumb": "https://template.canva.com/EAFaogtnMBo/3/0/400w-79sl6GIebQk.jpg"
  },
  {
    "id": "EAGscz9etVk",
    "title": "Blue and Pink Floral Wedding Invitation Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGscz9etVk-blue-and-pink-floral-wedding-invitation-video/",
    "thumb": "https://template.canva.com/EAGscz9etVk/1/0/400w-AJAukUImCzw.jpg"
  },
  {
    "id": "EAGS81q8WVE",
    "title": "Green and Gold Floral Wedding Invitation Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGS81q8WVE-green-and-gold-floral-wedding-invitation-video/",
    "thumb": "https://template.canva.com/EAGS81q8WVE/1/0/400w-CBaqgLNJc9g.jpg"
  },
  {
    "id": "EAHCa1wM2FY",
    "title": "Yellow Flower Watercolor Wedding Ceremony Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHCa1wM2FY-yellow-flower-watercolor-wedding-ceremony-video/",
    "thumb": "https://template.canva.com/EAHCa1wM2FY/1/0/400w-ttsao0tzDQY.jpg"
  },
  {
    "id": "EAGi72n4EZ4",
    "title": "Navy and Gold Elegant Wedding Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGi72n4EZ4-navy-and-gold-elegant-wedding-video/",
    "thumb": "https://template.canva.com/EAGi72n4EZ4/1/0/400w-xVRlf6yT1nI.jpg"
  },
  {
    "id": "EAFlOHmrag8",
    "title": "Light Pink Rose Floral Animated Illustration Save The Date Wedding Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFlOHmrag8-light-pink-rose-floral-animated-illustration-save-the-date-wedding-video/",
    "thumb": "https://template.canva.com/EAFlOHmrag8/1/0/400w-cPHWDT5AeMY.jpg"
  },
  {
    "id": "EAF_YN_C6Xc",
    "title": "Pink and White Simple Wedding Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAF_YN_C6Xc-pink-and-white-simple-wedding-video/",
    "thumb": "https://template.canva.com/EAF_YN_C6Xc/1/0/400w-MBTxdaaEsXQ.jpg"
  },
  {
    "id": "EAHXZtfS8_A",
    "title": "Gold and Black Dark Modern Marble Texture Save The Date Wedding Invitation Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHXZtfS8_A-gold-and-black-dark-modern-marble-texture-save-the-date-wedding-invitation-video/",
    "thumb": "https://template.canva.com/EAHXZtfS8_A/1/0/400w-8-W1TZBFwkg.jpg"
  },
  {
    "id": "EAGRirDCMrs",
    "title": "Purple Watercolor Floral Wedding Invitation Mobile Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGRirDCMrs-purple-watercolor-floral-wedding-invitation-mobile-video/",
    "thumb": "https://template.canva.com/EAGRirDCMrs/1/0/900w-XFUDhUcldac.jpg"
  },
  {
    "id": "EAGS8gBxov4",
    "title": "Pink White and Light Pink Romantic Floral Wedding Invitation Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGS8gBxov4-pink-white-and-light-pink-romantic-floral-wedding-invitation-video/",
    "thumb": "https://template.canva.com/EAGS8gBxov4/3/0/400w-vkL5BcddjBs.jpg"
  },
  {
    "id": "EAFl3ZU83LQ",
    "title": "Cream Elegant Sunset Save The Date Wedding Slideshow Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFl3ZU83LQ-cream-elegant-sunset-save-the-date-wedding-slideshow-video/",
    "thumb": "https://template.canva.com/EAFl3ZU83LQ/1/0/400w-wIMgAZl5iTs.jpg"
  },
  {
    "id": "EAGfbLjfDWw",
    "title": "Green and White Floral Illustration Save The Date Video",
    "category": "save-the-date",
    "categoryName": "Save the Date",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGfbLjfDWw-green-and-white-floral-illustration-save-the-date-video/",
    "thumb": "https://template.canva.com/EAGfbLjfDWw/1/0/400w-58Fb-aJGRqo.jpg"
  },
  {
    "id": "EAFT2XYvdE4",
    "title": "End-of-Life Tribute Video in Blue Pink White Elegant Photocentric Style",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2XYvdE4-end-of-life-tribute-video-in-blue-pink-white-elegant-photocentric-style/",
    "thumb": "https://template.canva.com/EAFT2XYvdE4/1/0/400w-wZdCYVy3yTg.jpg"
  },
  {
    "id": "EAG5Fo_dkvs",
    "title": "Beige and Gold Playful Celebration Message For Retirement Video",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG5Fo_dkvs-beige-and-gold-playful-celebration-message-for-retirement-video/",
    "thumb": "https://template.canva.com/EAG5Fo_dkvs/1/0/400w-tbXDXj7oQrA.jpg"
  },
  {
    "id": "EAHXNHp7Yq0",
    "title": "Orange Green and White Indian Air Force Day Landscape Video",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHXNHp7Yq0-orange-green-and-white-indian-air-force-day-landscape-video/",
    "thumb": "https://template.canva.com/EAHXNHp7Yq0/1/0/400w-Do4JRDuvjUs.jpg"
  },
  {
    "id": "EAFZHp6zG4k",
    "title": "End-of-Life Tribute Instagram Post Video in Red Yellow Elegant Photocentric Style",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFZHp6zG4k-end-of-life-tribute-instagram-post-video-in-red-yellow-elegant-photocentric-style/",
    "thumb": "https://template.canva.com/EAFZHp6zG4k/1/0/400w-AO2pX0NnfMU.jpg"
  },
  {
    "id": "EAHW31eucJg",
    "title": "Sky Blue White and Gray Modern Patriotic Indian Air Force Day Landscape Video",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHW31eucJg-sky-blue-white-and-gray-modern-patriotic-indian-air-force-day-landscape-video/",
    "thumb": "https://template.canva.com/EAHW31eucJg/1/0/400w-4cn1FKnUt1w.jpg"
  },
  {
    "id": "EAG4maYVbCQ",
    "title": "Purple And White Romantic Couple Wedding Anniversary Video",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG4maYVbCQ-purple-and-white-romantic-couple-wedding-anniversary-video/",
    "thumb": "https://template.canva.com/EAG4maYVbCQ/1/0/400w-mk59SE2Khk4.jpg"
  },
  {
    "id": "EAFT2lML59k",
    "title": "End-of-Life Tribute Video in Yellow Green Natural Photocentric Style",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2lML59k-end-of-life-tribute-video-in-yellow-green-natural-photocentric-style/",
    "thumb": "https://template.canva.com/EAFT2lML59k/1/0/400w-hCkoIBkFXqE.jpg"
  },
  {
    "id": "EAFZPgm3pCk",
    "title": "Tribute Mobile Video in Green Grey Illustrative Style",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFZPgm3pCk-tribute-mobile-video-in-green-grey-illustrative-style/",
    "thumb": "https://template.canva.com/EAFZPgm3pCk/1/0/400w-pOnjEvPv3zU.jpg"
  },
  {
    "id": "EAG5FmRo7qo",
    "title": "Black and Gold Elegant Tribute Farewell Message For Retirement Video",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG5FmRo7qo-black-and-gold-elegant-tribute-farewell-message-for-retirement-video/",
    "thumb": "https://template.canva.com/EAG5FmRo7qo/1/0/400w-fHuLNNAJ3cc.jpg"
  },
  {
    "id": "EAFT2ULvCm8",
    "title": "End-of-Life Tribute Video in Black Pink Elegant Informational Style",
    "category": "anniversaries",
    "categoryName": "Anniversaries",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFT2ULvCm8-end-of-life-tribute-video-in-black-pink-elegant-informational-style/",
    "thumb": "https://template.canva.com/EAFT2ULvCm8/1/0/400w-xzub0uOi0uY.jpg"
  },
  {
    "id": "EAGRNRapzkw",
    "title": "Red &amp; Gold Traditional Elegant Happy Diwali Greeting Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGRNRapzkw-red-gold-traditional-elegant-happy-diwali-greeting-video/",
    "thumb": "https://template.canva.com/EAGRNRapzkw/1/0/400w-pFR1uJRRCvM.jpg"
  },
  {
    "id": "EAGUZQNMqmk",
    "title": "Brown Yellow Minimal Modern Diwali Greeting Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGUZQNMqmk-brown-yellow-minimal-modern-diwali-greeting-video/",
    "thumb": "https://template.canva.com/EAGUZQNMqmk/2/0/400w-ivyd4XQKDvo.jpg"
  },
  {
    "id": "EAGQeosvzCY",
    "title": "Orange and Yellow Organic Diwali Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGQeosvzCY-orange-and-yellow-organic-diwali-video/",
    "thumb": "https://template.canva.com/EAGQeosvzCY/1/0/400w-lX4MP0L45HI.jpg"
  },
  {
    "id": "EAGT7PEU9mA",
    "title": "Violet Yellow Modern Minimalist Diwali Greeting Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGT7PEU9mA-violet-yellow-modern-minimalist-diwali-greeting-video/",
    "thumb": "https://template.canva.com/EAGT7PEU9mA/1/0/400w-rBYNFWAwPII.jpg"
  },
  {
    "id": "EAGRmGSG_GY",
    "title": "Red And Yellow Decorative Happy Diwali Greeting Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGRmGSG_GY-red-and-yellow-decorative-happy-diwali-greeting-video/",
    "thumb": "https://template.canva.com/EAGRmGSG_GY/1/0/400w-l_bAnKsYsoA.jpg"
  },
  {
    "id": "EAGU3fJjSVs",
    "title": "Purple Orange Illustrated Choti Diwali Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGU3fJjSVs-purple-orange-illustrated-choti-diwali-video/",
    "thumb": "https://template.canva.com/EAGU3fJjSVs/1/0/400w-EmGJr4BsU8E.jpg"
  },
  {
    "id": "EAG2D0InbFY",
    "title": "Gold Dynamic Diwali Greetings Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG2D0InbFY-gold-dynamic-diwali-greetings-video/",
    "thumb": "https://template.canva.com/EAG2D0InbFY/1/0/400w-I90w0tryqe0.jpg"
  },
  {
    "id": "EAG0af60Yb8",
    "title": "Brown and Yellow Illustrated Diwali Greetings Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG0af60Yb8-brown-and-yellow-illustrated-diwali-greetings-video/",
    "thumb": "https://template.canva.com/EAG0af60Yb8/2/0/400w-6azMf-r6Kjc.jpg"
  },
  {
    "id": "EAG1RI0MtzQ",
    "title": "Red and Gold Festive Diwali Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG1RI0MtzQ-red-and-gold-festive-diwali-video/",
    "thumb": "https://template.canva.com/EAG1RI0MtzQ/1/0/400w-8p8eitStSp8.jpg"
  },
  {
    "id": "EAG0qeLFGJw",
    "title": "Red and Yellow Playful Diwali Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG0qeLFGJw-red-and-yellow-playful-diwali-video/",
    "thumb": "https://template.canva.com/EAG0qeLFGJw/1/0/400w-22psKg1SYKA.jpg"
  },
  {
    "id": "EAGzDcQ8sEI",
    "title": "Yellow and Grey Traditional Diwali Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGzDcQ8sEI-yellow-and-grey-traditional-diwali-video/",
    "thumb": "https://template.canva.com/EAGzDcQ8sEI/1/0/400w-AM1mlvq8i-o.jpg"
  },
  {
    "id": "EAGzMxjSqn0",
    "title": "Yellow and Blue Traditional Happy Diwali Greetings Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGzMxjSqn0-yellow-and-blue-traditional-happy-diwali-greetings-video/",
    "thumb": "https://template.canva.com/EAGzMxjSqn0/1/0/400w-cYC2h6dwl1M.jpg"
  },
  {
    "id": "EAHV0AYcguk",
    "title": "Gold and Black Festive Happy Diwali Landscape Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHV0AYcguk-gold-and-black-festive-happy-diwali-landscape-video/",
    "thumb": "https://template.canva.com/EAHV0AYcguk/1/0/400w-HbWHRPuqvu4.jpg"
  },
  {
    "id": "EAGzMyjPpcI",
    "title": "Pink and Gold Traditional Happy Diwali Greetings Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGzMyjPpcI-pink-and-gold-traditional-happy-diwali-greetings-video/",
    "thumb": "https://template.canva.com/EAGzMyjPpcI/1/0/400w-Vgsgfg1cJtc.jpg"
  },
  {
    "id": "EAFykOWDAak",
    "title": "Purple Neon Diwali Greeting YouTube Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFykOWDAak-purple-neon-diwali-greeting-youtube-video/",
    "thumb": "https://template.canva.com/EAFykOWDAak/1/0/400w-fglvaMs_BUI.jpg"
  },
  {
    "id": "EAG1X2djQJg",
    "title": "Orange and Purple Illustrated Diwali Greetings Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG1X2djQJg-orange-and-purple-illustrated-diwali-greetings-video/",
    "thumb": "https://template.canva.com/EAG1X2djQJg/2/0/400w-6zLCxMleUt0.jpg"
  },
  {
    "id": "EAFzf7Yn7dA",
    "title": "Yellow Aesthetic Diwali Greeting Video",
    "category": "festivals",
    "categoryName": "Festivals & Diwali",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFzf7Yn7dA-yellow-aesthetic-diwali-greeting-video/",
    "thumb": "https://template.canva.com/EAFzf7Yn7dA/1/0/400w-PBWrT8R0K6w.jpg"
  },
  {
    "id": "EAHZcy7sXZ4",
    "title": "Red White and Green Playful Christmas Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHZcy7sXZ4-red-white-and-green-playful-christmas-video/",
    "thumb": "https://template.canva.com/EAHZcy7sXZ4/1/0/400w-1Q5wbvjIemM.jpg"
  },
  {
    "id": "EAExfU38h1Y",
    "title": "Gold Sparkles Elegant New Year Video Background&quot;",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAExfU38h1Y-gold-sparkles-elegant-new-year-video-background/",
    "thumb": "https://template.canva.com/EAExfU38h1Y/2/0/400w-NTudFLEiFfc.jpg"
  },
  {
    "id": "EAHVpKmbkKE",
    "title": "Brown and White Elegant Merry Christmas Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHVpKmbkKE-brown-and-white-elegant-merry-christmas-video/",
    "thumb": "https://template.canva.com/EAHVpKmbkKE/1/0/400w-0cc15ofU4F8.jpg"
  },
  {
    "id": "EAF3mQbRomg",
    "title": "Brown and Red Modern Christmas Greetings Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAF3mQbRomg-brown-and-red-modern-christmas-greetings-video/",
    "thumb": "https://template.canva.com/EAF3mQbRomg/1/0/400w--be5Lwxw5Bo.jpg"
  },
  {
    "id": "EAGVKcuhNcQ",
    "title": "Brown and Gold Luxury Merry Christmas Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGVKcuhNcQ-brown-and-gold-luxury-merry-christmas-video/",
    "thumb": "https://template.canva.com/EAGVKcuhNcQ/1/0/400w-Oi-nI9zpMdw.jpg"
  },
  {
    "id": "EAG6Q9sqIf8",
    "title": "Red and Gold Festive Christmas Greetings Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG6Q9sqIf8-red-and-gold-festive-christmas-greetings-video/",
    "thumb": "https://template.canva.com/EAG6Q9sqIf8/1/0/400w-K6cZXH7jglo.jpg"
  },
  {
    "id": "EAFpiI2ddvs",
    "title": "Red and Gold Elegant New Year 2024 Greetings Animated Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFpiI2ddvs-red-and-gold-elegant-new-year-2024-greetings-animated-video/",
    "thumb": "https://template.canva.com/EAFpiI2ddvs/1/0/400w-SyPn9i5ZnNg.jpg"
  },
  {
    "id": "EAGYZyu5gag",
    "title": "Red and Gold Modern Merry Christmas Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGYZyu5gag-red-and-gold-modern-merry-christmas-video/",
    "thumb": "https://template.canva.com/EAGYZyu5gag/1/0/400w-Y7eOJomWTkI.jpg"
  },
  {
    "id": "EAFt11zXZ6Y",
    "title": "Red Gold Animated Merry Christmas and Happy New Year Holiday Greeting Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFt11zXZ6Y-red-gold-animated-merry-christmas-and-happy-new-year-holiday-greeting-video/",
    "thumb": "https://template.canva.com/EAFt11zXZ6Y/1/0/400w-2_OaeM7q_Kc.jpg"
  },
  {
    "id": "EAGYnT9L9BU",
    "title": "Red Gold 3D Classy Merry Christmas and Happy New Year Greeting Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGYnT9L9BU-red-gold-3d-classy-merry-christmas-and-happy-new-year-greeting-video/",
    "thumb": "https://template.canva.com/EAGYnT9L9BU/2/0/400w-Ius1iZa9gm0.jpg"
  },
  {
    "id": "EAGVu273zS8",
    "title": "Red and White Modern Elegant Christmas Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGVu273zS8-red-and-white-modern-elegant-christmas-video/",
    "thumb": "https://template.canva.com/EAGVu273zS8/1/0/400w-WTame1vNMIU.jpg"
  },
  {
    "id": "EAG5itocO3Q",
    "title": "Black and green simple merry christmas video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAG5itocO3Q-black-and-green-simple-merry-christmas-video/",
    "thumb": "https://template.canva.com/EAG5itocO3Q/1/0/400w-1239adPmhLM.jpg"
  },
  {
    "id": "EAGyxoKIVDw",
    "title": "Red and Green Illustrated Christmas Greetings Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGyxoKIVDw-red-and-green-illustrated-christmas-greetings-video/",
    "thumb": "https://template.canva.com/EAGyxoKIVDw/1/0/400w-gOb20DhzjJs.jpg"
  },
  {
    "id": "EAFzHx6OKCo",
    "title": "Red and White Sparkling Animated Christmas Greeting Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFzHx6OKCo-red-and-white-sparkling-animated-christmas-greeting-video/",
    "thumb": "https://template.canva.com/EAFzHx6OKCo/1/0/400w-f1vxcYrdE8I.jpg"
  },
  {
    "id": "EAGVu9cUFPc",
    "title": "Blue Merry Christmas Greeting Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGVu9cUFPc-blue-merry-christmas-greeting-video/",
    "thumb": "https://template.canva.com/EAGVu9cUFPc/1/0/400w-yehQ-w14bbc.jpg"
  },
  {
    "id": "EAGYlvHsVCA",
    "title": "White and Green Modern Merry Christmas Greeting Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGYlvHsVCA-white-and-green-modern-merry-christmas-greeting-video/",
    "thumb": "https://template.canva.com/EAGYlvHsVCA/1/0/400w-noYha4DG8tU.jpg"
  },
  {
    "id": "EAHZx3_LK0k",
    "title": "Green Red and Black Elegant Merry Christmas Video",
    "category": "christmas",
    "categoryName": "Christmas",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHZx3_LK0k-green-red-and-black-elegant-merry-christmas-video/",
    "thumb": "https://template.canva.com/EAHZx3_LK0k/1/0/400w-eMvEkJwdNEM.jpg"
  },
  {
    "id": "EAEoq1dO0S0",
    "title": "Blue 10 Seconds Happy New Year Countdown 2022 Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAEoq1dO0S0-blue-10-seconds-happy-new-year-countdown-2022-video/",
    "thumb": "https://template.canva.com/EAEoq1dO0S0/2/0/400w-R8vzCJJ6ivU.jpg"
  },
  {
    "id": "EAGYob10g1A",
    "title": "Red Gold Vibrant Festive Show Merry Christmas Greeting Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGYob10g1A-red-gold-vibrant-festive-show-merry-christmas-greeting-video/",
    "thumb": "https://template.canva.com/EAGYob10g1A/2/0/400w-JapOlnYERAI.jpg"
  },
  {
    "id": "EAFy1WqvSoY",
    "title": "Yellow and Brown Greeting New Year Party Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFy1WqvSoY-yellow-and-brown-greeting-new-year-party-video/",
    "thumb": "https://template.canva.com/EAFy1WqvSoY/3/0/400w-Ed_cKhWLBZo.jpg"
  },
  {
    "id": "EAEoq0iwr1M",
    "title": "Modern Happy New Year 2022 Animated Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAEoq0iwr1M-modern-happy-new-year-2022-animated-video/",
    "thumb": "https://template.canva.com/EAEoq0iwr1M/2/0/400w-P3PdtH4xxTU.jpg"
  },
  {
    "id": "EAEvQ0rfyvI",
    "title": "Green and White Merry Christmas &amp; Happy New Year Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAEvQ0rfyvI-green-and-white-merry-christmas-happy-new-year-video/",
    "thumb": "https://template.canva.com/EAEvQ0rfyvI/2/0/400w-Fulz0IqW49U.jpg"
  },
  {
    "id": "EAFR2kF1Ucc",
    "title": "Black Golden and White 3D Realistic Illustrated 2027 New Year Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFR2kF1Ucc-black-golden-and-white-3d-realistic-illustrated-2027-new-year-video/",
    "thumb": "https://template.canva.com/EAFR2kF1Ucc/6/0/400w-yBxGz9nomKY.jpg"
  },
  {
    "id": "EAFVZRh1Bzc",
    "title": "Brown And White Creative Christmas Wish Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFVZRh1Bzc-brown-and-white-creative-christmas-wish-video/",
    "thumb": "https://template.canva.com/EAFVZRh1Bzc/1/0/400w-qOSkbX3dD6o.jpg"
  },
  {
    "id": "EAF2LzRQjJo",
    "title": "Light Blue Scrapbook Photo Collage Christmas Greeting Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAF2LzRQjJo-light-blue-scrapbook-photo-collage-christmas-greeting-video/",
    "thumb": "https://template.canva.com/EAF2LzRQjJo/1/0/400w-B0uWzbW4Ap0.jpg"
  },
  {
    "id": "EAFRPBbDKuo",
    "title": "Brown Minimalist New Year Sale Ads Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFRPBbDKuo-brown-minimalist-new-year-sale-ads-video/",
    "thumb": "https://template.canva.com/EAFRPBbDKuo/1/0/400w-bXbk5z-vFzw.jpg"
  },
  {
    "id": "EAGx6OMIn1k",
    "title": "White Black Festive Elegant Happy New Year Greeting Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGx6OMIn1k-white-black-festive-elegant-happy-new-year-greeting-video/",
    "thumb": "https://template.canva.com/EAGx6OMIn1k/1/0/400w-Ssut73NJxZw.jpg"
  },
  {
    "id": "EAEzDJSzy0E",
    "title": "Modern Neon Gradient Happy New Year 2022 Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAEzDJSzy0E-modern-neon-gradient-happy-new-year-2022-video/",
    "thumb": "https://template.canva.com/EAEzDJSzy0E/1/0/400w-FcjOfJEOnuk.jpg"
  },
  {
    "id": "EAExLun7bS8",
    "title": "Blue and Pink Creative New Year Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAExLun7bS8-blue-and-pink-creative-new-year-video/",
    "thumb": "https://template.canva.com/EAExLun7bS8/1/0/400w-8tR64CK4dnM.jpg"
  },
  {
    "id": "EAEu1mQHjuA",
    "title": "Red Creative New Year Party Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAEu1mQHjuA-red-creative-new-year-party-video/",
    "thumb": "https://template.canva.com/EAEu1mQHjuA/2/0/400w-P9Ces1GXJIY.jpg"
  },
  {
    "id": "EAEzQStqg0Y",
    "title": "Red Creative Greeting Happy Lunar New Year Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAEzQStqg0Y-red-creative-greeting-happy-lunar-new-year-video/",
    "thumb": "https://template.canva.com/EAEzQStqg0Y/2/0/400w-anDX2urLGxQ.jpg"
  },
  {
    "id": "EAFLdA55_X0",
    "title": "Blue Gold Rotating Balls Merry Christmas Video",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFLdA55_X0-blue-gold-rotating-balls-merry-christmas-video/",
    "thumb": "https://template.canva.com/EAFLdA55_X0/1/0/400w-1e8N8eEWBM8.jpg"
  },
  {
    "id": "EAGbNMMdfqc",
    "title": "Red and Yellow Videobased Playfull New Year Vlog Youtube Intro",
    "category": "new-year",
    "categoryName": "New Year",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAGbNMMdfqc-red-and-yellow-videobased-playfull-new-year-vlog-youtube-intro/",
    "thumb": "https://template.canva.com/EAGbNMMdfqc/1/0/400w-JXNGAAHoHeY.jpg"
  },
  {
    "id": "EAGSsqtE3zw",
    "title": "Blue and Yellow Playful Illustrative Baby Milestone Presentation template, 15 pages",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGSsqtE3zw-blue-and-yellow-playful-illustrative-baby-milestone-presentation/",
    "thumb": "https://template.canva.com/EAGSsqtE3zw/1/0/400w-NhhoQeBEc6k.jpg"
  },
  {
    "id": "EAHNmQ7Plw0",
    "title": "Purple and White Illustrated Product Roadmap Presentation template, 10 pages",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHNmQ7Plw0-purple-and-white-illustrated-product-roadmap-presentation/",
    "thumb": "https://template.canva.com/EAHNmQ7Plw0/1/0/400w-CAgKFyC4Ko4.jpg"
  },
  {
    "id": "EAHRkFjTECw",
    "title": "Navy Blue and White Modern Business Milestone Instagram Post",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHRkFjTECw-navy-blue-and-white-modern-business-milestone-instagram-post/",
    "thumb": "https://template.canva.com/EAHRkFjTECw/1/0/640w-e2naPIlcfTE.jpg"
  },
  {
    "id": "EAHNqLHKZ50",
    "title": "Green Minimalist Baby Milestone Your Story",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHNqLHKZ50-green-minimalist-baby-milestone-your-story/",
    "thumb": "https://template.canva.com/EAHNqLHKZ50/1/0/900w-9MEy1vakiZ8.jpg"
  },
  {
    "id": "EAG5WCIriwc",
    "title": "Orange Modern Milestone Achievement LinkedIn Post",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG5WCIriwc-orange-modern-milestone-achievement-linkedin-post/",
    "thumb": "https://template.canva.com/EAG5WCIriwc/2/0/400w-gNoBFYIpiog.jpg"
  },
  {
    "id": "EAEuc46e08o",
    "title": "Blue and White Playful Milestone LinkedIn Post",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAEuc46e08o-blue-and-white-playful-milestone-linkedin-post/",
    "thumb": "https://template.canva.com/EAEuc46e08o/1/0/400w-kFxHaSTxhd0.jpg"
  },
  {
    "id": "EAHLyoVYG6M",
    "title": "Pink and Blue Modern Milestone Celebration Instagram Post",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHLyoVYG6M-pink-and-blue-modern-milestone-celebration-instagram-post/",
    "thumb": "https://template.canva.com/EAHLyoVYG6M/1/0/640w-k9m7VlHY44w.jpg"
  },
  {
    "id": "EAG1GsuxnD4",
    "title": "Black Vintage Work Milestone Recap Instagram Reel",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG1GsuxnD4-black-vintage-work-milestone-recap-instagram-reel/",
    "thumb": "https://template.canva.com/EAG1GsuxnD4/3/0/900w-K4yVl4ZGJIY.jpg"
  },
  {
    "id": "EAFR8cLCOH0",
    "title": "Black and White Followers Milestone Thank You Instagram Post",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFR8cLCOH0-black-and-white-followers-milestone-thank-you-instagram-post/",
    "thumb": "https://template.canva.com/EAFR8cLCOH0/1/0/640w-vS4kG9s-QjM.jpg"
  },
  {
    "id": "EAHQl_bCu1E",
    "title": "LinkedIn Post for SMEs Achieving a Milestone Corporate Purple",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHQl_bCu1E-linkedin-post-for-smes-achieving-a-milestone-corporate-purple/",
    "thumb": "https://template.canva.com/EAHQl_bCu1E/2/0/400w-clFOnK1wlZk.jpg"
  },
  {
    "id": "EAHR2ip09Jg",
    "title": "Blue and White Modern Company Milestones Brainstorm",
    "category": "milestones",
    "categoryName": "Milestones",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHR2ip09Jg-blue-and-white-modern-company-milestones-brainstorm/",
    "thumb": "https://template.canva.com/EAHR2ip09Jg/1/0/400w-hk5YlvH6S-U.jpg"
  },
  {
    "id": "EAHLVN1QzFc",
    "title": "Cream and Black Minimalist Communication Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHLVN1QzFc-cream-and-black-minimalist-communication-instagram-reel/",
    "thumb": "https://template.canva.com/EAHLVN1QzFc/3/0/900w-c_sOU7of90M.jpg"
  },
  {
    "id": "EAGq0z5K_oU",
    "title": "Life Lately Instagram Reel in Statement Style",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGq0z5K_oU-life-lately-instagram-reel-in-statement-style/",
    "thumb": "https://template.canva.com/EAGq0z5K_oU/17/0/900w-0PZmxnuTJzg.jpg"
  },
  {
    "id": "EAHKp1iaIC0",
    "title": "Green Minimalist Motivational Quotes Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHKp1iaIC0-green-minimalist-motivational-quotes-instagram-reel/",
    "thumb": "https://template.canva.com/EAHKp1iaIC0/1/0/900w-goUtOY3Jq3o.jpg"
  },
  {
    "id": "EAGwBzqbjhs",
    "title": "Travel Day in the Life Instagram Reel in Yellow Film/Analog Style",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGwBzqbjhs-travel-day-in-the-life-instagram-reel-in-yellow-film-analog-style/",
    "thumb": "https://template.canva.com/EAGwBzqbjhs/10/0/900w-qbDMVuJ_BMo.jpg"
  },
  {
    "id": "EAG0o_BsZ6U",
    "title": "Yellow and Black Modern Party Photo Dump Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG0o_BsZ6U-yellow-and-black-modern-party-photo-dump-instagram-reel/",
    "thumb": "https://template.canva.com/EAG0o_BsZ6U/1/0/900w-9uyFjA8ETMI.jpg"
  },
  {
    "id": "EAHNnZR01zs",
    "title": "Orange and White Modern Love Anniversary Date Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHNnZR01zs-orange-and-white-modern-love-anniversary-date-instagram-reel/",
    "thumb": "https://template.canva.com/EAHNnZR01zs/1/0/900w-bGQl3fRvS-U.jpg"
  },
  {
    "id": "EAGtxqhTOFc",
    "title": "Montage Montage Instagram Reel in Black Yellow Statement Style",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGtxqhTOFc-montage-montage-instagram-reel-in-black-yellow-statement-style/",
    "thumb": "https://template.canva.com/EAGtxqhTOFc/4/0/900w-6awPFrqRorw.jpg"
  },
  {
    "id": "EAHK31q8BBg",
    "title": "Black and White Modern Fashion Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHK31q8BBg-black-and-white-modern-fashion-instagram-reel/",
    "thumb": "https://template.canva.com/EAHK31q8BBg/1/0/900w-fUEoMrArsAQ.jpg"
  },
  {
    "id": "EAFOHTrab2s",
    "title": "Brown Yellow Green Happy Birthday Greeting Mobile Video",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFOHTrab2s-brown-yellow-green-happy-birthday-greeting-mobile-video/",
    "thumb": "https://template.canva.com/EAFOHTrab2s/2/0/900w-DfB-eRLEyqY.jpg"
  },
  {
    "id": "EAGJcJxRqsM",
    "title": "Yellow Grey Modern Bold Sportswear Advertisement Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGJcJxRqsM-yellow-grey-modern-bold-sportswear-advertisement-instagram-reel/",
    "thumb": "https://template.canva.com/EAGJcJxRqsM/2/0/900w-gD02s_geOVI.jpg"
  },
  {
    "id": "EAGtxvqpxzk",
    "title": "Montage Photo Dump Instagram Reel in Statement Style",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGtxvqpxzk-montage-photo-dump-instagram-reel-in-statement-style/",
    "thumb": "https://template.canva.com/EAGtxvqpxzk/3/0/900w-XFWptZ9eWb4.jpg"
  },
  {
    "id": "EAHGZidy8is",
    "title": "Golden Orange Minimalist Sunset Mobile Video",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHGZidy8is-golden-orange-minimalist-sunset-mobile-video/",
    "thumb": "https://template.canva.com/EAHGZidy8is/1/0/900w-hCGyjKmfR_8.jpg"
  },
  {
    "id": "EAG1wwUU3G8",
    "title": "Neutral Simple Man Lying Down Mobile Video",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG1wwUU3G8-neutral-simple-man-lying-down-mobile-video/",
    "thumb": "https://template.canva.com/EAG1wwUU3G8/2/0/900w-dDsW0UAyYqg.jpg"
  },
  {
    "id": "EAFkXo13zyQ",
    "title": "Olive Green Floral Wedding Invitation Mobile Video",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFkXo13zyQ-olive-green-floral-wedding-invitation-mobile-video/",
    "thumb": "https://template.canva.com/EAFkXo13zyQ/2/0/900w-e9WNOoVC0m8.jpg"
  },
  {
    "id": "EAGwBwMFj78",
    "title": "Travel Day in the Life Instagram Reel in Yellow Collage Style",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGwBwMFj78-travel-day-in-the-life-instagram-reel-in-yellow-collage-style/",
    "thumb": "https://template.canva.com/EAGwBwMFj78/9/0/900w-NlyB20942k4.jpg"
  },
  {
    "id": "EAHLmTKzn4U",
    "title": "White Modern Motivational Quote Instagram Reel",
    "category": "reels",
    "categoryName": "Reels & Shorts",
    "aspect_ratio": "9:16",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHLmTKzn4U-white-modern-motivational-quote-instagram-reel/",
    "thumb": "https://template.canva.com/EAHLmTKzn4U/1/0/900w-pyqyFMV-4w4.jpg"
  },
  {
    "id": "EAGnBmp5Qig",
    "title": "Blue Orange and Black Dynamic Tunnel Futuristic Intro Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGnBmp5Qig-blue-orange-and-black-dynamic-tunnel-futuristic-intro-video/",
    "thumb": "https://template.canva.com/EAGnBmp5Qig/1/0/400w-RgE8VFkVnCo.jpg"
  },
  {
    "id": "EAG6d4f6H3M",
    "title": "Blue Yellow and Black Simple intro Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAG6d4f6H3M-blue-yellow-and-black-simple-intro-video/",
    "thumb": "https://template.canva.com/EAG6d4f6H3M/1/0/400w-kQHDfTh52X4.jpg"
  },
  {
    "id": "EAFJK2c8tJ4",
    "title": "Pink &amp; Blue Futuristic Gaming Channel Youtube Intro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFJK2c8tJ4-pink-blue-futuristic-gaming-channel-youtube-intro/",
    "thumb": "https://template.canva.com/EAFJK2c8tJ4/1/0/400w-PqbLlyAkHhQ.jpg"
  },
  {
    "id": "EAGrsY1TXL8",
    "title": "Red and White Minimal Simple Vlog Subscribe Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGrsY1TXL8-red-and-white-minimal-simple-vlog-subscribe-video/",
    "thumb": "https://template.canva.com/EAGrsY1TXL8/1/0/400w-tMnKODzqQUY.jpg"
  },
  {
    "id": "EAHNu5VVMn4",
    "title": "Red Black and White Modern My Channel Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHNu5VVMn4-red-black-and-white-modern-my-channel-video/",
    "thumb": "https://template.canva.com/EAHNu5VVMn4/1/0/400w-jEzzQildr6E.jpg"
  },
  {
    "id": "EAFKqympeoY",
    "title": "Colorful Blue and Purple Animated YouTube Outro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFKqympeoY-colorful-blue-and-purple-animated-youtube-outro/",
    "thumb": "https://template.canva.com/EAFKqympeoY/1/0/400w-CXS6-zhQMgg.jpg"
  },
  {
    "id": "EAFm6i1Truo",
    "title": "Pink Retro Subscribe Youtube Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFm6i1Truo-pink-retro-subscribe-youtube-video/",
    "thumb": "https://template.canva.com/EAFm6i1Truo/3/0/400w-xoRNtNhImaU.jpg"
  },
  {
    "id": "EAHMtgONOmc",
    "title": "Black and Blue Modern Welcome Landscape Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHMtgONOmc-black-and-blue-modern-welcome-landscape-video/",
    "thumb": "https://template.canva.com/EAHMtgONOmc/1/0/400w-r_-SqTPbPDU.jpg"
  },
  {
    "id": "EAGWpzeHjR4",
    "title": "Red and Black Simple Modern Subscribe Button Youtube Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGWpzeHjR4-red-and-black-simple-modern-subscribe-button-youtube-video/",
    "thumb": "https://template.canva.com/EAGWpzeHjR4/1/0/400w-pM_K-Yc8L-4.jpg"
  },
  {
    "id": "EAGoD1VQm6c",
    "title": "Pink Watercolor Illustrated Fashion Youtube Channel Intro Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGoD1VQm6c-pink-watercolor-illustrated-fashion-youtube-channel-intro-video/",
    "thumb": "https://template.canva.com/EAGoD1VQm6c/1/0/400w-JTUAEYnhVFk.jpg"
  },
  {
    "id": "EAFKFtt2XhI",
    "title": "Red and Black Futuristic Gaming Channel YouTube Intro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFKFtt2XhI-red-and-black-futuristic-gaming-channel-youtube-intro/",
    "thumb": "https://template.canva.com/EAFKFtt2XhI/1/0/400w-BoJpVCo_DWI.jpg"
  },
  {
    "id": "EAF3_pXHb5A",
    "title": "Black and White Modern Geometric Animation Youtube Channel Intro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAF3_pXHb5A-black-and-white-modern-geometric-animation-youtube-channel-intro/",
    "thumb": "https://template.canva.com/EAF3_pXHb5A/3/0/400w-EPMY6ld5qnA.jpg"
  },
  {
    "id": "EAFgP7NJXBo",
    "title": "Black and White Minimalist Animated Grunge Photography Camera YouTube Intro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFgP7NJXBo-black-and-white-minimalist-animated-grunge-photography-camera-youtube-intro/",
    "thumb": "https://template.canva.com/EAFgP7NJXBo/1/0/400w--sojAHZSkPc.jpg"
  },
  {
    "id": "EAE4aI2_Yjg",
    "title": "Sunset Video Relaxing Destinations Travel Vlog Youtube Intro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE4aI2_Yjg-sunset-video-relaxing-destinations-travel-vlog-youtube-intro/",
    "thumb": "https://template.canva.com/EAE4aI2_Yjg/2/0/400w-PgNP-1CbEZI.jpg"
  },
  {
    "id": "EAFriokdgng",
    "title": "Black and White Retro Countdown Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFriokdgng-black-and-white-retro-countdown-video/",
    "thumb": "https://template.canva.com/EAFriokdgng/1/0/400w-i0T4faidxZI.jpg"
  },
  {
    "id": "EAGtHiXn8cc",
    "title": "Red and White Dynamic Countdown Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGtHiXn8cc-red-and-white-dynamic-countdown-video/",
    "thumb": "https://template.canva.com/EAGtHiXn8cc/1/0/400w-h0UO2wsZHFE.jpg"
  },
  {
    "id": "EAFllcNqVao",
    "title": "White and Pastel Kawaii Cute Typography Plaid Video Centric YouTube Intro",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFllcNqVao-white-and-pastel-kawaii-cute-typography-plaid-video-centric-youtube-intro/",
    "thumb": "https://template.canva.com/EAFllcNqVao/1/0/400w-Wye_Tcp1B1I.jpg"
  },
  {
    "id": "EAGKbD2qga0",
    "title": "White Floral Simple Thanks For Watching Youtube Video",
    "category": "youtube",
    "categoryName": "YouTube Intros",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGKbD2qga0-white-floral-simple-thanks-for-watching-youtube-video/",
    "thumb": "https://template.canva.com/EAGKbD2qga0/1/0/400w-cKuBrfqTd_s.jpg"
  },
  {
    "id": "EAEdeVtVJN8",
    "title": "Green and Beige Toys Playful Illustrative Birth Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAEdeVtVJN8-green-and-beige-toys-playful-illustrative-birth-slideshow-video/",
    "thumb": "https://template.canva.com/EAEdeVtVJN8/3/0/400w-ukJK80z9J1M.jpg"
  },
  {
    "id": "EAE9FgBsSAs",
    "title": "Brown Friendship Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE9FgBsSAs-brown-friendship-video/",
    "thumb": "https://template.canva.com/EAE9FgBsSAs/1/0/400w-avIqzWUqZ7A.jpg"
  },
  {
    "id": "EADxf01hDtQ",
    "title": "Grey Minimalism Real Estate Residential Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADxf01hDtQ-grey-minimalism-real-estate-residential-slideshow-video/",
    "thumb": "https://template.canva.com/EADxf01hDtQ/1/0/400w-fLfh7rxtrZc.jpg"
  },
  {
    "id": "EADpo5k76vo",
    "title": "White and Green Modern Real Estate / Property Listing Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADpo5k76vo-white-and-green-modern-real-estate-property-listing-slideshow-video/",
    "thumb": "https://template.canva.com/EADpo5k76vo/4/0/400w-8OTfgwRvp_Q.jpg"
  },
  {
    "id": "EADpoxO8aog",
    "title": "Beige and White Minimalist Clothing Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADpoxO8aog-beige-and-white-minimalist-clothing-slideshow-video/",
    "thumb": "https://template.canva.com/EADpoxO8aog/4/0/400w-rxF21VpDfzw.jpg"
  },
  {
    "id": "EAFBwRKWGug",
    "title": "Stop Motion Gaming Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFBwRKWGug-stop-motion-gaming-video/",
    "thumb": "https://template.canva.com/EAFBwRKWGug/1/0/400w-O4G_fpQH6Sg.jpg"
  },
  {
    "id": "EAEdeS5Y5xk",
    "title": "Green and Gold Delicate Flowers Watercolor Christening Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAEdeS5Y5xk-green-and-gold-delicate-flowers-watercolor-christening-slideshow-video/",
    "thumb": "https://template.canva.com/EAEdeS5Y5xk/2/0/400w-WtDKCfIgOi0.jpg"
  },
  {
    "id": "EAEdedrQiM0",
    "title": "Green and Peach Delicate Watercolor Flowers Christening Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAEdedrQiM0-green-and-peach-delicate-watercolor-flowers-christening-slideshow-video/",
    "thumb": "https://template.canva.com/EAEdedrQiM0/2/0/400w-HInXkfAnbfo.jpg"
  },
  {
    "id": "EAEOljyiZmA",
    "title": "Black and Yellow Woman Film Frames All About Me Slideshow",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAEOljyiZmA-black-and-yellow-woman-film-frames-all-about-me-slideshow/",
    "thumb": "https://template.canva.com/EAEOljyiZmA/2/0/400w-9YxsYNv3AKg.jpg"
  },
  {
    "id": "EAElh99WBlM",
    "title": "Colorful Quirky Will You Be My Boyfriend Proposal Slideshow Video template, 6 pages",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAElh99WBlM-colorful-quirky-will-you-be-my-boyfriend-proposal-slideshow-video/",
    "thumb": "https://template.canva.com/EAElh99WBlM/2/0/400w-3FF12_JKYyg.jpg"
  },
  {
    "id": "EAE9Fi5kcPc",
    "title": "Brown Minimalist Moodboard Home Decor Inspiration Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE9Fi5kcPc-brown-minimalist-moodboard-home-decor-inspiration-video/",
    "thumb": "https://template.canva.com/EAE9Fi5kcPc/1/0/400w-vdoxW_Pi_Z4.jpg"
  },
  {
    "id": "EADom4zfWgw",
    "title": "Orange and White Cultural Travel Documentary Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EADom4zfWgw-orange-and-white-cultural-travel-documentary-slideshow-video/",
    "thumb": "https://template.canva.com/EADom4zfWgw/3/0/400w-o4kDbdUXRCU.jpg"
  },
  {
    "id": "EAE9FnZKh5o",
    "title": "Cream Polaroid Modern Beauty of Beach Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE9FnZKh5o-cream-polaroid-modern-beauty-of-beach-video/",
    "thumb": "https://template.canva.com/EAE9FnZKh5o/1/0/400w-uJyEbt1Z5n4.jpg"
  },
  {
    "id": "EAEZt6UxAHw",
    "title": "Purple Pink and Turquoise Minimalist Delicate Funeral Slideshow Video template, 5 pages",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAEZt6UxAHw-purple-pink-and-turquoise-minimalist-delicate-funeral-slideshow-video/",
    "thumb": "https://template.canva.com/EAEZt6UxAHw/2/0/400w-tYJxCWEDQk8.jpg"
  },
  {
    "id": "EAE9FvVdx5k",
    "title": "White Aesthetic Collage Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE9FvVdx5k-white-aesthetic-collage-video/",
    "thumb": "https://template.canva.com/EAE9FvVdx5k/1/0/400w-cmZP_4b_UU0.jpg"
  },
  {
    "id": "EAFuPdt4TnA",
    "title": "Yellow and Black Vintage Outdoor Adventure Trip Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFuPdt4TnA-yellow-and-black-vintage-outdoor-adventure-trip-video/",
    "thumb": "https://template.canva.com/EAFuPdt4TnA/1/0/400w-4COqSWnTMqM.jpg"
  },
  {
    "id": "EAElh_4n01c",
    "title": "Colorful Speckles Quirky Be Mine Gender Neutral Proposal Slideshow Video",
    "category": "slideshows",
    "categoryName": "Slideshows",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAElh_4n01c-colorful-speckles-quirky-be-mine-gender-neutral-proposal-slideshow-video/",
    "thumb": "https://template.canva.com/EAElh_4n01c/3/0/400w-fbmp0INyQFA.jpg"
  },
  {
    "id": "EAGSSk1DOVQ",
    "title": "Red White Aesthetic Lipstick Promo Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGSSk1DOVQ-red-white-aesthetic-lipstick-promo-video/",
    "thumb": "https://template.canva.com/EAGSSk1DOVQ/1/0/400w-PvuIj1eTrwE.jpg"
  },
  {
    "id": "EAE7pWP4Oe0",
    "title": "White &amp; Yellow Modern Restaurant Food Menu For Fast Food Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAE7pWP4Oe0-white-yellow-modern-restaurant-food-menu-for-fast-food-video/",
    "thumb": "https://template.canva.com/EAE7pWP4Oe0/2/0/400w-UawGzl3N60w.jpg"
  },
  {
    "id": "EAHG1UVATy4",
    "title": "Brown Modern Bold Cookies Promo Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAHG1UVATy4-brown-modern-bold-cookies-promo-video/",
    "thumb": "https://template.canva.com/EAHG1UVATy4/1/0/400w-s1t8s2orZ5g.jpg"
  },
  {
    "id": "EAFzZxRpBPo",
    "title": "Pink and Black New Single Promo Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFzZxRpBPo-pink-and-black-new-single-promo-video/",
    "thumb": "https://template.canva.com/EAFzZxRpBPo/1/0/400w-TvE81-7bqH4.jpg"
  },
  {
    "id": "EAE8TlIrW20",
    "title": "Pink Neon Restaurant Food Menu For Fast Food Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAE8TlIrW20-pink-neon-restaurant-food-menu-for-fast-food-video/",
    "thumb": "https://template.canva.com/EAE8TlIrW20/2/0/400w-0yPXpa2UAM4.jpg"
  },
  {
    "id": "EAGxFg5A_Pg",
    "title": "Blue and Gold Modern Coming Soon Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGxFg5A_Pg-blue-and-gold-modern-coming-soon-video/",
    "thumb": "https://template.canva.com/EAGxFg5A_Pg/1/0/400w-vti4CpfBzss.jpg"
  },
  {
    "id": "EAHUIb2uOKY",
    "title": "Orange and BlackModern Thank You For Watching Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHUIb2uOKY-orange-and-blackmodern-thank-you-for-watching-video/",
    "thumb": "https://template.canva.com/EAHUIb2uOKY/1/0/400w-tKQsI3PS344.jpg"
  },
  {
    "id": "EAGsCZI0bvs",
    "title": "Red and Yellow Modern Indian Food Menu Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGsCZI0bvs-red-and-yellow-modern-indian-food-menu-video/",
    "thumb": "https://template.canva.com/EAGsCZI0bvs/1/0/400w-ReqwgnFlPSw.jpg"
  },
  {
    "id": "EAFqMueM_pQ",
    "title": "Blue White Modern Bold Digital Marketing Expert Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFqMueM_pQ-blue-white-modern-bold-digital-marketing-expert-video/",
    "thumb": "https://template.canva.com/EAFqMueM_pQ/2/0/400w-5ZlmKj-hhnk.jpg"
  },
  {
    "id": "EAHV_gmWQ1I",
    "title": "Blue and Red Breaking News Intro Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAHV_gmWQ1I-blue-and-red-breaking-news-intro-video/",
    "thumb": "https://template.canva.com/EAHV_gmWQ1I/1/0/400w-K1vOH3iogK0.jpg"
  },
  {
    "id": "EAGSj0bq4HU",
    "title": "Pink Cream Aesthetic Lipstick Promo Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGSj0bq4HU-pink-cream-aesthetic-lipstick-promo-video/",
    "thumb": "https://template.canva.com/EAGSj0bq4HU/1/0/400w-eX-ENY7DX6M.jpg"
  },
  {
    "id": "EAGKsXMJk_w",
    "title": "White Black Minimalist Watch Product Showcase Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGKsXMJk_w-white-black-minimalist-watch-product-showcase-video/",
    "thumb": "https://template.canva.com/EAGKsXMJk_w/1/0/400w-T11elLOElyY.jpg"
  },
  {
    "id": "EAE1qRb58vg",
    "title": "Neon New Articles Fashion Gradient Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE1qRb58vg-neon-new-articles-fashion-gradient-video/",
    "thumb": "https://template.canva.com/EAE1qRb58vg/2/0/400w-QgAkbOL2AD8.jpg"
  },
  {
    "id": "EAD3hwBc2tc",
    "title": "White Croissant Photo Food Retail In-Stream Video Ad",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAD3hwBc2tc-white-croissant-photo-food-retail-in-stream-video-ad/",
    "thumb": "https://template.canva.com/EAD3hwBc2tc/1/0/400w-wWvMWbq1G2o.jpg"
  },
  {
    "id": "EAGebUK8rFo",
    "title": "Black Yellow Fitness Centre Promo Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAGebUK8rFo-black-yellow-fitness-centre-promo-video/",
    "thumb": "https://template.canva.com/EAGebUK8rFo/1/0/400w-CZg4RA8phjY.jpg"
  },
  {
    "id": "EAF3Vv3hJBE",
    "title": "Black Yellow Modern Spicy Food Promo Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAF3Vv3hJBE-black-yellow-modern-spicy-food-promo-video/",
    "thumb": "https://template.canva.com/EAF3Vv3hJBE/2/0/400w-UetFNEM7QKg.jpg"
  },
  {
    "id": "EAE18i_zCVI",
    "title": "Black This Or That Urban Streetwear Fashion Grayscale Video",
    "category": "marketing",
    "categoryName": "Marketing & Promos",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAE18i_zCVI-black-this-or-that-urban-streetwear-fashion-grayscale-video/",
    "thumb": "https://template.canva.com/EAE18i_zCVI/2/0/400w-8na1Qmj9zz8.jpg"
  },
  {
    "id": "EAFT2QgQ_lo",
    "title": "End-of-Life Tribute Video in Beige White Elegant Informational Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2QgQ_lo-end-of-life-tribute-video-in-beige-white-elegant-informational-style/",
    "thumb": "https://template.canva.com/EAFT2QgQ_lo/2/0/400w-DkE6e5A9DZQ.jpg"
  },
  {
    "id": "EAFT2UDO_mE",
    "title": "End-of-Life Tribute Video in Beige Dark Red Elegant Photocentric Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2UDO_mE-end-of-life-tribute-video-in-beige-dark-red-elegant-photocentric-style/",
    "thumb": "https://template.canva.com/EAFT2UDO_mE/1/0/400w-VtlQN0Zq2tc.jpg"
  },
  {
    "id": "EAFT2fczJ1g",
    "title": "End-of-Life Tribute Video in Grey White Natural Photocentric Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2fczJ1g-end-of-life-tribute-video-in-grey-white-natural-photocentric-style/",
    "thumb": "https://template.canva.com/EAFT2fczJ1g/1/0/400w-SNQn1koduvk.jpg"
  },
  {
    "id": "EAFT2uPY6HM",
    "title": "Tribute Video in Grey Purple Watercolor Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2uPY6HM-tribute-video-in-grey-purple-watercolor-style/",
    "thumb": "https://template.canva.com/EAFT2uPY6HM/1/0/400w-OjwrKzXp9e0.jpg"
  },
  {
    "id": "EAFT9t8l6IY",
    "title": "Tribute Video in Black White Film Frames Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT9t8l6IY-tribute-video-in-black-white-film-frames-style/",
    "thumb": "https://template.canva.com/EAFT9t8l6IY/2/0/400w-rrC0u6Wej_0.jpg"
  },
  {
    "id": "EAFZJU0CWK0",
    "title": "End-of-Life Tribute Instagram Post Video in White Beige Elegant Informational Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFZJU0CWK0-end-of-life-tribute-instagram-post-video-in-white-beige-elegant-informational-style/",
    "thumb": "https://template.canva.com/EAFZJU0CWK0/1/0/400w-I37DdHxNib4.jpg"
  },
  {
    "id": "EAFZPpXA4Kw",
    "title": "Tribute Instagram Post Video in Beige Pink Watercolor Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFZPpXA4Kw-tribute-instagram-post-video-in-beige-pink-watercolor-style/",
    "thumb": "https://template.canva.com/EAFZPpXA4Kw/1/0/400w-7SNXh5QrC9I.jpg"
  },
  {
    "id": "EAFZOvFuYvA",
    "title": "End-of-Life Tribute Instagram Post Video in Black Green Natural Photocentric Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFZOvFuYvA-end-of-life-tribute-instagram-post-video-in-black-green-natural-photocentric-style/",
    "thumb": "https://template.canva.com/EAFZOvFuYvA/1/0/400w-UhfloHbfORo.jpg"
  },
  {
    "id": "EAFT2WaNhqA",
    "title": "End-of-Life Tribute Video in Pink Blue White Femme Florals Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2WaNhqA-end-of-life-tribute-video-in-pink-blue-white-femme-florals-style/",
    "thumb": "https://template.canva.com/EAFT2WaNhqA/1/0/400w-hTwp8NBWmL4.jpg"
  },
  {
    "id": "EAFYuuTzdVo",
    "title": "Tribute Video in Green Beige Scrapbook Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "1:1",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFYuuTzdVo-tribute-video-in-green-beige-scrapbook-style/",
    "thumb": "https://template.canva.com/EAFYuuTzdVo/1/0/400w-TEFtheov3bc.jpg"
  },
  {
    "id": "EAFT2iArqwA",
    "title": "Tribute Video in Beige Grey Scrapbook Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2iArqwA-tribute-video-in-beige-grey-scrapbook-style/",
    "thumb": "https://template.canva.com/EAFT2iArqwA/1/0/400w-HrI0jDAXpG0.jpg"
  },
  {
    "id": "EAFT2tdN5eE",
    "title": "Tribute Video in Black Yellow White Film Frames Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFT2tdN5eE-tribute-video-in-black-yellow-white-film-frames-style/",
    "thumb": "https://template.canva.com/EAFT2tdN5eE/2/0/400w-P6bmMvtaMV0.jpg"
  },
  {
    "id": "EAFY0fvz9Vs",
    "title": "End-of-Life Tribute Mobile Video in Grey Orange Elegant Informational Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "PRO",
    "url": "https://www.canva.com/templates/EAFY0fvz9Vs-end-of-life-tribute-mobile-video-in-grey-orange-elegant-informational-style/",
    "thumb": "https://template.canva.com/EAFY0fvz9Vs/1/0/400w-3h02hQocKvc.jpg"
  },
  {
    "id": "EAFT2TGU_qs",
    "title": "End-of-Life Tribute Video in Black and White Natural Photocentric Style",
    "category": "tributes",
    "categoryName": "Tributes",
    "aspect_ratio": "16:9",
    "plan_tier": "FREE",
    "url": "https://www.canva.com/templates/EAFT2TGU_qs-end-of-life-tribute-video-in-black-and-white-natural-photocentric-style/",
    "thumb": "https://template.canva.com/EAFT2TGU_qs/4/0/400w-12KexaKG0gQ.jpg"
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
