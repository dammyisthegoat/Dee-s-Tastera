/* =====================================================================
   DEE'S TASTERA — EVERYTHING YOU'LL WANT TO EDIT LIVES IN THIS FILE
   ===================================================================== */

/* 1) BUSINESS DETAILS ------------------------------------------------ */
const CONFIG = {
  // Dee's WhatsApp number: country code + number, digits only, no + or spaces.
  // Example: "2348012345678"
  whatsapp: "2348109281770",

  instagram: "https://instagram.com/your_handle",
  instagramLabel: "@your_handle",
  phone: "+234 810 928 1770",
  email: "hello@example.com",
  location: "Your city, Nigeria",
  currency: "₦",

  // Dee's account details, shown to customers when they review/send an order.
  // Replace the placeholders below. Leave number as "" to hide the whole box.
  account: { bank: "Bank name", number: "0123456789", name: "Account name" },

  // Turn ordering on/off from here. Set to false when Dee is fully booked or away.
  acceptingOrders: true,
  closedMessage: "Dee isn't taking orders right now. Check back soon, or message her on WhatsApp.",

  // Dee's portrait (put the file in an /images folder and use "images/dee.jpg")
  portrait: "",

  // Big background photo at the top of the page
  hero: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=75"
};

/* 2) MENU -----------------------------------------------------------
   One block per dish. To add a dish, copy a block and change the id.
   avail: "available" | "limited" | "soldout"
   img:   any image URL, or a local file like "images/jollof.jpg"
   cat:   dishes with the same cat are grouped under one filter button  */
const u = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=75`;
const MENU = [
  { id:"jollof", cat:"Rice & Mains", name:"Party Jollof & Grilled Chicken", desc:"Smoky tomato-pepper rice with chicken grilled low and slow.", price:4500, avail:"available", img:u("1565557623262-b51c2513a641") },
  { id:"ofada", cat:"Rice & Mains", name:"Ofada Rice & Ayamase", desc:"Local rice with a rich green-pepper stew and assorted meats.", price:5000, avail:"limited", img:u("1546069901-ba9599a7e63c") },
  { id:"friedrice", cat:"Rice & Mains", name:"Fried Rice & Turkey", desc:"Veggie-packed fried rice with well-seasoned turkey.", price:5500, avail:"available", img:u("1512621776951-a57141f2eefd") },
  { id:"egusi", cat:"Soups & Stews", name:"Egusi & Pounded Yam", desc:"Melon-seed soup with spinach and your choice of protein.", price:6000, avail:"available", img:u("1547592180-85f173990554") },
  { id:"efo", cat:"Soups & Stews", name:"Efo Riro", desc:"Rich vegetable stew, slow-cooked with locust beans and meat.", price:5000, avail:"available", img:u("1476224203421-9ac39bcb3327") },
  { id:"suya", cat:"Grills", name:"Beef Suya Skewers", desc:"Thin-sliced beef rubbed with yaji and grilled, with onions.", price:3500, avail:"limited", img:u("1555939594-58d7cb561ad1") },
  { id:"fish", cat:"Grills", name:"Grilled Fish & Pepper Sauce", desc:"Whole fish, marinated and grilled, with a fiery side sauce.", price:6500, avail:"available", img:u("1559847844-5315695dadae") },
  { id:"moin", cat:"Sides & Treats", name:"Moin Moin", desc:"Soft, steamed bean pudding with a peppery kick.", price:1500, avail:"available", img:u("1482049016688-2d3e1b311543") },
  { id:"plantain", cat:"Sides & Treats", name:"Fried Plantain (Dodo)", desc:"Ripe plantain fried until caramelised at the edges.", price:1200, avail:"soldout", img:u("1567620905732-2d1ec7ab7445") }
];

/* 3) WORDING THAT APPEARS IN THE APP ---------------------------------- */
const TEXT = {
  availability: { available:"Ready to order", limited:"Few left", soldout:"Not today" },
  orderIntro: "Hi Dee! I'd like to place an order:",
  afterSend: "WhatsApp should now be open with your order already written. Just tap Send and Dee will reply to you there.",
  payNote: "Dee will confirm your total, any delivery fee and how to pay in the chat. Nothing is charged until then.",
  orderOutro: "Please confirm what's available, the total, and when I can expect it. Thank you!"
};
