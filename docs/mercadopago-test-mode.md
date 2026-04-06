# Mercado Pago en modo test

Esta integracion usa **Checkout Pro** con redireccion. El pedido se crea primero en `restopickup`, luego el backend genera una preferencia y el comprador termina el pago dentro de Mercado Pago.

## Variables de entorno

Carga estas variables en `.env.local`:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-...
MERCADOPAGO_WEBHOOK_SECRET=...
MERCADOPAGO_USE_SANDBOX=true
APP_URL=https://tu-url-publica-o-tunel
MERCADOPAGO_STATEMENT_DESCRIPTOR=RESTOPICKUP
```

### Donde va cada credencial

- `MERCADOPAGO_ACCESS_TOKEN`: pega aqui el **Access Token de prueba** de tu aplicacion de Mercado Pago. Se usa solo del lado server.
- `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`: pega aqui la **Public Key de prueba**. En el flujo actual de Checkout Pro no inicia el pago desde cliente, pero queda cargada y aislada para futuras integraciones client-side como Bricks.
- `MERCADOPAGO_WEBHOOK_SECRET`: pega aqui la clave secreta configurada para webhooks.
- `MERCADOPAGO_USE_SANDBOX=true`: hace que el checkout use `sandbox_init_point` cuando Mercado Pago lo devuelve.
- `APP_URL`: debe ser publica y accesible por Mercado Pago si queres probar el webhook end-to-end. `localhost` sirve para redireccionar de vuelta al sitio, pero no para recibir webhooks reales.

## Como probar el flujo end-to-end

1. Carga las variables de entorno de prueba en `.env.local`.
2. Levanta la app con `npm run dev`.
3. Si queres probar webhook real, expone la app con un tunel HTTPS, por ejemplo `ngrok` o `cloudflared`, y usa esa URL en `APP_URL`.
4. En Mercado Pago Developers, crea y usa cuentas de prueba separadas para vendedor y comprador.
5. Inicia una compra desde la tienda publica.
6. Completa el checkout usando una cuenta compradora de prueba y una tarjeta de prueba.
7. Verifica:
   - redireccion a `success`, `pending` o `failure`
   - actualizacion del pedido en la pantalla de confirmacion
   - recepcion del webhook en `/api/mercadopago/webhook`

## Notas sobre test

- Haz las compras de prueba en una ventana de incognito para evitar sesiones mezcladas.
- No uses la misma cuenta de prueba como vendedor y comprador.
- Las formas de pago offline pueden dejar el pedido en `pending`, lo cual es correcto para pruebas.

## Referencias oficiales

- Test purchases para Checkout Pro:
  `https://www.mercadopago.com.uy/developers/en/docs/checkout-pro/integration-test/test-purchases`
- Test cards para Checkout Pro:
  `https://www.mercadopago.com.uy/developers/en/docs/checkout-pro/additional-content/your-integrations/test/cards`
- Test accounts:
  `https://www.mercadopago.com.uy/developers/en/docs/checkout-bricks/additional-content/your-integrations/test/accounts`
- Webhooks:
  `https://www.mercadopago.com.uy/developers/en/docs/checkout-pro/payment-notifications`
