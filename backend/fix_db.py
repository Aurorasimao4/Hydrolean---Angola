"""
Cleans duplicate Fazenda rows and re-links users to the correct fazenda.
Run once and restart the backend.
"""
import sqlite3

conn = sqlite3.connect('hydrolean2.db')

print("BEFORE cleanup:")
print(conn.execute("SELECT id, nome, polygon_coordinates FROM fazendas;").fetchall())
print(conn.execute("SELECT id, email, fazenda_id FROM usuarios;").fetchall())

# Get all users grouped by fazenda
users = conn.execute("SELECT id, email, fazenda_id FROM usuarios;").fetchall()
fazendas = conn.execute("SELECT id, nome FROM fazendas;").fetchall()

# For each user, ensure their fazenda exists - if not, reset to fazenda 1
# Also delete unused duplicate fazenda rows (keep the one with minimum id for each distinct nome)
fazenda_ids_by_nome = {}
for f_id, nome in fazendas:
    if nome not in fazenda_ids_by_nome:
        fazenda_ids_by_nome[nome] = f_id  # keep the first (lowest) id for each name

print("\nFazenda name -> canonical id:", fazenda_ids_by_nome)

# Update users to point to the canonical fazenda id
for u_id, email, fazenda_id in users:
    # Find what nome the user's current fazenda had
    nome_row = conn.execute("SELECT nome FROM fazendas WHERE id=?", (fazenda_id,)).fetchone()
    if nome_row:
        canonical_id = fazenda_ids_by_nome.get(nome_row[0], fazenda_id)
        if canonical_id != fazenda_id:
            print(f"Updating user {email}: fazenda_id {fazenda_id} -> {canonical_id}")
            conn.execute("UPDATE usuarios SET fazenda_id=? WHERE id=?", (canonical_id, u_id))

# Delete extra duplicate fazendas (keep canonical ids)
canonical_ids = set(fazenda_ids_by_nome.values())
for f_id, _ in fazendas:
    if f_id not in canonical_ids:
        print(f"Deleting duplicate fazenda id={f_id}")
        conn.execute("DELETE FROM fazendas WHERE id=?", (f_id,))

conn.commit()

print("\nAFTER cleanup:")
print(conn.execute("SELECT id, nome, polygon_coordinates FROM fazendas;").fetchall())
print(conn.execute("SELECT id, email, fazenda_id FROM usuarios;").fetchall())

conn.close()
print("\nDone. Restart the backend now.")
