// Simple icon generator for PWA
// Creates placeholder icons in required sizes
// Replace with actual logo later

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG placeholder for each size
sizes.forEach(size => {
  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#6366f1"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size/4}" 
        fill="white" text-anchor="middle" dy=".3em">0x</text>
</svg>
  `.trim();
  
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  // For now, just create the SVG files
  // In production, convert these to PNG using a tool
  fs.writeFileSync(filepath.replace('.png', '.svg'), svg);
  console.log(`Generated ${filename}`);
});

console.log('\nNote: SVG files created. Convert to PNG using an image tool.');
console.log('Or use: https://realfavicongenerator.net/');
