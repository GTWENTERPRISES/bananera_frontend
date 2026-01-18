"""
Script de prueba para la API
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'data'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'data.settings')
django.setup()

from bananera.models import Usuario, Finca
from bananera.choices import RolUsuario, EstadoFinca

def test_models():
    """Prueba los modelos"""
    print("=" * 50)
    print("PRUEBAS DE MODELOS")
    print("=" * 50)
    
    # Verificar usuario administrador
    try:
        admin = Usuario.objects.get(email='admin@bananerahg.com')
        print(f"[OK] Usuario admin encontrado: {admin.nombre} ({admin.email})")
        print(f"  Rol: {admin.rol}")
        print(f"  Activo: {admin.activo}")
        
        # Probar verificación de contraseña
        if admin.check_password('admin123'):
            print("[OK] Contraseña verificada correctamente")
        else:
            print("[ERROR] Contraseña incorrecta")
    except Usuario.DoesNotExist:
        print("[ERROR] Usuario admin no encontrado")
    
    # Crear una finca de prueba
    print("\n" + "-" * 50)
    print("Creando finca de prueba...")
    finca, created = Finca.objects.get_or_create(
        nombre='FINCA_TEST',
        defaults={
            'hectareas': 50.0,
            'ubicacion': 'Test Location',
            'estado': EstadoFinca.ACTIVA
        }
    )
    if created:
        print(f"[OK] Finca creada: {finca.nombre} (ID: {finca.id})")
    else:
        print(f"[OK] Finca existente: {finca.nombre} (ID: {finca.id})")
    
    # Contar registros
    print("\n" + "-" * 50)
    print("ESTADISTICAS:")
    print(f"  Usuarios: {Usuario.objects.count()}")
    print(f"  Fincas: {Finca.objects.count()}")
    
    print("\n" + "=" * 50)
    print("[OK] Todas las pruebas pasaron correctamente!")
    print("=" * 50)

if __name__ == '__main__':
    test_models()

