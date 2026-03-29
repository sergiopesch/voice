#!/usr/bin/env python3
"""Generate app icons for Voice Dictation.

Creates PNG icons at required sizes for Tauri (Linux .deb packaging).
Uses only the Python standard library — no external deps needed.
"""
import struct
import zlib
import os
import math

ICON_DIR = os.path.join(os.path.dirname(__file__), "..", "apps", "desktop", "src-tauri", "icons")

def mic_shape(nx: float, ny: float) -> float:
    """Returns opacity 0.0..1.0 for a studio condenser mic shape."""
    cx = 0.5

    # Capsule (head)
    cap_cx, cap_cy = cx, 0.30
    cap_rx, cap_ry = 0.18, 0.22
    dx = (nx - cap_cx) / cap_rx
    dy = (ny - cap_cy) / cap_ry
    cap_dist = dx * dx + dy * dy
    if cap_dist <= 1.0:
        return min(1.0, (1.0 - cap_dist) / 0.08)

    # Pickup arc
    arc_cy, arc_rx, arc_ry = 0.58, 0.24, 0.09
    adx = (nx - cx) / arc_rx
    ady = (ny - arc_cy) / arc_ry
    arc_dist = adx * adx + ady * ady
    if 0.7 <= arc_dist <= 1.0 and ny > 0.52:
        return min(1.0, (1.0 - abs(arc_dist - 0.85) / 0.15) / 0.3)

    # Stand
    stand_hw = 0.035
    if abs(nx - cx) < stand_hw and 0.58 < ny < 0.74:
        return min(1.0, (1.0 - abs(nx - cx) / stand_hw) / 0.3)

    # Base
    base_hw, base_h, base_y = 0.16, 0.05, 0.74
    if abs(nx - cx) < base_hw and base_y <= ny < base_y + base_h:
        edge_x = min(1.0, (1.0 - abs(nx - cx) / base_hw) / 0.15)
        edge_y = min(1.0, (1.0 - abs(ny - base_y - base_h / 2) / (base_h / 2)) / 0.3)
        return min(edge_x, edge_y)

    return 0.0


def rounded_rect(nx: float, ny: float, radius: float = 0.15) -> float:
    """Returns 1.0 inside a rounded rectangle, 0.0 outside, with soft edges."""
    # Map to -0.5..0.5
    x = nx - 0.5
    y = ny - 0.5
    half = 0.5
    r = radius

    # Distance to rounded rect boundary
    dx = max(abs(x) - (half - r), 0.0)
    dy = max(abs(y) - (half - r), 0.0)
    dist = math.sqrt(dx * dx + dy * dy) - r

    if dist < -0.02:
        return 1.0
    elif dist > 0.02:
        return 0.0
    else:
        return 1.0 - (dist + 0.02) / 0.04


def generate_icon(size: int) -> bytes:
    """Generate RGBA pixel data for an icon at the given size."""
    pixels = bytearray(size * size * 4)

    # Colors
    bg_r, bg_g, bg_b = 30, 27, 50       # Dark indigo background
    mic_r, mic_g, mic_b = 165, 180, 252  # Light indigo mic (#A5B4FC)
    glow_r, glow_g, glow_b = 99, 102, 241  # Glow color (#6366F1)

    for py in range(size):
        for px in range(size):
            nx = (px + 0.5) / size
            ny = (py + 0.5) / size

            idx = (py * size + px) * 4

            # Rounded rectangle background
            bg_alpha = rounded_rect(nx, ny, radius=0.18)
            if bg_alpha <= 0:
                pixels[idx:idx+4] = bytes([0, 0, 0, 0])
                continue

            # Mic shape
            mic_alpha = mic_shape(nx, ny)

            # Subtle glow behind mic
            glow_cx, glow_cy = 0.5, 0.35
            glow_dist = math.sqrt((nx - glow_cx) ** 2 + (ny - glow_cy) ** 2)
            glow_alpha = max(0, 1.0 - glow_dist / 0.35) * 0.15

            # Composite: background + glow + mic
            r = bg_r + int((glow_r - bg_r) * glow_alpha)
            g = bg_g + int((glow_g - bg_g) * glow_alpha)
            b = bg_b + int((glow_b - bg_b) * glow_alpha)

            if mic_alpha > 0:
                ma = min(1.0, mic_alpha)
                r = int(r * (1 - ma) + mic_r * ma)
                g = int(g * (1 - ma) + mic_g * ma)
                b = int(b * (1 - ma) + mic_b * ma)

            a = int(bg_alpha * 255)
            pixels[idx] = min(255, r)
            pixels[idx+1] = min(255, g)
            pixels[idx+2] = min(255, b)
            pixels[idx+3] = min(255, a)

    return bytes(pixels)


def write_png(filename: str, width: int, height: int, rgba_data: bytes):
    """Write RGBA data as a PNG file (no external deps needed)."""
    def chunk(chunk_type: bytes, data: bytes) -> bytes:
        c = chunk_type + data
        crc = zlib.crc32(c) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + c + struct.pack(">I", crc)

    # PNG signature
    sig = b'\x89PNG\r\n\x1a\n'

    # IHDR
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = chunk(b'IHDR', ihdr_data)

    # IDAT — filter each row with filter type 0 (None)
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter type
        offset = y * width * 4
        raw.extend(rgba_data[offset:offset + width * 4])

    compressed = zlib.compress(bytes(raw), 9)
    idat = chunk(b'IDAT', compressed)

    # IEND
    iend = chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(sig + ihdr + idat + iend)


def main():
    os.makedirs(ICON_DIR, exist_ok=True)

    sizes = {
        "32x32.png": 32,
        "128x128.png": 128,
        "128x128@2x.png": 256,
    }

    for filename, size in sizes.items():
        path = os.path.join(ICON_DIR, filename)
        print(f"Generating {filename} ({size}x{size})...")
        rgba = generate_icon(size)
        write_png(path, size, size, rgba)
        print(f"  → {path} ({os.path.getsize(path)} bytes)")

    # Also generate icon.ico (just use 32x32 PNG — Tauri accepts PNG for .ico)
    # And icon.icns (use 256x256 PNG — Tauri accepts PNG for .icns on build)
    import shutil
    shutil.copy(
        os.path.join(ICON_DIR, "128x128.png"),
        os.path.join(ICON_DIR, "icon.ico"),
    )
    shutil.copy(
        os.path.join(ICON_DIR, "128x128@2x.png"),
        os.path.join(ICON_DIR, "icon.icns"),
    )
    print("Generated icon.ico and icon.icns (from PNG sources)")
    print("Done!")


if __name__ == "__main__":
    main()
