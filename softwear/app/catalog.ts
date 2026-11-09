// The catalog: Alternative Apparel's range as this store sells it. Fixed when the site is built, so the pages that
// list it render ahead (render=build). Style numbers are the wholesale catalog's; prices are this store's.
import type { Result } from './app.contract.d.ts';

export type Product = Result<'loadCatalog'>[number];

export const CATALOG: Product[] = [
  {
    "slug": "challenger-eco-fleece-hoodie",
    "style": "9595F2",
    "name": "Challenger Eco-Fleece Hoodie",
    "category": "hoodies",
    "gender": "unisex",
    "fabric": "Eco-Fleece: 50% polyester (6.25% recycled), 46% cotton (6.25% organic), 4% rayon",
    "weight": "6.5 oz",
    "fit": "Slim, set-in sleeve",
    "description": "Our signature pullover, brushed soft inside and out and worn in from the first wear. Throw it on over everything and call it a day.",
    "details": [
      "Kangaroo pouch pocket",
      "Drawcord hood",
      "Ribbed cuffs and hem",
      "Yarn-dyed and fabric-washed, low-impact dyes"
    ],
    "colors": [
      {
        "name": "Eco True Black",
        "hex": "#141414",
        "photo": "challenger-eco-fleece-hoodie--eco-true-black.jpg"
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": "challenger-eco-fleece-hoodie--eco-true-navy.jpg"
      },
      {
        "name": "Eco True Red",
        "hex": "#b0262c",
        "photo": ""
      },
      {
        "name": "Eco True Pacific Blue",
        "hex": "#3b7ea1",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 7400,
    "compareCents": 0,
    "tags": [
      "bestseller",
      "eco",
      "fleece"
    ],
    "kind": "hoodie",
    "photo": "challenger-eco-fleece-hoodie.jpg"
  },
  {
    "slug": "challenger-lightweight-washed-french-terry-hoodie",
    "style": "9595CT",
    "name": "Challenger Lightweight Washed French Terry Hoodie",
    "category": "hoodies",
    "gender": "unisex",
    "fabric": "Lightweight French Terry: cotton/recycled polyester blend, garment washed",
    "weight": "",
    "fit": "Relaxed, slightly slouchy",
    "description": "A broken-in, in-between-seasons hoodie with a washed finish and a looped inside that stays breathable. Soft in the way only a favorite hoodie gets.",
    "details": [
      "Garment-washed for a lived-in look",
      "Kangaroo pocket",
      "Lined hood with drawcord",
      "Ribbed cuffs and hem"
    ],
    "colors": [
      {
        "name": "Dark Grey",
        "hex": "#4b4b4d",
        "photo": "challenger-lightweight-washed-french-terry-hoodie--dark-grey.jpg"
      },
      {
        "name": "Washed Black",
        "hex": "#2c2c2c",
        "photo": ""
      },
      {
        "name": "Washed Navy",
        "hex": "#2b3550",
        "photo": ""
      },
      {
        "name": "Washed Sage",
        "hex": "#a3b09a",
        "photo": ""
      },
      {
        "name": "Washed Pink",
        "hex": "#e3b9b4",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 6800,
    "compareCents": 0,
    "tags": [
      "french-terry",
      "lightweight",
      "eco"
    ],
    "kind": "hoodie",
    "photo": "challenger-lightweight-washed-french-terry-hoodie.jpg"
  },
  {
    "slug": "rocky-eco-fleece-zip-hoodie",
    "style": "9590",
    "name": "Rocky Eco-Fleece Zip Hoodie",
    "category": "hoodies",
    "gender": "unisex",
    "fabric": "Eco-Fleece: 50% polyester (6.25% recycled), 46% cotton (6.25% organic), 4% rayon",
    "weight": "6.5 oz",
    "fit": "Relaxed, retro gym fit",
    "description": "Retro gym-class energy in our softest fleece. A full zip makes it the easy layer for early walks and late couches.",
    "details": [
      "Full zip front",
      "Kangaroo pockets",
      "Drawcord hood",
      "Ribbed cuffs and hem"
    ],
    "colors": [
      {
        "name": "Eco True Currant",
        "hex": "#7a2240",
        "photo": ""
      },
      {
        "name": "Eco Black",
        "hex": "#222222",
        "photo": ""
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": ""
      },
      {
        "name": "Eco True Green",
        "hex": "#2f6a50",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 7800,
    "compareCents": 0,
    "tags": [
      "bestseller",
      "eco",
      "fleece"
    ],
    "kind": "zip-hoodie",
    "photo": "rocky-eco-fleece-zip-hoodie.jpg"
  },
  {
    "slug": "burnout-french-terry-hooded-pullover",
    "style": "",
    "name": "Burnout French Terry Hooded Pullover",
    "category": "hoodies",
    "gender": "unisex",
    "fabric": "Burnout French Terry: cotton/polyester blend",
    "weight": "",
    "fit": "Relaxed, drop shoulder",
    "description": "A sheer-soft burnout terry with a vintage, sun-faded hand. Light enough for warm nights, cozy enough to sleep in.",
    "details": [
      "Burnout wash with faded texture",
      "Kangaroo pocket",
      "Drawcord hood",
      "Raw-edge hem"
    ],
    "colors": [
      {
        "name": "Washed Black",
        "hex": "#2c2c2c",
        "photo": ""
      },
      {
        "name": "Washed Pink",
        "hex": "#e3b9b4",
        "photo": ""
      },
      {
        "name": "Washed Sage",
        "hex": "#a3b09a",
        "photo": ""
      },
      {
        "name": "Dark Grey",
        "hex": "#4b4b4d",
        "photo": ""
      },
      {
        "name": "Sand",
        "hex": "#d9c9a8",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 6600,
    "compareCents": 0,
    "tags": [
      "burnout",
      "french-terry",
      "vintage"
    ],
    "kind": "hoodie",
    "photo": "burnout-french-terry-hooded-pullover.jpg"
  },
  {
    "slug": "eco-jersey-zip-hoodie",
    "style": "1970",
    "name": "Eco-Jersey Zip Hoodie",
    "category": "hoodies",
    "gender": "unisex",
    "fabric": "Eco-Jersey: cotton/recycled polyester jersey",
    "weight": "",
    "fit": "Easy, relaxed",
    "description": "A featherweight zip hoodie in our drapey Eco-Jersey. It layers over a Go-To tee like it was made to.",
    "details": [
      "Full zip front",
      "Lightweight, drapey jersey",
      "Drawcord hood",
      "Side pockets"
    ],
    "colors": [
      {
        "name": "Eco True Black",
        "hex": "#141414",
        "photo": ""
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 4100,
    "compareCents": 5800,
    "tags": [
      "eco",
      "jersey",
      "lightweight"
    ],
    "kind": "zip-hoodie",
    "photo": "eco-jersey-zip-hoodie.jpg"
  },
  {
    "slug": "women-s-eco-jersey-cool-down-zip-hoodie",
    "style": "2896",
    "name": "Women's Eco-Jersey Cool-Down Zip Hoodie",
    "category": "hoodies",
    "gender": "women",
    "fabric": "Eco-Jersey: cotton/recycled polyester jersey",
    "weight": "",
    "fit": "Easy, slightly cropped",
    "description": "A cool-down layer with soft, stretchy drape, for after the workout or instead of it.",
    "details": [
      "Zip front",
      "Thumbholes at cuff",
      "Hood with drawcord",
      "Soft jersey stretch"
    ],
    "colors": [
      {
        "name": "Eco True Black",
        "hex": "#141414",
        "photo": ""
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      },
      {
        "name": "Eco Pink",
        "hex": "#e8bfc0",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 5800,
    "compareCents": 0,
    "tags": [
      "eco",
      "jersey",
      "lightweight"
    ],
    "kind": "zip-hoodie",
    "photo": "women-s-eco-jersey-cool-down-zip-hoodie.jpg"
  },
  {
    "slug": "eco-cozy-fleece-pullover-hoodie",
    "style": "8804PF",
    "name": "Eco-Cozy Fleece Pullover Hoodie",
    "category": "hoodies",
    "gender": "unisex",
    "fabric": "Eco-Cozy Fleece: cotton/recycled polyester blend, plush brushed interior",
    "weight": "",
    "fit": "Roomy, cozy",
    "description": "Our coziest fleece yet: plush inside, softly brushed out. Made for hibernation season.",
    "details": [
      "Plush brushed interior",
      "Kangaroo pocket",
      "Drawcord hood",
      "Ribbed cuffs and hem"
    ],
    "colors": [
      {
        "name": "Eco Black",
        "hex": "#222222",
        "photo": ""
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": ""
      },
      {
        "name": "Eco True Currant",
        "hex": "#7a2240",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 7200,
    "compareCents": 0,
    "tags": [
      "new",
      "eco",
      "fleece"
    ],
    "kind": "hoodie",
    "photo": "eco-cozy-fleece-pullover-hoodie.jpg"
  },
  {
    "slug": "champ-eco-fleece-crewneck-sweatshirt",
    "style": "9575",
    "name": "Champ Eco-Fleece Crewneck Sweatshirt",
    "category": "sweatshirts",
    "gender": "unisex",
    "fabric": "Eco-Fleece: 50% polyester (6.25% recycled), 46% cotton (6.25% organic), 4% rayon",
    "weight": "6.5 oz",
    "fit": "Slim, set-in sleeve",
    "description": "The classic crew, softened to within an inch of its life. Your new default sweatshirt.",
    "details": [
      "Crew neck",
      "Ribbed cuffs and hem",
      "Brushed fleece interior",
      "Yarn-dyed and fabric-washed"
    ],
    "colors": [
      {
        "name": "Eco Black",
        "hex": "#222222",
        "photo": "champ-eco-fleece-crewneck-sweatshirt--eco-black.jpg"
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": "champ-eco-fleece-crewneck-sweatshirt--eco-grey.jpg"
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": "champ-eco-fleece-crewneck-sweatshirt--eco-true-navy.jpg"
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      },
      {
        "name": "Eco True Red",
        "hex": "#b0262c",
        "photo": ""
      },
      {
        "name": "Eco True Pacific Blue",
        "hex": "#3b7ea1",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 6400,
    "compareCents": 0,
    "tags": [
      "bestseller",
      "eco",
      "fleece"
    ],
    "kind": "crew",
    "photo": "champ-eco-fleece-crewneck-sweatshirt.jpg"
  },
  {
    "slug": "champ-lightweight-washed-french-terry-crewneck",
    "style": "9575CT",
    "name": "Champ Lightweight Washed French Terry Crewneck",
    "category": "sweatshirts",
    "gender": "unisex",
    "fabric": "Lightweight French Terry: cotton/recycled polyester blend, garment washed",
    "weight": "",
    "fit": "Relaxed",
    "description": "A washed-down terry crew with a soft, easy hand. Perfect for the in-between weather days.",
    "details": [
      "Garment-washed finish",
      "Crew neck",
      "Ribbed cuffs and hem",
      "Looped terry interior"
    ],
    "colors": [
      {
        "name": "Dark Grey",
        "hex": "#4b4b4d",
        "photo": ""
      },
      {
        "name": "Washed Black",
        "hex": "#2c2c2c",
        "photo": "champ-lightweight-washed-french-terry-crewneck--washed-black.jpg"
      },
      {
        "name": "Washed Navy",
        "hex": "#2b3550",
        "photo": ""
      },
      {
        "name": "Washed Pink",
        "hex": "#e3b9b4",
        "photo": ""
      },
      {
        "name": "Washed Sage",
        "hex": "#a3b09a",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 5800,
    "compareCents": 0,
    "tags": [
      "french-terry",
      "lightweight",
      "eco"
    ],
    "kind": "crew",
    "photo": "champ-lightweight-washed-french-terry-crewneck.jpg"
  },
  {
    "slug": "champ-eco-fleece-colorblocked-sweatshirt",
    "style": "32022F2",
    "name": "Champ Eco-Fleece Colorblocked Sweatshirt",
    "category": "sweatshirts",
    "gender": "unisex",
    "fabric": "Eco-Fleece: 50% polyester (6.25% recycled), 46% cotton (6.25% organic), 4% rayon",
    "weight": "6.5 oz",
    "fit": "Slim, set-in sleeve",
    "description": "A sporty color-blocked take on the Champ, in the same feather-soft Eco-Fleece.",
    "details": [
      "Color-blocked panels",
      "Crew neck",
      "Ribbed cuffs and hem",
      "Brushed fleece interior"
    ],
    "colors": [
      {
        "name": "Eco Grey / Eco True Navy",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco Ivory / Eco Black",
        "hex": "#efe9da",
        "photo": ""
      },
      {
        "name": "Eco True Navy / Eco Grey",
        "hex": "#1f2b45",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 6800,
    "compareCents": 0,
    "tags": [
      "eco",
      "fleece"
    ],
    "kind": "crew",
    "photo": "champ-eco-fleece-colorblocked-sweatshirt.jpg"
  },
  {
    "slug": "eco-cozy-fleece-crewneck-sweatshirt",
    "style": "8800PF",
    "name": "Eco-Cozy Fleece Crewneck Sweatshirt",
    "category": "sweatshirts",
    "gender": "unisex",
    "fabric": "Eco-Cozy Fleece: cotton/recycled polyester blend, plush brushed interior",
    "weight": "",
    "fit": "Roomy, cozy",
    "description": "Plush, pillowy and a bit oversized: the sweatshirt for days with no plans.",
    "details": [
      "Plush brushed interior",
      "Crew neck",
      "Ribbed cuffs and hem",
      "Dropped shoulder seam"
    ],
    "colors": [
      {
        "name": "Eco Black",
        "hex": "#222222",
        "photo": ""
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": ""
      },
      {
        "name": "Eco True Currant",
        "hex": "#7a2240",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 6200,
    "compareCents": 0,
    "tags": [
      "eco",
      "fleece"
    ],
    "kind": "crew",
    "photo": "eco-cozy-fleece-crewneck-sweatshirt.jpg"
  },
  {
    "slug": "lazy-day-pullover",
    "style": "8626",
    "name": "Lazy Day Pullover",
    "category": "sweatshirts",
    "gender": "women",
    "fabric": "Mineral-washed French Terry: 65% ring-spun cotton, 35% recycled polyester",
    "weight": "8.1 oz",
    "fit": "Oversized, boxy",
    "description": "Sun-faded, slouchy and ridiculously comfortable: the pullover that makes Sunday a whole personality.",
    "details": [
      "Mineral-washed for a faded finish",
      "Raw-edge hem",
      "Oversized, boxy cut",
      "Crew neck"
    ],
    "colors": [
      {
        "name": "Washed Black",
        "hex": "#2c2c2c",
        "photo": ""
      },
      {
        "name": "Washed Pink",
        "hex": "#e3b9b4",
        "photo": ""
      },
      {
        "name": "Washed Navy",
        "hex": "#2b3550",
        "photo": ""
      },
      {
        "name": "Washed Sage",
        "hex": "#a3b09a",
        "photo": ""
      },
      {
        "name": "Washed Mauve",
        "hex": "#b78f98",
        "photo": ""
      },
      {
        "name": "Camo",
        "hex": "#6a6b4a",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 6600,
    "compareCents": 0,
    "tags": [
      "bestseller",
      "french-terry",
      "vintage"
    ],
    "kind": "crew",
    "photo": "lazy-day-pullover.jpg"
  },
  {
    "slug": "lazy-day-burnout-french-terry-pullover",
    "style": "8626FH",
    "name": "Lazy Day Burnout French Terry Pullover",
    "category": "sweatshirts",
    "gender": "women",
    "fabric": "Burnout French Terry: cotton/polyester blend",
    "weight": "",
    "fit": "Oversized, boxy",
    "description": "The Lazy Day in a lighter, sheerer burnout terry. Worn-in softness from day one.",
    "details": [
      "Burnout finish",
      "Raw-edge hem",
      "Oversized, boxy cut",
      "Crew neck"
    ],
    "colors": [
      {
        "name": "Washed Black",
        "hex": "#2c2c2c",
        "photo": ""
      },
      {
        "name": "Washed Pink",
        "hex": "#e3b9b4",
        "photo": ""
      },
      {
        "name": "Dark Grey",
        "hex": "#4b4b4d",
        "photo": ""
      },
      {
        "name": "Sand",
        "hex": "#d9c9a8",
        "photo": ""
      },
      {
        "name": "Washed Sage",
        "hex": "#a3b09a",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 6600,
    "compareCents": 0,
    "tags": [
      "burnout",
      "french-terry",
      "vintage"
    ],
    "kind": "crew",
    "photo": "lazy-day-burnout-french-terry-pullover.jpg"
  },
  {
    "slug": "eco-jersey-slouchy-pullover",
    "style": "1990",
    "name": "Eco-Jersey Slouchy Pullover",
    "category": "sweatshirts",
    "gender": "women",
    "fabric": "Eco-Jersey: cotton/recycled polyester jersey",
    "weight": "",
    "fit": "Slouchy, relaxed",
    "description": "A jersey pullover cut slouchy on purpose. Light, drapey and as easy as it gets.",
    "details": [
      "Slouchy fit",
      "Crew neck",
      "Dropped shoulder",
      "Long sleeves"
    ],
    "colors": [
      {
        "name": "Eco True Black",
        "hex": "#141414",
        "photo": ""
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      },
      {
        "name": "Eco Pink",
        "hex": "#e8bfc0",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 3800,
    "compareCents": 5400,
    "tags": [
      "eco",
      "jersey",
      "lightweight"
    ],
    "kind": "crew",
    "photo": "eco-jersey-slouchy-pullover.jpg"
  },
  {
    "slug": "go-to-tee",
    "style": "1070",
    "name": "Go-To Tee",
    "category": "tees",
    "gender": "unisex",
    "fabric": "100% combed ring-spun cotton jersey (Heathers: 60% cotton, 40% polyester)",
    "weight": "4 oz",
    "fit": "Classic, contemporary cut",
    "description": "The tee you reach for first. Soft-washed combed cotton that fits like it was already yours.",
    "details": [
      "Ribbed crew neck",
      "Double-needle stitching",
      "Side-seamed",
      "Soft-wash finish",
      "Tear-away label"
    ],
    "colors": [
      {
        "name": "White",
        "hex": "#ffffff",
        "photo": "go-to-tee--white.jpg"
      },
      {
        "name": "Black",
        "hex": "#161616",
        "photo": "go-to-tee--black.jpg"
      },
      {
        "name": "Heather Grey",
        "hex": "#b0b0b0",
        "photo": ""
      },
      {
        "name": "Light Navy",
        "hex": "#2a3f5f",
        "photo": "go-to-tee--light-navy.jpg"
      },
      {
        "name": "Heather Red",
        "hex": "#b4474b",
        "photo": ""
      },
      {
        "name": "Vintage Pine",
        "hex": "#2f5a45",
        "photo": ""
      },
      {
        "name": "Dusty Rose",
        "hex": "#cf9fa0",
        "photo": ""
      },
      {
        "name": "Sand",
        "hex": "#d9c9a8",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 3000,
    "compareCents": 0,
    "tags": [
      "bestseller",
      "jersey",
      "lightweight"
    ],
    "kind": "tee",
    "photo": "go-to-tee.jpg"
  },
  {
    "slug": "her-go-to-tee",
    "style": "",
    "name": "Her Go-To Tee",
    "category": "tees",
    "gender": "women",
    "fabric": "100% combed ring-spun cotton jersey",
    "weight": "4 oz",
    "fit": "Fitted, shorter body",
    "description": "Everything you love about the Go-To, cut slimmer for her. Always the first thing in the drawer.",
    "details": [
      "Ribbed crew neck",
      "Slim, shorter body",
      "Soft-wash finish",
      "Side-seamed"
    ],
    "colors": [
      {
        "name": "White",
        "hex": "#ffffff",
        "photo": ""
      },
      {
        "name": "Black",
        "hex": "#161616",
        "photo": ""
      },
      {
        "name": "Heather Grey",
        "hex": "#b0b0b0",
        "photo": "her-go-to-tee--heather-grey.jpg"
      },
      {
        "name": "Dusty Rose",
        "hex": "#cf9fa0",
        "photo": ""
      },
      {
        "name": "Sage",
        "hex": "#9fb09a",
        "photo": ""
      },
      {
        "name": "Cream",
        "hex": "#f2ead6",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 3200,
    "compareCents": 0,
    "tags": [
      "jersey",
      "lightweight"
    ],
    "kind": "tee",
    "photo": "her-go-to-tee.jpg"
  },
  {
    "slug": "heavy-weight-go-to-tee",
    "style": "",
    "name": "Heavy Weight Go-To Tee",
    "category": "tees",
    "gender": "unisex",
    "fabric": "100% cotton heavyweight jersey",
    "weight": "6.5 oz",
    "fit": "Boxy, drop shoulder",
    "description": "The Go-To with some heft: a substantial, boxy tee that holds its shape and softens with every wash.",
    "details": [
      "Heavyweight jersey",
      "Boxy fit",
      "Ribbed collar",
      "Pre-washed"
    ],
    "colors": [
      {
        "name": "White",
        "hex": "#ffffff",
        "photo": ""
      },
      {
        "name": "Black",
        "hex": "#161616",
        "photo": ""
      },
      {
        "name": "Natural",
        "hex": "#e6dfcc",
        "photo": ""
      },
      {
        "name": "Vintage Navy",
        "hex": "#2c3a55",
        "photo": ""
      },
      {
        "name": "Rust",
        "hex": "#a2512e",
        "photo": ""
      },
      {
        "name": "Heather Grey",
        "hex": "#b0b0b0",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 3800,
    "compareCents": 0,
    "tags": [
      "heavyweight",
      "new"
    ],
    "kind": "tee",
    "photo": "heavy-weight-go-to-tee.jpg"
  },
  {
    "slug": "keeper-vintage-jersey-tee",
    "style": "5050",
    "name": "Keeper Vintage Jersey Tee",
    "category": "tees",
    "gender": "unisex",
    "fabric": "50% combed ring-spun cotton, 50% recycled polyester vintage jersey",
    "weight": "4.4 oz",
    "fit": "Classic, slightly roomy",
    "description": "A thin, worn-in tee with that thrifted softness. Looks like you've had it for ten years.",
    "details": [
      "Vintage 50/50 jersey",
      "Ribbed crew neck with bound collar",
      "Blind-stitched sleeves and hem",
      "Tonal inside stitching"
    ],
    "colors": [
      {
        "name": "Smoke Grey",
        "hex": "#b9b9b5",
        "photo": "keeper-vintage-jersey-tee--smoke-grey.jpg"
      },
      {
        "name": "Vintage Black",
        "hex": "#242424",
        "photo": ""
      },
      {
        "name": "Vintage White",
        "hex": "#f1ede4",
        "photo": ""
      },
      {
        "name": "Vintage Navy",
        "hex": "#2c3a55",
        "photo": "keeper-vintage-jersey-tee--vintage-navy.jpg"
      },
      {
        "name": "Vintage Pine",
        "hex": "#2f5a45",
        "photo": ""
      },
      {
        "name": "Vintage Oat",
        "hex": "#d8cdb6",
        "photo": ""
      },
      {
        "name": "Vintage Iris",
        "hex": "#8c86b8",
        "photo": "keeper-vintage-jersey-tee--vintage-iris.jpg"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 3200,
    "compareCents": 0,
    "tags": [
      "bestseller",
      "vintage",
      "jersey",
      "eco"
    ],
    "kind": "tee",
    "photo": "keeper-vintage-jersey-tee.jpg"
  },
  {
    "slug": "keepsake-vintage-tee",
    "style": "5052",
    "name": "Keepsake Vintage Tee",
    "category": "tees",
    "gender": "women",
    "fabric": "50% cotton, 50% recycled polyester vintage jersey",
    "weight": "4.4 oz",
    "fit": "Fitted, softly scooped",
    "description": "The Keeper, tailored for her. A thin, soft vintage jersey that wears like a memory.",
    "details": [
      "Vintage 50/50 jersey",
      "Scooped crew neck",
      "Side-seamed fit",
      "Blind-stitched hem"
    ],
    "colors": [
      {
        "name": "Smoke Grey",
        "hex": "#b9b9b5",
        "photo": "keepsake-vintage-tee--smoke-grey.jpg"
      },
      {
        "name": "Vintage Black",
        "hex": "#242424",
        "photo": ""
      },
      {
        "name": "Vintage White",
        "hex": "#f1ede4",
        "photo": ""
      },
      {
        "name": "Vintage Navy",
        "hex": "#2c3a55",
        "photo": "keepsake-vintage-tee--vintage-navy.jpg"
      },
      {
        "name": "Vintage Iris",
        "hex": "#8c86b8",
        "photo": "keepsake-vintage-tee--vintage-iris.jpg"
      },
      {
        "name": "Vintage Oat",
        "hex": "#d8cdb6",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 3200,
    "compareCents": 0,
    "tags": [
      "vintage",
      "jersey",
      "eco"
    ],
    "kind": "tee",
    "photo": "keepsake-vintage-tee.jpg"
  },
  {
    "slug": "eco-jersey-crew-tee",
    "style": "1973",
    "name": "Eco-Jersey Crew Tee",
    "category": "tees",
    "gender": "unisex",
    "fabric": "Eco-Jersey: cotton/recycled polyester jersey, heather",
    "weight": "",
    "fit": "Relaxed, easy",
    "description": "A heathered, buttery-soft crew tee made with recycled fiber. Light and breathable.",
    "details": [
      "Eco heather jersey",
      "Ribbed crew neck",
      "Side-seamed",
      "Made with recycled polyester"
    ],
    "colors": [
      {
        "name": "Eco True Black",
        "hex": "#141414",
        "photo": "eco-jersey-crew-tee--eco-true-black.jpg"
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": "eco-jersey-crew-tee--eco-grey.jpg"
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": "eco-jersey-crew-tee--eco-true-navy.jpg"
      },
      {
        "name": "Eco True Green",
        "hex": "#2f6a50",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      },
      {
        "name": "Eco True Red",
        "hex": "#b0262c",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 3200,
    "compareCents": 0,
    "tags": [
      "eco",
      "jersey",
      "lightweight"
    ],
    "kind": "crew",
    "photo": "eco-jersey-crew-tee.jpg"
  },
  {
    "slug": "keeper-weathered-slub-tee",
    "style": "6094",
    "name": "Keeper Weathered Slub Tee",
    "category": "tees",
    "gender": "unisex",
    "fabric": "Washed slub jersey: cotton/polyester blend",
    "weight": "",
    "fit": "Classic, relaxed",
    "description": "A textured slub jersey washed until it feels like an old favorite. Broken in, never boring.",
    "details": [
      "Weathered slub texture",
      "Garment-washed",
      "Ribbed crew neck",
      "Side-seamed"
    ],
    "colors": [
      {
        "name": "Dark Olive",
        "hex": "#4f5133",
        "photo": "keeper-weathered-slub-tee--dark-olive.jpg"
      },
      {
        "name": "Washed Black",
        "hex": "#2c2c2c",
        "photo": "keeper-weathered-slub-tee--washed-black.jpg"
      },
      {
        "name": "Heather Grey",
        "hex": "#b0b0b0",
        "photo": ""
      },
      {
        "name": "Washed Navy",
        "hex": "#2b3550",
        "photo": ""
      },
      {
        "name": "Dusty Rose",
        "hex": "#cf9fa0",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 3400,
    "compareCents": 0,
    "tags": [
      "slub",
      "vintage",
      "jersey"
    ],
    "kind": "tee",
    "photo": "keeper-weathered-slub-tee.jpg"
  },
  {
    "slug": "washed-slub-slouchy-tee",
    "style": "",
    "name": "Washed Slub Slouchy Tee",
    "category": "tees",
    "gender": "women",
    "fabric": "Washed slub jersey: cotton/polyester blend",
    "weight": "",
    "fit": "Slouchy, oversized",
    "description": "Slouchy by design, with a tiny slub texture and an oh-so-soft wash. Wear it tucked, knotted or loose.",
    "details": [
      "Slouchy oversized fit",
      "Slub texture",
      "Dropped shoulder",
      "Rolled-look hem"
    ],
    "colors": [
      {
        "name": "Washed Black",
        "hex": "#2c2c2c",
        "photo": "washed-slub-slouchy-tee--washed-black.jpg"
      },
      {
        "name": "Washed Pink",
        "hex": "#e3b9b4",
        "photo": ""
      },
      {
        "name": "Washed Sage",
        "hex": "#a3b09a",
        "photo": ""
      },
      {
        "name": "Sand",
        "hex": "#d9c9a8",
        "photo": ""
      },
      {
        "name": "Washed Navy",
        "hex": "#2b3550",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 3400,
    "compareCents": 0,
    "tags": [
      "slub",
      "vintage"
    ],
    "kind": "tee",
    "photo": "washed-slub-slouchy-tee.jpg"
  },
  {
    "slug": "kimber-slinky-jersey-tee",
    "style": "2620",
    "name": "Kimber Slinky Jersey Tee",
    "category": "tees",
    "gender": "women",
    "fabric": "Slinky jersey: cotton/modal-style blend, fluid hand",
    "weight": "",
    "fit": "Fitted, drapey",
    "description": "Fluid, slinky jersey with just enough stretch to move with you. Dressed up or dressed down.",
    "details": [
      "Slinky, fluid drape",
      "Cap sleeves",
      "Scooped neckline",
      "Soft stretch"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#161616",
        "photo": "kimber-slinky-jersey-tee--black.jpg"
      },
      {
        "name": "White",
        "hex": "#ffffff",
        "photo": ""
      },
      {
        "name": "Heather Grey",
        "hex": "#b0b0b0",
        "photo": ""
      },
      {
        "name": "Dusty Rose",
        "hex": "#cf9fa0",
        "photo": ""
      },
      {
        "name": "Sage",
        "hex": "#9fb09a",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 3400,
    "compareCents": 0,
    "tags": [
      "jersey",
      "lightweight"
    ],
    "kind": "tee",
    "photo": "kimber-slinky-jersey-tee.jpg"
  },
  {
    "slug": "slinky-v-neck-tee",
    "style": "",
    "name": "Slinky V-Neck Tee",
    "category": "tees",
    "gender": "women",
    "fabric": "Slinky jersey: cotton/modal-style blend",
    "weight": "",
    "fit": "Fitted, drapey",
    "description": "A soft, fluid V-neck that drapes like silk and layers like a dream.",
    "details": [
      "V-neckline",
      "Slinky drape",
      "Short sleeves",
      "Soft stretch"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#161616",
        "photo": ""
      },
      {
        "name": "White",
        "hex": "#ffffff",
        "photo": ""
      },
      {
        "name": "Heather Grey",
        "hex": "#b0b0b0",
        "photo": ""
      },
      {
        "name": "Navy",
        "hex": "#1b2a4a",
        "photo": ""
      },
      {
        "name": "Dusty Rose",
        "hex": "#cf9fa0",
        "photo": ""
      },
      {
        "name": "Rust",
        "hex": "#a2512e",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 3200,
    "compareCents": 0,
    "tags": [
      "jersey",
      "lightweight"
    ],
    "kind": "tee",
    "photo": "slinky-v-neck-tee.jpg"
  },
  {
    "slug": "heirloom-crew-tee",
    "style": "9070",
    "name": "Heirloom Crew Tee",
    "category": "tees",
    "gender": "unisex",
    "fabric": "Cotton-blend premium jersey",
    "weight": "",
    "fit": "Relaxed",
    "description": "A modern classic tee with a lived-in feel, meant to be handed down.",
    "details": [
      "Ribbed crew neck",
      "Premium jersey",
      "Side-seamed",
      "Tear-away label"
    ],
    "colors": [
      {
        "name": "Light Navy",
        "hex": "#2a3f5f",
        "photo": "heirloom-crew-tee--light-navy.jpg"
      },
      {
        "name": "Black",
        "hex": "#161616",
        "photo": "heirloom-crew-tee--black.jpg"
      },
      {
        "name": "White",
        "hex": "#ffffff",
        "photo": ""
      },
      {
        "name": "Heather Grey",
        "hex": "#b0b0b0",
        "photo": "heirloom-crew-tee--heather-grey.jpg"
      },
      {
        "name": "Asphalt",
        "hex": "#56575b",
        "photo": ""
      },
      {
        "name": "Nickel",
        "hex": "#b4b4af",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 2200,
    "compareCents": 3200,
    "tags": [
      "jersey"
    ],
    "kind": "crew",
    "photo": "heirloom-crew-tee.jpg"
  },
  {
    "slug": "eco-jersey-baseball-tee",
    "style": "2089",
    "name": "Eco-Jersey Baseball Tee",
    "category": "tees",
    "gender": "unisex",
    "fabric": "Eco-Jersey: cotton/recycled polyester jersey",
    "weight": "",
    "fit": "Easy, raglan sleeve",
    "description": "A vintage-feeling raglan with contrast sleeves, softly worn in. Pure outfield energy.",
    "details": [
      "Raglan contrast sleeves",
      "Ribbed crew neck",
      "Eco-Jersey fabric",
      "Side-seamed"
    ],
    "colors": [
      {
        "name": "Eco Ivory / Stars",
        "hex": "#efe9da",
        "photo": "eco-jersey-baseball-tee--eco-ivory-stars.jpg"
      },
      {
        "name": "Eco Grey / Eco True Black",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco Ivory / Eco True Navy",
        "hex": "#efe9da",
        "photo": ""
      },
      {
        "name": "Eco Ivory / Eco True Red",
        "hex": "#efe9da",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 3600,
    "compareCents": 0,
    "tags": [
      "eco",
      "jersey",
      "vintage"
    ],
    "kind": "longsleeve",
    "photo": "eco-jersey-baseball-tee.jpg"
  },
  {
    "slug": "keeper-long-sleeve-tee",
    "style": "5100BP",
    "name": "Keeper Long-Sleeve Tee",
    "category": "long-sleeves",
    "gender": "unisex",
    "fabric": "50% cotton, 50% recycled polyester vintage jersey",
    "weight": "4.4 oz",
    "fit": "Classic, slightly roomy",
    "description": "The Keeper with sleeves. The same thin, vintage softness for cooler days.",
    "details": [
      "Vintage 50/50 jersey",
      "Ribbed crew neck",
      "Ribbed cuffs",
      "Blind-stitched hem"
    ],
    "colors": [
      {
        "name": "Smoke Grey",
        "hex": "#b9b9b5",
        "photo": "keeper-long-sleeve-tee--smoke-grey.jpg"
      },
      {
        "name": "Vintage Black",
        "hex": "#242424",
        "photo": "keeper-long-sleeve-tee--vintage-black.jpg"
      },
      {
        "name": "Vintage White",
        "hex": "#f1ede4",
        "photo": ""
      },
      {
        "name": "Vintage Navy",
        "hex": "#2c3a55",
        "photo": "keeper-long-sleeve-tee--vintage-navy.jpg"
      },
      {
        "name": "Vintage Pine",
        "hex": "#2f5a45",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 3800,
    "compareCents": 0,
    "tags": [
      "vintage",
      "jersey",
      "eco"
    ],
    "kind": "longsleeve",
    "photo": "keeper-long-sleeve-tee.jpg"
  },
  {
    "slug": "go-to-long-sleeve-tee",
    "style": "",
    "name": "Go-To Long Sleeve Tee",
    "category": "long-sleeves",
    "gender": "unisex",
    "fabric": "100% combed ring-spun cotton jersey (Heather: 60% cotton, 40% polyester)",
    "weight": "4 oz",
    "fit": "Classic, contemporary cut",
    "description": "The Go-To tee with long sleeves for chillier mornings. Light, soft and easy.",
    "details": [
      "Ribbed crew neck",
      "Long sleeves",
      "Double-needle stitching",
      "Soft-wash finish"
    ],
    "colors": [
      {
        "name": "White",
        "hex": "#ffffff",
        "photo": ""
      },
      {
        "name": "Black",
        "hex": "#161616",
        "photo": ""
      },
      {
        "name": "Heather Grey",
        "hex": "#b0b0b0",
        "photo": ""
      },
      {
        "name": "Light Navy",
        "hex": "#2a3f5f",
        "photo": ""
      },
      {
        "name": "Vintage Pine",
        "hex": "#2f5a45",
        "photo": ""
      },
      {
        "name": "Heather Red",
        "hex": "#b4474b",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 3800,
    "compareCents": 0,
    "tags": [
      "jersey",
      "lightweight"
    ],
    "kind": "longsleeve",
    "photo": "go-to-long-sleeve-tee.jpg"
  },
  {
    "slug": "eco-jersey-three-quarter-raglan-henley",
    "style": "1989",
    "name": "Eco-Jersey Three-Quarter Raglan Henley",
    "category": "long-sleeves",
    "gender": "unisex",
    "fabric": "Eco-Jersey: cotton/recycled polyester jersey",
    "weight": "",
    "fit": "Easy, raglan sleeve",
    "description": "A three-quarter raglan henley in soft, recycled Eco-Jersey. Casual, effortless and always in rotation.",
    "details": [
      "3/4 raglan sleeves",
      "Button henley placket",
      "Ribbed neck",
      "Eco-Jersey fabric"
    ],
    "colors": [
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco True Black",
        "hex": "#141414",
        "photo": ""
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 3800,
    "compareCents": 0,
    "tags": [
      "eco",
      "jersey"
    ],
    "kind": "longsleeve",
    "photo": "eco-jersey-three-quarter-raglan-henley.jpg"
  },
  {
    "slug": "meegs-racerback-eco-jersey-tank",
    "style": "1927",
    "name": "Meegs Racerback Eco-Jersey Tank",
    "category": "tanks",
    "gender": "women",
    "fabric": "Eco-Jersey: cotton/recycled polyester jersey",
    "weight": "",
    "fit": "Fitted, racerback",
    "description": "A feather-light racerback tank that goes with everything and sits comfortably under anything.",
    "details": [
      "Racerback",
      "Scooped neckline",
      "Eco-Jersey fabric",
      "Slim fit"
    ],
    "colors": [
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": "meegs-racerback-eco-jersey-tank--eco-ivory.jpg"
      },
      {
        "name": "Eco True Black",
        "hex": "#141414",
        "photo": ""
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": ""
      },
      {
        "name": "Eco Pink",
        "hex": "#e8bfc0",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 2800,
    "compareCents": 0,
    "tags": [
      "eco",
      "jersey",
      "lightweight"
    ],
    "kind": "tank",
    "photo": "meegs-racerback-eco-jersey-tank.jpg"
  },
  {
    "slug": "weathered-slub-sporty-tank",
    "style": "6096",
    "name": "Weathered Slub Sporty Tank",
    "category": "tanks",
    "gender": "women",
    "fabric": "Washed slub jersey: cotton/polyester blend",
    "weight": "",
    "fit": "Relaxed, sporty",
    "description": "A relaxed slub tank with a washed-out softness. Easy for warm days.",
    "details": [
      "Weathered slub texture",
      "Sporty armholes",
      "Garment-washed",
      "Relaxed fit"
    ],
    "colors": [
      {
        "name": "Washed Black",
        "hex": "#2c2c2c",
        "photo": "weathered-slub-sporty-tank--washed-black.jpg"
      },
      {
        "name": "Washed Pink",
        "hex": "#e3b9b4",
        "photo": ""
      },
      {
        "name": "Heather Grey",
        "hex": "#b0b0b0",
        "photo": ""
      },
      {
        "name": "Washed Sage",
        "hex": "#a3b09a",
        "photo": ""
      },
      {
        "name": "Sand",
        "hex": "#d9c9a8",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 2000,
    "compareCents": 2800,
    "tags": [
      "slub",
      "vintage",
      "lightweight"
    ],
    "kind": "tank",
    "photo": "weathered-slub-sporty-tank.jpg"
  },
  {
    "slug": "slinky-tank",
    "style": "",
    "name": "Slinky Tank",
    "category": "tanks",
    "gender": "women",
    "fabric": "Slinky jersey: cotton/modal-style blend",
    "weight": "",
    "fit": "Fitted, drapey",
    "description": "A soft, slinky tank that falls just right: a layering staple from sun-up to sundown.",
    "details": [
      "Slinky, fluid drape",
      "Scooped neckline",
      "Soft stretch",
      "Slim fit"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#161616",
        "photo": "slinky-tank--black.jpg"
      },
      {
        "name": "White",
        "hex": "#ffffff",
        "photo": ""
      },
      {
        "name": "Heather Grey",
        "hex": "#b0b0b0",
        "photo": ""
      },
      {
        "name": "Dusty Rose",
        "hex": "#cf9fa0",
        "photo": ""
      },
      {
        "name": "Sage",
        "hex": "#9fb09a",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 2800,
    "compareCents": 0,
    "tags": [
      "jersey",
      "lightweight"
    ],
    "kind": "tank",
    "photo": "slinky-tank.jpg"
  },
  {
    "slug": "eco-fleece-dodgeball-joggers",
    "style": "9881",
    "name": "Eco-Fleece Dodgeball Joggers",
    "category": "pants",
    "gender": "unisex",
    "fabric": "Eco-Fleece: 50% polyester (6.25% recycled), 46% cotton (6.25% organic), 4% rayon",
    "weight": "6.5 oz",
    "fit": "Slim, tapered",
    "description": "Gym-class joggers reimagined in the softest fleece. The comfiest pair you'll own.",
    "details": [
      "Elastic waistband with drawcord",
      "Side pockets",
      "Ribbed ankle cuffs",
      "Tapered leg"
    ],
    "colors": [
      {
        "name": "Eco Black",
        "hex": "#222222",
        "photo": "eco-fleece-dodgeball-joggers--eco-black.jpg"
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": "eco-fleece-dodgeball-joggers--eco-grey.jpg"
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": "eco-fleece-dodgeball-joggers--eco-true-navy.jpg"
      },
      {
        "name": "Eco True Army Green",
        "hex": "#4a5130",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      },
      {
        "name": "Eco True Pacific Blue",
        "hex": "#3b7ea1",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 6400,
    "compareCents": 0,
    "tags": [
      "bestseller",
      "eco",
      "fleece"
    ],
    "kind": "jogger",
    "photo": "eco-fleece-dodgeball-joggers.jpg"
  },
  {
    "slug": "women-s-eco-fleece-joggers",
    "style": "",
    "name": "Women's Eco-Fleece Joggers",
    "category": "pants",
    "gender": "women",
    "fabric": "Eco-Fleece: 50% polyester (6.25% recycled), 46% cotton (6.25% organic), 4% rayon",
    "weight": "6.5 oz",
    "fit": "Relaxed, tapered",
    "description": "Soft, slightly slouchy joggers with a high-ish waist for lounging with intention.",
    "details": [
      "Elastic waistband with drawcord",
      "Side pockets",
      "Ribbed ankle cuffs",
      "Relaxed fit"
    ],
    "colors": [
      {
        "name": "Eco Black",
        "hex": "#222222",
        "photo": "women-s-eco-fleece-joggers--eco-black.jpg"
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      },
      {
        "name": "Eco Pink",
        "hex": "#e8bfc0",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "priceCents": 6200,
    "compareCents": 0,
    "tags": [
      "eco",
      "fleece"
    ],
    "kind": "jogger",
    "photo": "women-s-eco-fleece-joggers.jpg"
  },
  {
    "slug": "eco-cozy-fleece-sweatpants",
    "style": "",
    "name": "Eco-Cozy Fleece Sweatpants",
    "category": "pants",
    "gender": "unisex",
    "fabric": "Eco-Cozy Fleece: cotton/recycled polyester blend, plush brushed interior",
    "weight": "",
    "fit": "Roomy, straight leg",
    "description": "Plush, pillowy sweatpants to match the Cozy pullover. Warm, easy and low-key.",
    "details": [
      "Plush brushed interior",
      "Elastic waistband with drawcord",
      "Side pockets",
      "Straight leg with cuffs"
    ],
    "colors": [
      {
        "name": "Eco Black",
        "hex": "#222222",
        "photo": ""
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 6600,
    "compareCents": 0,
    "tags": [
      "new",
      "eco",
      "fleece"
    ],
    "kind": "jogger",
    "photo": "eco-cozy-fleece-sweatpants.jpg"
  },
  {
    "slug": "lightweight-french-terry-sweatpants",
    "style": "",
    "name": "Lightweight French Terry Sweatpants",
    "category": "pants",
    "gender": "unisex",
    "fabric": "Lightweight French Terry: cotton/recycled polyester blend, garment washed",
    "weight": "",
    "fit": "Relaxed, tapered",
    "description": "Washed-soft French terry sweats for warm-weather lounging. Light, loose and easy.",
    "details": [
      "Garment-washed finish",
      "Elastic waistband with drawcord",
      "Side pockets",
      "Ribbed ankle cuffs"
    ],
    "colors": [
      {
        "name": "Dark Grey",
        "hex": "#4b4b4d",
        "photo": "lightweight-french-terry-sweatpants--dark-grey.jpg"
      },
      {
        "name": "Washed Black",
        "hex": "#2c2c2c",
        "photo": ""
      },
      {
        "name": "Washed Navy",
        "hex": "#2b3550",
        "photo": ""
      },
      {
        "name": "Washed Sage",
        "hex": "#a3b09a",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 4100,
    "compareCents": 5800,
    "tags": [
      "french-terry",
      "lightweight"
    ],
    "kind": "jogger",
    "photo": "lightweight-french-terry-sweatpants.jpg"
  },
  {
    "slug": "eco-fleece-dodgeball-shorts",
    "style": "",
    "name": "Eco-Fleece Dodgeball Shorts",
    "category": "shorts",
    "gender": "unisex",
    "fabric": "Eco-Fleece: 50% polyester (6.25% recycled), 46% cotton (6.25% organic), 4% rayon",
    "weight": "6.5 oz",
    "fit": "Relaxed, 7-inch inseam",
    "description": "Our Dodgeball sweatpants cut for summer. Soft fleece, short length, easy fit.",
    "details": [
      "Elastic waistband with drawcord",
      "Side pockets",
      "7-inch inseam",
      "Brushed fleece interior"
    ],
    "colors": [
      {
        "name": "Eco Black",
        "hex": "#222222",
        "photo": ""
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 4800,
    "compareCents": 0,
    "tags": [
      "eco",
      "fleece"
    ],
    "kind": "shorts",
    "photo": "eco-fleece-dodgeball-shorts.jpg"
  },
  {
    "slug": "lightweight-french-terry-shorts",
    "style": "",
    "name": "Lightweight French Terry Shorts",
    "category": "shorts",
    "gender": "unisex",
    "fabric": "Lightweight French Terry: cotton/recycled polyester blend",
    "weight": "",
    "fit": "Relaxed, 6-inch inseam",
    "description": "Lightweight terry shorts, washed down for that worn-in feel. Great for the beach, great for the couch.",
    "details": [
      "Garment-washed",
      "Elastic waistband with drawcord",
      "Side pockets",
      "6-inch inseam"
    ],
    "colors": [
      {
        "name": "Dark Grey",
        "hex": "#4b4b4d",
        "photo": ""
      },
      {
        "name": "Washed Black",
        "hex": "#2c2c2c",
        "photo": ""
      },
      {
        "name": "Washed Navy",
        "hex": "#2b3550",
        "photo": ""
      },
      {
        "name": "Washed Pink",
        "hex": "#e3b9b4",
        "photo": ""
      },
      {
        "name": "Washed Sage",
        "hex": "#a3b09a",
        "photo": ""
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "priceCents": 4400,
    "compareCents": 0,
    "tags": [
      "french-terry",
      "lightweight"
    ],
    "kind": "shorts",
    "photo": "lightweight-french-terry-shorts.jpg"
  },
  {
    "slug": "eco-knit-cuff-beanie",
    "style": "",
    "name": "Eco-Knit Cuff Beanie",
    "category": "accessories",
    "gender": "unisex",
    "fabric": "Recycled acrylic and cotton rib knit",
    "weight": "",
    "fit": "One size",
    "description": "A cozy ribbed beanie that is soft against your forehead and perfect for cool mornings.",
    "details": [
      "Ribbed knit",
      "Folded cuff",
      "Stretchy one-size fit",
      "Made with recycled fiber"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#161616",
        "photo": ""
      },
      {
        "name": "Heather Grey",
        "hex": "#b0b0b0",
        "photo": "eco-knit-cuff-beanie--heather-grey.jpg"
      },
      {
        "name": "Navy",
        "hex": "#1b2a4a",
        "photo": "eco-knit-cuff-beanie--navy.jpg"
      },
      {
        "name": "Cream",
        "hex": "#f2ead6",
        "photo": ""
      },
      {
        "name": "Rust",
        "hex": "#a2512e",
        "photo": ""
      },
      {
        "name": "Sage",
        "hex": "#9fb09a",
        "photo": ""
      }
    ],
    "sizes": [
      "One Size"
    ],
    "priceCents": 2200,
    "compareCents": 0,
    "tags": [
      "eco"
    ],
    "kind": "beanie",
    "photo": "eco-knit-cuff-beanie.jpg"
  },
  {
    "slug": "everyday-canvas-tote",
    "style": "",
    "name": "Everyday Canvas Tote",
    "category": "accessories",
    "gender": "unisex",
    "fabric": "Organic cotton canvas",
    "weight": "",
    "fit": "14 x 15 in, 10 oz canvas",
    "description": "A sturdy organic cotton tote for groceries, gym clothes and everything else.",
    "details": [
      "Organic cotton canvas",
      "Reinforced handles",
      "Interior pocket",
      "Machine washable"
    ],
    "colors": [
      {
        "name": "Natural",
        "hex": "#e6dfcc",
        "photo": ""
      },
      {
        "name": "Black",
        "hex": "#161616",
        "photo": "everyday-canvas-tote--black.jpg"
      },
      {
        "name": "Navy",
        "hex": "#1b2a4a",
        "photo": ""
      },
      {
        "name": "Sage",
        "hex": "#9fb09a",
        "photo": ""
      }
    ],
    "sizes": [
      "One Size"
    ],
    "priceCents": 1800,
    "compareCents": 0,
    "tags": [
      "eco"
    ],
    "kind": "tote",
    "photo": "everyday-canvas-tote.jpg"
  },
  {
    "slug": "eco-fleece-crew-socks",
    "style": "",
    "name": "Eco-Fleece Crew Socks",
    "category": "accessories",
    "gender": "unisex",
    "fabric": "Organic cotton and recycled polyester terry blend",
    "weight": "",
    "fit": "One size",
    "description": "Cushioned crew socks that go with every lounge look. Comfort that goes all the way down.",
    "details": [
      "Cushioned footbed",
      "Ribbed cuff",
      "Reinforced heel and toe",
      "Made with recycled fiber"
    ],
    "colors": [
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": ""
      },
      {
        "name": "Eco Black",
        "hex": "#222222",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": ""
      }
    ],
    "sizes": [
      "S/M",
      "L/XL"
    ],
    "priceCents": 1800,
    "compareCents": 0,
    "tags": [
      "eco"
    ],
    "kind": "crew",
    "photo": "eco-fleece-crew-socks.jpg"
  },
  {
    "slug": "youth-keeper-tee",
    "style": "",
    "name": "Youth Keeper Tee",
    "category": "kids",
    "gender": "kids",
    "fabric": "50% cotton, 50% recycled polyester vintage jersey",
    "weight": "4.4 oz",
    "fit": "Classic youth fit",
    "description": "The Keeper in fun-sized form. Thin, soft and ready for the playground.",
    "details": [
      "Vintage 50/50 jersey",
      "Ribbed crew neck",
      "Tear-away label",
      "Tonal stitching"
    ],
    "colors": [
      {
        "name": "Smoke Grey",
        "hex": "#b9b9b5",
        "photo": ""
      },
      {
        "name": "Vintage Black",
        "hex": "#242424",
        "photo": ""
      },
      {
        "name": "Vintage White",
        "hex": "#f1ede4",
        "photo": ""
      },
      {
        "name": "Vintage Navy",
        "hex": "#2c3a55",
        "photo": ""
      },
      {
        "name": "Red",
        "hex": "#c0272d",
        "photo": "youth-keeper-tee--red.jpg"
      }
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL"
    ],
    "priceCents": 2400,
    "compareCents": 0,
    "tags": [
      "vintage",
      "jersey",
      "eco"
    ],
    "kind": "tee",
    "photo": "youth-keeper-tee.jpg"
  },
  {
    "slug": "youth-go-to-tee",
    "style": "",
    "name": "Youth Go-To Tee",
    "category": "kids",
    "gender": "kids",
    "fabric": "100% combed ring-spun cotton jersey",
    "weight": "4 oz",
    "fit": "Classic youth fit",
    "description": "A kid-size Go-To in soft combed cotton. Made to be worn all day, every day.",
    "details": [
      "Ribbed crew neck",
      "Soft-wash finish",
      "Side-seamed",
      "Tear-away label"
    ],
    "colors": [
      {
        "name": "White",
        "hex": "#ffffff",
        "photo": ""
      },
      {
        "name": "Black",
        "hex": "#161616",
        "photo": ""
      },
      {
        "name": "Heather Grey",
        "hex": "#b0b0b0",
        "photo": ""
      },
      {
        "name": "Royal",
        "hex": "#2c55a5",
        "photo": ""
      },
      {
        "name": "Sage",
        "hex": "#9fb09a",
        "photo": ""
      }
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL"
    ],
    "priceCents": 2200,
    "compareCents": 0,
    "tags": [
      "jersey",
      "lightweight"
    ],
    "kind": "tee",
    "photo": "youth-go-to-tee.jpg"
  },
  {
    "slug": "youth-champ-eco-fleece-sweatshirt",
    "style": "",
    "name": "Youth Champ Eco-Fleece Sweatshirt",
    "category": "kids",
    "gender": "kids",
    "fabric": "Eco-Fleece: 50% polyester (6.25% recycled), 46% cotton (6.25% organic), 4% rayon",
    "weight": "6.5 oz",
    "fit": "Classic youth fit",
    "description": "Our softest sweatshirt, sized for kids. Roomy and ready for all the recess.",
    "details": [
      "Crew neck",
      "Ribbed cuffs and hem",
      "Brushed fleece interior",
      "Low-impact dyes"
    ],
    "colors": [
      {
        "name": "Eco Black",
        "hex": "#222222",
        "photo": ""
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": "youth-champ-eco-fleece-sweatshirt--eco-grey.jpg"
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": "youth-champ-eco-fleece-sweatshirt--eco-true-navy.jpg"
      },
      {
        "name": "Eco True Red",
        "hex": "#b0262c",
        "photo": ""
      },
      {
        "name": "Eco Ivory",
        "hex": "#efe9da",
        "photo": ""
      }
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL"
    ],
    "priceCents": 3800,
    "compareCents": 0,
    "tags": [
      "eco",
      "fleece"
    ],
    "kind": "crew",
    "photo": "youth-champ-eco-fleece-sweatshirt.jpg"
  },
  {
    "slug": "youth-baller-eco-fleece-hoodie",
    "style": "",
    "name": "Youth Baller Eco-Fleece Hoodie",
    "category": "kids",
    "gender": "kids",
    "fabric": "Eco-Fleece: 50% polyester (6.25% recycled), 46% cotton (6.25% organic), 4% rayon",
    "weight": "6.5 oz",
    "fit": "Relaxed, cut-off sleeve",
    "description": "A cut-off sleeve hoodie for kids who like to rep the court. Cozy, quick to throw on.",
    "details": [
      "Cut-off sleeves",
      "Kangaroo pocket",
      "Drawcord hood",
      "Ribbed hem"
    ],
    "colors": [
      {
        "name": "Eco Black",
        "hex": "#222222",
        "photo": ""
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": "youth-baller-eco-fleece-hoodie--eco-grey.jpg"
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": "youth-baller-eco-fleece-hoodie--eco-true-navy.jpg"
      },
      {
        "name": "Eco True Red",
        "hex": "#b0262c",
        "photo": ""
      }
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL"
    ],
    "priceCents": 4000,
    "compareCents": 0,
    "tags": [
      "eco",
      "fleece",
      "new"
    ],
    "kind": "hoodie",
    "photo": "youth-baller-eco-fleece-hoodie.jpg"
  },
  {
    "slug": "youth-eco-fleece-joggers",
    "style": "",
    "name": "Youth Eco-Fleece Joggers",
    "category": "kids",
    "gender": "kids",
    "fabric": "Eco-Fleece: 50% polyester (6.25% recycled), 46% cotton (6.25% organic), 4% rayon",
    "weight": "6.5 oz",
    "fit": "Classic youth fit",
    "description": "Soft, stretchy joggers for the smallest lounging crew. Easy on, easy to move in.",
    "details": [
      "Elastic waistband with drawcord",
      "Side pockets",
      "Ribbed ankle cuffs",
      "Brushed fleece interior"
    ],
    "colors": [
      {
        "name": "Eco Black",
        "hex": "#222222",
        "photo": ""
      },
      {
        "name": "Eco Grey",
        "hex": "#a7a7a5",
        "photo": "youth-eco-fleece-joggers--eco-grey.jpg"
      },
      {
        "name": "Eco True Navy",
        "hex": "#1f2b45",
        "photo": ""
      },
      {
        "name": "Eco True Army Green",
        "hex": "#4a5130",
        "photo": ""
      }
    ],
    "sizes": [
      "YXS",
      "YS",
      "YM",
      "YL",
      "YXL"
    ],
    "priceCents": 3800,
    "compareCents": 0,
    "tags": [
      "eco",
      "fleece"
    ],
    "kind": "jogger",
    "photo": "youth-eco-fleece-joggers.jpg"
  }
];
