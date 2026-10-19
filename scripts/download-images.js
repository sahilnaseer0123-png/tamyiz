import fs from 'fs';
import path from 'path';
import https from 'https';

const images = [
  // Categories
  {
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/categories/apparel.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/categories/outerwear.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/categories/edc.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/categories/fragrance.jpg'
  },
  
  // Product 1: Horizon 480GSM Particle Hoodie
  {
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p1-hoodie-front.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p1-hoodie-back.jpg'
  },

  // Product 2: Monolith Heavyweight Boxy T-Shirt
  {
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p2-tee-black-front.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p2-tee-black-back.jpg'
  },

  // Product 3: Raw Horizon Off-White Tee
  {
    url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p3-tee-white-front.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p3-tee-white-back.jpg'
  },

  // Product 4: Eclipse French Terry Sweatshirt
  {
    url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p4-sweatshirt-front.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p4-sweatshirt-back.jpg'
  },

  // Product 5: Zero-Gravity Tactical Bomber
  {
    url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p5-bomber-front.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p5-bomber-back.jpg'
  },

  // Product 6: Horizon Ripstop Overshirt
  {
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p6-overshirt-front.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p6-overshirt-back.jpg'
  },

  // Product 7: Monolith Modular Cargo Trousers
  {
    url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p7-cargo-front.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p7-cargo-back.jpg'
  },

  // Product 8: Horizon Precision Chronograph
  {
    url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p8-watch-front.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1539874701005-7284f33d7b87?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p8-watch-back.jpg'
  },

  // Product 9: Magnetic Carbon Fiber Cardholder
  {
    url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p9-wallet-front.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1606503829058-c6183d3ffea7?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p9-wallet-back.jpg'
  },

  // Product 10: Disruption Modular Crossbody Sling
  {
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p10-bag-front.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p10-bag-back.jpg'
  },

  // Product 11: Horizon Extrait De Parfum (50ml)
  {
    url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p11-perfume-front.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p11-perfume-back.jpg'
  },

  // Product 12: Distinct Horizon Low-Top Sneaker
  {
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p12-sneaker-front.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    dest: 'public/assets/images/products/p12-sneaker-back.jpg'
  }
];

function download(item) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(item.dest);
    https.get(item.url, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        https.get(response.headers.location, resp => {
          resp.pipe(file);
          file.on('finish', () => { file.close(); resolve(item.dest); });
        }).on('error', err => { fs.unlink(item.dest, () => {}); reject(err); });
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(item.dest); });
      } else {
        reject(new Error(`Status ${response.statusCode} for ${item.url}`));
      }
    }).on('error', err => {
      fs.unlink(item.dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log(`Downloading ${images.length} assets...`);
  for (const img of images) {
    try {
      await download(img);
      console.log(`Saved: ${img.dest}`);
    } catch (e) {
      console.error(`Failed ${img.dest}: ${e.message}`);
    }
  }
  console.log('All downloads finished.');
}

run();
