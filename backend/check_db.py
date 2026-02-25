"""
Detailed check of DB relationships.
"""
import sqlite3

conn = sqlite3.connect('hydrolean2.db')

print("== FAZENDAS ==")
fazendas = conn.execute("SELECT id, nome, polygon_coordinates FROM fazendas;").fetchall()
for f in fazendas:
    print("  id=%s nome=%s polygon=%s" % (f[0], f[1], f[2]))

print("\n== USUARIOS ==")
users = conn.execute("SELECT id, nome, email, senha_hash, fazenda_id FROM usuarios;").fetchall()
for u in users:
    print("  id=%s nome=%s email=%s senha=%s fazenda_id=%s" % u)

print("\n== SENSOR ZONES ==")
zones = conn.execute("SELECT id, fazenda_id, name, lat, lng FROM sensor_zones;").fetchall()
for z in zones:
    print("  id=%s fazenda_id=%s name=%s lat=%s lng=%s" % z)

conn.close()
