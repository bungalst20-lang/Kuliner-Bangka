/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'Seafood' | 'Mie Bangka' | 'Martabak Bangka' | 'Otak-otak' | 'Lempah Kuning' | 'Kopi' | 'Dessert';

export interface LocationInfo {
  lat: number;
  lng: number;
  address: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface CulinarySpot {
  id: string;
  name: string;
  photoUrl: string;
  category: Category;
  description: string;
  rating: number; // calculated from reviews
  address: string;
  openingHours: string;
  averagePrice: number; // price in IDR, e.g. 25000
  phoneWhatsApp: string; // phone number formatted for wa.me, e.g. 628123456789
  location: LocationInfo;
  reviews: Review[];
  featured?: boolean;
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  code: string;
  discountPercentage: number;
  bannerUrl: string;
  expiryDate: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  favorites: string[]; // CulinarySpot IDs
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: 'user' | 'admin';
    favorites: string[];
  };
}
