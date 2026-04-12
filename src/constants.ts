import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Bh Bandung Premium Edition',
    category: 'SOREX COLLECTION',
    price: 32500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhUqFIDPfII9RaCItcZopqa84HQao1GAU5c2tFxgNscfoQuMvOHcqbH_UfK57mEe2Whsz1Gl2VAaDI-347sCX8XyAgDpE7vs91SgfAatprFfe0bpznbU6nBb0lyvPNjGKRxIAbwXzSY1exvCwDdE_JOio75-680b5aYZfhxCvbYstrueIqFId-97KNFfu0qwsEngsSLlckSCzXN-vJNtvd5k-4yfX1RCPSZSeA2dtEXu9zEEhm2vX2NViwIhF_QUOX_2N3BLdEarA',
    description: 'Bra premium dengan desain elegan dan kenyamanan maksimal.',
    features: ['Bahan katun lembut', 'Tanpa kawat', 'Busa tipis'],
    sizes: ['34', '36', '38'],
    minOrder: '1 Lusin',
    isNew: true
  },
  {
    id: '2',
    name: 'Boxer Premium Seamless',
    category: 'COMFORT FIT',
    price: 18000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDYvpIemuFu1jVAfL4jimV_Y2szOM3fDL_goS7X-CxS1roenstrcyn_JGQdbq8XQHuE4Nuzd6InbuxX-dwYCJadKySeS84H-i-bj1cfqist3rD7UMxn8TIncruB9qaM6ouWsDeal-vA707wZUI3RxBDwompfwacEUguKw8ikfddcKSKIQxmHbwFyejGEg0rb5UmrZGvnSkv5KacLtoWUvMDk2T8mAERTG74YcJMkM6K87v1Il1i1KovwXx8YxpH3DDxkA_2l4vUOI',
    description: 'Boxer seamless untuk kenyamanan sepanjang hari tanpa bekas jahitan.',
    features: ['Seamless design', 'Elastisitas tinggi', 'Cepat kering'],
    sizes: ['M', 'L', 'XL'],
    minOrder: '12 Pcs',
    isBestSeller: true
  },
  {
    id: '3',
    name: 'Kaos Kaki Anti-Bakteri',
    category: 'EVERYDAY ESSENTIALS',
    price: 65000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbvHEbZYiFekuz_-StDHhgkk9_FOW9Q6-f3DN84awLA5cOhkxgeC3tE16-b6ZqtNXKXe-mx5brqpTPXbgaVp4PIjiqULbre0KY9vblFv2E6fjhsXG1UnCAr8SWrUDaqN2sXpgkNSDUAKvwtvtRloinb1r-_km0XBvyyPk9420etMGgiC6rNabox4C_5jiSaLdmD5kt05Gp5H0YXOeWddUh0pK9amR3luxhEbRITvnQKXo-TLLnAsGuMDwuEJS8oCLF4vZD5Vzzbkc',
    description: 'Kaos kaki dengan teknologi anti-bakteri untuk mencegah bau.',
    features: ['Anti-bakteri', 'Bahan tebal', 'Nyaman dipakai'],
    sizes: ['All Size'],
    minOrder: '1 Lusin'
  },
  {
    id: '4',
    name: 'Singlet Katun Lembut',
    category: 'MEN\'S CLASSIC',
    price: 12500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDS6CqUK52Q1ky253-48BVlU_ZQqwqCDM5rmFhHnbv-BGVhD1c6tryF9Uac2e-pdcVfQ_vkzyNi8toq5vmO9xQSR4LtzgfY5KLIMnFzA7QEfxMBETwwUU3NewduWNidPGcUlUEPEW6SQsCaJXF8u4RHKL3IeguEWoDbV1ecaxI9uI3T8cFMCk8RNV189tRDpyIH6P-E8QM7zD3P_J67PFLvUDbbAyRvPdvnR1FaIbWbriYOsA3k_Nb1tOpydav2eU7HgGZZANxd2Q',
    description: 'Singlet katun klasik untuk dalaman pria.',
    features: ['100% Katun', 'Menyerap keringat', 'Awet'],
    sizes: ['M', 'L', 'XL'],
    minOrder: '1 Lusin'
  },
  {
    id: '5',
    name: 'Bxr Mr.Dax',
    category: 'MEN\'S UNDERWEAR',
    price: 52000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRIkjIcFdcY-AhKNkPAMt6uA4dVu9wJHDH-PF1_ysy3rYmxEdYAW5rMqmInmYMtUA0ZbVpvlnIBmNuQaDOP-j2Ppb-kBqrv-i0khb94kFX86KVg7uUVtyjR6mjVddVIOOLVvVHLLxQdzxey59vC4KGmrLQrIZVtJcBp9GaV_cTTHDBODZ-AekRqPQX8d6OqvZ9BPVwA-sjyqTbmThSj6nxWhbtQpm2Uv3c8c0VHZkQXWks2fiWwoUcPXtW_FrHp1epuWcJ0AV4qpM',
    description: 'Bxr Mr.Dax dirancang untuk memberikan kenyamanan maksimal bagi pria modern dengan aktivitas tinggi. Dibuat dengan serat katun pilihan yang memberikan sirkulasi udara optimal.',
    features: ['Elastisitas Tinggi', 'Anti-Bakteri', 'Warna Tahan Lama', 'Cutting Ergonomis'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    minOrder: '1 Lusin (12 pcs)',
    badge: 'Premium Heritage'
  },
  {
    id: '6',
    name: 'Celana Dalam Seamless Wanita',
    category: 'CELANA DALAM',
    price: 25000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUTcbpGOuflyK4vhv8-C4R0sIuEgJqgej03QuslqC8bd_DHrFq9P0FzbgmJ_Ha9OIKyB4sUezB6OdcGVuVWHnB9BEnsVZJF5XPF4tPBD1rKvBJ54uGSS0ZxDXv944Ebm9F-yLGxQ9I_sn8xlWWNrZiIeYRvZizDGFoFnC2cRCccCTf7pFK_eZLRe37LNkPBuqs4EE2huei8BNkmXEPBFuvNZJoyicPHflup807DIR7UALdu6Rrc22UT_eiASzeoeqR4eopd0xTvPs',
    description: 'Celana dalam wanita tanpa jahitan untuk kenyamanan maksimal dan tidak nyeplak.',
    features: ['Seamless', 'Bahan Ice Silk', 'Anti Lembab'],
    sizes: ['M', 'L', 'XL'],
    minOrder: '1 Lusin'
  },
  {
    id: '7',
    name: 'Daster Katun Premium',
    category: 'DASTER',
    price: 45000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLRMRuKbDGREC5Nglv6tbvO8ylyvsE08ICPKrU1tLRRIquIx8dQ9UwIYv-vIEZmy9aRdW5hxiCkuBi8Nt-lF3cLqnjD_gkZHGaZqgvKRT554jTDo9bd0TYIhSSu5flLQ1KZBPJeRuKlutgdIQcr6DKJhAmnLTCrilj3yL0tkZXaxU7THbybkD-UcaUGJF0bcTYn5P2jNUHowAiQd8JN0lN2DRdHl8Ox95az5l9Xyvc1b3hWUkvzHtp0Hn0xxFNb30o9qOdMvUCwZw',
    description: 'Daster katun rayon premium yang sangat adem dan nyaman untuk dipakai sehari-hari di rumah.',
    features: ['Katun Rayon', 'Busui Friendly', 'Adem'],
    sizes: ['All Size'],
    minOrder: '1 Seri (5 pcs)'
  },
  {
    id: '8',
    name: 'Handuk Mandi Microfiber',
    category: 'HANDUK',
    price: 35000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQCZosaSPXsdDzM3ECCuvr5Z_fz3wrhmBHlb9EOb5M3e7IVokK0Z-yCSMiZsuO6dCJZCsY5CuZv0OvMy_MvDpdjIkWsp-bAFl24qjAeJL3mmrHYV2-361gbDowrTlowOG6njM4bbx96p28A6SoWUKSPJTI9Lc4s6QpOrXlg10xilD90DJXfCt6-KhjCrCU6ya2fWF0YcfxTO4t4KlULV0Y7hEhITXLHOoC2qyOwM-6exiIMiYsBkVKDVY8QR04p9fgUdzqg9AEmn0',
    description: 'Handuk mandi bahan microfiber yang sangat menyerap air dan cepat kering.',
    features: ['Microfiber', 'Daya Serap Tinggi', 'Cepat Kering'],
    sizes: ['70x140 cm'],
    minOrder: '1 Lusin'
  }
];

export const CATEGORIES = [
  { name: 'ATASAN & MINISET', icon: 'checkroom', color: 'bg-blue-50', textColor: 'text-blue-600' },
  { name: 'BOXER & SETRIT', icon: 'styler', color: 'bg-orange-50', textColor: 'text-orange-600' },
  { name: 'BRA', icon: 'favorite', color: 'bg-pink-50', textColor: 'text-pink-600' },
  { name: 'CELANA DALAM', icon: 'shopping_basket', color: 'bg-purple-50', textColor: 'text-purple-600' },
  { name: 'DASTER', icon: 'spa', color: 'bg-teal-50', textColor: 'text-teal-600' },
  { name: 'HANDUK', icon: 'layers', color: 'bg-yellow-50', textColor: 'text-yellow-600' },
  { name: 'SINGLET', icon: 'apparel', color: 'bg-green-50', textColor: 'text-green-600' },
  { name: 'SOREX', icon: 'verified', color: 'bg-red-50', textColor: 'text-red-600' },
];
