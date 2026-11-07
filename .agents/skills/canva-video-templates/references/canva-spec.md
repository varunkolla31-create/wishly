# Canva Video Templates Catalog & Coding Agent Implementation Spec

Use this specification and template catalog directly as a prompt or context file (`@canva_video_templates_coding_agent_spec.md`) for your coding agent (Cursor, Claude Code, Windsurf, or GitHub Copilot) to build a complete **Multi-Occasion Video Template Gallery, Likes/Shares Ranking Engine, and Canva Autofill/Export Integration** in your application.

## 1. Master Prompt for Your Coding Agent

Copy and paste the command block below into your coding agent CLI or chat window:

```text
Build a full-stack "Occasion Video Templates" module for our application using the catalog, JSON schema, and Canva REST API workflows in @canva_video_templates_coding_agent_spec.md:

1. Database & Seed Catalog:
   - Create a `video_templates` table/collection supporting all occasion categories (Birthdays, Weddings & Save the Date, Anniversaries, Festivals & Holidays, Milestones & Graduation, Social Reels/TikTok/Shorts, Marketing & Promos, Slideshows & Collages, and Intros/Outros).
   - Include fields for: `id`, `title`, `category`, `sub_occasion`, `aspect_ratio` ("16:9" | "9:16" | "1:1"), `plan_tier` ("FREE" | "PRO"), `canva_category_url`, `canva_brand_template_id`, `preview_thumbnail_url`, `autofill_fields` (JSON schema of dynamic text/image/video slots), `likes_count`, `shares_count`, `uses_count`, and `trending_score`.
   - Seed the database with the verified Canva Video Template Categories and sample template records defined in Section 2 and Section 3.

2. Likes, Shares & "Best Templates" Ranking System:
   - Because Canva's public directory does not expose like/share counts via API, implement first-party endpoints (`POST /api/templates/:id/like`, `POST /api/templates/:id/share`, `POST /api/templates/:id/use`) with optimistic UI updates.
   - Compute a popularity ranking score: `trending_score = (likes_count * 2) + (shares_count * 3) + (uses_count * 1)` and expose filter/sort query params (`?category=birthday&aspect_ratio=9:16&plan=FREE&sort=popular`).

3. Three-Mode Template Execution Engine:
   - Mode A (Deep-Link Editor): Open the verified Canva category or template URL directly in a new tab or in-app browser for instant free customization.
   - Mode B (Canva Connect & Autofill REST API): Authenticate via OAuth 2.0 (`https://api.canva.com/rest/v1`), inspect dynamic fields via `GET /brand-templates/{id}/dataset`, upload user photos/clips via `POST /asset-uploads`, populate the video via `POST /autofills`, and export an MP4 (`horizontal_1080p` or `vertical_1080p`) via `POST /exports`.
   - Mode C (In-App Native Canvas Fallback): Render a customizable HTML5 Canvas / Remotion preview overlay using the `autofill_fields` schema (`HEADLINE`, `CELEBRANT_NAME`, `EVENT_DATE`, `BACKGROUND_MEDIA`) when running offline or without Canva Pro/Enterprise API credentials.
```

## 2. Verified Canva Video Template Categories & Directory Links

Every row below links to the official Canva video template gallery or creator endpoint for that occasion and format, along with real sample template preview assets retrieved from [Canva's Template Library](https://www.canva.com/create/).

| Category Group | Occasion / Video Type | Aspect Ratio & Format | Tier Availability | Verified Canva Directory & Maker Link | Sample Template Preview / Reference Asset |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Birthdays** | Birthday Video Templates (General) | 16:9 Landscape (`1920x1080`) | Free & Pro | [Canva Birthday Video Templates](https://www.canva.com/video-editor/templates/birthday/?continuation=350) | [Birthday Video Template Preview (EAEwnlf\_b3g)](https://www.google.com/url?sa=E&source=gmail&q=https://template.canva.com/EAEwnlf_b3g/2/0/400w-N9zy3e0T1fQ.jpg) |
| **Birthdays** | Happy Birthday Video Maker with Songs | 16:9 & 9:16 Multi-Format | Free & Pro | [Canva Happy Birthday Video Maker](https://www.canva.com/create/birthday-videos/) | [Birthday Collection Hub](https://www.canva.com/collection/birthday/) |
| **Birthdays** | Facebook Birthday Video Greetings | 1:1 Square & 16:9 Feed | Free & Pro | [Canva Facebook Birthday Videos](https://www.canva.com/facebook-videos/templates/birthday/) | [Facebook Birthday Preview (EAF9UBQqKoM)](https://www.google.com/url?sa=E&source=gmail&q=https://template.canva.com/EAF9UBQqKoM/1/0/400w-p6aHLvgCoCM.jpg) |
| **Birthdays** | Facebook Birthday Video Wishes (Page 3) | 1:1 Square & 9:16 Feed | Free & Pro | [Canva Facebook Birthday Templates Batch 2](https://www.canva.com/facebook-videos/templates/birthday/?continuation=100) | [Facebook Birthday Preview (EAGiba66x3E)](https://www.google.com/search?q=https://template.canva.com/EAGiba66x3E/1/0/400w-ydABoyWTNhg.jpg) |
| **Birthdays** | Birthday Party & Invitation Collection | 9:16 Mobile & 16:9 Video | Free & Pro | [Canva Birthday Party Collection](https://www.canva.com/collection/birthday-party/) | [Birthday Party Preview (`EAGs3rveK8w`)](https://template.canva.com/EAGs3rveK8w/1/0/1600w-LePNu4M-ubU.jpg) |
| **Birthdays** | Birthday Quotes & Greeting Videos | 9:16 Story & 1:1 Post | Free & Pro | [Canva Birthday Quotes Templates](https://www.canva.com/templates/s/birthday-quotes/) | [Birthday Collection Preview (EAG7FzMEPsA)](https://www.google.com/search?q=https://template.canva.com/EAG7FzMEPsA/1/0/1600w-A2AAHlO7CEM.jpg) |
| **Birthdays** | Happy Birthday Neon & Minimalist Mobile Videos | 9:16 Vertical (`1080x1920`) | Free & Pro | [Canva Happy Birthday Mobile Templates](https://www.canva.com/templates/s/happy/) | [Canva Birthday Video Maker](https://www.canva.com/create/birthday-videos/) |
| **Birthdays** | Best Friend Birthday & Collage Videos | 9:16 & 16:9 Video | Free & Pro | [Canva Best Friend Video Templates](https://www.canva.com/templates/s/best-friend/?continuation=450) | [Canva Video Collages Maker](https://www.canva.com/create/video-collages/) |
| **Weddings & Couples** | Wedding Invitation Video Maker | 9:16 Mobile & 16:9 Landscape | Free & Pro | [Canva Wedding Invitation Video Maker](https://www.canva.com/create/wedding-invitation-videos/) | [Canva Invitation Maker Hub](https://www.canva.com/create/invitation-cards/) |
| **Weddings & Couples** | Indian Wedding Mobile Videos (Sangeet, Haldi, Ceremony) | 9:16 Vertical (`1080x1920`) | Free & Pro | [Canva Indian Wedding Video Templates](https://www.canva.com/templates/s/indian-wedding/?continuation=350) | [Canva Indian Wedding Batch 2](https://www.canva.com/templates/s/indian-wedding/?continuation=500) |
| **Weddings & Couples** | Marriage & Vintage Wedding Videos | 16:9 & 9:16 Video | Free & Pro | [Canva Marriage Video Templates](https://www.canva.com/templates/s/marriage/?continuation=50) | [Canva RSVP Templates](https://www.canva.com/templates/s/rsvp/?continuation=550) |
| **Weddings & Couples** | Save the Date Video Templates | 16:9 Landscape & 9:16 Vertical | Free & Pro | [Canva Save the Date Video Templates](https://www.canva.com/video-editor/templates/save-the-date/?continuation=50) | [Canva Save the Date Video Maker](https://www.canva.com/create/save-the-date-videos/) |
| **Anniversaries & Tributes** | Wedding & Couple Anniversary Videos | 16:9 & 9:16 Slideshow | Free & Pro | [Canva Anniversary Video Maker](https://www.canva.com/create/anniversary-videos/) | [Anniversary & Celebration Preview (`EAFZHp6zG4k`)](https://template.canva.com/EAFZHp6zG4k/1/0/800w-4Vk2EFyO4O8.jpg) |
| **Anniversaries & Tributes** | Celebration & Tribute Videos | 16:9 Landscape (`1920x1080`) | Free & Pro | [Canva Celebration Video Templates](https://www.canva.com/video-editor/templates/celebration/) | [Canva Multi-Occasion Celebration Hub](https://www.canva.com/templates/s/celebration/?continuation=1000) |
| **Festivals & Holidays** | Diwali Greeting & Festival Videos (Holi, Ganesh Chaturthi, Eid) | 16:9 & 9:16 Festive Video | Free & Pro | [Canva Diwali & Indian Festival Video Templates](https://www.canva.in/video-editor/templates/diwali/) | [Diwali Video Preview (`EAFykOWDAak`)](https://template.canva.com/EAFykOWDAak/1/0/800w-cY58TfxHvAw.jpg) |
| **Festivals & Holidays** | Christmas Greeting & Holiday Party Videos | 16:9 Landscape & 9:16 Reels | Free & Pro | [Canva Christmas Video Templates](https://www.canva.com/video-editor/templates/christmas/?continuation=150) | [Canva Christmas Video Templates Page 6](https://www.canva.com/video-editor/templates/christmas/?continuation=250) |
| **Festivals & Holidays** | New Year Countdown & Greeting Videos | 16:9 & 9:16 Video | Free & Pro | [Canva New Year Video Templates](https://www.canva.com/video-editor/templates/new-year/?continuation=550) | [Canva Celebration Templates](https://www.canva.com/video-editor/templates/celebration/) |
| **Milestones & Life Events** | Graduation, Baby Milestones & Follower Milestones | 9:16 Story & 16:9 Video | Free & Pro | [Canva Milestone & Graduation Templates](https://www.canva.com/templates/s/milestone/?continuation=400) | [Canva Photo Booth & Event Strips](https://www.canva.com/templates/s/photo-booth/?continuation=300) |
| **Social Vertical (9:16)** | Mobile Videos (WhatsApp Status, Stories) | 9:16 Vertical (`1080x1920`) | Free & Pro | [Canva Mobile Video Templates](https://www.canva.com/mobile-videos/templates/) | [Mobile Video Preview (`EAHAQLmE9HU`)](https://template.canva.com/EAHAQLmE9HU/1/0/225w-X3rpb9nAwVY.jpg) |
| **Social Vertical (9:16)** | Instagram Reels Video Templates | 9:16 Vertical (`1080x1920`) | Free & Pro | [Canva Instagram Reels Templates](https://www.canva.com/instagram-reels/templates/) | [Reels Video Preview (`EAHAQLmE9HU`)](https://template.canva.com/EAHAQLmE9HU/1/0/900w--HnNaz--DUE.jpg) |
| **Social Vertical (9:16)** | Business & Creator Instagram Reels | 9:16 Vertical (`1080x1920`) | Free & Pro | [Canva Business Instagram Reels](https://www.canva.com/instagram-reels/templates/business/) | [Business Reel Preview (`EAGsKAyCUdk`)](https://template.canva.com/EAGsKAyCUdk/1/0/900w-qq606oLSLSA.jpg) |
| **Social Vertical (9:16)** | TikTok Video Templates | 9:16 Vertical (`1080x1920`) | Free & Pro | [Canva TikTok Video Maker](https://www.canva.com/create/tiktok-videos/) | [Canva Reel Creator](https://www.canva.com/create/reels/) |
| **Social Vertical (9:16)** | YouTube Shorts & Multi-Platform Short Videos | 9:16 Vertical (`1080x1920`) | Free & Pro | [Canva Short Video Maker](https://www.canva.com/create/short-videos/) | [Canva Filter & Vintage Vlog Templates](https://www.canva.com/templates/s/filter/) |
| **Social Feed & YouTube** | Facebook Video Post Templates | 1:1 & 16:9 Social Video | Free & Pro | [Canva Facebook Video Templates](https://www.canva.com/facebook-videos/templates/) | [Facebook Video Preview (`EAGl4oJ96W8`)](https://template.canva.com/EAGl4oJ96W8/1/0/400w-C6TPqmkCRCw.jpg) |
| **Social Feed & YouTube** | YouTube Video Intros | 16:9 Landscape (`1920x1080`) | Free & Pro | [Canva YouTube Intro Maker](https://www.canva.com/create/video-intros/) | [Canva YouTube Thumbnail Maker](https://www.canva.com/create/youtube-thumbnails/) |
| **Social Feed & YouTube** | YouTube Video Outros & End Screens | 16:9 Landscape (`1920x1080`) | Free & Pro | [Canva YouTube Outro Maker](https://www.canva.com/create/video-outros/) | [Canva YouTube Banner Maker](https://www.canva.com/create/youtube-banners/) |
| **Lifestyle & Niche** | Travel Vlog & Destination Videos | 16:9 & 9:16 Video | Free & Pro | [Canva Travel Video Templates](https://www.canva.com/video-editor/templates/travel/?continuation=300) | [Canva Filter & Travel Vlog Templates](https://www.canva.com/templates/s/filter/) |
| **Lifestyle & Niche** | Food, Recipe & Restaurant Promo Videos | 16:9 & 9:16 Video | Free & Pro | [Canva Food Video Templates](https://www.canva.com/video-editor/templates/food/?continuation=550) | [Canva Promo Video Maker](https://www.canva.com/create/promo-videos/) |
| **Business & Marketing** | Financial & Corporate Explainer Videos | 16:9 Landscape (`1920x1080`) | Free & Pro | [Canva Financial Video Templates](https://www.canva.com/video-editor/templates/financial/) | [Canva Marketing Video Maker](https://www.canva.com/create/marketing-videos/) |
| **Business & Marketing** | Product Launch & E-Commerce Videos | 16:9, 1:1 & 9:16 Video | Free & Pro | [Canva Product Video Maker](https://www.canva.com/create/product-videos/) | [Canva Promo Video Maker](https://www.canva.com/create/promo-videos/) |
| **Montages & Audio** | Video Compilations & Highlight Reels | 16:9 & 9:16 Video | Free & Pro | [Canva Video Compilation Maker](https://www.canva.com/create/video-compilations/) | [Canva Movie Maker](https://www.canva.com/create/movie-maker/) |
| **Montages & Audio** | Photo Slideshow & Memory Montage Videos | 16:9 & 9:16 Video | Free & Pro | [Canva Slideshow Video Maker](https://www.canva.com/create/slideshows/) | [Canva Photo Video Maker](https://www.canva.com/create/photo-videos/) |
| **Montages & Audio** | Animated Video Collages & Music Videos | 16:9 & 9:16 Video | Free & Pro | [Canva Video Collage Maker](https://www.canva.com/create/video-collages/) | [Canva Music Video Maker](https://www.canva.com/create/music-videos/) |

## 3. Seed JSON Catalog for Your App (`templates_seed.json`)

Provide this JSON array to your coding agent to seed your app's initial template database with verified URLs, preview images, aspect ratios, and dynamic `autofill_fields` definitions matching the [Canva Autofill API Dataset Schema](https://www.canva.dev/docs/apps/rest-apis/autofill-guide/):

```json
[
  {
    "id": "tpl_bday_landscape_01",
    "title": "Festive Animated Birthday Greeting Video",
    "category": "Birthdays",
    "sub_occasion": "Birthday Greeting",
    "aspect_ratio": "16:9",
    "resolution": "horizontal_1080p",
    "plan_tier": "FREE",
    "canva_category_url": "https://www.canva.com/video-editor/templates/birthday/?continuation=350",
    "canva_maker_url": "https://www.canva.com/create/birthday-videos/",
    "preview_thumbnail_url": "https://template.canva.com/EAEwnlf_b3g/2/0/400w-N9zy3e0T1fQ.jpg",
    "brand_template_id": "REPLACE_WITH_YOUR_BRAND_TEMPLATE_ID",
    "autofill_fields": {
      "CELEBRANT_NAME": { "type": "text", "default": "Alex" },
      "BIRTHDAY_MESSAGE": { "type": "text", "default": "Wishing you the happiest birthday!" },
      "HERO_PHOTO": { "type": "image", "required": true }
    },
    "metrics": { "likes_count": 0, "shares_count": 0, "uses_count": 0 }
  },
  {
    "id": "tpl_bday_fb_square_02",
    "title": "Custom Facebook Birthday Video Card",
    "category": "Birthdays",
    "sub_occasion": "Social Birthday Wish",
    "aspect_ratio": "1:1",
    "resolution": "horizontal_1080p",
    "plan_tier": "FREE",
    "canva_category_url": "https://www.canva.com/facebook-videos/templates/birthday/",
    "canva_maker_url": "https://www.canva.com/facebook-videos/templates/birthday/?continuation=100",
    "preview_thumbnail_url": "https://template.canva.com/EAF9UBQqKoM/1/0/400w-p6aHLvgCoCM.jpg",
    "brand_template_id": "REPLACE_WITH_YOUR_BRAND_TEMPLATE_ID",
    "autofill_fields": {
      "CELEBRANT_NAME": { "type": "text", "default": "Sam" },
      "AGE_MILESTONE": { "type": "text", "default": "Happy 25th!" },
      "MEMORY_CLIP": { "type": "image", "required": true }
    },
    "metrics": { "likes_count": 0, "shares_count": 0, "uses_count": 0 }
  },
  {
    "id": "tpl_anniversary_couple_03",
    "title": "Purple & White Romantic Couple Wedding Anniversary Video",
    "category": "Anniversaries & Tributes",
    "sub_occasion": "Wedding Anniversary",
    "aspect_ratio": "16:9",
    "resolution": "horizontal_1080p",
    "plan_tier": "FREE",
    "canva_category_url": "https://www.canva.com/video-editor/templates/celebration/",
    "canva_maker_url": "https://www.canva.com/create/anniversary-videos/",
    "preview_thumbnail_url": "https://template.canva.com/EAFZHp6zG4k/1/0/800w-4Vk2EFyO4O8.jpg",
    "brand_template_id": "REPLACE_WITH_YOUR_BRAND_TEMPLATE_ID",
    "autofill_fields": {
      "COUPLE_NAMES": { "type": "text", "default": "Priya & Rahul" },
      "ANNIVERSARY_YEAR": { "type": "text", "default": "Happy 5th Anniversary" },
      "COUPLE_PHOTO": { "type": "image", "required": true }
    },
    "metrics": { "likes_count": 0, "shares_count": 0, "uses_count": 0 }
  },
  {
    "id": "tpl_diwali_festival_04",
    "title": "Happy Diwali Animated Festival Greeting Video",
    "category": "Festivals & Holidays",
    "sub_occasion": "Diwali / Indian Festivals",
    "aspect_ratio": "16:9",
    "resolution": "horizontal_1080p",
    "plan_tier": "FREE",
    "canva_category_url": "https://www.canva.in/video-editor/templates/diwali/",
    "canva_maker_url": "https://www.canva.com/video-editor/templates/celebration/",
    "preview_thumbnail_url": "https://template.canva.com/EAFykOWDAak/1/0/800w-cY58TfxHvAw.jpg",
    "brand_template_id": "REPLACE_WITH_YOUR_BRAND_TEMPLATE_ID",
    "autofill_fields": {
      "SENDER_NAME": { "type": "text", "default": "From the Sharma Family" },
      "FESTIVAL_GREETING": { "type": "text", "default": "Wishing you joy, prosperity, and light this Diwali!" },
      "FAMILY_PHOTO": { "type": "image", "required": false }
    },
    "metrics": { "likes_count": 0, "shares_count": 0, "uses_count": 0 }
  },
  {
    "id": "tpl_wedding_mobile_05",
    "title": "Indian Wedding & Save the Date Mobile Video Invitation",
    "category": "Weddings & Couples",
    "sub_occasion": "Wedding Invitation (Sangeet / Haldi / Ceremony)",
    "aspect_ratio": "9:16",
    "resolution": "vertical_1080p",
    "plan_tier": "FREE",
    "canva_category_url": "https://www.canva.com/templates/s/indian-wedding/?continuation=350",
    "canva_maker_url": "https://www.canva.com/create/wedding-invitation-videos/",
    "preview_thumbnail_url": "https://template.canva.com/EAHAQLmE9HU/1/0/900w--HnNaz--DUE.jpg",
    "brand_template_id": "REPLACE_WITH_YOUR_BRAND_TEMPLATE_ID",
    "autofill_fields": {
      "BRIDE_AND_GROOM": { "type": "text", "default": "Ananya & Vikram" },
      "WEDDING_DATE": { "type": "text", "default": "December 18, 2026" },
      "VENUE_LOCATION": { "type": "text", "default": "Grand Palace Lawn, Chennai" },
      "COUPLE_PORTRAIT": { "type": "image", "required": true }
    },
    "metrics": { "likes_count": 0, "shares_count": 0, "uses_count": 0 }
  },
  {
    "id": "tpl_reels_vertical_06",
    "title": "Aesthetic Vertical Reel & TikTok Occasion Montage",
    "category": "Social Vertical (9:16)",
    "sub_occasion": "Instagram Reels / TikTok / Shorts",
    "aspect_ratio": "9:16",
    "resolution": "vertical_1080p",
    "plan_tier": "FREE",
    "canva_category_url": "https://www.canva.com/instagram-reels/templates/",
    "canva_maker_url": "https://www.canva.com/mobile-videos/templates/",
    "preview_thumbnail_url": "https://template.canva.com/EAGsKAyCUdk/1/0/900w-qq606oLSLSA.jpg",
    "brand_template_id": "REPLACE_WITH_YOUR_BRAND_TEMPLATE_ID",
    "autofill_fields": {
      "HOOK_TITLE": { "type": "text", "default": "Best Moments of 2026" },
      "SUBTITLE_CAPTION": { "type": "text", "default": "Tap to watch the full highlight!" },
      "BACKGROUND_CLIP": { "type": "image", "required": true }
    },
    "metrics": { "likes_count": 0, "shares_count": 0, "uses_count": 0 }
  }
]
```

## 4. Backend Service Implementation for Your Coding Agent (`canvaVideoService.ts`)

Your coding agent can drop this TypeScript/Node.js service directly into your backend to handle [Canva Asset Uploads (`POST /v1/asset-uploads`)](https://www.canva.dev/docs/apps/rest-apis/autofill-guide/), [Brand Template Dataset Inspection (`GET /v1/brand-templates/{id}/dataset`)](https://www.canva.dev/docs/apps/rest-apis/reference/brand-templates/get-brand-template-dataset/), [Design Autofill Jobs (`POST /v1/autofills`)](https://www.canva.dev/docs/apps/rest-apis/reference/autofills/create-design-autofill-job/), and [MP4 Video Exports (`POST /v1/exports`)](https://www.canva.dev/docs/apps/rest-apis/reference/exports/create-design-export-job/):

```typescript
// canvaVideoService.ts
// Official Canva REST API Base URL: https://api.canva.com/rest/v1
// Required OAuth Scopes:
// - design:content:read, design:content:write, design:meta:read
// - brandtemplate:meta:read, brandtemplate:content:read
// - asset:read, asset:write

const CANVA_API_BASE = "https://api.canva.com/rest/v1";

export type CanvaVideoQuality =
  | "horizontal_480p"
  | "horizontal_720p"
  | "horizontal_1080p"
  | "horizontal_4k"
  | "vertical_480p"
  | "vertical_720p"
  | "vertical_1080p"
  | "vertical_4k";

export interface AutofillFieldMap {
  [fieldName: string]:
    | { type: "text"; text: string }
    | { type: "image"; asset_id: string };
}

export class CanvaVideoService {
  constructor(private readonly accessToken: string) {}

  private get headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Step 1: Inspect the Brand Template's autofillable data fields
   * Docs: https://www.canva.dev/docs/apps/rest-apis/reference/brand-templates/get-brand-template-dataset/
   */
  async getBrandTemplateDataset(brandTemplateId: string) {
    const res = await fetch(
      `${CANVA_API_BASE}/brand-templates/${brandTemplateId}/dataset`,
      { method: "GET", headers: this.headers }
    );
    if (!res.ok) throw new Error(`Dataset lookup failed: ${ await res.text() }`);
    return res.json();
  }

  /**
   * Step 2: Upload a user photo/media binary for use in an Autofill field
   * Docs: https://www.canva.dev/docs/apps/rest-apis/autofill-guide/
   */
  async uploadMediaAsset(fileBuffer: Buffer, fileName: string): Promise<string> {
    const nameBase64 = Buffer.from(fileName, "utf8").toString("base64");
    const uploadRes = await fetch(`${CANVA_API_BASE}/asset-uploads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/octet-stream",
        "Asset-Upload-Metadata": JSON.stringify({ name_base64: nameBase64 }),
      },
      body: fileBuffer,
    });
    if (!uploadRes.ok) {
      throw new Error(`Asset upload failed: ${ await uploadRes.text() }`);
    }
    const { job } = await uploadRes.json();
    return this.pollJob(
      `${CANVA_API_BASE}/asset-uploads/${job.id}`,
      (data) => data.job.asset?.id
    );
  }

  /**
   * Step 3: Trigger an asynchronous Autofill job from a Brand Template
   * Docs: https://www.canva.dev/docs/apps/rest-apis/reference/autofills/create-design-autofill-job/
   */
  async createAutofillVideoDesign(
    brandTemplateId: string,
    data: AutofillFieldMap
  ): Promise<{ designId: string; editUrl: string; thumbnailUrl?: string }> {
    const res = await fetch(`${CANVA_API_BASE}/autofills`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        brand_template_id: brandTemplateId,
        data,
      }),
    });
    if (!res.ok) throw new Error(`Autofill creation failed: ${ await res.text() }`);
    const { job } = await res.json();

    return this.pollJob(`${CANVA_API_BASE}/autofills/${job.id}`, (payload) => {
      const design = payload.job.result?.design;
      // Extract design ID from https://www.canva.com/design/{DESIGN-ID}/edit
      const match = design?.url?.match(/\/design\/([^/]+)\//);
      return {
        designId: match ? match[1] : design?.id,
        editUrl: design?.url,
        thumbnailUrl: design?.thumbnail?.url,
      };
    });
  }

  /**
   * Step 4: Export the generated Canva Design to an MP4 Video URL
   * Docs: https://www.canva.dev/docs/apps/rest-apis/reference/exports/create-design-export-job/
   */
  async exportDesignToMp4(
    designId: string,
    quality: CanvaVideoQuality = "vertical_1080p",
    pages?: number[]
  ): Promise<string[]> {
    const res = await fetch(`${CANVA_API_BASE}/exports`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        design_id: designId,
        format: {
          type: "mp4",
          quality,
          export_quality: "regular",
          ...(pages ? { pages } : {}),
        },
      }),
    });
    if (!res.ok) throw new Error(`MP4 export failed: ${ await res.text() }`);
    const { job } = await res.json();

    return this.pollJob(
      `${CANVA_API_BASE}/exports/${job.id}`,
      (payload) => payload.job.urls
    );
  }

  private async pollJob<T>(
    url: string,
    extractor: (payload: any) => T,
    intervalMs = 2000,
    maxAttempts = 30
  ): Promise<T> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = await fetch(url, { method: "GET", headers: this.headers });
      if (!res.ok) throw new Error(`Job poll error: ${ await res.text() }`);
      const payload = await res.json();
      if (payload.job.status === "success") {
        return extractor(payload);
      }
      if (payload.job.status === "failed") {
        throw new Error(
          `Canva async job failed: ${JSON.stringify(payload.job.error)}`
        );
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error(`Canva job timed out after ${maxAttempts} attempts`);
  }
}
```

## 5. Compliance & Setup Checklist for Your App

* **Setting Up Autofill Data Fields in Canva:** Open any video template above in the Canva Editor, go to **Apps → Bulk Create → Labels** per the [Canva Autofill Setup Guide](https://www.canva.com/help/autofill/), bind text/photo/video placeholders to field names (such as `CELEBRANT_NAME`, `EVENT_DATE`, `HERO_PHOTO`), and publish it as a Brand Template in your [Canva Pro, Teams, or Enterprise account](https://www.canva.dev/docs/apps/rest-apis/autofill-guide/).
* **Rate Limits & Security:** Proxy all calls to `https://api.canva.com/rest/v1` through your backend server so your OAuth Client Secret is never exposed in client code, and respect the [Canva Export API rate limit](https://www.canva.dev/docs/apps/rest-apis/reference/exports/create-design-export-job/) of 20 requests/minute per user (up to 75 exports per 5-minute window).
* **Content Licensing:** Ensure your app either redirects users to customize templates on Canva via share links or exports finished end-user videos via the [Canva Connect REST API](https://www.canva.dev/docs/apps/rest-apis/reference/autofills/) in compliance with [Canva's Content License Agreement](https://www.canva.com/policies/content-license-agreement/) and [Canva's Licensing Guidelines](https://www.canva.com/licensing-explained/).
