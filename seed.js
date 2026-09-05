const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./model/User');
const Product = require('./model/Product');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

// Using Lorem Picsum with a fixed seed per product so images always load
// reliably (no broken-image risk from hotlinking specific stock photo IDs).
// Swap these for real product photography (or Cloudinary URLs) whenever
// you have actual images to use instead.
const img = (seed) => `https://picsum.photos/seed/${seed}/500/500`;

const importData = async () => {
    try {
        await User.deleteMany();
        await Product.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        await User.create({
            name: 'Admin User',
            email: 'admin@shopfusion.com',
            password: hashedPassword,
            role: 'admin'
        });

        const products = [
            // ---------- Smartphones ----------
            {
                name: 'Galaxy Pulse X5', brand: 'Galaxy', category: 'smartphones',
                price: 34999, originalPrice: 39999, stock: 25,
                description: '6.7" AMOLED display, 5000mAh battery, triple camera system with 108MP main sensor.',
                imageUrl: img('phone-pulse-x5'), ratings: 4.6, numReviews: 132
            },
            {
                name: 'Nova 12 Pro', brand: 'Nova', category: 'smartphones',
                price: 27999, originalPrice: 31999, stock: 30,
                description: '6.1" OLED display, 5G ready, 256GB storage, dual rear camera with night mode.',
                imageUrl: img('phone-nova-12'), ratings: 4.5, numReviews: 167
            },
            {
                name: 'Orbit Lite S', brand: 'Orbit', category: 'smartphones',
                price: 15999, originalPrice: 18999, stock: 40,
                description: 'Budget-friendly 5G phone with 6.5" display and 48MP camera.',
                imageUrl: img('phone-orbit-lite'), ratings: 4.1, numReviews: 95
            },
            {
                name: 'Zenith Fold 3', brand: 'Zenith', category: 'smartphones',
                price: 89999, originalPrice: 99999, stock: 10,
                description: 'Foldable 7.6" display, flagship processor, multitasking made effortless.',
                imageUrl: img('phone-zenith-fold'), ratings: 4.8, numReviews: 41
            },

            // ---------- Laptops ----------
            {
                name: 'UltraBook Slim 14"', brand: 'NexTech', category: 'laptops',
                price: 54999, originalPrice: 62999, stock: 12,
                description: 'Intel Core i5, 16GB RAM, 512GB SSD, 14-inch Full HD display, all-day battery.',
                imageUrl: img('laptop-ultrabook-slim'), ratings: 4.7, numReviews: 88
            },
            {
                name: 'ProBook 15" Gaming', brand: 'NexTech', category: 'laptops',
                price: 89999, originalPrice: 99999, stock: 8,
                description: 'AMD Ryzen 7, RTX graphics, 16GB RAM, 1TB SSD, 144Hz display for smooth gaming.',
                imageUrl: img('laptop-probook-gaming'), ratings: 4.8, numReviews: 41
            },
            {
                name: 'AirLight 13" Ultraportable', brand: 'CloudLine', category: 'laptops',
                price: 62999, originalPrice: 69999, stock: 18,
                description: 'Fanless design, 18-hour battery, weighs under 1kg for life on the move.',
                imageUrl: img('laptop-airlight-13'), ratings: 4.5, numReviews: 60
            },
            {
                name: 'WorkStation X1 Pro', brand: 'CloudLine', category: 'laptops',
                price: 124999, originalPrice: 139999, stock: 6,
                description: 'Intel Core i9, 32GB RAM, 1TB SSD, 4K display for creative professionals.',
                imageUrl: img('laptop-workstation-x1'), ratings: 4.9, numReviews: 22
            },

            // ---------- Audio ----------
            {
                name: 'AirBuds Pro', brand: 'SoundWave', category: 'audio',
                price: 4999, originalPrice: 6999, stock: 60,
                description: 'Active noise cancellation, 30-hour battery life with charging case, IPX4 water resistance.',
                imageUrl: img('audio-airbuds-pro'), ratings: 4.4, numReviews: 210
            },
            {
                name: 'BassBoost Over-Ear', brand: 'SoundWave', category: 'audio',
                price: 2999, originalPrice: 3999, stock: 45,
                description: 'Deep bass, 40mm drivers, foldable design, 25-hour wireless playback.',
                imageUrl: img('audio-bassboost-overear'), ratings: 4.1, numReviews: 63
            },
            {
                name: 'EchoSphere Bluetooth Speaker', brand: 'EchoSphere', category: 'audio',
                price: 3499, originalPrice: 4499, stock: 38,
                description: '360-degree sound, waterproof IPX7, 12-hour battery, perfect for outdoor use.',
                imageUrl: img('audio-echosphere-speaker'), ratings: 4.3, numReviews: 77
            },
            {
                name: 'StudioMic USB Condenser', brand: 'SoundWave', category: 'audio',
                price: 5499, originalPrice: 6499, stock: 22,
                description: 'Studio-quality recording, plug-and-play USB, ideal for podcasts and streaming.',
                imageUrl: img('audio-studiomic-usb'), ratings: 4.6, numReviews: 34
            },

            // ---------- Wearables ----------
            {
                name: 'FitTrack Pro Smartwatch', brand: 'FitTrack', category: 'wearables',
                price: 7999, originalPrice: 9999, stock: 40,
                description: 'Heart rate & SpO2 monitoring, GPS, 7-day battery, AMOLED always-on display.',
                imageUrl: img('wearable-fittrack-pro'), ratings: 4.3, numReviews: 156
            },
            {
                name: 'FitTrack Lite Fitness Band', brand: 'FitTrack', category: 'wearables',
                price: 1999, originalPrice: 2799, stock: 55,
                description: 'Slim fitness tracker with step counting, sleep tracking, 10-day battery.',
                imageUrl: img('wearable-fittrack-lite'), ratings: 4.0, numReviews: 122
            },
            {
                name: 'PulseRing Smart Ring', brand: 'PulseRing', category: 'wearables',
                price: 12999, originalPrice: 14999, stock: 15,
                description: 'Track sleep, activity, and recovery discreetly with a titanium smart ring.',
                imageUrl: img('wearable-pulsering'), ratings: 4.4, numReviews: 29
            },
            {
                name: 'VisionX AR Smart Glasses', brand: 'VisionX', category: 'wearables',
                price: 24999, originalPrice: 28999, stock: 9,
                description: 'Lightweight AR glasses with notifications, audio, and camera built in.',
                imageUrl: img('wearable-visionx-glasses'), ratings: 4.2, numReviews: 18
            },

            // ---------- Gaming ----------
            {
                name: 'GameForce Wireless Controller', brand: 'GameForce', category: 'gaming',
                price: 3499, originalPrice: 4499, stock: 35,
                description: 'Dual vibration motors, 20-hour battery, compatible with PC and consoles.',
                imageUrl: img('gaming-gameforce-controller'), ratings: 4.5, numReviews: 74
            },
            {
                name: 'GameForce Pro Gaming Headset', brand: 'GameForce', category: 'gaming',
                price: 3999, originalPrice: 4999, stock: 28,
                description: '7.1 surround sound, noise-cancelling mic, RGB lighting, memory foam ear cushions.',
                imageUrl: img('gaming-gameforce-headset'), ratings: 4.4, numReviews: 55
            },
            {
                name: 'RapidFire Mechanical Keyboard', brand: 'RapidFire', category: 'gaming',
                price: 5999, originalPrice: 6999, stock: 20,
                description: 'Hot-swappable switches, per-key RGB, aluminum frame built for competitive play.',
                imageUrl: img('gaming-rapidfire-keyboard'), ratings: 4.7, numReviews: 48
            },
            {
                name: 'PrecisionAim Gaming Mouse', brand: 'RapidFire', category: 'gaming',
                price: 2499, originalPrice: 2999, stock: 42,
                description: '16000 DPI optical sensor, 6 programmable buttons, ultra-lightweight design.',
                imageUrl: img('gaming-precisionaim-mouse'), ratings: 4.5, numReviews: 66
            },

            // ---------- Accessories ----------
            {
                name: 'PowerCore 20000mAh Power Bank', brand: 'PowerCore', category: 'accessories',
                price: 1799, originalPrice: 2299, stock: 80,
                description: 'Fast charging 22.5W, dual USB-A + USB-C output, digital charge display.',
                imageUrl: img('accessory-powercore-bank'), ratings: 4.2, numReviews: 98
            },
            {
                name: 'ClearView USB-C Hub 7-in-1', brand: 'ClearView', category: 'accessories',
                price: 2299, originalPrice: 2999, stock: 65,
                description: 'HDMI, USB 3.0, SD card reader, 100W PD charging - all in one compact hub.',
                imageUrl: img('accessory-clearview-hub'), ratings: 4.3, numReviews: 47
            },
            {
                name: 'ChargeFast Wireless Charging Pad', brand: 'PowerCore', category: 'accessories',
                price: 1299, originalPrice: 1699, stock: 70,
                description: '15W fast wireless charging, LED indicator, non-slip surface for any phone.',
                imageUrl: img('accessory-chargefast-pad'), ratings: 4.1, numReviews: 84
            },
            {
                name: 'GuardCase Protective Phone Case', brand: 'GuardCase', category: 'accessories',
                price: 799, originalPrice: 1199, stock: 120,
                description: 'Military-grade drop protection, slim profile, wireless charging compatible.',
                imageUrl: img('accessory-guardcase-case'), ratings: 4.0, numReviews: 143
            }
        ];

        await Product.insertMany(products);

        console.log(`✅ Data Imported Successfully! (${products.length} products, 1 admin user)`);
        process.exit();
    } catch (error) {
        console.error(`❌ Error with data import: ${error.message}`);
        process.exit(1);
    }
};

importData();
