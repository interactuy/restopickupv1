# Locales Demo

Script de provisionado rápido para crear locales de prueba con:

- negocio cargado
- usuario owner en Supabase Auth
- onboarding completo
- categorías y productos
- ofertas en `compare_at_amount`
- opciones con extras y selección simple/múltiple
- branding básico para logo, portada y productos

## Cómo correrlo

```bash
npm run provision:demos
```

Requiere:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

El script lee `.env.local` automáticamente si existe.

## Password común

```txt
RestoDemo2026!
```

## Locales incluidos

| Local | Zona | Email |
| --- | --- | --- |
| Bruma Cafe | Pocitos | `demo.bruma-cafe-pocitos@restopickup.test` |
| Patio Tostado | Punta Carretas | `demo.patio-tostado-punta-carretas@restopickup.test` |
| Fuego del Puerto | Ciudad Vieja | `demo.fuego-del-puerto-ciudad-vieja@restopickup.test` |
| Nonna Rina | Prado | `demo.nonna-rina-pastas-prado@restopickup.test` |
| Forno Malvin | Malvin | `demo.forno-malvin-pizzeria@restopickup.test` |
| Buceo Burger Club | Buceo | `demo.buceo-burger-club@restopickup.test` |
| Dulce Nube | Carrasco | `demo.dulce-nube-carrasco@restopickup.test` |

## Nota

El script es idempotente para los locales demo:

- actualiza negocio, branding y catálogo si ya existen
- asegura el usuario owner y resetea su password al valor común
- no depende del flujo de solicitudes
