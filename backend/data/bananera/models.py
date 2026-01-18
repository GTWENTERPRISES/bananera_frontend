"""
Modelos para la aplicación Bananera
"""

import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UsuarioManager(BaseUserManager):
    def create_user(self, email, nombre, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, nombre=nombre, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nombre, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('rol', 'administrador')
        return self.create_user(email, nombre, password, **extra_fields)


class Finca(models.Model):
    """Modelo para representar una finca bananera"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=100, unique=True)
    ubicacion = models.CharField(max_length=200, blank=True)
    hectareas = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    responsable = models.CharField(max_length=100, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    activa = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Finca'
        verbose_name_plural = 'Fincas'

    def __str__(self):
        return self.nombre


class Usuario(AbstractBaseUser, PermissionsMixin):
    """Modelo de usuario personalizado"""
    ROLES = [
        ('administrador', 'Administrador'),
        ('gerente', 'Gerente'),
        ('supervisor_finca', 'Supervisor de Finca'),
        ('contador_rrhh', 'Contador/RRHH'),
        ('bodeguero', 'Bodeguero'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    nombre = models.CharField(max_length=100)
    rol = models.CharField(max_length=20, choices=ROLES, default='supervisor_finca')
    finca_asignada = models.ForeignKey(
        Finca, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='usuarios'
    )
    telefono = models.CharField(max_length=20, blank=True)
    activo = models.BooleanField(default=True)
    avatar = models.CharField(max_length=255, blank=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre']

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f"{self.nombre} ({self.email})"


class Enfunde(models.Model):
    """Modelo para registro de enfundes"""
    COLORES_CINTA = [
        ('verde', 'Verde'),
        ('azul', 'Azul'),
        ('rojo', 'Rojo'),
        ('amarillo', 'Amarillo'),
        ('blanco', 'Blanco'),
        ('negro', 'Negro'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    finca = models.ForeignKey(Finca, on_delete=models.CASCADE, related_name='enfundes')
    fecha = models.DateField()
    semana = models.IntegerField()
    año = models.IntegerField()
    color_cinta = models.CharField(max_length=20, choices=COLORES_CINTA)
    cantidad_enfundes = models.IntegerField()
    matas_caidas = models.IntegerField(default=0)
    observaciones = models.TextField(blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha']
        verbose_name = 'Enfunde'
        verbose_name_plural = 'Enfundes'

    def __str__(self):
        return f"Enfunde {self.finca.nombre} - Semana {self.semana}/{self.año}"


class Cosecha(models.Model):
    """Modelo para registro de cosechas"""
    LOTES = [
        ('A', 'Lote A'),
        ('B', 'Lote B'),
        ('C', 'Lote C'),
        ('D', 'Lote D'),
        ('E', 'Lote E'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    finca = models.ForeignKey(Finca, on_delete=models.CASCADE, related_name='cosechas')
    fecha = models.DateField()
    semana = models.IntegerField()
    año = models.IntegerField()
    lote = models.CharField(max_length=1, choices=LOTES)
    cajas_producidas = models.IntegerField()
    racimos_recuperados = models.IntegerField(default=0)
    peso_promedio = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    calibracion = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    manos = models.IntegerField(default=0)
    ratio = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    observaciones = models.TextField(blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha']
        verbose_name = 'Cosecha'
        verbose_name_plural = 'Cosechas'

    def __str__(self):
        return f"Cosecha {self.finca.nombre} - {self.fecha}"


class RecuperacionCinta(models.Model):
    """Modelo para registro de recuperación de cintas"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enfunde = models.ForeignKey(Enfunde, on_delete=models.CASCADE, related_name='recuperaciones')
    fecha = models.DateField()
    cintas_recuperadas = models.IntegerField()
    porcentaje_recuperacion = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    observaciones = models.TextField(blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha']
        verbose_name = 'Recuperación de Cinta'
        verbose_name_plural = 'Recuperaciones de Cintas'

    def __str__(self):
        return f"Recuperación {self.enfunde} - {self.fecha}"


class Empleado(models.Model):
    """Modelo para empleados"""
    CARGOS = [
        ('jornalero', 'Jornalero'),
        ('enfundador', 'Enfundador'),
        ('cortador', 'Cortador'),
        ('empacador', 'Empacador'),
        ('supervisor', 'Supervisor'),
        ('administrador', 'Administrador'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    finca = models.ForeignKey(Finca, on_delete=models.CASCADE, related_name='empleados')
    nombre = models.CharField(max_length=100)
    cedula = models.CharField(max_length=20, unique=True)
    cargo = models.CharField(max_length=20, choices=CARGOS)
    salario_base = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fecha_ingreso = models.DateField()
    telefono = models.CharField(max_length=20, blank=True)
    direccion = models.CharField(max_length=200, blank=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Empleado'
        verbose_name_plural = 'Empleados'

    def __str__(self):
        return f"{self.nombre} - {self.cargo}"


class RolPago(models.Model):
    """Modelo para roles de pago"""
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('aprobado', 'Aprobado'),
        ('pagado', 'Pagado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='roles_pago')
    fecha_pago = models.DateField()
    periodo_inicio = models.DateField()
    periodo_fin = models.DateField()
    salario_base = models.DecimalField(max_digits=10, decimal_places=2)
    horas_extras = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonificaciones = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deducciones = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_pagar = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    observaciones = models.TextField(blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_pago']
        verbose_name = 'Rol de Pago'
        verbose_name_plural = 'Roles de Pago'

    def __str__(self):
        return f"Rol {self.empleado.nombre} - {self.fecha_pago}"


class Prestamo(models.Model):
    """Modelo para préstamos a empleados"""
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('aprobado', 'Aprobado'),
        ('pagado', 'Pagado'),
        ('rechazado', 'Rechazado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='prestamos')
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    monto_pagado = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cuotas = models.IntegerField()
    cuotas_pagadas = models.IntegerField(default=0)
    fecha_solicitud = models.DateField()
    fecha_aprobacion = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    motivo = models.TextField(blank=True)
    observaciones = models.TextField(blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_solicitud']
        verbose_name = 'Préstamo'
        verbose_name_plural = 'Préstamos'

    def __str__(self):
        return f"Préstamo {self.empleado.nombre} - ${self.monto}"


class Insumo(models.Model):
    """Modelo para insumos de inventario"""
    CATEGORIAS = [
        ('fertilizante', 'Fertilizante'),
        ('protector', 'Protector'),
        ('herramienta', 'Herramienta'),
        ('empaque', 'Empaque'),
        ('quimico', 'Químico'),
        ('par', 'Par'),
        ('otro', 'Otro'),
    ]

    UNIDADES = [
        ('unidad', 'Unidad'),
        ('kg', 'Kilogramo'),
        ('litro', 'Litro'),
        ('metro', 'Metro'),
        ('rollo', 'Rollo'),
        ('caja', 'Caja'),
        ('par', 'Par'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    finca = models.ForeignKey(Finca, on_delete=models.CASCADE, related_name='insumos', null=True, blank=True)
    nombre = models.CharField(max_length=100)
    categoria = models.CharField(max_length=20, choices=CATEGORIAS)
    proveedor = models.CharField(max_length=100, blank=True)
    unidad_medida = models.CharField(max_length=20, choices=UNIDADES, default='unidad')
    stock_actual = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_minimo = models.DecimalField(max_digits=10, decimal_places=2, default=10)
    stock_maximo = models.DecimalField(max_digits=10, decimal_places=2, default=1000)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fecha_vencimiento = models.DateField(null=True, blank=True)
    pedido_generado = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Insumo'
        verbose_name_plural = 'Insumos'

    def __str__(self):
        return f"{self.nombre} ({self.finca.nombre if self.finca else 'Sin finca'})"


class MovimientoInventario(models.Model):
    """Modelo para movimientos de inventario"""
    TIPOS = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    insumo = models.ForeignKey(Insumo, on_delete=models.CASCADE, related_name='movimientos')
    finca = models.ForeignKey(Finca, on_delete=models.CASCADE, related_name='movimientos_inventario')
    tipo = models.CharField(max_length=10, choices=TIPOS)
    cantidad = models.IntegerField()
    fecha = models.DateField()
    responsable = models.ForeignKey(
        Usuario, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='movimientos_inventario'
    )
    observaciones = models.TextField(blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha']
        verbose_name = 'Movimiento de Inventario'
        verbose_name_plural = 'Movimientos de Inventario'

    def __str__(self):
        return f"{self.tipo} - {self.insumo.nombre} ({self.cantidad})"


class Alerta(models.Model):
    """Modelo para alertas del sistema"""
    TIPOS = [
        ('stock_bajo', 'Stock Bajo'),
        ('pago_pendiente', 'Pago Pendiente'),
        ('prestamo_vencido', 'Préstamo Vencido'),
        ('cosecha', 'Cosecha'),
        ('mantenimiento', 'Mantenimiento'),
        ('general', 'General'),
    ]

    PRIORIDADES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('critica', 'Crítica'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tipo = models.CharField(max_length=20, choices=TIPOS)
    prioridad = models.CharField(max_length=10, choices=PRIORIDADES, default='media')
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    leida = models.BooleanField(default=False)
    finca = models.ForeignKey(
        Finca, on_delete=models.CASCADE, null=True, blank=True,
        related_name='alertas'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = 'Alerta'
        verbose_name_plural = 'Alertas'

    def __str__(self):
        return f"{self.tipo}: {self.titulo}"


class PasswordResetCode(models.Model):
    """Código de recuperación de contraseña"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(
        Usuario, on_delete=models.CASCADE,
        related_name='reset_codes'
    )
    codigo = models.CharField(max_length=6)
    usado = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_expiracion = models.DateTimeField()

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = 'Código de Recuperación'
        verbose_name_plural = 'Códigos de Recuperación'

    def __str__(self):
        return f"Código para {self.usuario.email}"

    @property
    def is_valid(self):
        from django.utils import timezone
        return not self.usado and self.fecha_expiracion > timezone.now()
