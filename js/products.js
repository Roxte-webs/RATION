// YOUR RATION — PRODUCT CATALOGUE
// Generated locally so the store ships with 100+ products without an external database.

const PRODUCT_SEEDS = [
  ["Rice","Premium Basmati Rice","5 kg",399,499,"🍚"],["Rice","Everyday Sona Masoori Rice","5 kg",279,349,"🍚"],["Rice","Steam Rice","5 kg",249,315,"🍚"],["Rice","Kolam Rice","5 kg",329,420,"🍚"],["Rice","Brown Rice","1 kg",119,150,"🌾"],
  ["Atta","Whole Wheat Atta","5 kg",239,295,"🌾"],["Atta","Multigrain Atta","5 kg",299,375,"🌾"],["Atta","Chakki Fresh Atta","10 kg",479,565,"🌾"],["Atta","Besan","1 kg",89,110,"🟡"],["Atta","Maida","1 kg",55,68,"🌾"],
  ["Dal","Toor Dal","1 kg",149,190,"🫘"],["Dal","Moong Dal","1 kg",139,175,"🫘"],["Dal","Masoor Dal","1 kg",109,140,"🫘"],["Dal","Chana Dal","1 kg",89,115,"🫘"],["Dal","Urad Dal","1 kg",129,165,"🫘"],
  ["Oil","Fortified Cooking Oil","1 L",119,145,"🫗"],["Oil","Sunflower Oil","1 L",129,158,"🫗"],["Oil","Mustard Oil","1 L",139,169,"🫗"],["Oil","Groundnut Oil","1 L",159,195,"🫗"],["Oil","Rice Bran Oil","1 L",139,170,"🫗"],
  ["Masala","Turmeric Powder","200 g",42,55,"🟨"],["Masala","Red Chilli Powder","200 g",49,65,"🌶️"],["Masala","Coriander Powder","200 g",45,60,"🌿"],["Masala","Garam Masala","100 g",58,72,"🧂"],["Masala","Cumin Seeds","100 g",39,52,"🌿"],
  ["Sugar & Salt","Fine Sugar","1 kg",49,59,"🍬"],["Sugar & Salt","Iodised Salt","1 kg",25,30,"🧂"],["Sugar & Salt","Rock Salt","1 kg",39,50,"🧂"],["Sugar & Salt","Jaggery","1 kg",79,99,"🟤"],["Sugar & Salt","Brown Sugar","500 g",69,85,"🍬"],
  ["Snacks","Classic Salted Chips","100 g",29,40,"🥔"],["Snacks","Masala Potato Chips","100 g",30,40,"🥔"],["Snacks","Aloo Bhujia","200 g",55,65,"🥨"],["Snacks","Roasted Peanuts","200 g",49,60,"🥜"],["Snacks","Namkeen Mix","200 g",59,72,"🥨"],
  ["Biscuits","Glucose Biscuits","250 g",30,40,"🍪"],["Biscuits","Cream Biscuits","120 g",25,30,"🍪"],["Biscuits","Digestive Biscuits","250 g",75,90,"🍪"],["Biscuits","Jeera Biscuits","200 g",45,55,"🍪"],["Biscuits","Salted Crackers","200 g",49,60,"🍘"],
  ["Breakfast","Corn Flakes","500 g",199,245,"🥣"],["Breakfast","Oats","500 g",149,185,"🥣"],["Breakfast","Poha","500 g",49,65,"🌾"],["Breakfast","Dalia","500 g",55,70,"🌾"],["Breakfast","Vermicelli","500 g",45,55,"🍜"],
  ["Beverages","Tea","250 g",119,150,"🫖"],["Beverages","Instant Coffee","100 g",169,205,"☕"],["Beverages","Lemon Drink","750 ml",45,55,"🥤"],["Beverages","Mango Drink","1 L",79,95,"🧃"],["Beverages","Coconut Water","1 L",99,125,"🥥"],
  ["Dairy","Full Cream Milk","1 L",67,72,"🥛"],["Dairy","Toned Milk","1 L",61,66,"🥛"],["Dairy","Curd","400 g",45,52,"🥣"],["Dairy","Paneer","200 g",79,95,"🧀"],["Dairy","Butter","100 g",59,68,"🧈"],
  ["Personal Care","Bath Soap","4 pcs",119,145,"🧼"],["Personal Care","Shampoo","180 ml",139,175,"🧴"],["Personal Care","Toothpaste","150 g",99,125,"🪥"],["Personal Care","Handwash","250 ml",89,110,"🧴"],["Personal Care","Face Wash","100 ml",129,160,"🧴"],
  ["Home Care","Laundry Detergent","1 kg",119,145,"🧺"],["Home Care","Dishwash Liquid","500 ml",89,110,"🧽"],["Home Care","Floor Cleaner","1 L",119,145,"🧹"],["Home Care","Toilet Cleaner","500 ml",99,125,"🧴"],["Home Care","Garbage Bags","30 pcs",79,99,"🗑️"],
  ["Kitchen","Aluminium Foil","9 m",69,85,"🧻"],["Kitchen","Cling Film","9 m",65,80,"🧻"],["Kitchen","Kitchen Towels","2 rolls",99,125,"🧻"],["Kitchen","Matchbox","10 boxes",25,30,"🔥"],["Kitchen","Paper Plates","25 pcs",59,75,"🍽️"],
  ["Baby Care","Baby Diapers","Small",399,475,"👶"],["Baby Care","Baby Wipes","72 pcs",99,125,"🧻"],["Baby Care","Baby Soap","75 g",49,60,"🧼"],["Baby Care","Baby Powder","100 g",89,110,"🍼"],["Baby Care","Baby Lotion","200 ml",129,155,"🧴"],
  ["Frozen","Frozen Peas","500 g",99,120,"🫛"],["Frozen","French Fries","400 g",119,145,"🍟"],["Frozen","Sweet Corn","500 g",99,125,"🌽"],["Frozen","Mixed Vegetables","500 g",109,135,"🥦"],["Frozen","Veg Nuggets","300 g",129,160,"🥟"],
  ["Pooja","Camphor","50 g",39,50,"🪔"],["Pooja","Incense Sticks","120 sticks",49,65,"🪔"],["Pooja","Cotton Wicks","100 pcs",29,40,"🕯️"],["Pooja","Diya Set","12 pcs",59,75,"🪔"],["Pooja","Sandalwood Powder","50 g",45,60,"🌿"],
  ["Stationery","Notebook","172 pages",55,70,"📓"],["Stationery","Ball Pens","10 pcs",49,60,"🖊️"],["Stationery","Pencils","10 pcs",35,45,"✏️"],["Stationery","Eraser Pack","5 pcs",25,35,"◻️"],["Stationery","A4 Sheets","100 sheets",79,99,"📄"],
  ["Dry Fruits","Almonds","250 g",199,240,"🌰"],["Dry Fruits","Cashews","250 g",229,275,"🥜"],["Dry Fruits","Raisins","250 g",119,145,"🍇"],["Dry Fruits","Walnuts","200 g",249,299,"🌰"],["Dry Fruits","Mixed Dry Fruits","200 g",219,270,"🥜"],
  ["Noodles","Instant Noodles","280 g",45,55,"🍜"],["Noodles","Masala Noodles","560 g",89,110,"🍜"],["Noodles","Hakka Noodles","200 g",49,60,"🍜"],["Noodles","Vermicelli Noodles","200 g",39,50,"🍜"],["Noodles","Pasta","500 g",89,110,"🍝"],
  ["Sauces","Tomato Ketchup","500 g",89,110,"🍅"],["Sauces","Green Chilli Sauce","200 g",49,60,"🌶️"],["Sauces","Soy Sauce","200 ml",59,72,"🥢"],["Sauces","Mayonnaise","250 g",99,125,"🥫"],["Sauces","Mixed Pickle","500 g",99,125,"🥭"]
];

const PRODUCTS = PRODUCT_SEEDS.map((p, i) => ({
  id: "yr-" + String(i + 1).padStart(3,"0"),
  name: p[1],
  brand: i % 4 === 0 ? "Your Ration Select" : "Everyday Choice",
  category: p[0],
  weight: p[2],
  price: p[3],
  mrp: p[4],
  stock: i % 17 === 0 ? 4 : 20 + (i % 35),
  rating: (4 + ((i * 7) % 10) / 10).toFixed(1),
  popularity: 50 + ((i * 31) % 500),
  emoji: p[5],
  badge: i % 9 === 0 ? "Bestseller" : i % 7 === 0 ? "Great deal" : "",
  unitWeightKg: /10 kg/.test(p[2]) ? 10 : /5 kg/.test(p[2]) ? 5 : /1 kg/.test(p[2]) ? 1 : /500 g/.test(p[2]) ? .5 : /250 g/.test(p[2]) ? .25 : /200 g/.test(p[2]) ? .2 : /100 g/.test(p[2]) ? .1 : 0.25
}));

PRODUCTS.forEach(p => p.discount = Math.max(0, Math.round((1 - p.price / p.mrp) * 100)));
const CATEGORIES = ["All", ...Array.from(new Set(PRODUCTS.map(p => p.category)))];
