/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import { Category, CulinarySpot, Promo, Review, User } from "./types";

const app = express();
const PORT = 3000;
const DATA_STORE_PATH = path.join(process.cwd(), "data-store.json");
const JWT_SECRET = process.env.JWT_SECRET || "bangka_kuliner_key_super_secret_2026";

app.use(express.json());

// Helper to load and save data from data-store.json
interface DBTemplate {
  users: User & { password?: string }[];
  promos: Promo[];
  culinarySpots: CulinarySpot[];
}

function loadDB(): DBTemplate {
  try {
    if (fs.existsSync(DATA_STORE_PATH)) {
      const raw = fs.readFileSync(DATA_STORE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error loading data-store.json, creating a new memory DB", err);
  }
  return { users: [], promos: [], culinarySpots: [] };
}

function saveDB(data: DBTemplate) {
  try {
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving data-store.json", err);
  }
}

// Ensure database file initialized cleanly
const db = loadDB();
console.log(`Loaded JSON db with ${db.users.length} users, ${db.culinarySpots.length} culinary spots, and ${db.promos.length} promotions.`);

// === AUTHENTICATION MIDDLEWARES ===
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: "user" | "admin";
  };
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ message: "Token tidak valid atau kedaluwarsa." });
      return;
    }
    req.user = decoded;
    next();
  });
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Akses khusus admin ditolak." });
    return;
  }
  next();
};

// === API ROUTES ===

// 1. Auth Endpoint: Register
app.post("/api/auth/register", (req: Request, res: Response): void => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    res.status(400).json({ message: "Email, password, dan username wajib diisi." });
    return;
  }

  const currentDb = loadDB();
  const existingUser = currentDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (existingUser) {
    res.status(400).json({ message: "Email sudah terdaftar." });
    return;
  }

  const newUser: any = {
    id: "u_" + Date.now(),
    email: email.toLowerCase(),
    password: password, // For simplicity stored directly, warning added in login helper
    username,
    role: "user",
    favorites: []
  };

  currentDb.users.push(newUser);
  saveDB(currentDb);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, username: newUser.username, role: newUser.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    token,
    user: userWithoutPassword
  });
});

// 2. Auth Endpoint: Login
app.post("/api/auth/login", (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email dan password wajib diisi." });
    return;
  }

  const currentDb = loadDB();
  const user = currentDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== password) {
    res.status(400).json({ message: "Email atau password salah." });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    token,
    user: userWithoutPassword
  });
});

// 3. Auth Endpoint: Get Profile
app.get("/api/auth/me", authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(404).json({ message: "User tidak ditemukan." });
    return;
  }
  const currentDb = loadDB();
  const user = currentDb.users.find(u => u.id === req.user?.id);
  if (!user) {
    res.status(404).json({ message: "Profil tidak ditemukan di database." });
    return;
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// 4. Favorites Toggle
app.post("/api/auth/favorites/:spotId", authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const { spotId } = req.params;
  const currentDb = loadDB();
  const userIndex = currentDb.users.findIndex(u => u.id === req.user?.id);

  if (userIndex === -1) {
    res.status(404).json({ message: "User tidak ditemukan." });
    return;
  }

  const userObj = currentDb.users[userIndex];
  if (!userObj.favorites) {
    userObj.favorites = [];
  }

  const favIndex = userObj.favorites.indexOf(spotId);
  let isFavorite = false;

  if (favIndex === -1) {
    userObj.favorites.push(spotId);
    isFavorite = true;
  } else {
    userObj.favorites.splice(favIndex, 1);
    isFavorite = false;
  }

  currentDb.users[userIndex] = userObj;
  saveDB(currentDb);

  res.json({ 
    message: isFavorite ? "Ditambahkan ke favorit" : "Dihapus dari favorit",
    favorites: userObj.favorites,
    isFavorite 
  });
});

// === CULINARY SPOTS ROUTES ===

// 5. Get All Culinary Spots with Search, Category Filter, and Sorting
app.get("/api/spots", (req: Request, res: Response) => {
  const { search, category, sortBy } = req.query;
  const currentDb = loadDB();
  let results = [...currentDb.culinarySpots];

  // Search filter
  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(
      spot => spot.name.toLowerCase().includes(q) || 
              spot.description.toLowerCase().includes(q) ||
              spot.address.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (category && category !== "Semua") {
    results = results.filter(spot => spot.category.toLowerCase() === (category as string).toLowerCase());
  }

  // Sorting
  if (sortBy === "rating") {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "price_asc") {
    results.sort((a, b) => a.averagePrice - b.averagePrice);
  } else if (sortBy === "price_desc") {
    results.sort((a, b) => b.averagePrice - a.averagePrice);
  } else {
    // Default newest/id sort or featured first
    results.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }

  res.json(results);
});

// 6. Get Single Spot
app.get("/api/spots/:id", (req: Request, res: Response): void => {
  const currentDb = loadDB();
  const spot = currentDb.culinarySpots.find(s => s.id === req.params.id);
  if (!spot) {
    res.status(404).json({ message: "Tempat kuliner tidak ditemukan." });
    return;
  }
  res.json(spot);
});

// 7. Admin CRUD: Create Spot
app.post("/api/spots", authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const { name, photoUrl, category, description, address, openingHours, averagePrice, phoneWhatsApp, location } = req.body;

  if (!name || !category || !description || !address || !openingHours || !averagePrice) {
    res.status(400).json({ message: "Mohon isi semua data wajib kuliner spot." });
    return;
  }

  const currentDb = loadDB();
  const newSpot: CulinarySpot = {
    id: "spot_" + Date.now(),
    name,
    photoUrl: photoUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
    category: category as Category,
    description,
    rating: 5.0, // default rating to start
    address,
    openingHours,
    averagePrice: Number(averagePrice),
    phoneWhatsApp: phoneWhatsApp || "6281234567890",
    location: {
      lat: location?.lat ? Number(location.lat) : -2.124618,
      lng: location?.lng ? Number(location.lng) : 106.111822,
      address: location?.address || address
    },
    reviews: []
  };

  currentDb.culinarySpots.push(newSpot);
  saveDB(currentDb);
  res.status(201).json(newSpot);
});

// 8. Admin CRUD: Update Spot
app.put("/api/spots/:id", authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { name, photoUrl, category, description, address, openingHours, averagePrice, phoneWhatsApp, location, featured } = req.body;

  const currentDb = loadDB();
  const idx = currentDb.culinarySpots.findIndex(s => s.id === id);

  if (idx === -1) {
    res.status(404).json({ message: "Tempat kuliner tidak ditemukan." });
    return;
  }

  const existingSpot = currentDb.culinarySpots[idx];
  const updatedSpot: CulinarySpot = {
    ...existingSpot,
    name: name || existingSpot.name,
    photoUrl: photoUrl || existingSpot.photoUrl,
    category: (category as Category) || existingSpot.category,
    description: description || existingSpot.description,
    address: address || existingSpot.address,
    openingHours: openingHours || existingSpot.openingHours,
    averagePrice: averagePrice !== undefined ? Number(averagePrice) : existingSpot.averagePrice,
    phoneWhatsApp: phoneWhatsApp || existingSpot.phoneWhatsApp,
    featured: featured !== undefined ? featured : existingSpot.featured,
    location: {
      lat: location?.lat ? Number(location.lat) : existingSpot.location.lat,
      lng: location?.lng ? Number(location.lng) : existingSpot.location.lng,
      address: location?.address || existingSpot.location.address || address || existingSpot.address
    }
  };

  currentDb.culinarySpots[idx] = updatedSpot;
  saveDB(currentDb);
  res.json(updatedSpot);
});

// 9. Admin CRUD: Delete Spot
app.delete("/api/spots/:id", authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const currentDb = loadDB();
  const initialLen = currentDb.culinarySpots.length;
  currentDb.culinarySpots = currentDb.culinarySpots.filter(s => s.id !== id);

  if (currentDb.culinarySpots.length === initialLen) {
    res.status(404).json({ message: "Tempat kuliner tidak ditemukan." });
    return;
  }

  saveDB(currentDb);
  res.json({ message: "Tempat kuliner berhasil dihapus.", id });
});

// 10. Reviews: Rate & Comment on Spot
app.post("/api/spots/:id/reviews", authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    res.status(400).json({ message: "Bintang rating dan komentar harus diisi." });
    return;
  }

  const currentDb = loadDB();
  const idx = currentDb.culinarySpots.findIndex(s => s.id === id);

  if (idx === -1) {
    res.status(404).json({ message: "Tempat kuliner tidak ditemukan." });
    return;
  }

  const newReview: Review = {
    id: "r_" + Date.now(),
    reviewerName: req.user?.username || "Reviewer Anonim",
    reviewerEmail: req.user?.email || "anonymous@kulinerbangka.com",
    rating: Number(rating),
    comment,
    date: new Date().toISOString().split("T")[0]
  };

  const spot = currentDb.culinarySpots[idx];
  if (!spot.reviews) {
    spot.reviews = [];
  }
  
  spot.reviews.unshift(newReview);

  // Recalculate average rating
  const totalStars = spot.reviews.reduce((sum, r) => sum + r.rating, 0);
  spot.rating = parseFloat((totalStars / spot.reviews.length).toFixed(1));

  currentDb.culinarySpots[idx] = spot;
  saveDB(currentDb);

  res.status(201).json({
    message: "Ulasan berhasil dikirim!",
    review: newReview,
    newRating: spot.rating
  });
});

// === PROMO ENDPOINTS ===

// 11. Get Active Promos
app.get("/api/promos", (req: Request, res: Response) => {
  const currentDb = loadDB();
  res.json(currentDb.promos || []);
});

// 12. Admin CRUD: Create Promo
app.post("/api/promos", authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const { title, description, code, discountPercentage, bannerUrl, expiryDate } = req.body;

  if (!title || !description || !code || !discountPercentage) {
    res.status(400).json({ message: "Isi semua data promo yang wajib." });
    return;
  }

  const currentDb = loadDB();
  const newPromo: Promo = {
    id: "promo_" + Date.now(),
    title,
    description,
    code: code.toUpperCase(),
    discountPercentage: Number(discountPercentage),
    bannerUrl: bannerUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200",
    expiryDate: expiryDate || "2026-12-31"
  };

  if (!currentDb.promos) currentDb.promos = [];
  currentDb.promos.push(newPromo);
  saveDB(currentDb);

  res.status(201).json(newPromo);
});

// 13. Admin CRUD: Update Promo
app.put("/api/promos/:id", authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { title, description, code, discountPercentage, bannerUrl, expiryDate } = req.body;

  const currentDb = loadDB();
  if (!currentDb.promos) currentDb.promos = [];
  const idx = currentDb.promos.findIndex(p => p.id === id);

  if (idx === -1) {
    res.status(404).json({ message: "Promo tidak ditemukan." });
    return;
  }

  const existing = currentDb.promos[idx];
  currentDb.promos[idx] = {
    ...existing,
    title: title || existing.title,
    description: description || existing.description,
    code: code ? code.toUpperCase() : existing.code,
    discountPercentage: discountPercentage !== undefined ? Number(discountPercentage) : existing.discountPercentage,
    bannerUrl: bannerUrl || existing.bannerUrl,
    expiryDate: expiryDate || existing.expiryDate
  };

  saveDB(currentDb);
  res.json(currentDb.promos[idx]);
});

// 14. Admin CRUD: Delete Promo
app.delete("/api/promos/:id", authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const currentDb = loadDB();
  if (!currentDb.promos) currentDb.promos = [];
  const initialLen = currentDb.promos.length;
  currentDb.promos = currentDb.promos.filter(p => p.id !== id);

  if (currentDb.promos.length === initialLen) {
    res.status(404).json({ message: "Promo tidak ditemukan." });
    return;
  }

  saveDB(currentDb);
  res.json({ message: "Promo Berhasil dihapus.", id });
});

// === ADMIN USER PANELS ENDPOINTS ===

// 15. Get All Users
app.get("/api/users", authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const currentDb = loadDB();
  // Don't send real passwords in API responses
  const cleanUsers = currentDb.users.map(({ password, ...u }) => u);
  res.json(cleanUsers);
});

// 16. Update User Role
app.put("/api/users/:id/role", authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== "admin" && role !== "user") {
    res.status(400).json({ message: "Role harus 'user' atau 'admin'." });
    return;
  }

  const currentDb = loadDB();
  const idx = currentDb.users.findIndex(u => u.id === id);

  if (idx === -1) {
    res.status(404).json({ message: "Pengguna tidak ditemukan." });
    return;
  }

  currentDb.users[idx].role = role;
  saveDB(currentDb);
  res.json({ message: `Role pengguna berhasil diubah ke ${role}`, id });
});

// 17. Delete User
app.delete("/api/users/:id", authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const currentDb = loadDB();
  const initialLen = currentDb.users.length;
  currentDb.users = currentDb.users.filter(u => u.id !== id);

  if (currentDb.users.length === initialLen) {
    res.status(404).json({ message: "Pengguna tidak ditemukan." });
    return;
  }

  saveDB(currentDb);
  res.json({ message: "Pengguna berhasil dihapus.", id });
});


// === VITE / STATIC ROUTING ===

async function startServer() {
  // Setup Vite middleware inside Express in development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static assets
    app.use(express.static(distPath));
    
    // Serve SPA index for all other requests
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(`🍽️  Kuliner Bangka Backend & Frontend Live!`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}

startServer();
