"""
Script para probar el servidor API
"""
import urllib.request
import urllib.parse
import json

def test_login():
    """Prueba el endpoint de login"""
    print("=" * 50)
    print("PRUEBA DE API - LOGIN")
    print("=" * 50)
    
    url = 'http://localhost:8000/api/usuarios/login/'
    data = {
        'email': 'admin@bananerahg.com',
        'password': 'admin123'
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print("[OK] Login exitoso!")
            print(f"  Token recibido: {result.get('access', 'N/A')[:50]}...")
            print(f"  Usuario: {result.get('usuario', {}).get('nombre', 'N/A')}")
            print(f"  Email: {result.get('usuario', {}).get('email', 'N/A')}")
            print(f"  Rol: {result.get('usuario', {}).get('rol', 'N/A')}")
            return result.get('access')
    except urllib.error.HTTPError as e:
        print(f"[ERROR] HTTP {e.code}: {e.reason}")
        print(f"  Respuesta: {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        print(f"[ERROR] {type(e).__name__}: {str(e)}")
        return None

def test_fincas(token):
    """Prueba el endpoint de fincas"""
    if not token:
        print("\n[SKIP] Saltando prueba de fincas (sin token)")
        return
    
    print("\n" + "=" * 50)
    print("PRUEBA DE API - FINCAS")
    print("=" * 50)
    
    url = 'http://localhost:8000/api/fincas/'
    
    try:
        req = urllib.request.Request(
            url,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
        )
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f"[OK] Fincas obtenidas: {len(result.get('results', result))}")
            if result.get('results'):
                for finca in result.get('results', [])[:3]:
                    print(f"  - {finca.get('nombre')} ({finca.get('hectareas')} ha)")
    except urllib.error.HTTPError as e:
        print(f"[ERROR] HTTP {e.code}: {e.reason}")
        print(f"  Respuesta: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"[ERROR] {type(e).__name__}: {str(e)}")

if __name__ == '__main__':
    token = test_login()
    test_fincas(token)
    print("\n" + "=" * 50)
    print("[OK] Pruebas completadas!")
    print("=" * 50)






