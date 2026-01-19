"""
Admin para la app Bananera - Interfaz optimizada y fácil de usar
"""

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Finca, Usuario, Enfunde, Cosecha, RecuperacionCinta,
    Empleado, RolPago, Prestamo, Insumo, MovimientoInventario, Alerta,
    PasswordResetCode
)

# ============================================
# CONFIGURACIÓN GLOBAL DEL ADMIN
# ============================================
admin.site.site_header = "🍌 Bananera HG - Administración"
admin.site.site_title = "Bananera Admin"
admin.site.index_title = "Panel de Control"


# ============================================
# FINCAS
# ============================================
@admin.register(Finca)
class FincaAdmin(admin.ModelAdmin):
    list_display = ['nombre_con_icono', 'ubicacion', 'hectareas_format', 'responsable', 'estado_badge']
    list_filter = ['activa']
    search_fields = ['nombre', 'ubicacion', 'responsable']
    list_editable = ['responsable']
    list_per_page = 20
    
    fieldsets = (
        ('📍 Información General', {
            'fields': ('nombre', 'ubicacion', 'hectareas'),
            'classes': ('wide',)
        }),
        ('👤 Administración', {
            'fields': ('responsable', 'activa'),
        }),
    )
    
    @admin.display(description='Finca')
    def nombre_con_icono(self, obj):
        return format_html('🏡 <strong>{}</strong>', obj.nombre)
    
    @admin.display(description='Hectáreas')
    def hectareas_format(self, obj):
        return format_html('<span style="color:#059669;font-weight:600;">{} ha</span>', obj.hectareas)
    
    @admin.display(description='Estado')
    def estado_badge(self, obj):
        if obj.activa:
            return mark_safe('<span style="background:#10b981;color:white;padding:3px 10px;border-radius:12px;">✓ Activa</span>')
        return mark_safe('<span style="background:#ef4444;color:white;padding:3px 10px;border-radius:12px;">✗ Inactiva</span>')


# ============================================
# USUARIOS
# ============================================
@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ['email', 'nombre', 'rol_badge', 'finca_asignada', 'estado_badge', 'is_staff']
    list_filter = ['rol', 'activo', 'finca_asignada', 'is_staff']
    search_fields = ['email', 'nombre', 'telefono']
    ordering = ['nombre']
    readonly_fields = ['last_login', 'fecha_creacion']
    list_per_page = 25
    
    fieldsets = (
        ('🔐 Credenciales', {
            'fields': ('email', 'password'),
            'classes': ('wide',)
        }),
        ('👤 Información Personal', {
            'fields': ('nombre', 'telefono', 'avatar'),
            'classes': ('wide',)
        }),
        ('🛡️ Permisos y Acceso', {
            'fields': ('rol', 'finca_asignada', 'activo', 'is_staff', 'is_superuser'),
            'classes': ('wide',)
        }),
        ('📅 Información del Sistema', {
            'fields': ('last_login', 'fecha_creacion'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activar_usuarios', 'desactivar_usuarios']
    
    @admin.display(description='Rol')
    def rol_badge(self, obj):
        colors = {
            'admin': '#7c3aed',
            'supervisor': '#2563eb',
            'operador': '#059669',
            'visualizador': '#6b7280',
        }
        color = colors.get(obj.rol, '#6b7280')
        return format_html('<span style="background:{};color:white;padding:3px 10px;border-radius:12px;text-transform:capitalize;">{}</span>', color, obj.rol)
    
    @admin.display(description='Estado')
    def estado_badge(self, obj):
        if obj.activo:
            return mark_safe('<span style="color:#10b981;">● Activo</span>')
        return mark_safe('<span style="color:#ef4444;">● Inactivo</span>')
    
    @admin.action(description='✓ Activar usuarios seleccionados')
    def activar_usuarios(self, request, queryset):
        queryset.update(activo=True)
        self.message_user(request, f'{queryset.count()} usuarios activados')
    
    @admin.action(description='✗ Desactivar usuarios seleccionados')
    def desactivar_usuarios(self, request, queryset):
        queryset.update(activo=False)
        self.message_user(request, f'{queryset.count()} usuarios desactivados')
    
    def save_model(self, request, obj, form, change):
        if 'password' in form.changed_data:
            obj.set_password(form.cleaned_data['password'])
        super().save_model(request, obj, form, change)


# ============================================
# PRODUCCIÓN - ENFUNDES
# ============================================
@admin.register(Enfunde)
class EnfundeAdmin(admin.ModelAdmin):
    list_display = ['finca', 'fecha', 'semana_año', 'color_badge', 'cantidad_format']
    list_filter = ['finca', 'color_cinta', 'año', 'semana']
    date_hierarchy = 'fecha'
    list_per_page = 30
    ordering = ['-fecha']
    
    fieldsets = (
        ('📍 Ubicación', {'fields': ('finca',)}),
        ('📅 Fecha', {'fields': ('fecha', 'semana', 'año')}),
        ('🎨 Detalles', {'fields': ('color_cinta', 'cantidad_enfundes', 'observaciones')}),
    )
    
    @admin.display(description='Semana/Año')
    def semana_año(self, obj):
        return format_html('S{} / {}', obj.semana, obj.año)
    
    @admin.display(description='Cinta')
    def color_badge(self, obj):
        colors = {
            'rojo': '#ef4444', 'azul': '#3b82f6', 'verde': '#22c55e',
            'amarillo': '#eab308', 'naranja': '#f97316', 'morado': '#a855f7',
            'blanco': '#e5e7eb', 'negro': '#1f2937',
        }
        color = colors.get(obj.color_cinta.lower(), '#6b7280')
        text_color = 'white' if obj.color_cinta.lower() not in ['blanco', 'amarillo'] else 'black'
        return format_html('<span style="background:{};color:{};padding:3px 12px;border-radius:12px;text-transform:capitalize;">{}</span>', color, text_color, obj.color_cinta)
    
    @admin.display(description='Cantidad')
    def cantidad_format(self, obj):
        return mark_safe(f'<strong>{obj.cantidad_enfundes:,}</strong> enfundes')


# ============================================
# PRODUCCIÓN - COSECHAS
# ============================================
@admin.register(Cosecha)
class CosechaAdmin(admin.ModelAdmin):
    list_display = ['finca', 'fecha', 'semana_año', 'cajas_format', 'peso_promedio', 'ratio_badge']
    list_filter = ['finca', 'año']
    date_hierarchy = 'fecha'
    list_per_page = 30
    ordering = ['-fecha']
    
    @admin.display(description='Semana/Año')
    def semana_año(self, obj):
        return format_html('S{} / {}', obj.semana, obj.año)
    
    @admin.display(description='Cajas')
    def cajas_format(self, obj):
        return mark_safe(f'<strong style="color:#059669;">{obj.cajas_producidas:,}</strong>')
    
    @admin.display(description='Ratio')
    def ratio_badge(self, obj):
        ratio = obj.ratio or 0
        color = '#10b981' if ratio >= 1.0 else '#f59e0b' if ratio >= 0.8 else '#ef4444'
        return mark_safe(f'<span style="color:{color};font-weight:600;">{ratio:.2f}</span>')


# ============================================
# RECUPERACIÓN DE CINTAS
# ============================================
@admin.register(RecuperacionCinta)
class RecuperacionCintaAdmin(admin.ModelAdmin):
    list_display = ['enfunde', 'fecha', 'cintas_recuperadas', 'porcentaje_badge']
    list_filter = ['fecha']
    date_hierarchy = 'fecha'
    list_per_page = 30
    
    @admin.display(description='% Recuperación')
    def porcentaje_badge(self, obj):
        pct = obj.porcentaje_recuperacion or 0
        color = '#10b981' if pct >= 80 else '#f59e0b' if pct >= 50 else '#ef4444'
        return mark_safe(f'<span style="background:{color};color:white;padding:3px 10px;border-radius:12px;">{pct:.1f}%</span>')


# ============================================
# NÓMINA - EMPLEADOS
# ============================================
@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    list_display = ['nombre_completo', 'cedula', 'finca', 'cargo_badge', 'salario_format', 'estado_badge']
    list_filter = ['finca', 'cargo', 'activo']
    search_fields = ['nombre', 'cedula', 'telefono']
    list_editable = ['finca']
    list_per_page = 30
    ordering = ['nombre']
    
    fieldsets = (
        ('👤 Datos Personales', {
            'fields': ('nombre', 'cedula', 'telefono', 'direccion'),
            'classes': ('wide',)
        }),
        ('💼 Información Laboral', {
            'fields': ('finca', 'cargo', 'fecha_ingreso', 'salario_base'),
            'classes': ('wide',)
        }),
        ('📋 Estado', {
            'fields': ('activo',),
        }),
    )
    
    actions = ['activar_empleados', 'desactivar_empleados']
    
    @admin.display(description='Empleado')
    def nombre_completo(self, obj):
        return format_html('👤 <strong>{}</strong>', obj.nombre)
    
    @admin.display(description='Cargo')
    def cargo_badge(self, obj):
        return format_html('<span style="background:#e0e7ff;color:#4338ca;padding:3px 10px;border-radius:12px;">{}</span>', obj.cargo)
    
    @admin.display(description='Salario')
    def salario_format(self, obj):
        return mark_safe(f'<span style="color:#059669;font-weight:600;">${obj.salario_base:,.2f}</span>')
    
    @admin.display(description='Estado')
    def estado_badge(self, obj):
        if obj.activo:
            return mark_safe('<span style="color:#10b981;">● Activo</span>')
        return mark_safe('<span style="color:#ef4444;">● Inactivo</span>')
    
    @admin.action(description='✓ Activar empleados')
    def activar_empleados(self, request, queryset):
        queryset.update(activo=True)
    
    @admin.action(description='✗ Desactivar empleados')
    def desactivar_empleados(self, request, queryset):
        queryset.update(activo=False)


# ============================================
# NÓMINA - ROLES DE PAGO
# ============================================
@admin.register(RolPago)
class RolPagoAdmin(admin.ModelAdmin):
    list_display = ['empleado', 'fecha_pago', 'salario_format', 'total_format', 'estado_badge']
    list_filter = ['estado', 'fecha_pago', 'empleado__finca']
    date_hierarchy = 'fecha_pago'
    list_per_page = 30
    ordering = ['-fecha_pago']
    
    actions = ['marcar_pagado', 'marcar_pendiente']
    
    @admin.display(description='Salario Base')
    def salario_format(self, obj):
        return f'${obj.salario_base:,.2f}'
    
    @admin.display(description='Total a Pagar')
    def total_format(self, obj):
        return mark_safe(f'<strong style="color:#059669;">${obj.total_pagar:,.2f}</strong>')
    
    @admin.display(description='Estado')
    def estado_badge(self, obj):
        colors = {'pagado': '#10b981', 'pendiente': '#f59e0b', 'cancelado': '#ef4444'}
        icons = {'pagado': '✓', 'pendiente': '⏳', 'cancelado': '✗'}
        return format_html('<span style="background:{};color:white;padding:3px 10px;border-radius:12px;">{} {}</span>', 
            colors.get(obj.estado, '#6b7280'), icons.get(obj.estado, ''), obj.estado.capitalize())
    
    @admin.action(description='✓ Marcar como pagado')
    def marcar_pagado(self, request, queryset):
        queryset.update(estado='pagado')
        self.message_user(request, f'{queryset.count()} roles marcados como pagados')
    
    @admin.action(description='⏳ Marcar como pendiente')
    def marcar_pendiente(self, request, queryset):
        queryset.update(estado='pendiente')


# ============================================
# PRÉSTAMOS
# ============================================
@admin.register(Prestamo)
class PrestamoAdmin(admin.ModelAdmin):
    list_display = ['empleado', 'monto_format', 'pagado_format', 'cuotas_progreso', 'estado_badge']
    list_filter = ['estado', 'empleado__finca']
    search_fields = ['empleado__nombre']
    list_per_page = 30
    
    actions = ['marcar_activo', 'marcar_pagado']
    
    @admin.display(description='Monto')
    def monto_format(self, obj):
        return mark_safe(f'<strong>${obj.monto:,.2f}</strong>')
    
    @admin.display(description='Pagado')
    def pagado_format(self, obj):
        return mark_safe(f'<span style="color:#059669;">${obj.monto_pagado:,.2f}</span>')
    
    @admin.display(description='Cuotas')
    def cuotas_progreso(self, obj):
        pct = (obj.cuotas_pagadas / obj.cuotas * 100) if obj.cuotas > 0 else 0
        return f'{obj.cuotas_pagadas}/{obj.cuotas} ({pct:.0f}%)'
    
    @admin.display(description='Estado')
    def estado_badge(self, obj):
        colors = {'activo': '#3b82f6', 'pagado': '#10b981', 'cancelado': '#ef4444'}
        return format_html('<span style="background:{};color:white;padding:3px 10px;border-radius:12px;">{}</span>', 
            colors.get(obj.estado, '#6b7280'), obj.estado.capitalize())
    
    @admin.action(description='Marcar como activo')
    def marcar_activo(self, request, queryset):
        queryset.update(estado='activo')
    
    @admin.action(description='✓ Marcar como pagado')
    def marcar_pagado(self, request, queryset):
        queryset.update(estado='pagado')


# ============================================
# INVENTARIO - INSUMOS
# ============================================
@admin.register(Insumo)
class InsumoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'finca', 'categoria_badge', 'stock_visual', 'precio_format']
    list_filter = ['finca', 'categoria']
    search_fields = ['nombre']
    list_editable = ['finca']
    list_per_page = 30
    
    fieldsets = (
        ('📦 Información del Insumo', {
            'fields': ('nombre', 'finca', 'categoria', 'unidad_medida'),
        }),
        ('📊 Stock', {
            'fields': ('stock_actual', 'stock_minimo'),
        }),
        ('💰 Precio', {
            'fields': ('precio_unitario',),
        }),
    )
    
    @admin.display(description='Categoría')
    def categoria_badge(self, obj):
        return format_html('<span style="background:#f3f4f6;padding:3px 10px;border-radius:12px;">{}</span>', obj.categoria)
    
    @admin.display(description='Stock')
    def stock_visual(self, obj):
        pct = (obj.stock_actual / obj.stock_minimo * 100) if obj.stock_minimo > 0 else 100
        color = '#10b981' if pct >= 100 else '#f59e0b' if pct >= 50 else '#ef4444'
        icon = '✓' if pct >= 100 else '⚠' if pct >= 50 else '✗'
        return format_html('<span style="color:{};">{} {} / {} min</span>', color, icon, obj.stock_actual, obj.stock_minimo)
    
    @admin.display(description='Precio')
    def precio_format(self, obj):
        return f'${obj.precio_unitario:,.2f}'


# ============================================
# INVENTARIO - MOVIMIENTOS
# ============================================
@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ['insumo', 'finca', 'tipo_badge', 'cantidad_format', 'fecha', 'responsable']
    list_filter = ['tipo', 'finca', 'fecha']
    date_hierarchy = 'fecha'
    list_per_page = 30
    ordering = ['-fecha']
    
    @admin.display(description='Tipo')
    def tipo_badge(self, obj):
        colors = {'entrada': '#10b981', 'salida': '#ef4444', 'ajuste': '#6b7280'}
        icons = {'entrada': '↓', 'salida': '↑', 'ajuste': '↔'}
        return format_html('<span style="background:{};color:white;padding:3px 10px;border-radius:12px;">{} {}</span>', 
            colors.get(obj.tipo, '#6b7280'), icons.get(obj.tipo, ''), obj.tipo.capitalize())
    
    @admin.display(description='Cantidad')
    def cantidad_format(self, obj):
        color = '#10b981' if obj.tipo == 'entrada' else '#ef4444' if obj.tipo == 'salida' else '#6b7280'
        sign = '+' if obj.tipo == 'entrada' else '-' if obj.tipo == 'salida' else ''
        return format_html('<span style="color:{};font-weight:600;">{}{}</span>', color, sign, obj.cantidad)


# ============================================
# ALERTAS
# ============================================
@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ['titulo_con_icono', 'tipo_badge', 'prioridad_badge', 'finca', 'leida_badge', 'fecha_creacion']
    list_filter = ['tipo', 'prioridad', 'leida', 'finca']
    search_fields = ['titulo', 'mensaje']
    list_per_page = 30
    ordering = ['-fecha_creacion']
    
    actions = ['marcar_leida', 'marcar_no_leida']
    
    @admin.display(description='Título')
    def titulo_con_icono(self, obj):
        icons = {'stock': '📦', 'vencimiento': '⏰', 'produccion': '🌱', 'sistema': '⚙️'}
        return format_html('{} {}', icons.get(obj.tipo, '🔔'), obj.titulo)
    
    @admin.display(description='Tipo')
    def tipo_badge(self, obj):
        colors = {'stock': '#8b5cf6', 'vencimiento': '#f59e0b', 'produccion': '#10b981', 'sistema': '#6b7280'}
        return format_html('<span style="background:{};color:white;padding:3px 10px;border-radius:12px;">{}</span>', 
            colors.get(obj.tipo, '#6b7280'), obj.tipo.capitalize())
    
    @admin.display(description='Prioridad')
    def prioridad_badge(self, obj):
        colors = {'alta': '#ef4444', 'media': '#f59e0b', 'baja': '#10b981'}
        return format_html('<span style="color:{};font-weight:600;">● {}</span>', 
            colors.get(obj.prioridad, '#6b7280'), obj.prioridad.capitalize())
    
    @admin.display(description='Leída')
    def leida_badge(self, obj):
        if obj.leida:
            return mark_safe('<span style="color:#10b981;">✓ Sí</span>')
        return mark_safe('<span style="color:#f59e0b;">○ No</span>')
    
    @admin.action(description='✓ Marcar como leídas')
    def marcar_leida(self, request, queryset):
        queryset.update(leida=True)
        self.message_user(request, f'{queryset.count()} alertas marcadas como leídas')
    
    @admin.action(description='○ Marcar como no leídas')
    def marcar_no_leida(self, request, queryset):
        queryset.update(leida=False)


# ============================================
# PASSWORD RESET (oculto de la navegación principal)
# ============================================
@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'codigo', 'usado_badge', 'fecha_creacion', 'fecha_expiracion']
    list_filter = ['usado', 'fecha_creacion']
    search_fields = ['usuario__email', 'codigo']
    readonly_fields = ['codigo', 'fecha_creacion']
    list_per_page = 20
    
    @admin.display(description='Usado')
    def usado_badge(self, obj):
        if obj.usado:
            return mark_safe('<span style="color:#10b981;">✓ Sí</span>')
        return mark_safe('<span style="color:#f59e0b;">○ No</span>')
