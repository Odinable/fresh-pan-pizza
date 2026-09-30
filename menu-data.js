/*
  Fresh Pan Pizza - menu data
  ---------------------------
  This is the only file you need to edit to change the menu.
  Prices come from the yellow laminated menu and the dark "Deal 1-12" poster
  (both from the shop's Google Maps photos).

  - A section with `sizes` gives every item in it one price per size, in the same order.
  - An item can have its own `sizes` to override the section's.
  - An item without sizes has a single `price`.
  - `image` is the banner photo for the section (in the img/ folder).
*/

const SHOP = {
  name: "Fresh Pan Pizza",
  whatsapp: "923176702161", // international format, no + or spaces
  phones: ["0317-6702161", "0329-0702161", "0316-4622900"],
  address: "Garden Town, Taunsa Road (Tounsa House Road), near Afaq Karyana Store, Multan",
  mapsUrl: "https://maps.app.goo.gl/PVyUwWDUCH74rA498",
  // Opening hours in Pakistan time, 24h clock. Closing after midnight is fine.
  opens: 14,  // 2 PM
  closes: 2   // 2 AM
};

const MENU = [
  {
    id: "deals",
    title: "Deals",
    image: "img/deals.webp",
    items: [
      { name: "Deal 1", desc: "1 Small Pizza + 1 Drink (345 ml)", price: 399 },
      { name: "Deal 2", desc: "1 Medium Pizza + 1 Drink (345 ml)", price: 599 },
      { name: "Deal 3", desc: "1 Small Pizza + 1 Zinger Burger + 1 Drink (345 ml)", price: 549 },
      { name: "Deal 4", desc: "5 Zinger Burgers + 1 Drink (1.5 litre)", price: 1300 },
      { name: "Deal 5", desc: "1 Large Pizza + 1 Drink (1 litre)", price: 899 },
      { name: "Deal 6", desc: "2 Large Pizzas + 1 Drink (1 litre)", price: 1599 },
      { name: "Deal 7", desc: "1 Large Pizza + 3 Small Pizzas + 1 Drink (1.5 litre)", price: 1399 },
      { name: "Deal 8", desc: "3 Zinger Burgers + 1 Drink (1.5 litre)", price: 900 },
      { name: "Deal 9", desc: "1 Leg Piece + 1 Chest Piece + 3 Naan", price: 650 },
      { name: "Deal 10", desc: "4 Leg Pieces + 5 Naan", price: 1149 },
      { name: "Deal 11", desc: "3 Chest Pieces + 3 Naan", price: 1099 },
      { name: "Deal 12", desc: "5 Wings + 1 Drumstick + French Fries", price: 450 },
      { name: "Family Deal", desc: "1 Large Pizza + 1 Medium Pizza + 1 Patty Burger + 1 Plain Fries + 1 Drink (1.5 litre) + 1 Drink (1 litre)", price: 2299, featured: true }
    ]
  },
  {
    id: "regular-pizza",
    title: "Regular Pizza",
    image: "img/regular-pizza.webp",
    sizes: ["Small", "Medium", "Large"],
    items: [
      { name: "Chicken Tikka", prices: [300, 649, 949] },
      { name: "Chicken Fajita", prices: [300, 649, 949] },
      { name: "Veggie Lover", prices: [300, 649, 949] },
      { name: "Cheese Lover", prices: [300, 649, 949] },
      { name: "Tandoori", prices: [300, 649, 949] },
      { name: "Fajita Sicilian", prices: [300, 649, 949] },
      { name: "European Delight", prices: [300, 649, 949] }
    ]
  },
  {
    id: "special-pizza",
    title: "Special Pizza",
    image: "img/special-pizza.webp",
    sizes: ["Small", "Medium", "Large"],
    items: [
      { name: "Shahi", prices: [400, 699, 999] },
      { name: "Bon Fire", prices: [400, 699, 999] },
      { name: "Behari Kabab", prices: [400, 699, 999] },
      { name: "Double Seekh Kabab", prices: [400, 699, 999] },
      { name: "Peri Peri", prices: [400, 699, 999] },
      { name: "Supreme", prices: [400, 699, 999] },
      { name: "Achari", prices: [400, 699, 999] },
      { name: "Malai Boti", prices: [400, 699, 999] },
      { name: "Mughlai", prices: [400, 699, 999] },
      { name: "Fresh Pan Special", prices: [400, 699, 999] }
    ]
  },
  {
    id: "extreme-crust",
    title: "Extreme Crust",
    image: "img/extreme-crust.webp",
    sizes: ["Medium", "Large"],
    items: [
      { name: "Crown Crust", prices: [799, 1099] },
      { name: "Royal Crust", prices: [799, 1099] },
      { name: "Kabab Crust", prices: [799, 1099] },
      { name: "Cheese Crust", prices: [799, 1099] },
      { name: "Fresh Pan Crust", prices: [899, 1199] }
    ]
  },
  {
    id: "roll-paratha",
    title: "Roll Paratha",
    image: "img/roll-paratha.webp",
    items: [
      { name: "Tikka Paratha", price: 249 },
      { name: "Chicken Fajita Paratha", price: 250 },
      { name: "Tikka Cheese Paratha", price: 299 },
      { name: "Zinger Paratha", price: 299 },
      { name: "Loaded Paratha", price: 330 },
      { name: "Fresh Pan Special Paratha", price: 349 }
    ]
  },
  {
    id: "shawarma",
    title: "Shawarma",
    image: "img/shawarma.webp",
    items: [
      { name: "Tikka Shawarma", price: 199 },
      { name: "Arabic Shawarma", price: 249 },
      { name: "Tikka Cheese Shawarma", price: 299 }
    ]
  },
  {
    id: "burgers",
    title: "Burgers",
    image: "img/burgers.webp",
    items: [
      { name: "Chicken Patty Burger", price: 199 },
      { name: "Zinger Burger", price: 280 },
      { name: "Chicken Grilled Burger", price: 399 },
      { name: "Monster Burger", price: 399 }
    ]
  },
  {
    id: "pasta",
    title: "Pasta",
    image: "img/pasta.webp",
    sizes: ["Half", "Full"],
    items: [
      { name: "Flaming Pasta", prices: [270, 500] },
      { name: "Fresh Pan Special Pasta", prices: [320, 600] },
      { name: "Creamy Pasta", prices: [350, 650] },
      { name: "Crispy Pasta", prices: [390, 700] }
    ]
  },
  {
    id: "fries",
    title: "Fries",
    image: "img/fries.webp",
    items: [
      { name: "Regular Fries", price: 180 },
      { name: "Family Fries", price: 299 },
      { name: "Pizza Fries", price: 349 },
      { name: "Loaded Fries", price: 399 }
    ]
  },
  {
    id: "wings",
    title: "Wings",
    image: "img/wings.webp",
    sizes: ["Half", "Full"],
    items: [
      { name: "Baked Wings", prices: [199, 399] },
      { name: "Grilled Wings", prices: [199, 399] },
      { name: "BBQ Wings", prices: [249, 499] },
      { name: "Creamy Wings", prices: [299, 449] }
    ]
  },
  {
    id: "broast",
    title: "Broast",
    image: "img/broast.webp",
    items: [
      { name: "Leg Broast Piece", price: 280 },
      { name: "Chest Broast Piece", price: 360 }
    ]
  },
  {
    id: "extras",
    title: "Nuggets & Extras",
    image: "img/extras.webp",
    items: [
      { name: "Nuggets", sizes: ["Half", "Full"], prices: [190, 349] },
      { name: "Extra Topping", sizes: ["Small", "Medium", "Large"], prices: [80, 120, 150] }
    ]
  }
];
