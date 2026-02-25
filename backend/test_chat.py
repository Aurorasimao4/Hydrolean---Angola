"""
Teste direto ao endpoint /chat do AgroIntel
"""
import urllib.request
import urllib.parse
import json

BASE = "http://localhost:8000"

# 1. Fazer login para obter token
login_data = urllib.parse.urlencode({'username': 'ladsperises@gmail.com', 'password': 'Naruto551'}).encode()
req = urllib.request.Request(f"{BASE}/login", data=login_data, method='POST')
req.add_header('Content-Type', 'application/x-www-form-urlencoded')

try:
    res = urllib.request.urlopen(req)
    token_data = json.loads(res.read().decode())
    token = token_data['access_token']
    print(f"✅ Login OK. Token: {token[:40]}...")
except Exception as e:
    print(f"❌ Login falhou: {e}")
    exit(1)

# 2. Testar /chat
chat_body = json.dumps({
    "mensagem": "Qual é o estado dos meus sensores e devo irrigar hoje?",
    "historico": []
}).encode()

req2 = urllib.request.Request(f"{BASE}/chat", data=chat_body, method='POST')
req2.add_header('Content-Type', 'application/json')
req2.add_header('Authorization', f'Bearer {token}')

try:
    res2 = urllib.request.urlopen(req2, timeout=30)
    data = json.loads(res2.read().decode())
    print(f"\n✅ /chat OK!")
    print(f"\n📝 RESPOSTA DO AGROÍNTEL:\n")
    print(data['resposta'])
    print(f"\n📚 Histórico tem {len(data['historico_atualizado'])} mensagens")
except urllib.error.HTTPError as e:
    print(f"❌ HTTP Error {e.code}: {e.read().decode()}")
except Exception as e:
    print(f"❌ Erro: {e}")
