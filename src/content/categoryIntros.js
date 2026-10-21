/** Unique ~150–250 word intros for category SEO (fallback when DB description is short). */

const TEMPLATES = {
  default: (name) =>
    `Shop ${name} at IBelieveThis, a US motorcycle lifestyle store for riders who want gear that looks sharp and holds up on the road. This ${name} collection brings together pieces chosen for everyday riding culture — whether you are building a new kit, replacing a worn favorite, or hunting for a gift with real biker character. Browse the products below, open any item for full details, photos, and available sizes, and use our Size Guide when fit matters. Shipping from the USA is explained on our Shipping Policy page, and eligible returns follow the Return & Exchange Policy. Prefer to ask before you buy? The Contact page lists support hours and how to reach us. Explore ${name} with confidence, then add your picks to the cart for secure Stripe checkout.`,
  bells: (name) =>
    `Discover ${name} at IBelieveThis — traditional motorcycle guardian bells for US riders who love road folklore and bike style. A guardian bell is a small metal charm hung on a motorcycle for good luck; many riders gift them to friends as a sign of protection. In this category you will find designs that suit cruisers, choppers, and everyday riders. Read each product page for finish and size details, then see How to Hang a Guardian Bell for placement tips that keep the bell clear of wheels and heat. Shipping timelines live on our Shipping Policy page (rates appear at checkout). Returns follow the Return & Exchange Policy. Questions about gifting or mounting? Contact us anytime. Shop ${name} below and bring a classic rider tradition to your bike.`,
  boots: (name) =>
    `Browse ${name} at IBelieveThis for motorcycle and biker boots built for riders across the United States. From everyday stompers to taller riding styles, this collection focuses on look, durability, and confident fit. Start with our Size Guide, then open each product for materials, shaft details, and available sizes — select a size before checkout when options are listed. Care tips and fit notes appear on product pages; for shipping windows see the Shipping Policy, and for exchanges use the Return & Exchange Policy. If you are between sizes, Contact us with your usual shoe size before ordering. Explore ${name} below, compare styles, and gear up for the next ride.`,
  jackets: (name) =>
    `Shop ${name} at IBelieveThis for motorcycle jackets and rider outerwear with classic biker attitude. Whether you want leather presence or everyday riding layers, each listing includes materials, features, and sizing so you can choose with confidence. Use the Size Guide for chest and fit tips, then pick your size on the product page when variations are offered. Pair a jacket with gloves or boots from our store for a complete look. Delivery details are on the Shipping Policy page; eligible returns are covered by the Return & Exchange Policy. Need help choosing a cut or size? Reach out through Contact. Scroll ${name} below to find your next ride-ready layer.`,
  gloves: (name) =>
    `Find ${name} at IBelieveThis — riding gloves for grip, comfort, and motorcycle style. Snug fit across the palm matters for control, so check the Size Guide and the sizes listed on each product before you add to cart. Product descriptions call out materials and seasonal intent so you can match gloves to your climate and bike. Shipping from the USA is outlined in the Shipping Policy, with options shown at checkout. Returns follow the Return & Exchange Policy when items meet the stated conditions. Unsure about hand size? Contact us and we will help. Explore ${name} below and complete your riding kit.`,
  hats: (name) =>
    `Explore ${name} at IBelieveThis for cowboy hats and rider headwear with western and motorcycle edge. Measure your head, compare with the Size Guide, and review one-size notes on product pages when listed. Hats ship carefully within the US per our Shipping Policy; tracking is sent when available. If something arrives damaged, Contact us with your order number and photos. Returns follow the Return & Exchange Policy. Browse ${name} below to crown your next ride or roadhouse look.`,
  patches: (name) =>
    `Shop ${name} at IBelieveThis for motorcycle patches that personalize jackets, vests, and bags. Each product page notes attachment style and design details so you can plan your layout. Patches pair well with guardian bells and other rider accessories in our catalog. Shipping and combined orders follow the Shipping Policy and checkout rates. Returns are covered under the Return & Exchange Policy when eligible. Questions about sew-on versus iron-on methods? Contact us. Browse ${name} below and make your gear unmistakably yours.`,
};

export function categoryIntro(category) {
  const name = category?.name || 'Motorcycle Gear';
  const existing = String(category?.description || '').trim();
  if (existing.length >= 150) return existing;

  const n = name.toLowerCase();
  if (n.includes('bell')) return TEMPLATES.bells(name);
  if (n.includes('boot')) return TEMPLATES.boots(name);
  if (n.includes('jacket')) return TEMPLATES.jackets(name);
  if (n.includes('glove')) return TEMPLATES.gloves(name);
  if (n.includes('hat') || n.includes('cowboy')) return TEMPLATES.hats(name);
  if (n.includes('patch')) return TEMPLATES.patches(name);
  return TEMPLATES.default(name);
}
