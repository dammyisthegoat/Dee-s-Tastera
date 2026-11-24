/* =====================================================================
   D’TASTERA KITCHEN — EDIT YOUR BUSINESS DETAILS AND MENU IN THIS FILE
   ===================================================================== */

/* 1) BUSINESS DETAILS ------------------------------------------------ */
const CONFIG = {
  // WhatsApp orders go to this number: country code + number, digits only.
  whatsapp: "2348109281770",

  // Both numbers appear in the Contact section and footer.
  // display = how it's shown · tel = what the Call button dials
  phones: [
    { display: "+234 810 928 1770", tel: "+2348109281770" },
    { display: "+234 902 240 8618", tel: "+2349022408618" }
  ],

  // Leave these empty ("") until Dee supplies them. Empty = not shown on the site.
  instagram: "",        // e.g. "https://instagram.com/handle"
  instagramLabel: "",   // e.g. "@handle"
  email: "",            // e.g. "hello@example.com"
  location: "",         // e.g. "Area, City"

  currency: "₦",

  // Demo photos for now. Swap in Dee's own: hero background and portrait.
  portrait: "",         // e.g. "images/dee.jpg"
  hero: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=75",

  // Set to false to pause orders. The menu shows "Closed for now".
  acceptingOrders: true,
  closedMessage: "Dee isn’t taking orders right now. Check back soon, or message her on WhatsApp.",

  // Bank details shown when a customer reviews their order.
  // Leave number as "" to hide this box until you have the real details.
  account: { bank: "", number: "", name: "" }
};

/* 2) MENU -----------------------------------------------------------
   One block per dish. Names, prices and descriptions are placeholders
   until Dee confirms them.
   img:   demo photo for now. Replace with a file like "images/jollof.jpg"
   avail: "available" | "limited" | "soldout"  (only limited/soldout show a label) */
const u = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=75`;
const MENU = [
  { id:"jollof", cat:"Rice & Mains", name:"Party Jollof & Grilled Chicken", desc:"Smoky tomato-pepper rice with chicken grilled low and slow.", price:4500, avail:"available", img:u("1565557623262-b51c2513a641") },
  { id:"ofada", cat:"Rice & Mains", name:"Ofada Rice & Ayamase", desc:"Local rice with a rich green-pepper stew and assorted meats.", price:5000, avail:"available", img:u("1546069901-ba9599a7e63c") },
  { id:"friedrice", cat:"Rice & Mains", name:"Fried Rice & Turkey", desc:"Veggie-packed fried rice with well-seasoned turkey.", price:5500, avail:"available", img:u("1512621776951-a57141f2eefd") },
  { id:"egusi", cat:"Soups & Stews", name:"Egusi & Pounded Yam", desc:"Melon-seed soup with spinach and your choice of protein.", price:6000, avail:"available", img:u("1547592180-85f173990554") },
  { id:"efo", cat:"Soups & Stews", name:"Efo Riro", desc:"Rich vegetable stew, slow-cooked with locust beans and meat.", price:5000, avail:"available", img:u("1476224203421-9ac39bcb3327") },
  { id:"suya", cat:"Grills", name:"Beef Suya Skewers", desc:"Thin-sliced beef rubbed with yaji and grilled, with onions.", price:3500, avail:"available", img:u("1555939594-58d7cb561ad1") },
  { id:"fish", cat:"Grills", name:"Grilled Fish & Pepper Sauce", desc:"Whole fish, marinated and grilled, with a fiery side sauce.", price:6500, avail:"available", img:u("1559847844-5315695dadae") },
  { id:"moin", cat:"Sides & Treats", name:"Moin Moin", desc:"Soft, steamed bean pudding with a peppery kick.", price:1500, avail:"available", img:u("1482049016688-2d3e1b311543") },
  { id:"plantain", cat:"Sides & Treats", name:"Fried Plantain (Dodo)", desc:"Ripe plantain fried until caramelised at the edges.", price:1200, avail:"available", img:u("1567620905732-2d1ec7ab7445") }
];

/* 3) WORDING INSIDE THE ORDER FLOW ------------------------------------ */
const TEXT = {
  labels: { limited:"Limited", soldout:"Not available" },
  orderIntro: "Hi Dee! I'd like to place an order:",
  orderOutro: "Please confirm my order, the total, and how I'll get it. Thank you!",
  afterSend: "WhatsApp should now be open with your order already written. Just tap Send and Dee will reply to you there.",
  payNote: "Dee will confirm your total and how to pay in the chat. Nothing is charged until then."
};
