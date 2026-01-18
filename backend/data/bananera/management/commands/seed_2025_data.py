"""
Comando para insertar datos de producción 2025
Ejecutar con: python manage.py seed_2025_data
"""

from django.core.management.base import BaseCommand
from bananera.models import Finca, Enfunde, Cosecha
from datetime import date
import random


class Command(BaseCommand):
    help = 'Seed production data for 2025'

    def handle(self, *args, **options):
        fincas = Finca.objects.all()
        
        if not fincas.exists():
            self.stdout.write(self.style.ERROR('No hay fincas registradas. Primero crea las fincas.'))
            return

        colores = ['azul', 'rojo', 'amarillo', 'verde', 'naranja', 'morado', 'rosado', 'blanco']
        
        enfundes_creados = 0
        cosechas_creadas = 0

        for finca in fincas:
            self.stdout.write(f'Procesando finca: {finca.nombre}')
            
            # Crear enfundes y cosechas para semanas 1-52 de 2025
            for semana in range(1, 53):
                # Enfunde
                if not Enfunde.objects.filter(finca=finca, semana=semana, año=2025).exists():
                    cantidad_base = random.randint(800, 1500)
                    Enfunde.objects.create(
                        finca=finca,
                        semana=semana,
                        año=2025,
                        color_cinta=colores[(semana - 1) % len(colores)],
                        cantidad_enfundes=cantidad_base + random.randint(-100, 100),
                        matas_caidas=random.randint(5, 30),
                        fecha=date(2025, min((semana - 1) // 4 + 1, 12), 1)
                    )
                    enfundes_creados += 1

                # Cosecha
                if not Cosecha.objects.filter(finca=finca, semana=semana, año=2025).exists():
                    racimos = random.randint(300, 600)
                    rechazados = random.randint(10, 40)
                    recuperados = random.randint(5, 20)
                    cajas = int((racimos - rechazados + recuperados) * random.uniform(1.8, 2.3))
                    
                    Cosecha.objects.create(
                        finca=finca,
                        semana=semana,
                        año=2025,
                        racimos_corta=racimos,
                        racimos_rechazados=rechazados,
                        racimos_recuperados=recuperados,
                        cajas_producidas=cajas,
                        ratio=round(cajas / max(racimos, 1), 2),
                        merma=round((rechazados / max(racimos, 1)) * 100, 2),
                        peso_promedio=round(random.uniform(40, 45), 2),
                        calibracion=round(random.uniform(44, 48), 1),
                        numero_manos=round(random.uniform(8.5, 10), 1),
                        fecha=date(2025, 1, 1) if semana <= 4 else date(2025, min((semana - 1) // 4 + 1, 12), 1)
                    )
                    cosechas_creadas += 1

        self.stdout.write(self.style.SUCCESS(
            f'✅ Datos 2025 creados: {enfundes_creados} enfundes, {cosechas_creadas} cosechas'
        ))
