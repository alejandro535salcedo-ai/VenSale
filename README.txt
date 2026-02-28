Este sistema combina un panel atractivo con funciones prácticas para el control de inventario, clientes y ventas, todo sincronizado con el tipo de cambio del día.

### Módulos principales y su operación
- **Autenticación**: El acceso está protegido por usuario y contraseña (por defecto `admin/admin123`). Puedes registrar nuevos usuarios desde la misma pantalla.
- **Tasa de cambio BCV**: La tasa se puede ingresar manualmente u obtener automáticamente desde una API pública. Este valor afecta el precio en bolívares de todos los productos.
- **Productos**: Se registran con nombre y precio en USD. El precio en bolívares se calcula en tiempo real multiplicando por la tasa vigente.
- **Clientes y Ventas**: Permite asociar una venta a un cliente y producto, registrar el monto pagado y calcular automáticamente la deuda (pagado, abonado o debe). El estado de pago se visualiza con colores.
- **Dashboard**: Muestra un resumen de tasas, total de ventas y deuda general, más las últimas ventas registradas.

La interfaz está diseñada con un menú lateral fijo y áreas de contenido claras, buscando una experiencia similar a la de aplicaciones de mensajería como Telegram.