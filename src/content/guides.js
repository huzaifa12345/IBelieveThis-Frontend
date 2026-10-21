export const GUIDES = [
  {
    slug: 'what-is-a-motorcycle-guardian-bell',
    title: 'What Is a Motorcycle Guardian Bell?',
    description:
      'Learn what motorcycle guardian bells are, where the tradition comes from, and how riders use them as good-luck charms on the road.',
    datePublished: '2026-06-18',
    dateModified: '2026-07-12',
    sections: [
      {
        h2: 'A rider tradition with meaning',
        body: `A motorcycle guardian bell — sometimes called a gremlin bell — is a small metal bell riders hang on their bikes. Folklore says the bell wards off road spirits and bad luck. Whether you believe the story or simply love the look, bells are a classic gift between riders and a signature piece of motorcycle culture.`,
      },
      {
        h2: 'Why riders still hang them',
        body: `Many riders hang a guardian bell for tradition, camaraderie, and style. Gifted bells are especially meaningful — the story goes that a bell given by a friend carries stronger luck. At IBelieveThis we stock guardian bells that look sharp on cruisers, choppers, and everyday riders’ bikes.`,
      },
      {
        h2: 'Choosing a bell at IBelieveThis',
        body: `Browse our guardian bells for designs that match your bike and personality. Read each product description for size and finish, then check our Shipping Policy for delivery details. When you are ready, add a bell to your cart or Contact us if you want help picking a gift.`,
      },
    ],
    relatedLinks: [
      { href: '/guides/how-to-hang-a-guardian-bell', label: 'How to Hang a Guardian Bell' },
      { href: '/all-products', label: 'Shop all products' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    slug: 'how-to-hang-a-guardian-bell',
    title: 'How to Hang a Guardian Bell',
    description:
      'Step-by-step tips for hanging a motorcycle guardian bell safely on your frame or front end so it can ring freely.',
    datePublished: '2026-06-18',
    dateModified: '2026-07-12',
    sections: [
      {
        h2: 'Pick a safe mounting spot',
        body: `Hang your guardian bell low on the frame or near the front axle area so it can swing and ring. Keep it clear of the front wheel, brake lines, chain, and hot exhaust. The goal is a secure mount that will not snag or melt.`,
      },
      {
        h2: 'Secure the hardware',
        body: `Use the cable, bolt, or hanger that came with your bell — or a motorcycle-safe zip-style mount designed for accessories. Double-check that nothing can work loose on rough roads. After the first ride, re-check the mount.`,
      },
      {
        h2: 'Shop bells and get help',
        body: `Find a design you love in our guardian bells selection, then review the Shipping Policy for timing. Prefer a walkthrough before you buy? Read What Is a Motorcycle Guardian Bell? or Contact us with photos of your mounting area.`,
      },
    ],
    relatedLinks: [
      { href: '/guides/what-is-a-motorcycle-guardian-bell', label: 'What Is a Motorcycle Guardian Bell?' },
      { href: '/shipping-policy', label: 'Shipping Policy' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    slug: 'how-to-choose-biker-boots',
    title: 'How to Choose Biker Boots',
    description:
      'A practical guide to choosing motorcycle and biker boots — fit, shaft height, materials, and when to size up.',
    datePublished: '2026-06-18',
    dateModified: '2026-07-12',
    sections: [
      {
        h2: 'Start with fit and function',
        body: `Good biker boots should feel secure through the heel and ankle while leaving your toes comfortable. Decide whether you need taller shafts for coverage, easier walkability for everyday wear, or a classic riding look. Use our Size Guide before you order.`,
      },
      {
        h2: 'Materials and construction',
        body: `Leather and synthetic uppers each have trade-offs in break-in time and weather resistance. Read the product page for sole type, zipper or lace closures, and care notes. Pair boots with jackets and gloves from IBelieveThis for a cohesive kit.`,
      },
      {
        h2: 'Order with confidence',
        body: `Compare sizes on each product, then check the Shipping Policy and Return & Exchange Policy so you know how delivery and fit returns work. Still between sizes? Contact us with your usual shoe size and we will help you choose.`,
      },
    ],
    relatedLinks: [
      { href: '/size-guide', label: 'Size Guide' },
      { href: '/return-policy', label: 'Return & Exchange Policy' },
      { href: '/all-products', label: 'Shop all products' },
    ],
  },
];

export function getGuide(slug) {
  return GUIDES.find((g) => g.slug === slug) || null;
}
