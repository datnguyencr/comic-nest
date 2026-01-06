import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import secrets
import json

# 🔑 MUST be exactly 32 bytes (AES-256)
KEY = b"692b0630a29e5454545444fa2ee5f630"

SRC_ROOT = "D:\\workplaces\\test\\New folder"
OUT_ROOT = "D:\\workplaces\\test\\comic-nest\\output"

def encrypt_file(src_path, out_path):
    # Detect if it's a JSON file
    if src_path.lower().endswith(".json"):
        # Read and encode as bytes
        with open(src_path, "r", encoding="utf-8") as f:
            data = f.read().encode("utf-8")
    else:
        # Otherwise, read as binary (e.g., images)
        with open(src_path, "rb") as f:
            data = f.read()

    aes = AESGCM(KEY)
    nonce = secrets.token_bytes(12)  # 96-bit nonce
    encrypted = aes.encrypt(nonce, data, None)

    # [nonce][ciphertext+tag]
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(nonce + encrypted)

for root, _, files in os.walk(SRC_ROOT):
    for filename in files:
        if not filename.lower().endswith((".json", ".avif")):
            continue

        src_path = os.path.join(root, filename)

        # Preserve folder structure
        rel_path = os.path.relpath(src_path, SRC_ROOT)
        out_path = os.path.join(OUT_ROOT, rel_path + ".enc")

        encrypt_file(src_path, out_path)
        print("Encrypted:", rel_path)
