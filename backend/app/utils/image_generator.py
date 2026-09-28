import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from app.config import settings

def generate_satellite_cyclone_image(
    cyclone_name: str,
    wind_speed: float,
    category: str,
    output_filename: str,
    is_demo: bool = True
) -> str:
    """
    Generates a realistic multi-spectral IR/Doppler synthetic satellite image of a tropical cyclone.
    """
    width, height = 512, 512
    center_x, center_y = width // 2, height // 2
    
    # Create coordinate grid
    y, x = np.ogrid[:height, :width]
    dist_from_center = np.sqrt((x - center_x)**2 + (y - center_y)**2)
    angle = np.arctan2(y - center_y, x - center_x)
    
    # Eye radius scale based on wind speed
    eye_radius = max(8, min(32, int(45 - (wind_speed / 7))))
    spiral_tightness = 4.5 + (wind_speed / 40.0)
    
    # Spiral log pattern formula: r = a * e^(b * theta)
    spiral_val = np.sin(spiral_tightness * np.log(dist_from_center + 1) - 3 * angle)
    
    # Cloud density falloff
    max_radius = 220
    envelope = np.clip((max_radius - dist_from_center) / max_radius, 0, 1)
    
    # Eye wall ring mask
    eyewall_mask = np.exp(-((dist_from_center - (eye_radius + 15)) ** 2) / 120)
    eye_clear_mask = np.clip((dist_from_center - eye_radius) / 10.0, 0, 1)
    
    # Combined intensity matrix (0.0 to 1.0)
    intensity = (0.45 * (spiral_val * 0.5 + 0.5) + 0.55 * eyewall_mask) * envelope * eye_clear_mask
    intensity = np.clip(intensity + 0.15 * np.random.uniform(0, 0.2, (height, width)), 0, 1)
    
    # False-color thermal IR palette (Deep blue ocean -> Yellow/Orange/Red convective eye wall -> White/Cyan dense cloud tops)
    rgb_img = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Ocean background
    rgb_img[:, :, 0] = 12   # Dark Navy R
    rgb_img[:, :, 1] = 22   # Dark Navy G
    rgb_img[:, :, 2] = 45   # Dark Navy B
    
    for i in range(height):
        for j in range(width):
            val = intensity[i, j]
            if val > 0.05:
                if val < 0.35: # Outer bands (cyan to light green)
                    t = (val - 0.05) / 0.30
                    rgb_img[i, j, 0] = int(20 + 30 * t)
                    rgb_img[i, j, 1] = int(70 + 150 * t)
                    rgb_img[i, j, 2] = int(140 + 80 * t)
                elif val < 0.65: # Convective rainbands (yellow to orange)
                    t = (val - 0.35) / 0.30
                    rgb_img[i, j, 0] = int(50 + 205 * t)
                    rgb_img[i, j, 1] = int(220 - 50 * t)
                    rgb_img[i, j, 2] = int(220 - 180 * t)
                elif val < 0.85: # High convective eyewall (deep crimson red)
                    t = (val - 0.65) / 0.20
                    rgb_img[i, j, 0] = int(255)
                    rgb_img[i, j, 1] = int(170 - 140 * t)
                    rgb_img[i, j, 2] = int(40 - 20 * t)
                else: # Central Cold Cover / Overshooting tops (White/Pink)
                    t = (val - 0.85) / 0.15
                    rgb_img[i, j, 0] = int(255)
                    rgb_img[i, j, 1] = int(30 + 225 * t)
                    rgb_img[i, j, 2] = int(20 + 235 * t)
    
    # Convert to PIL Image
    pil_img = Image.fromarray(rgb_img)
    pil_img = pil_img.filter(ImageFilter.GaussianBlur(radius=1.2))
    
    draw = ImageDraw.Draw(pil_img)
    
    # Add Grid Lines (Latitude / Longitude overlay)
    for step in range(64, width, 64):
        draw.line([(step, 0), (step, height)], fill=(255, 255, 255, 40), width=1)
        draw.line([(0, step), (width, step)], fill=(255, 255, 255, 40), width=1)
        
    # Add Center Crosshair
    draw.line([(center_x - 12, center_y), (center_x + 12, center_y)], fill=(0, 255, 255), width=2)
    draw.line([(center_x, center_y - 12), (center_x, center_y + 12)], fill=(0, 255, 255), width=2)
    draw.ellipse([(center_x - 18, center_y - 18), (center_x + 18, center_y + 18)], outline=(0, 255, 255), width=1)

    # Add Text Overlays & Metadata
    draw.text((12, 12), f"SATELLITE: INSAT-3DR / TIR-1 FUSION", fill=(255, 255, 255))
    draw.text((12, 28), f"TARGET: {cyclone_name.upper()} ({category})", fill=(255, 215, 0))
    draw.text((12, 44), f"MAX WIND: {wind_speed:.1f} km/h", fill=(0, 255, 200))
    
    if is_demo:
        # Prominent DEMO DATA watermark badge
        draw.rectangle([(width - 150, 10), (width - 10, 34)], fill=(220, 38, 38, 200), outline=(255, 255, 255))
        draw.text((width - 142, 14), "DEMO DATA / SIMULATION", fill=(255, 255, 255))
        
    # Save Image
    out_dir = os.path.join(settings.UPLOAD_DIR, "satellites")
    os.makedirs(out_dir, exist_ok=True)
    full_path = os.path.join(out_dir, output_filename)
    pil_img.save(full_path, "JPEG", quality=90)
    
    return f"/uploads/satellites/{output_filename}"
