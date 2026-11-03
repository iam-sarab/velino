/* ==========================================================================
   VELINO CATALOG: everything the store sells or features lives in this file.

   To add a product, copy one block in `products` and change the values:
     id          short name used in the page link (lowercase, hyphens only)
     name        product name shown to customers
     type        a short description shown under the name
     category    one of the ids in `categories`
     occasions   any ids from `occasions`
     price       selling price in rupees
     compareAt   original price (leave it out if there is no discount)
     colors      any ids from `colors`
     sizes       UK sizes the style comes in
     soldOut     sizes that are out of stock
     isNew       true shows it on the New Arrivals page
     bestseller  true shows it in the home page Bestsellers row
     images      photo paths, first one is the main photo, second shows on hover.
                 Each photo also needs a smaller copy named <photo>-600.webp.
     views       a short name for each photo, in the same order
     details     bullet points for the product page
     tags        extra words people might search for
     description a short paragraph for the product page

   Prices, sizes and stock below are placeholders until real ones are confirmed.
   ========================================================================== */
window.VELINO = {

  /* Home page adverts, in the order they play. Each one is a finished 16:9 image.
     link is the page it opens; alt is what screen readers announce, so it repeats the words in the ad. */
  slides: [
    {
      image: 'assets/slides/ad-festive.webp', width: 1594, height: 898,
      link: 'new-arrivals',
      label: 'All new festive collection',
      alt: 'All new festive collection. Velino Noor beaded slingbacks worn with a gold embroidered outfit, beside brass lamps and diyas on a marble floor.'
    },
    {
      image: 'assets/slides/ad-gulnaar.webp', width: 1594, height: 987,
      link: 'product-gulnaar',
      label: 'Gulnaar, the embroidered boot',
      alt: 'Gulnaar, the embroidered boot for modern women. Intricate embroidery, cushioned support, all-day comfort. Burgundy lace-up boots worn with a matching embroidered dress. Velino, confidence without compromise.'
    },
    {
      image: 'assets/slides/ad-everyday.webp', width: 1672, height: 941,
      link: 'shop',
      label: 'Fashionable and comfortable',
      alt: 'Fashionable and comfortable at affordable prices. White Velino Sukoon sandals worn with jeans. Velino, confidence without compromise.'
    }
  ],

  categories: [
    { id: 'heels',      label: 'Heels' },
    { id: 'slingbacks', label: 'Slingbacks' },
    { id: 'mules',      label: 'Mules' },
    { id: 'boots',      label: 'Boots' },
    { id: 'sandals',    label: 'Sandals' }
  ],

  occasions: [
    { id: 'wedding',  label: 'Weddings' },
    { id: 'party',    label: 'Parties' },
    { id: 'festive',  label: 'Festive' },
    { id: 'everyday', label: 'Everyday' }
  ],

  colors: {
    ranipink: { label: 'Rani pink',   hex: '#C4145F' },
    white:    { label: 'White',       hex: '#F4F1EA' },
    emerald:  { label: 'Emerald',     hex: '#1B6A4B' },
    pearl:    { label: 'Pearl beige', hex: '#E2C7A6' },
    burgundy: { label: 'Burgundy',    hex: '#5C1A2E' },
    nude:     { label: 'Nude',        hex: '#E8C6B3' },
    rosegold: { label: 'Rose gold',   hex: '#D8A487' }
  },

  priceBands: [
    { id: 'u2000', label: 'Under \u20B92,000', min: 0, max: 1999 },
    { id: 'm2500', label: '\u20B92,000 to \u20B92,499', min: 2000, max: 2499 },
    { id: 'o2500', label: '\u20B92,500 and above', min: 2500, max: Infinity }
  ],

  products: [
    { id: 'rani', type: 'Embroidered block-heel pump', name: 'Rani', category: 'heels', occasions: ['wedding', 'festive'], price: 2299, compareAt: 2999,
      colors: ['ranipink'], sizes: [3, 4, 5, 6, 7, 8], soldOut: [], isNew: true, bestseller: false,
      images: ['assets/products/rani/1.webp', 'assets/products/rani/2.webp', 'assets/products/rani/3.webp', 'assets/products/rani/4.webp', 'assets/products/rani/5.webp', 'assets/products/rani/6.webp'],
      views: ['Side view', 'The pair', 'From above', 'From behind', 'The sole', 'Embroidery close-up'],
      description: 'Rani pink satin covered in orange floral embroidery, pearls and beads, right down to the heel. A low block heel and a padded insole keep it easy to wear from the haldi to the reception.',
      details: ['Satin upper with floral embroidery, pearls and beads', 'Low block heel, embroidered all round', 'Padded, contoured insole', 'Textured sole for grip'],
      tags: 'pump block pink fuchsia embroidered floral mehendi haldi sangeet' },

    { id: 'sukoon', type: 'Cushioned strappy sandal', name: 'Sukoon', category: 'sandals', occasions: ['everyday'], price: 1699, compareAt: 2199,
      colors: ['white'], sizes: [3, 4, 5, 6, 7, 8], soldOut: [], isNew: false, bestseller: true,
      images: ['assets/products/sukoon/1.webp', 'assets/products/sukoon/2.webp', 'assets/products/sukoon/3.webp', 'assets/products/sukoon/4.webp', 'assets/products/sukoon/5.webp', 'assets/products/sukoon/6.webp'],
      views: ['Side view', 'The pair', 'From behind', 'The sole', 'Strap close-up', 'On foot'],
      description: 'Soft, padded crossover straps on a light, cushioned platform sole. Our easiest pair, made for long days and relaxed plans.',
      details: ['Padded crossover straps with an adjustable buckle', 'Cushioned, contoured footbed', 'Lightweight platform sole with deep tread'],
      tags: 'comfort casual strappy platform wedge flat daily' },

    { id: 'panna', type: 'Satin bow slingback', name: 'Panna', category: 'slingbacks', occasions: ['party', 'wedding'], price: 2599, compareAt: 3299,
      colors: ['emerald'], sizes: [3, 4, 5, 6, 7, 8], soldOut: [8], isNew: false, bestseller: true,
      images: ['assets/products/panna/1.webp', 'assets/products/panna/2.webp', 'assets/products/panna/3.webp', 'assets/products/panna/4.webp'],
      views: ['Side view', 'On foot', 'Bow close-up', 'Bubble heel close-up'],
      description: 'Emerald satin with a sculpted bow and a low heel made of glossy emerald bubbles. A statement for cocktail nights and receptions, with a padded insole underneath.',
      details: ['Satin upper with a crystal-banded bow', 'Low sculpted bubble heel', 'Perforated, padded insole with arch support', 'Slingback strap for a snug, gentle fit'],
      tags: 'green bow satin cocktail reception statement' },

    { id: 'moti', type: 'Pearl-work clear-heel mule', name: 'Moti', category: 'mules', occasions: ['wedding', 'festive', 'party'], price: 2199, compareAt: 2799,
      colors: ['pearl'], sizes: [3, 4, 5, 6, 7, 8], soldOut: [], isNew: true, bestseller: false,
      images: ['assets/products/moti/1.webp', 'assets/products/moti/2.webp', 'assets/products/moti/3.webp', 'assets/products/moti/4.webp', 'assets/products/moti/5.webp', 'assets/products/moti/6.webp'],
      views: ['Side view', 'The pair', 'From above', 'Clear heel', 'The sole', 'Pearl work close-up'],
      description: 'Rows of pearls and golden beads in a soft fan pattern, set on a clear block heel. It slips on in seconds and goes with almost everything you will wear this season.',
      details: ['Pearl and gold bead work on a nude upper', 'Clear block heel', 'Contoured, cushioned insole', 'Textured sole for grip'],
      tags: 'pearl beaded slip on transparent bridal sangeet gold beige' },

    { id: 'gulnaar', type: 'Embroidered lace-up ankle boot', name: 'Gulnaar', category: 'boots', occasions: ['festive', 'party'], price: 2999, compareAt: 3799,
      colors: ['burgundy'], sizes: [3, 4, 5, 6, 7, 8], soldOut: [3], isNew: true, bestseller: false,
      images: ['assets/products/gulnaar/1.webp', 'assets/products/gulnaar/2.webp', 'assets/products/gulnaar/3.webp', 'assets/products/gulnaar/4.webp', 'assets/products/gulnaar/5.webp'],
      views: ['Side view', 'The pair', 'The sole', 'Rose embroidery close-up', 'Lace and pearl close-up'],
      description: 'Deep burgundy with raised embroidered roses, jewel-toned crystals and pearls across a sheer mesh panel. A block heel and a padded insole keep it wearable all evening.',
      details: ['Satin and sheer mesh upper with raised rose embroidery', 'Crystal and pearl detailing', 'Lace-up front with a velvet tongue', 'Block heel', 'Padded insole with arch support'],
      tags: 'ankle boot lace up rose floral embroidered maroon wine winter' },

    { id: 'ada', type: 'Patent block-heel pump', name: 'Ada', category: 'heels', occasions: ['everyday', 'party'], price: 1799, compareAt: 2299,
      colors: ['nude'], sizes: [3, 4, 5, 6, 7, 8], soldOut: [], isNew: false, bestseller: true,
      images: ['assets/products/ada/1.webp', 'assets/products/ada/2.webp', 'assets/products/ada/3.webp', 'assets/products/ada/4.webp'],
      views: ['Side view', 'From the front', 'From behind', 'Cushioned insole'],
      description: 'A clean, glossy nude pump with a steady block heel and a quilted, cushioned insole. It goes with everything, from office days to evening functions.',
      details: ['Patent finish upper', 'Block heel', 'Quilted, cushioned insole', 'Textured sole for grip'],
      tags: 'pump block classic office beige blush patent' },

    { id: 'noor', type: 'Beaded block-heel slingback', name: 'Noor', category: 'slingbacks', occasions: ['wedding', 'festive', 'party'], price: 2499, compareAt: 3199,
      colors: ['rosegold'], sizes: [3, 4, 5, 6, 7, 8], soldOut: [], isNew: true, bestseller: false,
      images: ['assets/products/noor/1.webp', 'assets/products/noor/2.webp', 'assets/products/noor/3.webp', 'assets/products/noor/4.webp', 'assets/products/noor/5.webp'],
      views: ['Side view', 'The pair', 'From above', 'The sole', 'Beadwork close-up'],
      description: 'Sheer mesh scattered with beads, sequins and embroidered blossoms in peach and gold, finished with a scalloped edge. A steady block heel and adjustable buckle make it an easy pick for long functions.',
      details: ['Sheer mesh upper with beads, sequins and embroidered flowers', 'Scalloped, gold-trimmed edge', 'Satin block heel', 'Adjustable buckle strap', 'Cushioned insole'],
      tags: 'peach pink beaded sequin bridal block sangeet gold' }
  ]
};
