"""
Serializadores para la API REST de Bananera
"""

from rest_framework import serializers
from .models import (
    Finca, Usuario, Enfunde, Cosecha, RecuperacionCinta,
    Empleado, RolPago, Prestamo, Insumo, MovimientoInventario, Alerta
)


class FincaSerializer(serializers.ModelSerializer):
    """Serializador para Finca"""
    class Meta:
        model = Finca
        fields = '__all__'


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializador para Usuario"""
    finca_nombre = serializers.CharField(source='finca_asignada.nombre', read_only=True, allow_null=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'nombre', 'password', 'rol', 'finca_asignada', 'finca_nombre',
            'telefono', 'activo', 'avatar', 'fecha_creacion'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = Usuario(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_password('123456')  # Default password
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class EnfundeSerializer(serializers.ModelSerializer):
    """Serializador para Enfunde"""
    finca_nombre = serializers.CharField(source='finca.nombre', read_only=True)
    
    class Meta:
        model = Enfunde
        fields = [
            'id', 'finca', 'finca_nombre', 'fecha', 'semana', 'año',
            'color_cinta', 'cantidad_enfundes', 'matas_caidas',
            'observaciones', 'fecha_creacion'
        ]


class CosechaSerializer(serializers.ModelSerializer):
    """Serializador para Cosecha"""
    finca_nombre = serializers.CharField(source='finca.nombre', read_only=True)
    
    class Meta:
        model = Cosecha
        fields = [
            'id', 'finca', 'finca_nombre', 'fecha', 'semana', 'año', 'lote',
            'cajas_producidas', 'racimos_recuperados', 'peso_promedio',
            'calibracion', 'manos', 'ratio', 'observaciones', 'fecha_creacion'
        ]


class RecuperacionCintaSerializer(serializers.ModelSerializer):
    """Serializador para RecuperacionCinta"""
    enfunde_info = serializers.SerializerMethodField()
    finca_nombre = serializers.CharField(source='enfunde.finca.nombre', read_only=True)
    
    class Meta:
        model = RecuperacionCinta
        fields = [
            'id', 'enfunde', 'enfunde_info', 'finca_nombre', 'fecha',
            'cintas_recuperadas', 'porcentaje_recuperacion',
            'observaciones', 'fecha_creacion'
        ]
    
    def get_enfunde_info(self, obj):
        return f"Semana {obj.enfunde.semana}/{obj.enfunde.año} - {obj.enfunde.finca.nombre}"


class EmpleadoSerializer(serializers.ModelSerializer):
    """Serializador para Empleado"""
    finca_nombre = serializers.CharField(source='finca.nombre', read_only=True)
    
    class Meta:
        model = Empleado
        fields = [
            'id', 'finca', 'finca_nombre', 'nombre', 'cedula', 'cargo',
            'salario_base', 'fecha_ingreso', 'telefono', 'direccion',
            'activo', 'fecha_creacion'
        ]


class RolPagoSerializer(serializers.ModelSerializer):
    """Serializador para RolPago"""
    empleado_nombre = serializers.CharField(source='empleado.nombre', read_only=True)
    finca_nombre = serializers.CharField(source='empleado.finca.nombre', read_only=True)
    
    class Meta:
        model = RolPago
        fields = [
            'id', 'empleado', 'empleado_nombre', 'finca_nombre', 'fecha_pago',
            'periodo_inicio', 'periodo_fin', 'salario_base', 'horas_extras',
            'bonificaciones', 'deducciones', 'total_pagar', 'estado',
            'observaciones', 'fecha_creacion'
        ]


class PrestamoSerializer(serializers.ModelSerializer):
    """Serializador para Prestamo"""
    empleado_nombre = serializers.CharField(source='empleado.nombre', read_only=True)
    finca_nombre = serializers.CharField(source='empleado.finca.nombre', read_only=True)
    saldo_pendiente = serializers.SerializerMethodField()
    
    class Meta:
        model = Prestamo
        fields = [
            'id', 'empleado', 'empleado_nombre', 'finca_nombre', 'monto',
            'monto_pagado', 'saldo_pendiente', 'cuotas', 'cuotas_pagadas',
            'fecha_solicitud', 'fecha_aprobacion', 'estado', 'motivo',
            'observaciones', 'fecha_creacion'
        ]
    
    def get_saldo_pendiente(self, obj):
        return obj.monto - obj.monto_pagado


class InsumoSerializer(serializers.ModelSerializer):
    """Serializador para Insumo"""
    finca_nombre = serializers.CharField(source='finca.nombre', read_only=True, allow_null=True)
    stock_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Insumo
        fields = [
            'id', 'finca', 'finca_nombre', 'nombre', 'categoria', 'proveedor',
            'unidad_medida', 'stock_actual', 'stock_minimo', 'stock_maximo',
            'stock_status', 'precio_unitario', 'fecha_vencimiento',
            'pedido_generado', 'fecha_creacion'
        ]
    
    def get_stock_status(self, obj):
        if obj.stock_actual < obj.stock_minimo * 0.5:
            return 'critico'
        elif obj.stock_actual < obj.stock_minimo:
            return 'bajo'
        return 'normal'


class MovimientoInventarioSerializer(serializers.ModelSerializer):
    """Serializador para MovimientoInventario"""
    insumo_nombre = serializers.CharField(source='insumo.nombre', read_only=True)
    finca_nombre = serializers.CharField(source='finca.nombre', read_only=True)
    responsable_nombre = serializers.CharField(source='responsable.nombre', read_only=True, allow_null=True)
    
    class Meta:
        model = MovimientoInventario
        fields = [
            'id', 'insumo', 'insumo_nombre', 'finca', 'finca_nombre',
            'tipo', 'cantidad', 'fecha', 'responsable', 'responsable_nombre',
            'observaciones', 'fecha_creacion'
        ]


class AlertaSerializer(serializers.ModelSerializer):
    """Serializador para Alerta"""
    finca_nombre = serializers.CharField(source='finca.nombre', read_only=True, allow_null=True)
    
    class Meta:
        model = Alerta
        fields = [
            'id', 'tipo', 'prioridad', 'titulo', 'mensaje', 'leida',
            'finca', 'finca_nombre', 'fecha_creacion'
        ]
