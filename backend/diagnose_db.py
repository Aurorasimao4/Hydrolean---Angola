"""
Diagnoses the full login->polygonsave flow, debugging the exact DB path.
"""
import sqlite3
import sys
import os

# 1. Check what DB the backend code would use
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("Working directory:", os.getcwd())
print("DB files found:")
for f in os.listdir('.'):
    if f.endswith('.db'):
        print("  -", f, "(size: %d bytes)" % os.path.getsize(f))

# 2. Query hydrolean2.db
print("\n== hydrolean2.db ==")
try:
    conn = sqlite3.connect('hydrolean2.db')
    tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    print("Tables:", tables)
    users = conn.execute("SELECT id, email, senha_hash, fazenda_id FROM usuarios;").fetchall()
    print("Users:", users)
    fazendas = conn.execute("SELECT id, nome, polygon_coordinates FROM fazendas;").fetchall()
    print("Fazendas:", [(f[0], f[1], f[2][:50] if f[2] else None) for f in fazendas])
    conn.close()
except Exception as e:
    print("Error:", e)

# 3. If there are other DB files, show them too
for f in os.listdir('.'):
    if f.endswith('.db') and f != 'hydrolean2.db':
        print(f"\n== {f} ==")
        try:
            conn2 = sqlite3.connect(f)
            tables2 = conn2.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
            print("Tables:", tables2)
            if ('usuarios',) in tables2:
                users2 = conn2.execute("SELECT id, email, senha_hash, fazenda_id FROM usuarios;").fetchall()
                print("Users:", users2)
            conn2.close()
        except Exception as e:
            print("Error:", e)
