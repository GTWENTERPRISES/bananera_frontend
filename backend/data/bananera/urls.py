"""
URLs para la app bananera
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import (
    FincaViewSet, UsuarioViewSet, EnfundeViewSet,
    CosechaViewSet, RecuperacionCintaViewSet,
    EmpleadoViewSet, RolPagoViewSet, PrestamoViewSet,
    InsumoViewSet, MovimientoInventarioViewSet,
    AlertaViewSet, ReporteViewSet,
    request_password_reset, verify_reset_code, reset_password
)

router = DefaultRouter()
router.register(r'fincas', FincaViewSet, basename='finca')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'enfundes', EnfundeViewSet, basename='enfunde')
router.register(r'cosechas', CosechaViewSet, basename='cosecha')
router.register(r'recuperaciones', RecuperacionCintaViewSet, basename='recuperacion')
router.register(r'empleados', EmpleadoViewSet, basename='empleado')
router.register(r'roles-pago', RolPagoViewSet, basename='rol-pago')
router.register(r'prestamos', PrestamoViewSet, basename='prestamo')
router.register(r'insumos', InsumoViewSet, basename='insumo')
router.register(r'movimientos-inventario', MovimientoInventarioViewSet, basename='movimiento-inventario')
router.register(r'alertas', AlertaViewSet, basename='alerta')
router.register(r'reportes', ReporteViewSet, basename='reporte')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Password Reset
    path('password-reset/request/', request_password_reset, name='password_reset_request'),
    path('password-reset/verify/', verify_reset_code, name='password_reset_verify'),
    path('password-reset/confirm/', reset_password, name='password_reset_confirm'),
]






