"""
Teste do endpoint /irrigar com a nova lógica de Expert
"""
import urllib.request
import urllib.parse
import json

BASE = "http://localhost:8000"

# 1. Login
login_data = urllib.parse.urlencode({'username': 'ladsperises@gmail.com', 'password': 'Naruto551'}).encode()
req = urllib.request.Request(f"{BASE}/login", data=login_data, method='POST')
req.add_header('Content-Type', 'application/x-www-form-urlencoded')
token = json.loads(urllib.request.urlopen(req).read().decode())['access_token']

# 2. Testar /irrigar
irr_body = json.dumps({
    "N": 90, "P": 42, "K": 43,
    "temperature": 25.0, "humidity": 70.0,
    "ph": 6.5, "rainfall": 100.0,
    "latitude": -8.838, "longitude": 13.234,
    "tipo_solo": "argiloso",
    "area_hectares": 2.5
}).encode()

req2 = urllib.request.Request(f"{BASE}/irrigar", data=irr_body, method='POST')
req2.add_header('Content-Type', 'application/json')
req2.add_header('Authorization', f'Bearer {token}')

try:
    res2 = urllib.request.urlopen(req2, timeout=30)
    data = json.loads(res2.read().decode())
    print(f"\n✅ /irrigar OK!")
    print(f"\n📝 RECOMENDAÇÃO DO ENGENHEIRO:\n")
    print(data['recomendacao_irrigacao'])
except Exception as e:
    print(f"❌ Erro: {e}")
