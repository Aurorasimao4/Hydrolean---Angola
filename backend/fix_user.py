import sqlite3

conn = sqlite3.connect('hydrolean2.db')

# Verificar fazendas existentes
fazendas = conn.execute('SELECT id, nome FROM fazendas;').fetchall()
print('Fazendas existentes:', fazendas)

# Usar fazenda existente ou criar nova
if fazendas:
    fazenda_id = fazendas[0][0]
else:
    conn.execute("INSERT INTO fazendas (nome, nif, endereco) VALUES ('Fazenda Principal', '000000001', 'Angola')")
    conn.commit()
    fazenda_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]

print('Usando fazenda_id:', fazenda_id)

# Verificar se user já existe
existing = conn.execute("SELECT id FROM usuarios WHERE email='ladsperises@gmail.com';").fetchone()
if existing:
    print('Utilizador já existe! A atualizar senha...')
    conn.execute("UPDATE usuarios SET senha_hash='Naruto551' WHERE email='ladsperises@gmail.com'")
else:
    print('A criar utilizador ladsperises@gmail.com...')
    conn.execute(
        "INSERT INTO usuarios (nome, email, senha_hash, role, fazenda_id) VALUES ('Ladislau', 'ladsperises@gmail.com', 'Naruto551', 'admin', ?)",
        (fazenda_id,)
    )

conn.commit()

# Verificar resultado
users = conn.execute('SELECT id, email, senha_hash, fazenda_id, role FROM usuarios;').fetchall()
print('\nTodos os utilizadores:')
for u in users:
    print(f'  {u}')
conn.close()
print('\nPronto!')
