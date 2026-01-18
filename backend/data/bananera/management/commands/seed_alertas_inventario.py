"""
Comando para insertar insumos con stock bajo que generan alertas de inventario
Ejecutar con: python manage.py seed_alertas_inventario
"""

from django.core.management.base import BaseCommand
from bananera.models import Insumo, Finca
from datetime import date, timedelta
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seed inventory items with low stock to generate alerts'

    def handle(self, *args, **options):
        # Obtener fincas para asignar algunos insumos
        fincas = list(Finca.objects.all())
        
        # Insumos con stock bajo para generar alertas (stock_actual < stock_minimo)
        insumos_alertas = [
            {
                "nombre": "Fungicida Mancozeb 80%",
                "categoria": "protector",
                "proveedor": "AgroQuímicos SA",
                "unidad_medida": "litro",
                "stock_actual": Decimal("15"),
                "stock_minimo": Decimal("100"),
                "stock_maximo": Decimal("300"),
                "precio_unitario": Decimal("12.80"),
                "fecha_vencimiento": date.today() + timedelta(days=180),
            },
            {
                "nombre": "Cinta Azul Marcadora",
                "categoria": "empaque",
                "proveedor": "Empaques HG",
                "unidad_medida": "rollo",
                "stock_actual": Decimal("8"),
                "stock_minimo": Decimal("50"),
                "stock_maximo": Decimal("200"),
                "precio_unitario": Decimal("8.20"),
                "fecha_vencimiento": date.today() + timedelta(days=60),
            },
            {
                "nombre": "Cinta Roja Marcadora",
                "categoria": "empaque",
                "proveedor": "Empaques HG",
                "unidad_medida": "rollo",
                "stock_actual": Decimal("12"),
                "stock_minimo": Decimal("60"),
                "stock_maximo": Decimal("200"),
                "precio_unitario": Decimal("8.00"),
                "fecha_vencimiento": date.today() + timedelta(days=45),
            },
            {
                "nombre": "Cinta Verde Marcadora",
                "categoria": "empaque",
                "proveedor": "Empaques HG",
                "unidad_medida": "rollo",
                "stock_actual": Decimal("5"),
                "stock_minimo": Decimal("60"),
                "stock_maximo": Decimal("220"),
                "precio_unitario": Decimal("8.00"),
                "fecha_vencimiento": date.today() + timedelta(days=30),
            },
            {
                "nombre": "Fertilizante Urea 46%",
                "categoria": "fertilizante",
                "proveedor": "AgroQuímicos SA",
                "unidad_medida": "kg",
                "stock_actual": Decimal("80"),
                "stock_minimo": Decimal("200"),
                "stock_maximo": Decimal("800"),
                "precio_unitario": Decimal("1.10"),
                "fecha_vencimiento": date.today() + timedelta(days=240),
            },
            {
                "nombre": "Desinfectante Industrial",
                "categoria": "protector",
                "proveedor": "AgroQuímicos SA",
                "unidad_medida": "litro",
                "stock_actual": Decimal("10"),
                "stock_minimo": Decimal("80"),
                "stock_maximo": Decimal("300"),
                "precio_unitario": Decimal("10.50"),
                "fecha_vencimiento": date.today() + timedelta(days=90),
            },
            {
                "nombre": "Cajas Cartón Reforzado",
                "categoria": "empaque",
                "proveedor": "Empaques HG",
                "unidad_medida": "unidad",
                "stock_actual": Decimal("800"),
                "stock_minimo": Decimal("3000"),
                "stock_maximo": Decimal("9000"),
                "precio_unitario": Decimal("1.10"),
            },
            {
                "nombre": "Guantes Nitrilo Talla M",
                "categoria": "herramienta",
                "proveedor": "SegurAgro",
                "unidad_medida": "par",
                "stock_actual": Decimal("25"),
                "stock_minimo": Decimal("120"),
                "stock_maximo": Decimal("400"),
                "precio_unitario": Decimal("2.90"),
            },
            {
                "nombre": "Fertilizante NPK 12-12-17",
                "categoria": "fertilizante",
                "proveedor": "AgroQuímicos SA",
                "unidad_medida": "kg",
                "stock_actual": Decimal("100"),
                "stock_minimo": Decimal("250"),
                "stock_maximo": Decimal("900"),
                "precio_unitario": Decimal("1.35"),
                "fecha_vencimiento": date.today() + timedelta(days=120),
            },
            {
                "nombre": "Plástico Protector Racimo",
                "categoria": "protector",
                "proveedor": "Plásticos del Banano",
                "unidad_medida": "unidad",
                "stock_actual": Decimal("500"),
                "stock_minimo": Decimal("2500"),
                "stock_maximo": Decimal("6000"),
                "precio_unitario": Decimal("0.18"),
            },
            {
                "nombre": "Mascarillas N95",
                "categoria": "herramienta",
                "proveedor": "SegurAgro",
                "unidad_medida": "unidad",
                "stock_actual": Decimal("20"),
                "stock_minimo": Decimal("100"),
                "stock_maximo": Decimal("500"),
                "precio_unitario": Decimal("1.50"),
            },
            {
                "nombre": "Insecticida Clorpirifos",
                "categoria": "protector",
                "proveedor": "AgroQuímicos SA",
                "unidad_medida": "litro",
                "stock_actual": Decimal("8"),
                "stock_minimo": Decimal("50"),
                "stock_maximo": Decimal("150"),
                "precio_unitario": Decimal("15.00"),
                "fecha_vencimiento": date.today() + timedelta(days=200),
            },
        ]

        creados = 0
        actualizados = 0

        for i, insumo_data in enumerate(insumos_alertas):
            # Asignar finca alternadamente si hay fincas
            finca = fincas[i % len(fincas)] if fincas else None
            
            insumo, created = Insumo.objects.update_or_create(
                nombre=insumo_data["nombre"],
                defaults={
                    "categoria": insumo_data["categoria"],
                    "proveedor": insumo_data["proveedor"],
                    "unidad_medida": insumo_data["unidad_medida"],
                    "stock_actual": insumo_data["stock_actual"],
                    "stock_minimo": insumo_data["stock_minimo"],
                    "stock_maximo": insumo_data["stock_maximo"],
                    "precio_unitario": insumo_data["precio_unitario"],
                    "fecha_vencimiento": insumo_data.get("fecha_vencimiento"),
                    "finca": finca,
                }
            )
            
            if created:
                creados += 1
                self.stdout.write(f'  ✅ Creado: {insumo.nombre} (Stock: {insumo.stock_actual}/{insumo.stock_minimo})')
            else:
                actualizados += 1
                self.stdout.write(f'  🔄 Actualizado: {insumo.nombre} (Stock: {insumo.stock_actual}/{insumo.stock_minimo})')

        self.stdout.write(self.style.SUCCESS(
            f'\n🔔 Alertas de inventario: {creados} insumos creados, {actualizados} actualizados'
        ))
        self.stdout.write(self.style.SUCCESS(
            f'📊 Total de insumos con stock bajo: {len(insumos_alertas)}'
        ))
