"""
Admin para la app Bananera
"""

from django.contrib import admin
from .models import (
    Finca, Usuario, Enfunde, Cosecha, RecuperacionCinta,
    Empleado, RolPago, Prestamo, Insumo, MovimientoInventario, Alerta,
    PasswordResetCode
)


@admin.register(Finca)
class FincaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'ubicacion', 'hectareas', 'responsable', 'activa']
    list_filter = ['activa']
    search_fields = ['nombre', 'ubicacion', 'responsable']


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ['email', 'nombre', 'rol', 'finca_asignada', 'activo', 'is_staff']
    list_filter = ['rol', 'activo', 'finca_asignada', 'is_staff']
    search_fields = ['email', 'nombre']
    ordering = ['email']
    readonly_fields = ['last_login']
    
    fieldsets = (
        ('Credenciales', {'fields': ('email', 'password')}),
        ('Información Personal', {'fields': ('nombre', 'telefono', 'avatar')}),
        ('Permisos', {'fields': ('rol', 'finca_asignada', 'activo', 'is_staff', 'is_superuser')}),
        ('Info', {'fields': ('last_login',)}),
    )
    
    def save_model(self, request, obj, form, change):
        if 'password' in form.changed_data:
            obj.set_password(form.cleaned_data['password'])
        super().save_model(request, obj, form, change)


@admin.register(Enfunde)
class EnfundeAdmin(admin.ModelAdmin):
    list_display = ['finca', 'fecha', 'semana', 'año', 'color_cinta', 'cantidad_enfundes']
    list_filter = ['finca', 'color_cinta', 'año']
    date_hierarchy = 'fecha'


@admin.register(Cosecha)
class CosechaAdmin(admin.ModelAdmin):
    list_display = ['finca', 'fecha', 'semana', 'cajas_producidas', 'peso_promedio', 'ratio']
    list_filter = ['finca', 'año']
    date_hierarchy = 'fecha'


@admin.register(RecuperacionCinta)
class RecuperacionCintaAdmin(admin.ModelAdmin):
    list_display = ['enfunde', 'fecha', 'cintas_recuperadas', 'porcentaje_recuperacion']
    list_filter = ['fecha']
    date_hierarchy = 'fecha'


@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'cedula', 'finca', 'cargo', 'salario_base', 'activo']
    list_filter = ['finca', 'cargo', 'activo']
    search_fields = ['nombre', 'cedula']


@admin.register(RolPago)
class RolPagoAdmin(admin.ModelAdmin):
    list_display = ['empleado', 'fecha_pago', 'salario_base', 'total_pagar', 'estado']
    list_filter = ['estado', 'fecha_pago']
    date_hierarchy = 'fecha_pago'


@admin.register(Prestamo)
class PrestamoAdmin(admin.ModelAdmin):
    list_display = ['empleado', 'monto', 'monto_pagado', 'cuotas', 'cuotas_pagadas', 'estado']
    list_filter = ['estado']


@admin.register(Insumo)
class InsumoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'finca', 'categoria', 'stock_actual', 'stock_minimo', 'precio_unitario']
    list_filter = ['finca', 'categoria']
    search_fields = ['nombre']


@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ['insumo', 'finca', 'tipo', 'cantidad', 'fecha', 'responsable']
    list_filter = ['tipo', 'finca', 'fecha']
    date_hierarchy = 'fecha'


@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'tipo', 'prioridad', 'finca', 'leida', 'fecha_creacion']
    list_filter = ['tipo', 'prioridad', 'leida', 'finca']
    search_fields = ['titulo', 'mensaje']


@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'codigo', 'usado', 'fecha_creacion', 'fecha_expiracion']
    list_filter = ['usado', 'fecha_creacion']
    search_fields = ['usuario__email', 'codigo']
    readonly_fields = ['codigo', 'fecha_creacion']
