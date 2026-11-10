// The whole menu and the shop details, in one place. Every page reads this file.
// Menu copied from adanosburger.co.uk on 6 Nov 2026. Check every price with Tuay before launch.
// Item: [name, description, price, mealPrice or null, photo or null]
// A sixth field `{hidden: true}` keeps an item out of the site until it's confirmed.
window.ADANOS = {
  // Online ordering for collection. Paste the collection-order page link here and every
  // "Order for collection" button on the site uses it. Leave it empty and the buttons say to call instead.
  orderUrl: "",

  // Shows the yellow "stand-in" labels. Set to false before launch.
  previewNotes: true,

  phone: "0161 843 2233",
  tel: "tel:+441618432233",
  email: "info@adanosburger.com",
  address: "153 Oldham Rd, Failsworth, Manchester M35 0BX",
  maps: "https://www.google.com/maps/search/?api=1&query=153+Oldham+Rd+Failsworth+M35+0BX",
  instagram: "https://www.instagram.com/adanosburger/",

  // 0 = Sunday ... 6 = Saturday, [open, close] in 24h
  hours: {0: [11, 23], 1: [11, 22], 2: [11, 22], 3: [11, 22], 4: [11, 22], 5: [11, 22], 6: [11, 23]},

  menu: [
    {cat: "Beef Burgers", note: "Make it a meal: chips & a drink", items: [
      ["Adanos Burger", "2 smashed Angus patties, American cheese, lettuce, onions, gherkins & house sauce", 7.99, 9.99, "adanos-burger"],
      ["Meat Stack", "Angus beef patty, chicken fillet, onion rings, American cheese, salad & house sauce", 9.99, 11.99, "meat-stack"],
      ["Daddy Burger", "Angus beef patty, peri chicken, turkey rasher, American cheese, salad & house sauce", 9.99, 11.99, "daddy-burger"],
      ["Cheese Burger", "Angus beef, cheese, ketchup, mayo", 6.99, 8.99, "cheese-burger"],
      ["Black Angus Special", "2 Black Angus patties, caramelised onions, secret sauce, cheese slice", 9.99, 11.99, "black-angus"]]},
    {cat: "Chicken Burgers", note: "Make it a meal: chips & a drink", items: [
      ["Peri Peri Burger", "Grilled peri peri chicken, cheese, red onions, mayo & lettuce", 6.99, 8.99, "peri-peri"],
      ["Classic Chicken Burger", "Chicken fillet, lettuce, mayo, cheese slice", 6.49, 8.49, null],
      ["Big Yummy Burger", "Crispy fried chicken, cheese, BBQ sauce, hash brown, jalapeños, lettuce, mayo, nachos", 7.49, 9.49, "big-yummy"],
      ["Hot Yummy Burger", "Hot fillet, hot sauce, mayo, hash brown, cheese slice, lettuce, jalapeño", 7.49, 9.49, "hot-yummy"],
      // His current site lists this at £5.00, or £15.00 as a meal. Hidden until Tuay confirms.
      ["Nashville", "Adanos sauce", 5.00, 15.00, null, {hidden: true}]]},
    {cat: "Adanos Grilled", note: "Choose your heat: Lemon & Herb, Mild, Hot or Buffalo BBQ", items: [
      ["Butterfly Chicken", "Marinated butterfly chicken with salad, rice, chips & drink", 8.99, 10.99, null],
      ["Grilled Chicken Leg", "Grilled chicken leg with salad, rice, chips & drink", 6.99, 9.49, null],
      ["Half Chicken", "Half grilled chicken with salad, rice, chips & drink", 9.49, 11.49, "half-chicken"],
      ["Whole Chicken", "Whole grilled chicken with salad, rice, chips & drink", 12.49, 14.99, null],
      ["6pcs Chicken Wings", "Meal served with fries and a drink", 6.49, 8.99, null],
      ["12pcs Chicken Wings", "Meal served with fries and a drink", 8.49, 10.49, null],
      ["4 Lamb Chops", "Meal served with salad, fries and a drink", 11.99, 14.49, "lamb-chops"]]},
    {cat: "Box Meals", items: [
      ["Mini Munch Box", "Beef or chicken burger, 2 onion rings, chilli cheese bites, 2 mild wings, cheesy house fries", 11.99, null, null],
      ["Feast Munch Box", "1 Adanos Burger, 1 chicken burger, 4 chilli cheese bites, 4 onion rings, 4 wings, 2 tender strips, cheesy chips", 27.99, null, null]]},
    {cat: "Loaded Chips", items: [
      ["Chicken Loaded Chips", "3 chicken strips, skin-on fries, nachos, homemade sauce & cheese sauce", 7.99, null, null],
      ["Beef Loaded Chips", "2 beef patties, skin-on fries, nachos, homemade sauce & cheese sauce", 7.99, null, null],
      ["Mixed Loaded Chips", "1 beef, 2 chicken strips, skin-on fries, nachos, homemade sauce & cheese sauce", 8.99, null, null]]},
    {cat: "Light Meals", items: [
      ["Peri Peri Wrap", "Grilled peri peri chicken, peri sauce, cheese, red onions, lettuce, mayo", 6.99, 7.99, null],
      ["Classic Wrap", "Fried chicken fillet, lettuce, cheese, mayo", 6.99, 7.99, null],
      ["Veggie Burger", "Veggie burger, cheese, lettuce, mayo", 6.49, 8.49, null],
      ["Chicken & Rice", "Chicken strips served with rice", 6.99, 9.49, null],
      ["Spicy Turkish Vegan Wrap", "Fine bulgur, tomato paste, parsley, green onion, olive oil, lemon, Turkish spices", 5.99, 7.49, null],
      ["Chicken Salad", "Mixed leaf, olives, feta, onion, tomato, cucumber, peppers, chicken", 6.49, 8.49, null]]},
    {cat: "Sides", items: [
      ["House Fries", "Crispy golden house fries", 2.99, null, null],
      ["Cheesy House Fries", "Topped with melted cheese sauce", 3.99, null, null],
      ["Sweet Potato Fries", "Crispy sweet potato fries", 3.99, null, null],
      ["Curly Fries", "Seasoned curly fries", 3.49, null, null],
      ["Popcorn Chicken", "Crispy bite-sized chicken", 4.49, null, null],
      ["Chilli Cheese Bites", "Spicy cheese bites", 4.49, null, null],
      ["Onion Rings", "Crispy battered onion rings", 3.49, null, null],
      ["Peri Rice", "Peri peri rice", 2.99, null, null],
      ["Coleslaw", "Creamy homemade coleslaw", 1.99, null, null],
      ["Houmous", "Creamy houmous dip", 2.49, null, null],
      ["Portion Salad", "Fresh mixed salad", 2.49, null, null]]},
    {cat: "Kids Meals", note: "All with fries and a drink", items: [
      ["Popcorn Chicken Meal", "Popcorn chicken, fries & drink", 5.99, null, null],
      ["Chicken Fillet Burger Meal", "Kids chicken burger, fries & drink", 5.99, null, null],
      ["Cheese Burger Meal", "Kids cheese burger, fries & drink", 5.99, null, null]]},
    {cat: "Milkshakes", items: [
      ["Ferrero Milkshake", "Ferrero Rocher", 4.99, null, null],
      ["Lotus Milkshake", "Lotus Biscoff", 4.99, null, null],
      ["Oreo & Peanut Butter", "Oreo cookies with peanut butter", 4.99, null, null],
      ["Chocolate Milkshake", "Rich chocolate", 3.99, null, null],
      ["Strawberry Milkshake", "Fresh strawberry", 3.99, null, null],
      ["Banana Milkshake", "Creamy banana", 3.99, null, null]]},
    {cat: "Smoothies", items: [
      ["Blueberry Bliss", "Blueberry smoothie", 4.49, null, null],
      ["Strawberry Refresher", "Strawberry smoothie", 4.49, null, null],
      ["Raspberry Dream", "Raspberry smoothie", 4.49, null, null]]},
    {cat: "Waffles", items: [
      ["Ferrero Rocher Waffle", "Belgian waffle, Ferrero Rocher & Nutella", 6.99, null, null],
      ["Nutella Waffle", "Belgian waffle with Nutella", 5.99, null, null],
      ["Lotus Biscoff Waffle", "Lotus spread and crumbs", 6.49, null, null],
      ["Oreo Crumble Waffle", "Oreo crumble and cream", 6.49, null, null]]},
    {cat: "Ice Cream & Desserts", items: [
      ["Vanilla, Chocolate or Strawberry", "Classic scoops", 2.99, null, null],
      ["Oreo or Lotus Ice Cream", "Cookies & cream or Biscoff", 3.49, null, null],
      ["Cakes", "Freshly baked cakes", 4.99, null, null],
      ["Churros Lazo", "Churros with chocolate dip", 5.49, null, null],
      ["Cookie Dough", "Warm cookie dough with ice cream", 5.99, null, null]]}
  ]
};

// Hidden items drop out here, so no page can show them by accident.
window.ADANOS.menu.forEach(g => { g.items = g.items.filter(i => !(i[5] && i[5].hidden)); });
