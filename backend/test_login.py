import urllib.request
import urllib.parse

data = urllib.parse.urlencode({'username': 'ladsperises@gmail.com', 'password': 'Naruto551'}).encode()
req = urllib.request.Request('http://localhost:8000/login', data=data, method='POST')
req.add_header('Content-Type', 'application/x-www-form-urlencoded')

try:
    response = urllib.request.urlopen(req)
    print('SUCCESS:', response.read().decode())
except urllib.error.HTTPError as e:
    print('HTTP Error:', e.code, e.reason)
    print('Body:', e.read().decode())
