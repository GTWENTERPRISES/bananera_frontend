"""
Comando para poblar la base de datos con datos de prueba hasta semana 3 de 2026
"""
import random
from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from bananera.models import (
    Finca, Usuario, Enfunde, Cosecha, RecuperacionCinta,
    Empleado, RolPago, Prestamo, Insumo, MovimientoInventario, Alerta
)


class Command(BaseCommand):
    help = 'Pobla la base de datos con datos de prueba hasta semana 3 de 2026'

    def handle(self, *args, **options):
        self.stdout.write('🍌 Iniciando población de datos...\n')
        
        # Limpiar datos existentes (excepto usuarios admin)
        self.stdout.write('Limpiando datos existentes...')
        Alerta.objects.all().delete()
        MovimientoInventario.objects.all().delete()
        Insumo.objects.all().delete()
        Prestamo.objects.all().delete()
        RolPago.objects.all().delete()
        Empleado.objects.all().delete()
        RecuperacionCinta.objects.all().delete()
        Cosecha.objects.all().delete()
        Enfunde.objects.all().delete()
        Finca.objects.all().delete()
        
        # 1. Crear Fincas (las 4 originales del mock)
        self.stdout.write('Creando fincas...')
        fincas_data = [
            {'nombre': 'BABY', 'ubicacion': 'Valencia / Los Ríos', 'hectareas': 45.5, 'responsable': 'Juan Pérez'},
            {'nombre': 'SOLO', 'ubicacion': 'Valencia / Los Ríos', 'hectareas': 38.2, 'responsable': 'María González'},
            {'nombre': 'LAURITA', 'ubicacion': 'Valencia / Los Ríos', 'hectareas': 52.8, 'responsable': 'Carlos Hernández'},
            {'nombre': 'MARAVILLA', 'ubicacion': 'Quevedo / Los Ríos', 'hectareas': 61.3, 'responsable': 'Ana Torres'},
        ]
        fincas = []
        for data in fincas_data:
            finca = Finca.objects.create(**data, activa=True)
            fincas.append(finca)
            self.stdout.write(f'  ✓ {finca.nombre}')
        
        # 2. Crear Empleados
        self.stdout.write('\nCreando empleados...')
        nombres = [
            'Juan Pérez', 'Pedro González', 'Luis Martínez', 'Carlos Sánchez',
            'Miguel Torres', 'Jorge Ramírez', 'Diego López', 'Andrés Castro',
            'Roberto Flores', 'Fernando Vargas', 'Manuel Herrera', 'Ricardo Mora',
            'Antonio Jiménez', 'Francisco Ruiz', 'Eduardo Díaz', 'Alejandro Cruz',
            'Pablo Reyes', 'Víctor Medina', 'Óscar Guzmán', 'Raúl Ortiz',
            'Alberto Núñez', 'Sergio Paredes', 'Javier Mendoza', 'Gabriel Romero',
        ]
        cargos = ['jornalero', 'enfundador', 'cortador', 'empacador', 'supervisor']
        salarios = {
            'jornalero': Decimal('450.00'),
            'enfundador': Decimal('480.00'),
            'cortador': Decimal('500.00'),
            'empacador': Decimal('470.00'),
            'supervisor': Decimal('800.00'),
        }
        
        empleados = []
        for i, nombre in enumerate(nombres):
            finca = random.choice(fincas)
            cargo = random.choice(cargos)
            empleado = Empleado.objects.create(
                finca=finca,
                nombre=nombre,
                cedula=f'09{str(i+1).zfill(8)}1',
                cargo=cargo,
                salario_base=salarios[cargo],
                fecha_ingreso=date(2024, random.randint(1, 12), random.randint(1, 28)),
                telefono=f'09{random.randint(10000000, 99999999)}',
                direccion=f'Calle {random.randint(1, 50)}, {finca.ubicacion}',
                activo=True
            )
            empleados.append(empleado)
        self.stdout.write(f'  ✓ {len(empleados)} empleados creados')
        
        # 3. Crear Insumos
        self.stdout.write('\nCreando insumos...')
        insumos_data = [
            {'nombre': 'Fertilizante NPK 15-15-15', 'categoria': 'fertilizante', 'unidad_medida': 'kg', 'precio_unitario': Decimal('0.85')},
            {'nombre': 'Urea 46%', 'categoria': 'fertilizante', 'unidad_medida': 'kg', 'precio_unitario': Decimal('0.65')},
            {'nombre': 'Fungicida Mancozeb', 'categoria': 'quimico', 'unidad_medida': 'litro', 'precio_unitario': Decimal('12.50')},
            {'nombre': 'Protector de Racimo', 'categoria': 'protector', 'unidad_medida': 'unidad', 'precio_unitario': Decimal('0.15')},
            {'nombre': 'Funda de Banano 38x54', 'categoria': 'empaque', 'unidad_medida': 'unidad', 'precio_unitario': Decimal('0.08')},
            {'nombre': 'Cinta de Colores', 'categoria': 'empaque', 'unidad_medida': 'rollo', 'precio_unitario': Decimal('3.50')},
            {'nombre': 'Guantes de Caucho', 'categoria': 'par', 'unidad_medida': 'par', 'precio_unitario': Decimal('2.80')},
            {'nombre': 'Machete Tramontina', 'categoria': 'herramienta', 'unidad_medida': 'unidad', 'precio_unitario': Decimal('18.00')},
            {'nombre': 'Herbicida Glifosato', 'categoria': 'quimico', 'unidad_medida': 'litro', 'precio_unitario': Decimal('8.50')},
            {'nombre': 'Cajas de Cartón', 'categoria': 'empaque', 'unidad_medida': 'unidad', 'precio_unitario': Decimal('1.20')},
        ]
        
        insumos = []
        for finca in fincas:
            for data in insumos_data:
                stock = random.randint(50, 500)
                insumo = Insumo.objects.create(
                    finca=finca,
                    nombre=data['nombre'],
                    categoria=data['categoria'],
                    unidad_medida=data['unidad_medida'],
                    precio_unitario=data['precio_unitario'],
                    stock_actual=stock,
                    stock_minimo=random.randint(20, 50),
                    stock_maximo=1000,
                    proveedor=random.choice(['AgroInsumos S.A.', 'Fertisa', 'Agripac', 'Ecuaquímica']),
                )
                insumos.append(insumo)
        self.stdout.write(f'  ✓ {len(insumos)} insumos creados')
        
        # 4. Crear datos de producción por semana (últimas 12 semanas hasta semana 3 de 2026)
        self.stdout.write('\nCreando datos de producción...')
        colores_cinta = ['verde', 'azul', 'rojo', 'amarillo', 'blanco', 'negro']
        lotes = ['A', 'B', 'C', 'D', 'E']
        
        # Semana 3 de 2026 termina el 19 de enero
        # Generar datos desde semana 44 de 2025 hasta semana 3 de 2026
        semanas_data = [
            (44, 2025, date(2025, 10, 28)),
            (45, 2025, date(2025, 11, 4)),
            (46, 2025, date(2025, 11, 11)),
            (47, 2025, date(2025, 11, 18)),
            (48, 2025, date(2025, 11, 25)),
            (49, 2025, date(2025, 12, 2)),
            (50, 2025, date(2025, 12, 9)),
            (51, 2025, date(2025, 12, 16)),
            (52, 2025, date(2025, 12, 23)),
            (1, 2026, date(2026, 1, 6)),
            (2, 2026, date(2026, 1, 13)),
            (3, 2026, date(2026, 1, 20)),
        ]
        
        enfundes_creados = 0
        cosechas_creadas = 0
        recuperaciones_creadas = 0
        
        for semana, año, fecha_base in semanas_data:
            for finca in fincas:
                # Crear enfunde
                color = colores_cinta[(semana - 1) % len(colores_cinta)]
                cantidad_enfundes = random.randint(800, 1500)
                enfunde = Enfunde.objects.create(
                    finca=finca,
                    fecha=fecha_base,
                    semana=semana,
                    año=año,
                    color_cinta=color,
                    cantidad_enfundes=cantidad_enfundes,
                    matas_caidas=random.randint(5, 30),
                    observaciones=''
                )
                enfundes_creados += 1
                
                # Crear recuperación de cinta (para enfundes de 10-12 semanas antes)
                cintas_recuperadas = int(cantidad_enfundes * random.uniform(0.7, 0.95))
                RecuperacionCinta.objects.create(
                    enfunde=enfunde,
                    fecha=fecha_base + timedelta(days=random.randint(70, 84)),
                    cintas_recuperadas=cintas_recuperadas,
                    porcentaje_recuperacion=Decimal(str(round(cintas_recuperadas / cantidad_enfundes * 100, 2)))
                )
                recuperaciones_creadas += 1
                
                # Crear cosechas (2-3 por semana por finca)
                for _ in range(random.randint(2, 3)):
                    lote = random.choice(lotes)
                    cajas = random.randint(200, 600)
                    peso = Decimal(str(round(random.uniform(42.0, 46.0), 2)))
                    Cosecha.objects.create(
                        finca=finca,
                        fecha=fecha_base + timedelta(days=random.randint(0, 6)),
                        semana=semana,
                        año=año,
                        lote=lote,
                        cajas_producidas=cajas,
                        racimos_recuperados=random.randint(10, 50),
                        peso_promedio=peso,
                        calibracion=Decimal(str(round(random.uniform(38.0, 42.0), 2))),
                        manos=random.randint(6, 9),
                        ratio=Decimal(str(round(cajas / (cantidad_enfundes / 10), 2))),
                    )
                    cosechas_creadas += 1
        
        self.stdout.write(f'  ✓ {enfundes_creados} enfundes')
        self.stdout.write(f'  ✓ {cosechas_creadas} cosechas')
        self.stdout.write(f'  ✓ {recuperaciones_creadas} recuperaciones')
        
        # 5. Crear Roles de Pago
        self.stdout.write('\nCreando roles de pago...')
        roles_creados = 0
        for semana, año, fecha_base in semanas_data[-6:]:  # Últimas 6 semanas
            for empleado in empleados:
                periodo_inicio = fecha_base - timedelta(days=6)
                periodo_fin = fecha_base
                horas_extras = Decimal(str(round(random.uniform(0, 20) * 5, 2)))
                bonificaciones = Decimal(str(round(random.uniform(0, 50), 2)))
                deducciones = Decimal(str(round(random.uniform(10, 30), 2)))
                total = empleado.salario_base + horas_extras + bonificaciones - deducciones
                
                estado = 'pagado' if semana < 2 or año < 2026 else random.choice(['pendiente', 'aprobado'])
                
                RolPago.objects.create(
                    empleado=empleado,
                    fecha_pago=fecha_base + timedelta(days=5),
                    periodo_inicio=periodo_inicio,
                    periodo_fin=periodo_fin,
                    salario_base=empleado.salario_base,
                    horas_extras=horas_extras,
                    bonificaciones=bonificaciones,
                    deducciones=deducciones,
                    total_pagar=total,
                    estado=estado,
                )
                roles_creados += 1
        self.stdout.write(f'  ✓ {roles_creados} roles de pago')
        
        # 6. Crear Préstamos
        self.stdout.write('\nCreando préstamos...')
        prestamos_creados = 0
        empleados_prestamo = random.sample(empleados, min(8, len(empleados)))
        for empleado in empleados_prestamo:
            monto = Decimal(str(random.choice([100, 150, 200, 300, 500])))
            cuotas = random.choice([2, 3, 4, 6])
            cuotas_pagadas = random.randint(0, cuotas - 1)
            monto_pagado = (monto / cuotas) * cuotas_pagadas
            
            Prestamo.objects.create(
                empleado=empleado,
                monto=monto,
                monto_pagado=monto_pagado,
                cuotas=cuotas,
                cuotas_pagadas=cuotas_pagadas,
                fecha_solicitud=date(2025, 12, random.randint(1, 28)),
                fecha_aprobacion=date(2025, 12, random.randint(1, 28)),
                estado='aprobado' if cuotas_pagadas < cuotas else 'pagado',
                motivo=random.choice(['Emergencia médica', 'Gastos escolares', 'Reparación de vivienda', 'Gastos personales']),
            )
            prestamos_creados += 1
        self.stdout.write(f'  ✓ {prestamos_creados} préstamos')
        
        # 7. Crear Movimientos de Inventario
        self.stdout.write('\nCreando movimientos de inventario...')
        movimientos_creados = 0
        admin_user = Usuario.objects.filter(is_superuser=True).first()
        
        for semana, año, fecha_base in semanas_data[-4:]:  # Últimas 4 semanas
            for finca in fincas:
                finca_insumos = Insumo.objects.filter(finca=finca)
                for insumo in random.sample(list(finca_insumos), min(5, len(finca_insumos))):
                    tipo = random.choice(['entrada', 'salida'])
                    cantidad = random.randint(10, 100)
                    MovimientoInventario.objects.create(
                        insumo=insumo,
                        finca=finca,
                        tipo=tipo,
                        cantidad=cantidad,
                        fecha=fecha_base + timedelta(days=random.randint(0, 6)),
                        responsable=admin_user,
                        observaciones=f'Movimiento de {tipo}'
                    )
                    movimientos_creados += 1
        self.stdout.write(f'  ✓ {movimientos_creados} movimientos')
        
        # 8. Crear Alertas
        self.stdout.write('\nCreando alertas...')
        alertas_data = [
            {'tipo': 'stock_bajo', 'prioridad': 'alta', 'titulo': 'Stock bajo de Fertilizante NPK', 'mensaje': 'El stock de Fertilizante NPK está por debajo del mínimo requerido.'},
            {'tipo': 'pago_pendiente', 'prioridad': 'media', 'titulo': 'Roles de pago pendientes', 'mensaje': 'Hay 5 roles de pago pendientes de aprobación para esta semana.'},
            {'tipo': 'cosecha', 'prioridad': 'baja', 'titulo': 'Producción semanal completada', 'mensaje': 'La producción de la semana 3 ha sido registrada exitosamente.'},
            {'tipo': 'mantenimiento', 'prioridad': 'media', 'titulo': 'Mantenimiento de cable vía', 'mensaje': 'Se requiere mantenimiento preventivo del sistema de cable vía.'},
            {'tipo': 'stock_bajo', 'prioridad': 'critica', 'titulo': 'Fundas de banano agotándose', 'mensaje': 'Stock crítico de fundas de banano. Realizar pedido urgente.'},
        ]
        
        alertas_creadas = 0
        for finca in fincas:
            for data in random.sample(alertas_data, 3):
                Alerta.objects.create(
                    tipo=data['tipo'],
                    prioridad=data['prioridad'],
                    titulo=data['titulo'],
                    mensaje=data['mensaje'],
                    finca=finca,
                    leida=random.choice([True, False, False])
                )
                alertas_creadas += 1
        self.stdout.write(f'  ✓ {alertas_creadas} alertas')
        
        self.stdout.write(self.style.SUCCESS('\n✅ Base de datos poblada exitosamente hasta semana 3 de 2026!'))
