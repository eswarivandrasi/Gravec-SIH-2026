import urllib.request
import json

__test__ = False

def test(url, method='GET', data=None):
    try:
        req = urllib.request.Request(url, method=method)
        if data:
            req.add_header('Content-Type', 'application/json')
            req.data = json.dumps(data).encode('utf-8')
        with urllib.request.urlopen(req) as resp:
            print(f'{method} {url} -> {resp.status}')
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f'{method} {url} -> ERROR: {e}')
        return None

def main():
    print('--- Testing Live Backend REST Endpoints ---')
    test('http://localhost:8000/api/health')
    cycs = test('http://localhost:8000/api/cyclones')
    if cycs:
        for c in cycs:
            cid = c['id']
            test(f'http://localhost:8000/api/cyclones/{cid}')
            test(f'http://localhost:8000/api/cyclones/{cid}/fingerprint')
            test(f'http://localhost:8000/api/cyclones/{cid}/similar-patterns')
            test(f'http://localhost:8000/api/cyclones/{cid}/trend')
    test('http://localhost:8000/api/dashboard/summary')
    test('http://localhost:8000/api/alerts')
    test('http://localhost:8000/api/safety/instructions')
    test('http://localhost:8000/api/safety/shelters')
    test('http://localhost:8000/api/models/evaluation')
    test('http://localhost:8000/api/models/versions')
    test('http://localhost:8000/api/system/status')
    test('http://localhost:8000/api/system/users')
    test('http://localhost:8000/api/system/audit-logs')

if __name__ == '__main__':
    main()
