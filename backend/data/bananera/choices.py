"""
Choices para los modelos del sistema bananera
"""

from django.db import models


class EstadoFinca(models.TextChoices):
    ACTIVA = 'activa', 'Activa'
    INACTIVA = 'inactiva', 'Inactiva'
    MANTENIMIENTO = 'mantenimiento', 'En Mantenimiento'


class RolUsuario(models.TextChoices):
    ADMINISTRADOR = 'administrador', 'Administrador'
    GERENTE = 'gerente', 'Gerente'
    SUPERVISOR_FINCA = 'supervisor_finca', 'Supervisor de Finca'
    CONTADOR_RRHH = 'contador_rrhh', 'Contador/RRHH'
    BODEGUERO = 'bodeguero', 'Bodeguero'


class ColorCinta(models.TextChoices):
    AZUL = 'azul', 'Azul'
    ROJO = 'rojo', 'Rojo'
    AMARILLO = 'amarillo', 'Amarillo'
    VERDE = 'verde', 'Verde'
    NARANJA = 'naranja', 'Naranja'
    MORADO = 'morado', 'Morado'
    ROSADO = 'rosado', 'Rosado'
    BLANCO = 'blanco', 'Blanco'


class Lote(models.TextChoices):
    A = 'A', 'Lote A'
    B = 'B', 'Lote B'
    C = 'C', 'Lote C'
    D = 'D', 'Lote D'
    E = 'E', 'Lote E'


class LaborEmpleado(models.TextChoices):
    ENFUNDE = 'Enfunde', 'Enfunde'
    COSECHA = 'Cosecha', 'Cosecha'
    CALIBRACION = 'Calibración', 'Calibración'
    VARIOS = 'Varios', 'Varios'
    ADMINISTRADOR = 'Administrador', 'Administrador'
    SUPERVISOR = 'Supervisor', 'Supervisor'
    FUMIGACION = 'Fumigación', 'Fumigación'
    MANTENIMIENTO = 'Mantenimiento', 'Mantenimiento'


class VariedadBanano(models.TextChoices):
    CAVENDISH = 'Cavendish', 'Cavendish'
    CLON = 'Clon', 'Clon'
    WILLIAMS = 'Williams', 'Williams'
    GRAN_ENANO = 'Gran Enano', 'Gran Enano'
    OTRO = 'Otro', 'Otro'


class UnidadMedida(models.TextChoices):
    KG = 'kg', 'Kilogramos'
    LITROS = 'L', 'Litros'
    UNIDADES = 'unidades', 'Unidades'
    ROLLOS = 'rollos', 'Rollos'
    PARES = 'pares', 'Pares'
    CAJAS = 'cajas', 'Cajas'
    GALONES = 'galones', 'Galones'
    SACOS = 'sacos', 'Sacos'


class TipoMovimientoInventario(models.TextChoices):
    ENTRADA = 'entrada', 'Entrada'
    SALIDA = 'salida', 'Salida'


class CategoriaInsumo(models.TextChoices):
    FERTILIZANTE = 'fertilizante', 'Fertilizante'
    PROTECTOR = 'protector', 'Protector'
    HERRAMIENTA = 'herramienta', 'Herramienta'
    EMPAQUE = 'empaque', 'Empaque'
    OTRO = 'otro', 'Otro'


class EstadoRolPago(models.TextChoices):
    PENDIENTE = 'pendiente', 'Pendiente'
    PAGADO = 'pagado', 'Pagado'


class EstadoPrestamo(models.TextChoices):
    ACTIVO = 'activo', 'Activo'
    FINALIZADO = 'finalizado', 'Finalizado'


class TipoAlerta(models.TextChoices):
    CRITICO = 'critico', 'Crítico'
    ADVERTENCIA = 'advertencia', 'Advertencia'
    INFO = 'info', 'Información'


class TipoReporte(models.TextChoices):
    PRODUCCION = 'produccion', 'Producción'
    ENFUNDES = 'enfundes', 'Enfundes'
    COSECHAS = 'cosechas', 'Cosechas'
    NOMINA = 'nomina', 'Nómina'
    INVENTARIO = 'inventario', 'Inventario'
    FINANCIERO = 'financiero', 'Financiero'


class FormatoReporte(models.TextChoices):
    PDF = 'pdf', 'PDF'
    EXCEL = 'excel', 'Excel'
    CSV = 'csv', 'CSV'


class TipoAccionAuditoria(models.TextChoices):
    INSERT = 'INSERT', 'Insertar'
    UPDATE = 'UPDATE', 'Actualizar'
    DELETE = 'DELETE', 'Eliminar'


class ModuloSistema(models.TextChoices):
    """Módulos del sistema para alertas y auditoría"""
    PRODUCCION = 'produccion', 'Producción'
    NOMINA = 'nomina', 'Nómina'
    INVENTARIO = 'inventario', 'Inventario'
    CONFIGURACION = 'configuracion', 'Configuración'
    REPORTES = 'reportes', 'Reportes'
    SISTEMA = 'sistema', 'Sistema'






