"""
ViewSets para la API REST de Bananera
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Avg, Count, F
from django.utils import timezone
from datetime import timedelta

from .models import (
    Finca, Usuario, Enfunde, Cosecha, RecuperacionCinta,
    Empleado, RolPago, Prestamo, Insumo, MovimientoInventario, Alerta
)
from .serializers import (
    FincaSerializer, UsuarioSerializer, EnfundeSerializer,
    CosechaSerializer, RecuperacionCintaSerializer,
    EmpleadoSerializer, RolPagoSerializer, PrestamoSerializer,
    InsumoSerializer, MovimientoInventarioSerializer, AlertaSerializer
)


class FincaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Fincas"""
    queryset = Finca.objects.all()
    serializer_class = FincaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'ubicacion']
    ordering_fields = ['nombre', 'hectareas']

    @action(detail=True, methods=['get'])
    def estadisticas(self, request, pk=None):
        """Obtener estadísticas de una finca específica"""
        finca = self.get_object()
        cosechas = Cosecha.objects.filter(finca=finca)
        enfundes = Enfunde.objects.filter(finca=finca)
        
        return Response({
            'total_cosechas': cosechas.count(),
            'total_cajas': cosechas.aggregate(Sum('cajas_producidas'))['cajas_producidas__sum'] or 0,
            'total_enfundes': enfundes.aggregate(Sum('cantidad_enfundes'))['cantidad_enfundes__sum'] or 0,
            'promedio_ratio': cosechas.aggregate(Avg('ratio'))['ratio__avg'] or 0,
        })


class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Usuarios"""
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['rol', 'activo', 'finca_asignada']
    search_fields = ['nombre', 'email']


class EnfundeViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Enfundes"""
    queryset = Enfunde.objects.all()
    serializer_class = EnfundeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['finca', 'semana', 'año', 'color_cinta']
    ordering_fields = ['fecha', 'semana']
    ordering = ['-fecha']

    @action(detail=False, methods=['get'])
    def por_semana(self, request):
        """Obtener enfundes agrupados por semana"""
        semana = request.query_params.get('semana')
        año = request.query_params.get('año')
        
        queryset = self.get_queryset()
        if semana:
            queryset = queryset.filter(semana=semana)
        if año:
            queryset = queryset.filter(año=año)
            
        return Response(self.get_serializer(queryset, many=True).data)


class CosechaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Cosechas"""
    queryset = Cosecha.objects.all()
    serializer_class = CosechaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['finca', 'semana', 'año', 'lote']
    ordering_fields = ['fecha', 'semana', 'cajas_producidas']
    ordering = ['-fecha']

    @action(detail=False, methods=['get'])
    def tendencias(self, request):
        """Obtener tendencias de cosecha por semana"""
        año = request.query_params.get('año', timezone.now().year)
        
        tendencias = Cosecha.objects.filter(año=año).values('semana').annotate(
            total_cajas=Sum('cajas_producidas'),
            promedio_ratio=Avg('ratio'),
            total_racimos=Sum('racimos_recuperados')
        ).order_by('semana')
        
        return Response(list(tendencias))

    @action(detail=False, methods=['get'])
    def comparativo(self, request):
        """Comparativo de producción entre fincas"""
        año = request.query_params.get('año', timezone.now().year)
        
        comparativo = Cosecha.objects.filter(año=año).values('finca__nombre').annotate(
            total_cajas=Sum('cajas_producidas'),
            promedio_ratio=Avg('ratio'),
            cosechas_count=Count('id')
        ).order_by('-total_cajas')
        
        return Response(list(comparativo))


class RecuperacionCintaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Recuperación de Cintas"""
    queryset = RecuperacionCinta.objects.all()
    serializer_class = RecuperacionCintaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['enfunde', 'enfunde__finca']
    ordering = ['-fecha']


class EmpleadoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Empleados"""
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['finca', 'cargo', 'activo']
    search_fields = ['nombre', 'cedula']

    @action(detail=True, methods=['get'])
    def historial_pagos(self, request, pk=None):
        """Obtener historial de pagos de un empleado"""
        empleado = self.get_object()
        roles = RolPago.objects.filter(empleado=empleado).order_by('-fecha_pago')
        return Response(RolPagoSerializer(roles, many=True).data)


class RolPagoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Roles de Pago"""
    queryset = RolPago.objects.all()
    serializer_class = RolPagoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['empleado', 'empleado__finca', 'estado']
    ordering = ['-fecha_pago']

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        """Aprobar un rol de pago"""
        rol = self.get_object()
        rol.estado = 'aprobado'
        rol.save()
        return Response({'status': 'Rol de pago aprobado'})

    @action(detail=True, methods=['post'])
    def pagar(self, request, pk=None):
        """Marcar rol de pago como pagado"""
        rol = self.get_object()
        rol.estado = 'pagado'
        rol.save()
        return Response({'status': 'Rol de pago marcado como pagado'})


class PrestamoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Préstamos"""
    queryset = Prestamo.objects.all()
    serializer_class = PrestamoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['empleado', 'empleado__finca', 'estado']
    ordering = ['-fecha_solicitud']

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        """Aprobar un préstamo"""
        prestamo = self.get_object()
        prestamo.estado = 'aprobado'
        prestamo.save()
        return Response({'status': 'Préstamo aprobado'})

    @action(detail=True, methods=['post'])
    def registrar_pago(self, request, pk=None):
        """Registrar un pago de préstamo"""
        prestamo = self.get_object()
        monto = request.data.get('monto', 0)
        
        prestamo.monto_pagado += float(monto)
        if prestamo.monto_pagado >= prestamo.monto:
            prestamo.estado = 'pagado'
        prestamo.save()
        
        return Response({
            'status': 'Pago registrado',
            'monto_pagado': prestamo.monto_pagado,
            'saldo_pendiente': prestamo.monto - prestamo.monto_pagado
        })


class InsumoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Insumos"""
    queryset = Insumo.objects.all()
    serializer_class = InsumoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['categoria', 'finca']
    search_fields = ['nombre']

    @action(detail=False, methods=['get'])
    def alertas_stock(self, request):
        """Obtener insumos con stock bajo"""
        from django.db.models import F
        insumos_bajos = Insumo.objects.filter(stock_actual__lt=F('stock_minimo'))
        return Response(self.get_serializer(insumos_bajos, many=True).data)

    @action(detail=True, methods=['post'])
    def generar_orden(self, request, pk=None):
        """Generar orden de compra para un insumo"""
        insumo = self.get_object()
        insumo.pedido_generado = True
        insumo.save()
        return Response({'status': 'Orden de compra generada'})


class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Movimientos de Inventario"""
    queryset = MovimientoInventario.objects.all()
    serializer_class = MovimientoInventarioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['insumo', 'tipo', 'finca']
    ordering = ['-fecha']

    def perform_create(self, serializer):
        """Al crear un movimiento, actualizar el stock del insumo"""
        movimiento = serializer.save()
        insumo = movimiento.insumo
        
        if movimiento.tipo == 'entrada':
            insumo.stock_actual += movimiento.cantidad
        else:
            insumo.stock_actual -= movimiento.cantidad
        
        insumo.save()


class AlertaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Alertas"""
    queryset = Alerta.objects.all()
    serializer_class = AlertaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['tipo', 'prioridad', 'leida']
    ordering = ['-fecha_creacion']

    @action(detail=True, methods=['post'])
    def marcar_leida(self, request, pk=None):
        """Marcar una alerta como leída"""
        alerta = self.get_object()
        alerta.leida = True
        alerta.save()
        return Response({'status': 'Alerta marcada como leída'})

    @action(detail=False, methods=['post'])
    def marcar_todas_leidas(self, request):
        """Marcar todas las alertas como leídas"""
        Alerta.objects.filter(leida=False).update(leida=True)
        return Response({'status': 'Todas las alertas marcadas como leídas'})


class ReporteViewSet(viewsets.ViewSet):
    """ViewSet para generar Reportes"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def produccion(self, request):
        """Reporte de producción"""
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        finca_id = request.query_params.get('finca')
        
        queryset = Cosecha.objects.all()
        
        if fecha_inicio:
            queryset = queryset.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha__lte=fecha_fin)
        if finca_id:
            queryset = queryset.filter(finca_id=finca_id)
        
        resumen = queryset.aggregate(
            total_cajas=Sum('cajas_producidas'),
            promedio_ratio=Avg('ratio'),
            total_racimos=Sum('racimos_recuperados'),
            total_cosechas=Count('id')
        )
        
        por_finca = queryset.values('finca__nombre').annotate(
            cajas=Sum('cajas_producidas'),
            ratio_promedio=Avg('ratio')
        )
        
        return Response({
            'resumen': resumen,
            'por_finca': list(por_finca)
        })

    @action(detail=False, methods=['get'])
    def nomina(self, request):
        """Reporte de nómina"""
        mes = request.query_params.get('mes')
        año = request.query_params.get('año')
        
        queryset = RolPago.objects.all()
        
        if mes:
            queryset = queryset.filter(fecha_pago__month=mes)
        if año:
            queryset = queryset.filter(fecha_pago__year=año)
        
        resumen = queryset.aggregate(
            total_pagado=Sum('total_pagar'),
            total_roles=Count('id')
        )
        
        por_finca = queryset.values('empleado__finca__nombre').annotate(
            total=Sum('total_pagar'),
            empleados=Count('empleado', distinct=True)
        )
        
        return Response({
            'resumen': resumen,
            'por_finca': list(por_finca)
        })

    @action(detail=False, methods=['get'])
    def inventario(self, request):
        """Reporte de inventario"""
        finca_id = request.query_params.get('finca')
        
        queryset = Insumo.objects.all()
        
        if finca_id:
            queryset = queryset.filter(finca_id=finca_id)
        
        resumen = {
            'total_insumos': queryset.count(),
            'stock_bajo': queryset.filter(stock_actual__lt=F('stock_minimo')).count(),
            'valor_total': sum(i.stock_actual * 10 for i in queryset)  # Precio estimado
        }
        
        por_categoria = queryset.values('categoria').annotate(
            cantidad=Count('id'),
            stock_total=Sum('stock_actual')
        )
        
        return Response({
            'resumen': resumen,
            'por_categoria': list(por_categoria)
        })
