"""
Generates a JWT manually using the same secret as auth.py, then tests the PUT polygon endpoint.
"""
import requests
import json
import sqlite3
import jwt
from datetime import datetime, timedelta, timezone

SECRET = "super_secret_key_hydrolean_2026"
ALGORITHM = "HS256"

# Get a real user from the DB
conn = sqlite3.connect('hydrolean2.db')
users = conn.execute("SELECT id, email, role, fazenda_id FROM usuarios ORDER BY id DESC;").fetchall()
fazendas = conn.execute("SELECT id, nome, polygon_coordinates FROM fazendas;").fetchall()
conn.close()

print("Users in DB:")
for u in users:
    print("  id=%s email=%s role=%s fazenda_id=%s" % u)
print("Fazendas in DB:")
for f in fazendas:
    print("  id=%s nome=%s polygon=%s" % (f[0], f[1], f[2]))

if not users:
    print("No users. Register first.")
    exit(1)

# Use the last registered user
uid, email, role, fazenda_id = users[0]

# Manually create token
token_data = {
    "sub": str(uid),
    "email": email,
    "role": role,
    "fazenda_id": fazenda_id,
    "exp": datetime.now(timezone.utc) + timedelta(minutes=60)
}
token = jwt.encode(token_data, SECRET, algorithm=ALGORITHM)
print(f"\nUser: {email} (id={uid}, fazenda_id={fazenda_id})")
print("Token generated:", token[:50], "...")

BASE = "http://localhost:8000"
headers = {"Authorization": f"Bearer {token}"}

# 1. Test /me
r_me = requests.get(f"{BASE}/me", headers=headers)
print("\n/me status:", r_me.status_code)
print("/me body:", r_me.text[:300])

# 2. Save polygon
coords = [[-12.75, 15.70], [-12.76, 15.71], [-12.77, 15.70]]
payload = {"polygon": json.dumps(coords)}
print("\nPUT /fazenda/polygon ...")
r_put = requests.put(f"{BASE}/fazenda/polygon", json=payload, headers=headers)
print("  Status:", r_put.status_code)
print("  Body:", r_put.text)

# 3. Verify via /me
r_me2 = requests.get(f"{BASE}/me", headers=headers)
me2 = r_me2.json()
print("\n/me after PUT - polygon_coordinates:", me2.get("polygon_coordinates"))

# 4. Check DB
conn2 = sqlite3.connect('hydrolean2.db')
result = conn2.execute("SELECT id, nome, polygon_coordinates FROM fazendas;").fetchall()
conn2.close()
print("\nDB STATE after PUT:")
for row in result:
    print("  id=%s nome=%s polygon=%s" % (row[0], row[1], row[2]))
