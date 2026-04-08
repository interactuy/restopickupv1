begin;

with upsert_business as (
  insert into public.businesses (
    name,
    slug,
    description,
    legal_name,
    contact_email,
    contact_phone,
    contact_action_type,
    business_hours_text,
    is_open_now,
    business_hours,
    is_temporarily_closed,
    pickup_address,
    pickup_instructions,
    latitude,
    longitude,
    timezone,
    currency_code,
    prep_time_min_minutes,
    prep_time_max_minutes,
    is_active
  )
  select
    'Mostrador Centro',
    'mostrador-centro',
    'Burgers, pizzas y wraps para retirar en el centro, con cocina agil y menu pensado para resolver almuerzos y cenas sin vueltas.',
    'Mostrador Centro SAS',
    'hola@mostradorcentro.uy',
    '+598 91 234 567',
    'whatsapp',
    'Lun a Dom de 12:00 a 23:30',
    true,
    '[
      {"day":0,"is_closed":false,"open_time":"12:00","close_time":"23:30"},
      {"day":1,"is_closed":false,"open_time":"12:00","close_time":"23:30"},
      {"day":2,"is_closed":false,"open_time":"12:00","close_time":"23:30"},
      {"day":3,"is_closed":false,"open_time":"12:00","close_time":"23:30"},
      {"day":4,"is_closed":false,"open_time":"12:00","close_time":"23:30"},
      {"day":5,"is_closed":false,"open_time":"12:00","close_time":"23:30"},
      {"day":6,"is_closed":false,"open_time":"12:00","close_time":"23:30"}
    ]'::jsonb,
    false,
    'Av. 18 de Julio 1450, Centro, Montevideo',
    'Retira tu pedido por mostrador. Presenta tu numero de pedido y nombre. Tiempo estimado habitual: 20 a 30 minutos.',
    -34.904862,
    -56.185119,
    'America/Montevideo',
    'UYU',
    20,
    30,
    true
  where not exists (
    select 1
    from public.businesses
    where lower(slug) = lower('mostrador-centro')
  )
  returning id
),
business as (
  select id
  from upsert_business
  union all
  select id
  from public.businesses
  where lower(slug) = lower('mostrador-centro')
  limit 1
)
update public.businesses b
set
  name = 'Mostrador Centro',
  description = 'Burgers, pizzas y wraps para retirar en el centro, con cocina agil y menu pensado para resolver almuerzos y cenas sin vueltas.',
  legal_name = 'Mostrador Centro SAS',
  contact_email = 'hola@mostradorcentro.uy',
  contact_phone = '+598 91 234 567',
  contact_action_type = 'whatsapp',
  business_hours_text = 'Lun a Dom de 12:00 a 23:30',
  is_open_now = true,
  business_hours = '[
    {"day":0,"is_closed":false,"open_time":"12:00","close_time":"23:30"},
    {"day":1,"is_closed":false,"open_time":"12:00","close_time":"23:30"},
    {"day":2,"is_closed":false,"open_time":"12:00","close_time":"23:30"},
    {"day":3,"is_closed":false,"open_time":"12:00","close_time":"23:30"},
    {"day":4,"is_closed":false,"open_time":"12:00","close_time":"23:30"},
    {"day":5,"is_closed":false,"open_time":"12:00","close_time":"23:30"},
    {"day":6,"is_closed":false,"open_time":"12:00","close_time":"23:30"}
  ]'::jsonb,
  is_temporarily_closed = false,
  pickup_address = 'Av. 18 de Julio 1450, Centro, Montevideo',
  pickup_instructions = 'Retira tu pedido por mostrador. Presenta tu numero de pedido y nombre. Tiempo estimado habitual: 20 a 30 minutos.',
  latitude = -34.904862,
  longitude = -56.185119,
  timezone = 'America/Montevideo',
  currency_code = 'UYU',
  prep_time_min_minutes = 20,
  prep_time_max_minutes = 30,
  is_active = true
from business
where b.id = business.id;

insert into public.business_order_counters (business_id, last_order_number)
select b.id, 0
from public.businesses b
where lower(b.slug) = lower('mostrador-centro')
  and not exists (
    select 1
    from public.business_order_counters boc
    where boc.business_id = b.id
  );

update public.business_order_counters boc
set last_order_number = 0
from public.businesses b
where boc.business_id = b.id
  and lower(b.slug) = lower('mostrador-centro')
  and boc.last_order_number < 0;

with business as (
  select id
  from public.businesses
  where lower(slug) = lower('mostrador-centro')
)
insert into public.product_categories (
  business_id,
  name,
  slug,
  description,
  position,
  is_active
)
select
  business.id,
  category.name,
  category.slug,
  category.description,
  category.position,
  true
from business
cross join (
  values
    ('Burgers', 'burgers', 'Hamburguesas caseras con pan de papa y papas rusticas opcionales.', 1),
    ('Pizzas', 'pizzas', 'Pizzas individuales y medianas para retirar recien horneadas.', 2),
    ('Wraps y Sandwiches', 'wraps-y-sandwiches', 'Opciones rapidas para almuerzo o cena.', 3),
    ('Bebidas', 'bebidas', 'Bebidas frias para acompanar el pedido.', 4)
) as category(name, slug, description, position)
where not exists (
  select 1
  from public.product_categories pc
  where pc.business_id = business.id
    and lower(pc.slug) = lower(category.slug)
);

with business as (
  select id
  from public.businesses
  where lower(slug) = lower('mostrador-centro')
)
update public.product_categories pc
set
  name = category.name,
  description = category.description,
  position = category.position,
  is_active = true
from business
cross join (
  values
    ('Burgers', 'burgers', 'Hamburguesas caseras con pan de papa y papas rusticas opcionales.', 1),
    ('Pizzas', 'pizzas', 'Pizzas individuales y medianas para retirar recien horneadas.', 2),
    ('Wraps y Sandwiches', 'wraps-y-sandwiches', 'Opciones rapidas para almuerzo o cena.', 3),
    ('Bebidas', 'bebidas', 'Bebidas frias para acompanar el pedido.', 4)
) as category(name, slug, description, position)
where pc.business_id = business.id
  and lower(pc.slug) = lower(category.slug);

with business as (
  select id, currency_code
  from public.businesses
  where lower(slug) = lower('mostrador-centro')
),
catalog as (
  select
    business.id as business_id,
    business.currency_code,
    product.name,
    product.slug,
    product.category_slug,
    product.description,
    product.price_amount,
    product.compare_at_amount,
    product.position
  from business
  cross join (
    values
      ('Burger Clasica', 'burger-clasica', 'burgers', 'Carne vacuna, cheddar, lechuga, tomate y salsa de la casa.', 390, null::integer, 1),
      ('Burger Doble Bacon', 'burger-doble-bacon', 'burgers', 'Doble medallon, cheddar, bacon crocante, cebolla caramelizada y mayonesa ahumada.', 520, null::integer, 2),
      ('Burger Pollo Crispy', 'burger-pollo-crispy', 'burgers', 'Pollo rebozado, cheddar, pepinos, lechuga fresca y alioli suave.', 430, null::integer, 3),
      ('Pizza Muzza Individual', 'pizza-muzza-individual', 'pizzas', 'Salsa de tomate, muzzarella y oregano. Ideal para una persona.', 360, null::integer, 4),
      ('Pizza Napolitana Mediana', 'pizza-napolitana-mediana', 'pizzas', 'Muzzarella, tomate fresco, ajo y oregano en masa de fermentacion lenta.', 610, null::integer, 5),
      ('Pizza Fugazzeta Mediana', 'pizza-fugazzeta-mediana', 'pizzas', 'Muzzarella extra, cebolla salteada y toque de pimienta negra.', 650, null::integer, 6),
      ('Wrap Caesar Crispy', 'wrap-caesar-crispy', 'wraps-y-sandwiches', 'Pollo crispy, mix verde, parmesano y aderezo caesar casero.', 410, null::integer, 7),
      ('Wrap Veggie Grillado', 'wrap-veggie-grillado', 'wraps-y-sandwiches', 'Vegetales asados, hummus, hojas verdes y pesto suave.', 380, null::integer, 8),
      ('Sandwich Milanesa Completo', 'sandwich-milanesa-completo', 'wraps-y-sandwiches', 'Milanesa vacuna, jamon, queso, lechuga, tomate y mayonesa.', 460, null::integer, 9),
      ('Papas Rusticas', 'papas-rusticas', 'wraps-y-sandwiches', 'Porcion para compartir con sal marina y alioli de ajo asado.', 220, null::integer, 10),
      ('Limonada de la Casa', 'limonada-de-la-casa', 'bebidas', 'Limon, menta y jengibre. Botella de 500 ml.', 150, null::integer, 11),
      ('Coca-Cola Sin Azucar 500 ml', 'coca-cola-sin-azucar-500ml', 'bebidas', 'Botella individual fria para retirar.', 130, null::integer, 12)
  ) as product(name, slug, category_slug, description, price_amount, compare_at_amount, position)
)
insert into public.products (
  business_id,
  category_id,
  name,
  slug,
  description,
  price_amount,
  compare_at_amount,
  currency_code,
  is_available,
  position
)
select
  catalog.business_id,
  pc.id,
  catalog.name,
  catalog.slug,
  catalog.description,
  catalog.price_amount,
  catalog.compare_at_amount,
  catalog.currency_code,
  true,
  catalog.position
from catalog
join public.product_categories pc
  on pc.business_id = catalog.business_id
 and lower(pc.slug) = lower(catalog.category_slug)
where not exists (
  select 1
  from public.products p
  where p.business_id = catalog.business_id
    and lower(p.slug) = lower(catalog.slug)
);

with business as (
  select id, currency_code
  from public.businesses
  where lower(slug) = lower('mostrador-centro')
),
catalog as (
  select
    business.id as business_id,
    business.currency_code,
    product.name,
    product.slug,
    product.category_slug,
    product.description,
    product.price_amount,
    product.compare_at_amount,
    product.position
  from business
  cross join (
    values
      ('Burger Clasica', 'burger-clasica', 'burgers', 'Carne vacuna, cheddar, lechuga, tomate y salsa de la casa.', 390, null::integer, 1),
      ('Burger Doble Bacon', 'burger-doble-bacon', 'burgers', 'Doble medallon, cheddar, bacon crocante, cebolla caramelizada y mayonesa ahumada.', 520, null::integer, 2),
      ('Burger Pollo Crispy', 'burger-pollo-crispy', 'burgers', 'Pollo rebozado, cheddar, pepinos, lechuga fresca y alioli suave.', 430, null::integer, 3),
      ('Pizza Muzza Individual', 'pizza-muzza-individual', 'pizzas', 'Salsa de tomate, muzzarella y oregano. Ideal para una persona.', 360, null::integer, 4),
      ('Pizza Napolitana Mediana', 'pizza-napolitana-mediana', 'pizzas', 'Muzzarella, tomate fresco, ajo y oregano en masa de fermentacion lenta.', 610, null::integer, 5),
      ('Pizza Fugazzeta Mediana', 'pizza-fugazzeta-mediana', 'pizzas', 'Muzzarella extra, cebolla salteada y toque de pimienta negra.', 650, null::integer, 6),
      ('Wrap Caesar Crispy', 'wrap-caesar-crispy', 'wraps-y-sandwiches', 'Pollo crispy, mix verde, parmesano y aderezo caesar casero.', 410, null::integer, 7),
      ('Wrap Veggie Grillado', 'wrap-veggie-grillado', 'wraps-y-sandwiches', 'Vegetales asados, hummus, hojas verdes y pesto suave.', 380, null::integer, 8),
      ('Sandwich Milanesa Completo', 'sandwich-milanesa-completo', 'wraps-y-sandwiches', 'Milanesa vacuna, jamon, queso, lechuga, tomate y mayonesa.', 460, null::integer, 9),
      ('Papas Rusticas', 'papas-rusticas', 'wraps-y-sandwiches', 'Porcion para compartir con sal marina y alioli de ajo asado.', 220, null::integer, 10),
      ('Limonada de la Casa', 'limonada-de-la-casa', 'bebidas', 'Limon, menta y jengibre. Botella de 500 ml.', 150, null::integer, 11),
      ('Coca-Cola Sin Azucar 500 ml', 'coca-cola-sin-azucar-500ml', 'bebidas', 'Botella individual fria para retirar.', 130, null::integer, 12)
  ) as product(name, slug, category_slug, description, price_amount, compare_at_amount, position)
)
update public.products p
set
  category_id = pc.id,
  name = catalog.name,
  description = catalog.description,
  price_amount = catalog.price_amount,
  compare_at_amount = catalog.compare_at_amount,
  currency_code = catalog.currency_code,
  is_available = true,
  position = catalog.position
from catalog
join public.product_categories pc
  on pc.business_id = catalog.business_id
 and lower(pc.slug) = lower(catalog.category_slug)
where p.business_id = catalog.business_id
  and lower(p.slug) = lower(catalog.slug);

with business as (
  select id
  from public.businesses
  where lower(slug) = lower('mostrador-centro')
),
product_media as (
  select
    business.id as business_id,
    media.product_slug,
    media.storage_path,
    media.public_url,
    media.alt_text,
    media.position
  from business
  cross join (
    values
      ('burger-clasica', 'seed/mostrador-centro/products/burger-clasica.jpg', 'https://placehold.co/1200x900/F3E5D0/4B2E1F?text=Burger+Clasica', 'Burger Clasica de Mostrador Centro', 1),
      ('burger-doble-bacon', 'seed/mostrador-centro/products/burger-doble-bacon.jpg', 'https://placehold.co/1200x900/E8D9C5/4B2E1F?text=Burger+Doble+Bacon', 'Burger Doble Bacon de Mostrador Centro', 1),
      ('burger-pollo-crispy', 'seed/mostrador-centro/products/burger-pollo-crispy.jpg', 'https://placehold.co/1200x900/F1E7D8/4B2E1F?text=Burger+Pollo+Crispy', 'Burger Pollo Crispy de Mostrador Centro', 1),
      ('pizza-muzza-individual', 'seed/mostrador-centro/products/pizza-muzza-individual.jpg', 'https://placehold.co/1200x900/F6E8D5/7A2E1F?text=Pizza+Muzza', 'Pizza Muzza Individual de Mostrador Centro', 1),
      ('pizza-napolitana-mediana', 'seed/mostrador-centro/products/pizza-napolitana-mediana.jpg', 'https://placehold.co/1200x900/F2E4CF/7A2E1F?text=Pizza+Napolitana', 'Pizza Napolitana Mediana de Mostrador Centro', 1),
      ('pizza-fugazzeta-mediana', 'seed/mostrador-centro/products/pizza-fugazzeta-mediana.jpg', 'https://placehold.co/1200x900/EEE2D2/7A2E1F?text=Pizza+Fugazzeta', 'Pizza Fugazzeta Mediana de Mostrador Centro', 1),
      ('wrap-caesar-crispy', 'seed/mostrador-centro/products/wrap-caesar-crispy.jpg', 'https://placehold.co/1200x900/E7E2D3/36513D?text=Wrap+Caesar', 'Wrap Caesar Crispy de Mostrador Centro', 1),
      ('wrap-veggie-grillado', 'seed/mostrador-centro/products/wrap-veggie-grillado.jpg', 'https://placehold.co/1200x900/E2E8D5/36513D?text=Wrap+Veggie', 'Wrap Veggie Grillado de Mostrador Centro', 1),
      ('sandwich-milanesa-completo', 'seed/mostrador-centro/products/sandwich-milanesa-completo.jpg', 'https://placehold.co/1200x900/E8DDCF/5A3A22?text=Sandwich+Milanesa', 'Sandwich Milanesa Completo de Mostrador Centro', 1),
      ('papas-rusticas', 'seed/mostrador-centro/products/papas-rusticas.jpg', 'https://placehold.co/1200x900/F0E3BF/6A532A?text=Papas+Rusticas', 'Papas Rusticas de Mostrador Centro', 1),
      ('limonada-de-la-casa', 'seed/mostrador-centro/products/limonada-de-la-casa.jpg', 'https://placehold.co/1200x900/E3F0D8/35523A?text=Limonada', 'Limonada de la Casa de Mostrador Centro', 1),
      ('coca-cola-sin-azucar-500ml', 'seed/mostrador-centro/products/coca-cola-sin-azucar-500ml.jpg', 'https://placehold.co/1200x900/EEEAEA/7A1F1F?text=Coca-Cola+500ml', 'Coca-Cola Sin Azucar 500 ml de Mostrador Centro', 1)
  ) as media(product_slug, storage_path, public_url, alt_text, position)
)
insert into public.product_images (
  product_id,
  storage_path,
  public_url,
  alt_text,
  position,
  is_primary
)
select
  p.id,
  product_media.storage_path,
  product_media.public_url,
  product_media.alt_text,
  product_media.position,
  true
from product_media
join public.products p
  on p.business_id = product_media.business_id
 and lower(p.slug) = lower(product_media.product_slug)
where not exists (
  select 1
  from public.product_images pi
  where pi.product_id = p.id
    and pi.is_primary = true
);

with business as (
  select id
  from public.businesses
  where lower(slug) = lower('mostrador-centro')
),
product_media as (
  select
    business.id as business_id,
    media.product_slug,
    media.storage_path,
    media.public_url,
    media.alt_text,
    media.position
  from business
  cross join (
    values
      ('burger-clasica', 'seed/mostrador-centro/products/burger-clasica.jpg', 'https://placehold.co/1200x900/F3E5D0/4B2E1F?text=Burger+Clasica', 'Burger Clasica de Mostrador Centro', 1),
      ('burger-doble-bacon', 'seed/mostrador-centro/products/burger-doble-bacon.jpg', 'https://placehold.co/1200x900/E8D9C5/4B2E1F?text=Burger+Doble+Bacon', 'Burger Doble Bacon de Mostrador Centro', 1),
      ('burger-pollo-crispy', 'seed/mostrador-centro/products/burger-pollo-crispy.jpg', 'https://placehold.co/1200x900/F1E7D8/4B2E1F?text=Burger+Pollo+Crispy', 'Burger Pollo Crispy de Mostrador Centro', 1),
      ('pizza-muzza-individual', 'seed/mostrador-centro/products/pizza-muzza-individual.jpg', 'https://placehold.co/1200x900/F6E8D5/7A2E1F?text=Pizza+Muzza', 'Pizza Muzza Individual de Mostrador Centro', 1),
      ('pizza-napolitana-mediana', 'seed/mostrador-centro/products/pizza-napolitana-mediana.jpg', 'https://placehold.co/1200x900/F2E4CF/7A2E1F?text=Pizza+Napolitana', 'Pizza Napolitana Mediana de Mostrador Centro', 1),
      ('pizza-fugazzeta-mediana', 'seed/mostrador-centro/products/pizza-fugazzeta-mediana.jpg', 'https://placehold.co/1200x900/EEE2D2/7A2E1F?text=Pizza+Fugazzeta', 'Pizza Fugazzeta Mediana de Mostrador Centro', 1),
      ('wrap-caesar-crispy', 'seed/mostrador-centro/products/wrap-caesar-crispy.jpg', 'https://placehold.co/1200x900/E7E2D3/36513D?text=Wrap+Caesar', 'Wrap Caesar Crispy de Mostrador Centro', 1),
      ('wrap-veggie-grillado', 'seed/mostrador-centro/products/wrap-veggie-grillado.jpg', 'https://placehold.co/1200x900/E2E8D5/36513D?text=Wrap+Veggie', 'Wrap Veggie Grillado de Mostrador Centro', 1),
      ('sandwich-milanesa-completo', 'seed/mostrador-centro/products/sandwich-milanesa-completo.jpg', 'https://placehold.co/1200x900/E8DDCF/5A3A22?text=Sandwich+Milanesa', 'Sandwich Milanesa Completo de Mostrador Centro', 1),
      ('papas-rusticas', 'seed/mostrador-centro/products/papas-rusticas.jpg', 'https://placehold.co/1200x900/F0E3BF/6A532A?text=Papas+Rusticas', 'Papas Rusticas de Mostrador Centro', 1),
      ('limonada-de-la-casa', 'seed/mostrador-centro/products/limonada-de-la-casa.jpg', 'https://placehold.co/1200x900/E3F0D8/35523A?text=Limonada', 'Limonada de la Casa de Mostrador Centro', 1),
      ('coca-cola-sin-azucar-500ml', 'seed/mostrador-centro/products/coca-cola-sin-azucar-500ml.jpg', 'https://placehold.co/1200x900/EEEAEA/7A1F1F?text=Coca-Cola+500ml', 'Coca-Cola Sin Azucar 500 ml de Mostrador Centro', 1)
  ) as media(product_slug, storage_path, public_url, alt_text, position)
)
update public.product_images pi
set
  storage_path = product_media.storage_path,
  public_url = product_media.public_url,
  alt_text = product_media.alt_text,
  position = product_media.position
from product_media
join public.products p
  on p.business_id = product_media.business_id
 and lower(p.slug) = lower(product_media.product_slug)
where pi.product_id = p.id
  and pi.is_primary = true;

commit;
