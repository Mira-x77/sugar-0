export const products = [
  {
    id: 'jar',
    index: '01',
    short: 'The Powder',
    name: 'Stevia Powder',
    kicker: 'The everyday essential',
    size: '100 g',
    price: 499,
    image: '/assets/jar.webp',
    alt: 'Sugar-0% stevia powder jar with a copper lid',
    tags: ['100 g', '100 servings'],
    badge: 'Bestseller',
    desc: 'The jar that lives on the counter. A 100% natural, plant-based sweetener with zero calories and a clean, sugar-like finish. One scoop replaces one teaspoon of sugar — in chai, coffee, smoothies, bakes and everything in between.',
    usage: 'One scoop equals one teaspoon of sugar. Stir into hot or cold drinks, sprinkle over yogurt or fruit, or use it spoon-for-spoon in recipes. Adjust to taste.',
    ingredients: 'Allulose, high-purity steviol glycosides, dietary fibre.'
  },
  {
    id: 'sachet',
    index: '02',
    short: 'The Sachets',
    name: 'Stevia Sachets',
    kicker: 'Sweetness, on the go',
    size: 'Box of 30',
    price: 349,
    image: '/assets/sachets.webp',
    alt: 'A box of Sugar-0% stevia sachets on a marble table',
    tags: ['30 sachets', 'travel-ready'],
    badge: 'For your bag',
    desc: 'Single-serve sachets for desks, handbags, hotel rooms and café tables. Tear, pour, stir — the same clean sweetness as the jar, already measured for one cup.',
    usage: 'Tear one sachet into a cup of tea or coffee. Each sachet delivers the sweetness of roughly one teaspoon of sugar. No measuring, no carrying a jar.',
    ingredients: 'Allulose, high-purity steviol glycosides, dietary fibre.'
  },
  {
    id: 'drops',
    index: '03',
    short: 'The Drops',
    name: 'Stevia Drops',
    kicker: 'Precision in every drop',
    size: '30 ml',
    price: 599,
    image: '/assets/drops.webp',
    alt: 'Sugar-0% stevia drops bottle with a gold dropper cap',
    tags: ['30 ml', 'dropper included'],
    badge: 'For the table',
    desc: 'A compact glass bottle with a precision dropper. Add a few drops to tea, coffee, cold drinks, cocktails or dressings and taste as you go — sweetness exactly where you want it.',
    usage: 'Add a few drops to your cup and stir. Start small and build to your taste. The dropper makes it easy to sweeten by the glass, not by the spoonful.',
    ingredients: 'Purified water, high-purity steviol glycosides, natural flavour.'
  }
];

export const featureGroups = [
  {
    id: 'origin',
    label: 'Origin & Quality',
    items: [
      { icon: 'leaf', label: 'Natural plant extract', note: 'From the stevia leaf' },
      { icon: 'gut', label: 'Prebiotic', note: 'Feeds good bacteria' },
      { icon: 'vegan', label: 'Vegan', note: 'Nothing from animals' },
      { icon: 'globe', label: 'Eco-friendly production', note: 'Kinder to the planet' },
      { icon: 'plant', label: 'Plant-based', note: 'Rooted in nature' },
      { icon: 'heat', label: 'Heat stable', note: 'Holds up in cooking' },
      { icon: 'shelf', label: 'Long shelf life', note: 'Stays fresh for 24 months' }
    ]
  },
  {
    id: 'nutrition',
    label: 'Nutrition & Diet',
    items: [
      { icon: 'zero', label: 'Zero calories', note: 'No energy, all sweetness' },
      { icon: 'gi', label: 'Zero glycemic index', note: 'No blood-sugar spike' },
      { icon: 'keto', label: 'Keto-friendly', note: 'Fits low-carb days' },
      { icon: 'diabetic', label: 'Diabetic-friendly', note: 'Made for mindful diets' },
      { icon: 'spike', label: 'Low sugar spike', note: 'Steady, not spiky' },
      { icon: 'carb', label: 'Carb-free', note: 'Nothing to count' },
      { icon: 'fat', label: 'Fat-free', note: 'Clean by design' },
      { icon: 'heart', label: 'Cholesterol-free', note: 'Heart-kind' },
      { icon: 'gluten', label: 'Gluten-free', note: 'Free from wheat' }
    ]
  },
  {
    id: 'taste',
    label: 'Taste & Flavor',
    items: [
      { icon: 'smile', label: 'No bitter taste', note: 'Clean, smooth finish' },
      { icon: 'flask', label: 'No artificial sweetener', note: 'Nothing synthetic' },
      { icon: 'taste', label: 'Natural taste', note: 'Closer to sugar' }
    ]
  },
  {
    id: 'convenience',
    label: 'Convenience & Usage',
    items: [
      { icon: 'shield', label: 'No preservatives', note: 'Just three ingredients' },
      { icon: 'soluble', label: 'Highly soluble', note: 'Dissolves clear' },
      { icon: 'multi', label: 'Multi-purpose', note: 'Drinks, bakes, everything' },
      { icon: 'label', label: 'Clean label ingredients', note: 'Easy to read' },
      { icon: 'nongmo', label: 'Non-GMO', note: 'No genetic modification' },
      { icon: 'portion', label: 'Easy portion control', note: 'One scoop, done' },
      { icon: 'cup', label: 'Perfect for beverages & cooking', note: 'Hot or cold' },
      { icon: 'travel', label: 'Pocket-friendly sachets', note: 'Sweetness on the go' }
    ]
  }
];

export const reviews = [
  {
    quote: 'I stopped noticing I had switched. My chai tastes like chai — not like a compromise. That is the whole review.',
    name: 'Riya M.',
    detail: 'Chai, twice a day',
    location: 'Ahmedabad',
    rating: 5
  },
  {
    quote: 'As a pastry chef I was sceptical. The crumb is identical, the caramel catches the same way, and the sugar crash simply does not arrive.',
    name: 'Chef Aarav D.',
    detail: 'Pastry chef',
    location: 'Mumbai',
    rating: 5
  },
  {
    quote: 'The sachets live in my bag. One at my desk, one in my car, one in my travel kit. Zero excuses, zero aftertaste.',
    name: 'Nisha P.',
    detail: 'Consultant, always travelling',
    location: 'Bengaluru',
    rating: 5
  },
  {
    quote: 'My father is diabetic and very fussy about his coffee. He asked for a second cup. I did not tell him what was in it until later.',
    name: 'Karan S.',
    detail: 'Weekend barista for family',
    location: 'Mehsana',
    rating: 5
  }
];

export const faqs = [
  {
    q: 'What is Sugar-0% actually made of?',
    a: 'A short, plant-based blend: allulose, high-purity steviol glycosides from the stevia leaf, and dietary fibre. No artificial sweeteners, no preservatives and no sugar.'
  },
  {
    q: 'How much do I use?',
    a: 'One scoop equals one teaspoon of sugar. Start with one scoop per cup and adjust to taste. Sachets are pre-measured for a single cup; with the drops, begin with a few drops and build up.'
  },
  {
    q: 'Does it have a bitter aftertaste?',
    a: 'That was the whole point. Sugar-0% is formulated for a clean, smooth sweetness that finishes like sugar — without the lingering bitterness people often associate with stevia.'
  },
  {
    q: 'Is it suitable for diabetics and keto diets?',
    a: 'Sugar-0% has zero added sugar, zero calories and a zero glycemic index, which makes it a thoughtful choice for low-sugar, diabetic-friendly and keto-friendly lifestyles. It is a food product, not medicine — please check with your doctor about your individual diet.'
  },
  {
    q: 'Will it dissolve in cold drinks?',
    a: 'Yes. It is highly soluble in hot and cold liquids. For cold drinks, stir for a few seconds and give it a moment to open up. It also holds up well in baking and cooking.'
  },
  {
    q: 'How should I store it?',
    a: 'Keep it in a cool, dry, hygienic place. Do not refrigerate. The jar is best before 24 months from the date of manufacture; the sachets are individually sealed for freshness.'
  },
  {
    q: 'Where do you deliver?',
    a: 'We currently ship across India. For international orders, bulk supply or café partnerships, write to naturalsweetsolutions@gmail.com and our team will confirm the details with you.'
  }
];

export const tickerItems = [
  '100% natural',
  'Zero calories',
  'Gluten free',
  'Non-GMO',
  'Vegan',
  'Keto friendly',
  'Zero glycemic index',
  'No preservatives'
];
