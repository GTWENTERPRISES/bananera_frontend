"""
Comando para probar todos los endpoints de la API
"""
import requests
from django.core.management.base import BaseCommand
from bananera.models import Usuario, Finca, Enfunde, Cosecha, Empleado, Insumo

API_BASE = 'http://localhost:8000/api'

class Command(BaseCommand):
    help = 'Prueba todos los endpoints de la API'

    def handle(self, *args, **options):
        self.stdout.write('🧪 Iniciando pruebas de API...\n')
        
        # 1. Verificar/crear usuario admin
        self.stdout.write('1. Verificando usuario admin...')
        admin, created = Usuario.objects.get_or_create(
            email='admin@bananerahg.com',
            defaults={
                'nombre': 'Admin Test',
                'rol': 'administrador',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('   ✓ Usuario admin creado'))
        else:
            # Asegurar password correcto
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('   ✓ Usuario admin existe'))
        
        # 2. Probar login
        self.stdout.write('\n2. Probando login...')
        try:
            res = requests.post(f'{API_BASE}/login/', json={
                'email': 'admin@bananerahg.com',
                'password': 'admin123'
            })
            if res.status_code == 200:
                token = res.json().get('access')
                self.stdout.write(self.style.SUCCESS(f'   ✓ Login OK - Token: {token[:20]}...'))
            else:
                self.stdout.write(self.style.ERROR(f'   ✗ Login falló: {res.status_code} - {res.text}'))
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   ✗ Error de conexión: {e}'))
            return
        
        headers = {'Authorization': f'Bearer {token}'}
        
        # 3. Probar endpoints de lectura
        endpoints = [
            ('Fincas', '/fincas/'),
            ('Usuarios', '/usuarios/'),
            ('Enfundes', '/enfundes/'),
            ('Cosechas', '/cosechas/'),
            ('Recuperaciones', '/recuperaciones/'),
            ('Empleados', '/empleados/'),
            ('Roles Pago', '/roles-pago/'),
            ('Préstamos', '/prestamos/'),
            ('Insumos', '/insumos/'),
            ('Movimientos', '/movimientos-inventario/'),
            ('Alertas', '/alertas/'),
        ]
        
        self.stdout.write('\n3. Probando endpoints de lectura...')
        for name, path in endpoints:
            try:
                res = requests.get(f'{API_BASE}{path}', headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    count = len(data) if isinstance(data, list) else 'OK'
                    self.stdout.write(self.style.SUCCESS(f'   ✓ {name}: {count} registros'))
                else:
                    self.stdout.write(self.style.WARNING(f'   ⚠ {name}: {res.status_code}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'   ✗ {name}: {e}'))
        
        # 4. Verificar datos en BD
        self.stdout.write('\n4. Verificando datos en base de datos...')
        counts = {
            'Fincas': Finca.objects.count(),
            'Usuarios': Usuario.objects.count(),
            'Enfundes': Enfunde.objects.count(),
            'Cosechas': Cosecha.objects.count(),
            'Empleados': Empleado.objects.count(),
            'Insumos': Insumo.objects.count(),
        }
        for name, count in counts.items():
            status = self.style.SUCCESS('✓') if count > 0 else self.style.WARNING('⚠')
            self.stdout.write(f'   {status} {name}: {count}')
        
        # 5. Probar /usuarios/me/
        self.stdout.write('\n5. Probando /usuarios/me/...')
        try:
            res = requests.get(f'{API_BASE}/usuarios/me/', headers=headers)
            if res.status_code == 200:
                user = res.json()
                self.stdout.write(self.style.SUCCESS(f'   ✓ Usuario actual: {user.get("email")} ({user.get("rol")})'))
            else:
                self.stdout.write(self.style.ERROR(f'   ✗ Error: {res.status_code}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   ✗ Error: {e}'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Pruebas de API completadas!'))
