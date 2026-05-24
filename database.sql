-- ==========================================
-- Database Schema for Kuliner Bangka
-- Kota Pangkalpinang, Bangka Belitung
-- ==========================================

CREATE DATABASE IF NOT EXISTS kuliner_bangka;
USE kuliner_bangka;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Culinary Spots Table
CREATE TABLE IF NOT EXISTS culinary_spots (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    photo_url TEXT,
    category ENUM('Seafood', 'Mie Bangka', 'Martabak Bangka', 'Otak-otak', 'Lempah Kuning', 'Kopi', 'Dessert') NOT NULL,
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 5.0,
    address TEXT NOT NULL,
    opening_hours VARCHAR(100),
    average_price INT NOT NULL,
    phone_whatsapp VARCHAR(20),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(50) PRIMARY KEY,
    spot_id VARCHAR(50),
    reviewer_name VARCHAR(100),
    reviewer_email VARCHAR(100),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date DATE,
    FOREIGN KEY (spot_id) REFERENCES culinary_spots(id) ON DELETE CASCADE
);

-- 4. Promos Table
CREATE TABLE IF NOT EXISTS promos (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percentage INT,
    banner_url TEXT,
    expiry_date DATE
);

-- 5. Favorites Table (Many-to-Many Connection)
CREATE TABLE IF NOT EXISTS favorites (
    user_id VARCHAR(50),
    spot_id VARCHAR(50),
    PRIMARY KEY (user_id, spot_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES culinary_spots(id) ON DELETE CASCADE
);

-- =========================================
-- PRE-LOADED DUMMY DATA FOR PANGKALPINANG
-- =========================================

-- Insert Default Users (Admin & User)
INSERT INTO users (id, username, email, password, role) VALUES 
('u1', 'Budi Bangka', 'user@kulinerbangka.com', 'password123', 'user'),
('u2', 'Admin Pangkalpinang', 'admin@kulinerbangka.com', 'admin123', 'admin');

-- Insert Culinary Spots
INSERT INTO culinary_spots (id, name, photo_url, category, description, rating, address, opening_hours, average_price, phone_whatsapp, lat, lng, featured) VALUES 
('1', 'Mie Koba Iskandar', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=800', 'Mie Bangka', 'Mie Koba Iskandar merupakan ikon kuliner mi khas Bangka yang sangat legendaris. Sajian mi kenyal ini disiram dengan kuah kaldu ikan tenggiri yang kental, manis, gurih, serta beraroma cengkih. Dilengkapi taburan taoge segar, bawang goreng, seledri, cincangan telur rebus, serta kucuran jeruk kunci (nipis lokal Bangka) asam segar yang membangkitkan selera makan.', 4.8, 'Jl. Balai No.83, Gedung Nasional, Kec. Taman Sari, Pangkalpinang, Bangka Belitung', '08:00 - 20:00 WIB', 20000, '6282177000123', -2.124618, 106.111822, TRUE),
('2', 'Kopi Tung Tau - Pangkalpinang', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800', 'Kopi', 'Warung Kopi Tung Tau telah setia menemani pecinta kopi sejak tahun 1938. Menggunakan metode seduh tradisional legendaris tarik kopi saringan kain sutra serta biji kopi robusta lokal berkualitas, menghasilkan rasa kopi O hitam yang pekat nan harum. Pasangan terbaik dari minuman hits ini adalah Roti Panggang Gandum bakar arang tradisional isi selai srikaya buatan sendiri yang gurih dan legit.', 4.7, 'Jl. Soekarno Hatta No.7, Kel. Semabung Baru, Kec. Girimaya, Kota Pangkalpinang, Bangka Belitung', 'Buka 24 Jam', 25000, '6281923456789', -2.138950, 106.121500, TRUE),
('3', 'Otak-Otak Amui', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800', 'Otak-otak', 'Otak-Otak Amui menyajikan penganan otak-otak panggang ikan tenggiri premium yang dibungkus daun pisang segar berkualitas tinggi. Dibakar di atas bara arang menghasilkan rasa gurih lembut beraroma panggangan khas Bangka Belitung. Keunikan utama toko ini terletak pada 3 rasa cuka cocolan otentik: Cuka Tauco kedelai yang asin-manis, Cuka Terasi Bangka pedas gurih, dan Cuka Kacang kental bertekstur gurih pedas asam.', 4.9, 'Jl. Melintas No.18, Kel. Bintang, Kec. Rangkui, Kota Pangkalpinang, Bangka Belitung', '09:00 - 18:00 WIB', 30000, '6285266881234', -2.126500, 106.113200, TRUE),
('4', 'Lempah Kuning Muara', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800', 'Lempah Kuning', 'Lempah Kuning Muara adalah surga bagi penikmat hidangan sup kunyit asam pedas tradisional Bangka. Menyajikan potongan kepala/badan ikan Kakap Merah, ikan bawal, mas atau kerisi segar tenggiri hasil tangkapan nelayan lokal hari itu juga. Kuah lempah diracik dengan bumbu halus kunyit, cabai rawit merah, asam jawa, terasi Bangka, dan irisan nanas mtang.', 4.6, 'Pelabuhan Acuan, Kawasan Kelapa Tujuh, Pangkalpinang, Bangka Belitung', '10:00 - 16:00 WIB', 50000, '6287755443211', -2.122100, 106.135400, FALSE),
('5', 'Seafood Mr. Adox', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800', 'Seafood', 'Seafood Mr. Adox adalah rumah makan seafood paling prestisius di Pangkalpinang. Menawarkan beraneka hidangan laut segar hidup (live seafood) seperti Kepiting Bakau Saus Padang, Cumi Goreng Mentega, Udang Satang Bakar madu, serta kerrang dara rebus bumbu cuka pedas khas.', 4.6, 'Jl. Alexander Raya No. 1, Kel. Air Itam, Kec. Bukit Intan, Kota Pangkalpinang, Bangka Belitung', '11:00 - 22:00 WIB', 85000, '628117170099', -2.152300, 106.143200, TRUE),
('6', 'Martabak Asli Bangka Acun', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800', 'Martabak Bangka', 'Martabak Acun merupakan legenda hidup sajian Hok-Lo-Pan asli Bangka Belitung. Adonan martabak difermentasi manual dengan resep rahasia turun-temurun, menghasilkan sensasi tebal-lembut bersarang sempurna. Diolesi mentega Wijsman Belanda melimpah, ditambahkan parutan keju Kraft panjang berlimpah, cokelat meises butir premium, kacang goreng renyah cincang dan taburan wijen harum, memberikan cita rasa premium sejati martabak manis Bangka.', 4.9, 'Jl. Jenderal Sudirman No.95, Taman Sari, Kota Pangkalpinang, Bangka Belitung', '16:00 - 23:00 WIB', 45000, '628127373889', -2.122300, 106.111200, TRUE);

-- Insert Reviews
INSERT INTO reviews (id, spot_id, reviewer_name, reviewer_email, rating, comment, date) VALUES 
('r1', '1', 'Andi Wijaya', 'andi@gmail.com', 5, 'Rasa kuah tenggirinya juara banget! Gurih manisnya pas ditambah jeruk kunci bikin segar luar biasa. Sangat direkomendasikan jika ke Pangkalpinang.', '2026-05-12'),
('r2', '1', 'Siska Putri', 'siska@aol.com', 4, 'Makanan paling wajib dicoba kalau singgah di Bangka, harga murah meriah porsi mengenyangkan.', '2026-05-20'),
('r3', '2', 'Irwan Saputra', 'irwan@gmail.com', 5, 'Tempat nongkrong legendaris 24 jam. Kopi hitam pekat disanding roti bakar srikaya gandum paling mantap sedunia.', '2026-04-18'),
('r4', '3', 'Hendra Tan', 'hendra@gmail.com', 5, 'Ikannya terasa sekali, tidak terlalu banyak tepung. Saus tauco dan terasinya sangat authentic Bangka!', '2026-05-01'),
('r5', '4', 'Yanto Lubis', 'yanto@lubis.com', 4, 'Lempah kepala ikan bawal nanas rasanya segar sekali. Pedas gurihnya nikmat dimakan dengan nasi hangat saat siang hari.', '2026-05-15'),
('r6', '5', 'Rina Gunawan', 'rina@gun.com', 5, 'Kepiting saus Padang-nya gurih pedas melimpah ruah, ikan bakar gurame segar pas banget bumbunya meresap sampai ke serat daging terdalam.', '2026-05-22'),
('r7', '6', 'Dedi Hartono', 'dedi@gmail.com', 5, 'Martabak paling lembut yang pernah saya makan. Harganya sebanding dengan kualitas mentega premiumnya yang wangi melimpah.', '2026-05-23');

-- Insert Promos
INSERT INTO promos (id, title, description, code, discount_percentage, banner_url, expiry_date) VALUES 
('p1', 'Makan Hemat Lempah Kuning', 'Diskon 20% khusus untuk menu Lempah Kuning Kakap Seafood Khas Bangka Belitung.', 'LEMPAH20', 20, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200', '2026-12-31'),
('p2', 'Kopi O Pagi Seru Tung Tau', 'Beli Roti Panggang Gandum gratis Kopi O pekat legendaris di Pangkalpinang.', 'TUNGTAUCOFFEE', 15, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1200', '2026-12-31');

-- Insert User Favorites
INSERT INTO favorites (user_id, spot_id) VALUES 
('u1', '1'),
('u1', '3');
