/**
 * Temporary imagery from Unsplash (free to use under the Unsplash License: https://unsplash.com/license).
 * Each item is a normal MediaAsset, so it can be replaced from Admin → Media Library without touching code.
 * Images were reviewed to avoid visible third-party brand logos.
 */
const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=entropy&w=2000&h=1333&q=80`;

export type SeedMedia = { key: string; photo: string; alt: string; width: number; height: number };

export const MEDIA: SeedMedia[] = [
  { key: "web-ui-screens", photo: "1559028012-481c04fa702d", alt: "Desktop monitor showing website interface designs in progress", width: 2000, height: 1333 },
  { key: "wireframe-sketches", photo: "1581291518857-4e27b48ff24e", alt: "Hand sketching website wireframes on paper", width: 2000, height: 1333 },
  { key: "wireframe-desk", photo: "1432888498266-38ffec3eaf0a", alt: "Wireframe sketches and a phone on a designer's desk", width: 2000, height: 1333 },
  { key: "laptop-code", photo: "1498050108023-c5249f4df085", alt: "Laptop with code editor open on a clean desk", width: 2000, height: 1333 },
  { key: "phone-app", photo: "1586953208448-b95a79798f07", alt: "Smartphone displaying a shopping app interface", width: 2000, height: 1333 },
  { key: "laptop-phone-shop", photo: "1556742049-0cfed4f6a45d", alt: "Customer paying by card at a small shop counter", width: 2000, height: 1333 },
  { key: "ecommerce-laptop", photo: "1563986768609-322da13575f3", alt: "Person browsing an online store on a laptop and phone", width: 2000, height: 1333 },
  { key: "analytics-laptop", photo: "1460925895917-afdab827c52f", alt: "Laptop displaying website analytics charts", width: 2000, height: 1333 },
  { key: "analytics-dark", photo: "1551288049-bebda4e38f71", alt: "Dark dashboard with campaign performance graphs", width: 2000, height: 1333 },
  { key: "marketing-desk", photo: "1533750349088-cd871a92f312", alt: "Marketing strategy notes and books on a wooden desk", width: 2000, height: 1333 },
  { key: "social-letters", photo: "1562577309-4932fdd64cd1", alt: "Colourful letters spelling social media", width: 2000, height: 1333 },
  { key: "brand-swatches", photo: "1561070791-2526d30994b5", alt: "Colour swatches and brand identity samples laid out on a table", width: 2000, height: 1333 },
  { key: "coffee-packaging", photo: "1497935586351-b67a49e012bf", alt: "Coffee brewing tools, ground coffee and a latte styled on a wooden board", width: 2000, height: 1333 },
  { key: "headphones-yellow", photo: "1505740420928-5e560c06d30e", alt: "Black headphones photographed on a bright yellow background", width: 2000, height: 1333 },
  { key: "watches-white", photo: "1523275335684-37898b6baf30", alt: "Two white smartwatches in a clean product shot", width: 2000, height: 1333 },
  { key: "cosmetics-flatlay", photo: "1596462502278-27bfdc403348", alt: "Cosmetics flat lay with brushes and lipsticks on a peach background", width: 2000, height: 1333 },
  { key: "camera-lenses", photo: "1516035069371-29a1b244cc32", alt: "Camera body and lenses on a dark surface", width: 2000, height: 1333 },
  { key: "photographer-mountain", photo: "1492691527719-9d1e07e534b4", alt: "Photographer shooting a misty mountain landscape", width: 2000, height: 1333 },
  { key: "video-timeline", photo: "1574717024653-61fd2cf4d44d", alt: "Video editing timeline on a monitor", width: 2000, height: 1333 },
  { key: "projector", photo: "1478720568477-152d9b164e26", alt: "Film projector casting a beam of light", width: 2000, height: 1333 },
  { key: "food-plates", photo: "1504674900247-0877df9cc836", alt: "Overhead shot of plated dishes for a food campaign", width: 2000, height: 1333 },
  { key: "pancakes", photo: "1567620905732-2d1ec7ab7445", alt: "Stack of pancakes styled for food photography", width: 2000, height: 1333 },
  { key: "salad-bowl", photo: "1540189549336-e6e99c3679fe", alt: "Colourful salad bowl photographed from above", width: 2000, height: 1333 },
  { key: "latte-cups", photo: "1509042239860-f550ce710b93", alt: "Latte art in coffee cups on a café table", width: 2000, height: 1333 },
  { key: "latte-hands", photo: "1495474472287-4d71bcdd2085", alt: "Friends holding cups of coffee with latte art", width: 2000, height: 1333 },
  { key: "restaurant-dining", photo: "1414235077428-338989a2e8c0", alt: "Fine dining table set in a restaurant", width: 2000, height: 1333 },
  { key: "restaurant-interior", photo: "1517248135467-4c7edcad34c4", alt: "Warm restaurant interior with wooden tables", width: 2000, height: 1333 },
  { key: "cafe-interior", photo: "1555396273-367ea4eb4db5", alt: "Busy café interior with tables and pendant lights", width: 2000, height: 1333 },
  { key: "restaurant-terrace", photo: "1559339352-11d035aa65de", alt: "Restaurant terrace overlooking the sea", width: 2000, height: 1333 },
  { key: "hotel-pool", photo: "1566073771259-6a8506099945", alt: "Resort hotel pool with loungers at dusk", width: 2000, height: 1333 },
  { key: "clothing-store", photo: "1441986300917-64674bd600d8", alt: "Independent clothing store interior", width: 2000, height: 1333 },
  { key: "clothing-rack", photo: "1445205170230-053b83016050", alt: "Neutral-toned clothing hanging on a rack", width: 2000, height: 1333 },
  { key: "ai-letters", photo: "1677442136019-21780ecad995", alt: "Abstract 3D illustration of the letters AI", width: 2000, height: 1333 },
  { key: "server-cables", photo: "1558494949-ef010cbdcc31", alt: "Network cables in a server rack", width: 2000, height: 1333 },
  { key: "laptop-purple", photo: "1517336714731-489689fd1ca8", alt: "Laptop keyboard lit with purple light", width: 2000, height: 1333 },
  { key: "team-collab", photo: "1522202176988-66273c2fd55f", alt: "Small team collaborating around laptops", width: 2000, height: 1333 },
  { key: "team-meeting", photo: "1542744173-8e7e53415bb0", alt: "Team meeting around a large table", width: 2000, height: 1333 },
  { key: "team-whiteboard", photo: "1557804506-669a67965ba0", alt: "Team planning a project at a whiteboard in a bright studio", width: 2000, height: 1333 },
  { key: "studio-workspace", photo: "1497366216548-37526070297c", alt: "Modern minimal studio workspace", width: 2000, height: 1333 },
  { key: "desk-setup", photo: "1593642632559-0c6d3fc62b89", alt: "Minimal desk with a computer and camera beside a window", width: 2000, height: 1333 },
];

export const mediaUrl = (photo: string) => u(photo);
