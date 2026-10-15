====================================================
0. DE QUÉ VA EL PDF

Es un tutorial para añadir asociaciones (relaciones entre tablas) y consultas con Sequelize a una API hecha con Node + Express + TypeScript + MySQL. El caso práctico es una tienda de bicicletas.

La arquitectura que repiten en las primeras diapositivas:

Cliente (React / Postman / móvil)
| petición REST (GET, POST, PUT, DELETE) y respuesta JSON
v
Routes + Controller (Express) -> recibe la petición y responde
v
Service (Sequelize) -> habla con la base de datos
v
MySQL

Analogía: es un restaurante. La ruta es la puerta, el controller es el camarero que toma el pedido, el service es el cocinero y MySQL es la despensa. Cuando haces una consulta con include (más abajo), el cocinero te trae el plato con la guarnición incluida en vez de tener que pedirla aparte.

Este PDF se centra en Service + Sequelize (las relaciones y las consultas).

El resultado final que buscan (el diagrama ER):

Brand 1:N Bicycle
Bicycle 1:1 BicycleDetail
Customer 1:N Order
Order N:M Bicycle (a través de OrderItem)

====================================================

PASOS PREVIOS (lo simple)
====================================================

Paso 1: crear un módulo nuevo src/modules/brands con su modelo (id, name, createdAt, updatedAt). Cada módulo suele tener 4 archivos: model, service, controller y routes.

Paso 2: tocar lo necesario para que el CRUD funcione (registrar el modelo en server.ts y la ruta en routes/index.ts). La idea es que primero bicycles y brands funcionen por separado, sin relación.

Paso 3: crear en Postman una carpeta por cada CRUD y probar todo. Esto lo desarrollo en la sección de Postman.

====================================================
2. CONCEPTO CLAVE: ASOCIACIONES Y ALIAS

Una asociación le dice a Sequelize "estas dos tablas están relacionadas". Se declaran en src/models/associations.ts dentro de una función defineAssociations(), que luego se llama en server.ts.

Siempre van en pareja (una a cada lado):

Relación 1:N -> A.hasMany(B) + B.belongsTo(A)
Relación 1:1 -> A.hasOne(B) + B.belongsTo(A)
Relación N:M -> A.belongsToMany(B, {through: C}) + B.belongsToMany(A, {through: C})

Regla fácil para no liarte con hasMany / hasOne / belongsTo:

La tabla que TIENE la clave foránea (FK) es la que hace belongsTo.
La tabla "padre" es la que hace hasMany o hasOne.
Ejemplo: la FK brandId está en la tabla bicycles, así que Bicycle.belongsTo(Brand) y Brand.hasMany(Bicycle).

Opciones que se pasan:

foreignKey: el nombre de la columna FK (ej: "brandId").
as: el ALIAS.

El alias es la parte que más confunde. Es el nombre del "campo virtual" que aparecerá en el JSON cuando traigas los datos relacionados.

Brand.hasMany(Bicycle, { foreignKey: "brandId", as: "bicycles" })
-> una Brand tendrá un campo "bicycles" (array con todas sus bicis)
Bicycle.belongsTo(Brand, { foreignKey: "brandId", as: "brand" })
-> una Bicycle tendrá un campo "brand" (objeto con su marca)

REGLA DE ORO (el PDF lo repite mil veces): el alias que uses en el include de la consulta tiene que ser EXACTAMENTE el mismo que declaraste en la asociación. Si en la asociación pusiste "brand" y en la consulta "marca", Sequelize explota con un error tipo "Brand is associated to Bicycle using an alias..." (error muy típico).

Y en server.ts hay que:

importar defineAssociations
importar los modelos (para que Sequelize los registre)
llamar a defineAssociations() ANTES de sequelize.sync()

Aviso: en la captura se ve algo como sequelize.sync({ force: ... }). Si es force: true, borra y recrea TODAS las tablas cada vez que arrancas el servidor, así que pierdes los datos (y también tus pruebas de Postman). Mírate qué valor tienes.

====================================================
3. RELACIÓN 1:N -> BRAND (1) a BICYCLE (N)

Significado: una marca tiene muchas bicis; una bici pertenece a una sola marca.

Cambio en el modelo de Bicycle: se sustituye el campo "brand" (que antes era un texto) por brandId, que es la FK:

declare brandId: number; <- en la clase (TypeScript)

brandId: { <- en Bicycle.init
type: DataTypes.INTEGER.UNSIGNED,
allowNull: false,
references: { model: "brands", key: "id" },
onUpdate: "CASCADE",
onDelete: "RESTRICT",
}

Qué significa cada cosa:

allowNull: false -> toda bici TIENE que tener marca.
references -> la FK apunta a brands.id.
onUpdate CASCADE -> si cambia el id de la marca, se actualiza en sus bicis.
onDelete RESTRICT -> NO te deja borrar una marca que tenga bicis. Devuelve un error de MySQL. Esto en Postman es importante, porque si haces DELETE de una marca con bicis te dará error 500 (o el que gestione tu middleware). Eso es lo correcto, no es un bug.

Ejemplo mental: no puedes borrar la marca "BH" si aún hay una "Sky" de BH en la tienda. Primero borras las bicis (o las cambias de marca) y luego la marca.

====================================================
4. CONSULTA CON RELACIÓN 1:N (EAGER LOADING)

Consulta normal (NO ansiosa): GET /api/bicycles/1

{ "id": 1, "brandId": 1, "model": "Sky", ... }

Solo ves brandId = 1. No sabes qué marca es sin hacer otra petición.

Consulta ansiosa (eager loading): GET /api/bicycles/eagerly/1

{ "id": 1, "brandId": 1, "model": "Sky", ...,
"brand": { "id": 1, "name": "BH", ... } }

"Eager" = ansiosa: trae YA los datos del modelo asociado, en la misma consulta, con un JOIN.

Analogía: pedir un pedido en un restaurante. La consulta normal es que te traigan solo el plato y tengas que ir tú a por la bebida. La ansiosa es que te lo traen todo junto en la bandeja.

El service (la clave es include):

static async findEagerlyById(id: number) {
return Bicycle.findByPk(id, {
include: [
{ model: Brand, as: "brand" }
]
});
}

Equivale a SQL:

SELECT bi., br.
FROM bicycles bi LEFT JOIN brands br ON bi.brandId = br.id
WHERE bi.id = 1;

Controller (patrón que se repite en todo el PDF):

static async getEagerlyById(req, res, next) {
try {
const id = Number(req.params.id);
const bicycle = await BicycleService.findEagerlyById(id);
if (!bicycle) {
res.status(404).json({ message: "Bicycle not found" });
return;
}
res.json(bicycle);
} catch (error) {
next(error);
}
}

Explicación línea a línea:

req.params.id siempre llega como string, por eso Number(...).
Si no existe -> 404 y return (para no seguir).
try/catch + next(error) -> pasa el error al middleware de errores en vez de tumbar el servidor.

Ruta:

router.get("/eagerly/:id", BicycleController.getEagerlyById);

IMPORTANTE con el orden de las rutas en Express: se evalúan de arriba a abajo. Pon las rutas específicas (/eagerly/..., /customers/...) ANTES de la genérica "/:id". Si no, Express podría interpretar "eagerly" como un id. En el PDF las ponen antes por eso.

====================================================
5. RELACIÓN 1:1 -> BICYCLE a BICYCLEDETAIL

Significado: cada bici tiene como mucho un detalle (material del cuadro, tamaño de rueda, peso, suspensión) y cada detalle pertenece a una sola bici.

Bicycle.hasOne(BicycleDetail, { foreignKey: "bicycleId", as: "detail", onDelete: "CASCADE" })
BicycleDetail.belongsTo(Bicycle, { foreignKey: "bicycleId", as: "bicycle" })

Fíjate en la diferencia con el 1:N: aquí se usa hasOne en vez de hasMany, y el alias "detail" va en singular (un objeto, no un array).

onDelete CASCADE: si borras la bici, se borra su detalle automáticamente (al contrario que con la marca, que era RESTRICT). Tiene sentido: un detalle sin bici no sirve para nada.

La FK (bicycleId) está en la tabla del detalle, por eso BicycleDetail es el que hace belongsTo.

Modelo BicycleDetail (campos):

id (PK, autoincrement)
bicycleId (FK, allowNull false)
frameMaterial: ENUM("Aluminum","Carbon","Steel","Titanium")
wheelSize: DECIMAL(4,1), no null
weight: DECIMAL(5,2)
suspension: STRING(80), puede ser null
createdAt, updatedAt

Detalle de TypeScript: en la clase se declara frameMaterial como unión de strings ("Aluminum" | "Carbon" | ...), igual que el ENUM de la BD. Y suspension es CreationOptional<string | null> porque es opcional.

Nota: los DECIMAL salen como string en el JSON (por ejemplo "price": "189.99"). Es normal en Sequelize con MySQL. No es un error, solo conviértelo si lo necesitas como número.

Ficheros a crear/tocar: bicycle-detail.controller/service/routes/model.ts, server.ts (importar el modelo) y routes/index.ts (registrar la ruta).

====================================================
6. CONSULTA CON RELACIÓN 1:1 (filtrar por un campo del detalle)

Objetivo: todas las bicis cuyo cuadro sea de Carbon.
GET /api/bicycles/eagerly/frame-material/carbon

Service:

static async findAllEagerlyByFrameMaterial(frameMaterial: string) {
return Bicycle.findAll({
include: [
{ model: BicycleDetail, as: "detail", where: { frameMaterial } }
],
order: [["id", "ASC"]]
});
}

Novedades:

where DENTRO del include: filtra por un campo de la tabla relacionada (frameMaterial está en BicycleDetail, no en Bicycle).
order: [["id","ASC"]] ordena por id ascendente.

Detalle fino: el PDF dibuja un LEFT JOIN, pero cuando pones un where dentro de un include, Sequelize pone required: true automáticamente y lo convierte en INNER JOIN. En la práctica solo salen bicis que tienen detalle y cumplen el filtro. (Esto cuadra con lo que ves en la respuesta.)

Ruta (OJO al orden: va antes de "/:id"):

router.get("/eagerly/frame-material/:frameMaterial", BicycleController.getAllEagerlyByFrameMaterial);

Controller: igual que el anterior pero con String(req.params.frameMaterial) y devuelve el array.

Otra cosa a vigilar: el valor llega tal cual de la URL. El ENUM es "Carbon" con mayúscula; en el PDF la URL usa "carbon" en minúscula y funciona porque MySQL compara los ENUM sin distinguir mayúsculas. Si algún día usas otra BD, cuidado.

====================================================
7. SEGUNDO EJEMPLO 1:N -> CUSTOMER (1) a ORDER (N)

Misma idea que Brand-Bicycle:

Customer.hasMany(Order, { foreignKey: "customerId", as: "orders" })
Order.belongsTo(Customer, { foreignKey: "customerId", as: "customer" })

Modelo Customer: id, name (string 100, no null, unique), email (string 160, no null, unique), createdAt, updatedAt. Los unique hacen que si creas dos clientes con el mismo email te dé un error de duplicado.

Modelo Order: id, customerId (FK), orderDate (DATE, default NOW), status (ENUM: "pending", "paid", "shipped", "cancelled", default "pending"), timestamps.

Cosas útiles: como orderDate y status tienen valor por defecto, en el POST de Postman son opcionales. Solo necesitas customerId para crear un pedido.

====================================================
8. CONSULTAS DEL 1:N CUSTOMER-ORDER

Consulta A: pedidos de un cliente, del más reciente al más antiguo.
GET /api/orders/customers/1

static async findByCustomerId(customerId: number) {
return Order.findAll({
where: { customerId },
include: [{ model: Customer, as: "customer", attributes: ["id","name","email"] }],
order: [["orderDate","DESC"]]
});
}

Novedades:

where: { customerId } es la abreviatura de { customerId: customerId }.
attributes dentro del include: elige qué columnas del cliente quieres (como el SELECT de SQL). Así no mandas createdAt, updatedAt, etc. En la respuesta ves customer con solo id, name y email.
order DESC: descendente.

Ojo, en la diapositiva el SQL tiene una errata: dice "b.id, b.name, b.email" pero la tabla se llama c (customers). Sería: SELECT o.*, c.id, c.name, c.email ... Y el ORDER BY tiene que ir antes del punto y coma, sin ; en medio.

Ruta: router.get("/customers/:id", OrderController.getByCustomerId); (antes de "/:id").

Consulta B: clientes cuyo nombre contenga "ibu", con sus pedidos.
GET /api/customers/ibu/orders

import { Op } from "sequelize";

static async findCustomersWithOrdersByNameSearch(nameSearch: string) {
return Customer.findAll({
where: { name: { [Op.like]: %${nameSearch}% } },
include: [{ model: Order, as: "orders", required: true }]
});
}

Novedades:

Op.like: el LIKE de SQL. Los % son comodines (cualquier texto antes/después). Se importa Op de sequelize.
required: true: convierte el LEFT JOIN en INNER JOIN. Solo salen clientes que tengan al menos un pedido. Sin él, saldrían también clientes con "orders": [].
Aquí el include usa el alias "orders" (plural, array), porque es el lado hasMany.

Ruta: router.get("/:name_search/orders", CustomerController.getCustomersWithOrdersByNameSearch);
El ":" delante de name_search indica que es un parámetro variable. En la URL pones "ibu" en ese hueco.

Comparativa rápida de los dos JOIN:

Tipo Cuándo Qué devuelve
LEFT JOIN (por defecto) todos los de la tabla principal, aunque no tengan relacionados
INNER JOIN required:true solo los que tienen coincidencia en ambas tablas

====================================================
9. RELACIÓN N:M -> ORDER y BICYCLE (con ORDERITEM)

Problema: un pedido tiene muchas bicis y una bici sale en muchos pedidos. Eso es muchos a muchos y en SQL no se puede poner directamente. Se resuelve con una tabla intermedia (OrderItem), que además guarda datos propios de la relación: quantity (cantidad) y unitPrice (precio unitario en el momento de la compra).

Analogía: el ticket de compra. El pedido es el ticket, la bici es el producto, y cada línea del ticket (OrderItem) dice "2 unidades a 189,99".

Las asociaciones que enseña el PDF son las del "super many-to-many" (todas a la vez):

Order.belongsToMany(Bicycle, { through: OrderItem, foreignKey: "orderId", otherKey: "bicycleId", as: "bicycles" })
Bicycle.belongsToMany(Order, { through: OrderItem, foreignKey: "bicycleId", otherKey: "orderId", as: "orders" })

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" })
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" })
Bicycle.hasMany(OrderItem, { foreignKey: "bicycleId", as: "orderItems" })
OrderItem.belongsTo(Bicycle, { foreignKey: "bicycleId", as: "bicycle" })

Para qué sirve cada grupo:

belongsToMany con through: te permite saltarte la tabla intermedia y pedir "las bicis de este pedido" directamente (alias "bicycles").
hasMany/belongsTo con OrderItem: te permite acceder a la línea en sí (con quantity y unitPrice), alias "items".
Si solo pusieras el belongsToMany no podrías incluir los datos de la tabla intermedia tan fácil; con los dos grupos tienes lo mejor de cada.

foreignKey vs otherKey en belongsToMany:

foreignKey: la columna de la tabla intermedia que apunta al modelo desde el que declaras (en Order.belongsToMany -> orderId).
otherKey: la columna que apunta al otro modelo (-> bicycleId).

Modelo OrderItem: id, orderId, bicycleId (ambos FK, no null), quantity (entero, no null, validate min 1), unitPrice (DECIMAL(10,2), no null, validate min 0), timestamps. Tabla "order_items".

Ficheros: order-item.model/controller/service/routes.ts, server.ts, routes/index.ts.

Ejemplo de consulta que podrías hacer (el PDF no la desarrolla, es una idea para practicar):

Order.findByPk(1, {
include: [{ model: OrderItem, as: "items", include: [{ model: Bicycle, as: "bicycle" }] }]
})

Te devuelve el pedido, con sus líneas, y cada línea con su bici (include anidado).

====================================================
10. POSTMAN (la parte que más te cuesta)

Postman es un cliente para probar tu API sin necesidad de tener el frontend hecho. Es tu "navegador de pruebas" para peticiones que no sean GET.

10.1 Estructura que pide el PDF

Colección: bicycle-shop-in-the-classroom
Carpeta Bicycles
GET http://localhost:3000/api/bicycles
POST http://localhost:3000/api/bicycles
PUT http://localhost:3000/api/bicycles/2
DELETE http://localhost:3000/api/bicycles/2
Carpeta Brands
GET http://localhost:3000/api/brands
POST http://localhost:3000/api/brands
PUT http://localhost:3000/api/brands/2
DELETE http://localhost:3000/api/brands/2
GET http://localhost:3000 (la raíz, para comprobar que el servidor está vivo)

Cómo montarlo:

New -> Collection, ponle nombre.
Botón de los tres puntos de la colección -> Add folder -> una por cada CRUD.
Dentro de la carpeta -> Add request -> eliges método (GET/POST/PUT/DELETE), pones URL y nombre.

10.2 Qué significa cada método (CRUD)

Método CRUD Para qué ¿Necesita body? URL
GET Read leer datos no /api/brands o /api/brands/1
POST Create crear uno nuevo sí (JSON) /api/brands
PUT Update modificar uno existente sí (JSON) /api/brands/1
DELETE Delete borrar no /api/brands/1

El número final (/1, /2) es el id del elemento (req.params.id en el controller).

10.3 Cómo mandar un body (POST y PUT)

Selecciona el método POST.
Pestaña Body -> raw -> en el desplegable de la derecha elige JSON.
Escribe el JSON (comillas dobles siempre, y sin coma final).
Send.

Postman añade solo la cabecera Content-Type: application/json al elegir JSON. Tu app.ts tiene que tener app.use(express.json()); si no, req.body llega undefined.

Ejemplos de body:

POST /api/brands
{ "name": "BH" }

POST /api/bicycles
{
"brandId": 1,
"model": "Sky",
"description": "Great for any occasion",
"price": 189.99,
"stock": 10
}

POST /api/bicycle-details (usa la ruta que hayas registrado)
{
"bicycleId": 4,
"frameMaterial": "Carbon",
"wheelSize": 10.0,
"weight": 189.99,
"suspension": "SuperSuspension"
}

POST /api/customers
{ "name": "Tiburcio Cruz Ravelo", "email": "tiburciocruz@ieselrincon.es" }

POST /api/orders
{ "customerId": 1, "orderDate": "2026-09-09", "status": "paid" }
(orderDate y status son opcionales)

POST /api/order-items
{ "orderId": 1, "bicycleId": 1, "quantity": 2, "unitPrice": 189.99 }

PUT /api/brands/1
{ "name": "BH Bikes" }

10.4 ORDEN DE PRUEBAS (esto es lo que más suele fallar)

Por las claves foráneas, no puedes crear algo que apunte a algo que no existe. El orden correcto:

Brand
Bicycle (necesita brandId existente)
BicycleDetail (necesita bicycleId existente)
Customer
Order (necesita customerId existente)
OrderItem (necesita orderId y bicycleId existentes)

Y para borrar, al revés:

Un Brand con bicis no se puede borrar (RESTRICT).
Borrar una Bicycle borra su BicycleDetail (CASCADE).
Lo del Customer/Order y OrderItem depende de cómo hayas puesto el onDelete en tus modelos (en el PDF no se ve para esos).

10.5 Cómo leer la respuesta

Código Significado Causa típica
200 OK todo bien (GET, PUT, DELETE)
201 creado (POST) depende de lo que ponga tu controller
204 sin contenido a veces en DELETE
400 petición mal hecha body inválido o falta un campo obligatorio
404 no encontrado id que no existe ("Bicycle not found")
500 error del servidor FK que no existe, unique duplicado, error de código...

Si te da 500, mira la CONSOLA de tu servidor (la terminal donde corre npm run dev): ahí sale el error de Sequelize/MySQL real. El body de Postman a veces solo dice "Internal server error".

10.6 Errores típicos y cómo arreglarlos

"Cannot GET /api/..." -> ruta mal escrita o no registrada en routes/index.ts, o el servidor no se reinició.
Connection refused / Could not get response -> el servidor no está arrancado o el puerto no es el 3000.
req.body undefined / campos "null" -> falta Body: raw: JSON en Postman o falta express.json() en app.ts.
JSON mal formado -> comillas simples, coma final, o comentarios dentro del JSON.
Foreign key constraint fails -> estás usando un brandId/customerId/etc. que no existe. Haz primero el GET de la tabla padre para ver los ids.
Duplicate entry -> intentas crear un Customer con name o email ya existente (unique).
La respuesta eager sale sin el campo del alias -> alias distinto entre asociación e include, o te falta llamar a defineAssociations().
Los datos desaparecen al reiniciar -> el sync con force: true.

10.7 Trucos para ahorrar tiempo

Variable de entorno: en vez de escribir http://localhost:3000 en cada petición, crea un Environment con baseUrl = http://localhost:3000 y usa:

{{baseUrl}}/api/bicycles

Así si cambias de puerto lo tocas en un solo sitio.

Guardar el id automáticamente: en la pestaña Scripts (o Tests) de un POST puedes guardar el id creado:

const data = pm.response.json();
pm.environment.set("brandId", data.id);

Y luego en otro body: { "brandId": {{brandId}}, "model": "Sky", ... }. Útil para encadenar pruebas.

Test básico para comprobar el estado:

pm.test("Status 200", () => pm.response.to.have.status(200));

Nombrar bien las peticiones: pon nombres como "Eager bicycle by id" en vez de "New Request", y organiza también las consultas de las relaciones en sus carpetas.

10.8 Lista de peticiones extra que deberías tener en la colección para las consultas del PDF

GET {{baseUrl}}/api/bicycles/1 (normal)
GET {{baseUrl}}/api/bicycles/eagerly/1 (eager con marca)
GET {{baseUrl}}/api/bicycles/eagerly/frame-material/carbon (eager con detalle + filtro)
GET {{baseUrl}}/api/orders/customers/1 (pedidos de un cliente, DESC)
GET {{baseUrl}}/api/customers/ibu/orders (clientes cuyo nombre contiene "ibu")

Para cada una compara lo que sale con lo del PDF: el campo del alias (brand, detail, customer, orders) tiene que aparecer.

====================================================
11. CONCLUSIONES DEL PDF

Lo aprendido:

Creamos asociaciones de todos los tipos (1:N, 1:1, N:M).
Hicimos consultas ansiosas (eager loading).
Herramientas de Sequelize usadas: include, attributes, model, as, where, required: true, Op.like y order.

Próximo paso: transacciones (para que varias operaciones se hagan todas o ninguna; por ejemplo, crear un pedido y todas sus líneas de OrderItem a la vez).

====================================================
12. CHULETA FINAL (opciones del include)

include: [{
model: Modelo, qué tabla unir
as: "alias", el MISMO alias de la asociación
attributes: ["a","b"], qué columnas traer (el SELECT)
where: { campo }, filtrar en la tabla unida
required: true, INNER JOIN en vez de LEFT JOIN
}]
where: {...} filtrar en la tabla principal
order: [["campo","DESC"]] ordenar
[Op.like]: "%texto%" búsqueda con LIKE

====================================================
LO QUE MÁS PROBABLE CAE (en orden de importancia)
QUÉ ASOCIACIÓN USAR Y DÓNDE VA LA FK (seguro cae)

Tipo Lado "padre" Lado "hijo" (tiene la FK) Alias típico
1:N A.hasMany(B) B.belongsTo(A) "bicycles" (plural) / "brand" (singular)
1:1 A.hasOne(B) B.belongsTo(A) "detail" / "bicycle" (singulares)
N:M belongsToMany + through (tabla intermedia) "bicycles" / "orders"

Truco: la tabla que tiene la columna FK es la que hace belongsTo.
Truco: hasMany -> alias en plural (array). hasOne y belongsTo -> alias en singular (objeto).

Para el N:M, la tabla intermedia (OrderItem) existe porque en SQL no se puede hacer muchos a muchos directo. Además guarda datos propios de la relación (quantity, unitPrice).

LA REGLA DEL ALIAS (el PDF la repite como 5 veces, así que es pregunta fácil)

El alias del include en la consulta TIENE que coincidir con el "as" de la asociación. Si no, error.
Además, el alias es el nombre del campo que aparece en el JSON de respuesta.

EAGER LOADING (seguro cae)
Normal: devuelve solo la tabla principal (ves brandId: 1 y ya).
Eager (ansiosa): devuelve también los datos de la tabla relacionada, en la misma consulta, usando include (hace un JOIN).
Código mínimo que debes saber escribir de memoria: Bicycle.findByPk(id, {
include: [{ model: Brand, as: "brand" }]
});
LAS OPCIONES DEL INCLUDE Y PARA QUÉ SIRVE CADA UNA

model -> qué tabla unes
as -> el alias (igual que en la asociación)
attributes -> qué columnas traer. Es el SELECT de SQL
where -> filtra la tabla unida (si lo pones dentro del include)
required -> true = INNER JOIN, false (por defecto) = LEFT JOIN
order -> ordenar, ej: [["orderDate","DESC"]]
Op.like -> el LIKE de SQL, con [Op.like]: %texto%

LEFT JOIN vs INNER JOIN

LEFT JOIN -> salen todos los de la tabla principal, aunque no tengan relacionados (campo vacío o array vacío).
INNER JOIN -> solo salen los que tienen coincidencia en las dos tablas. En Sequelize: required: true.
Dato fino: si pones where dentro de un include, Sequelize pone required: true solo.

TRADUCIR SQL <-> SEQUELIZE (este tipo de pregunta es muy típica)

SQL:
SELECT c., o. FROM customers c
INNER JOIN orders o ON o.customerId = c.id
WHERE c.name LIKE '%ibu%';

Sequelize:
Customer.findAll({
where: { name: { [Op.like]: "%ibu%" } },
include: [{ model: Order, as: "orders", required: true }]
});

Y el ejemplo con ORDER BY:
Order.findAll({
where: { customerId },
include: [{ model: Customer, as: "customer", attributes: ["id","name","email"] }],
order: [["orderDate","DESC"]]
});

CAPAS Y FLUJO DE UNA PETICIÓN

Routes -> Controller -> Service -> Sequelize -> MySQL

Routes: define la URL y el método, y a qué función del controller llama.
Controller: lee req.params / req.body, llama al service, responde con res.json o res.status(404). Siempre con try/catch y next(error).
Service: aquí van las consultas de Sequelize.

Para añadir una consulta nueva se tocan 3 sitios: service (la query), controller (la función) y routes (la URL).

COSAS DE CONFIGURACIÓN QUE SUELEN PREGUNTAR
Las asociaciones se declaran en src/models/associations.ts, dentro de defineAssociations().
En server.ts: importar los modelos, y llamar a defineAssociations() ANTES del sync.
La FK en el modelo: brandId con references: { model: "brands", key: "id" }.
onDelete RESTRICT: no deja borrar el padre si tiene hijos. onDelete CASCADE: borra los hijos con el padre. onUpdate CASCADE: propaga el cambio de id.
Ejemplos del PDF: Brand->Bicycle es RESTRICT. Bicycle->BicycleDetail es CASCADE.
Orden de las rutas en Express: las específicas (/eagerly/:id) ANTES de "/:id".
POSTMAN (lo que te cuesta; para el examen quédate con esto)

Métodos y qué hacen:
GET -> leer POST -> crear (body) PUT -> modificar (body + id en URL) DELETE -> borrar (id en URL)

Para POST/PUT: pestaña Body -> raw -> JSON.

Orden para probar con FKs: Brand -> Bicycle -> BicycleDetail -> Customer -> Order -> OrderItem. Si usas un id que no existe, error de clave foránea (500).

Códigos: 200 ok, 404 no encontrado, 400 petición mal hecha, 500 error de servidor (mira la consola del servidor).

====================================================
LO QUE NO TE HACE FALTA APRENDER DE MEMORIA
El código exacto de los modelos (las columnas, tipos DECIMAL...). Basta con entender qué es cada campo.
Los JSON concretos de Postman. Entiende la estructura, no los valores.
Los diagramas mermaid (solo es notación para dibujar el diagrama ER).
El detalle de cada archivo de importaciones.

Sí, te explico: son las restricciones que el diagrama dibuja con las patitas de gallo. Cada una se traduce a algo concreto en el código.

Qué significa cada símbolo

El símbolo pegado a una entidad dice cuántas de esas entidades puede haber en ese extremo de la relación:

Dibujo	Significa	En Sequelize
||	Exactamente uno (obligatorio)	La clave foránea lleva allowNull: false.
|o	Cero o uno (opcional)	La clave foránea lleva allowNull: true, y en TypeScript es number | null.
o{	Cero o muchos	hasMany, sin más.
|{	Uno o más (al menos uno)	La base de datos no puede obligar a esto, se valida en el código.

Ejemplo: Model |o--o{ Bicycle quiere decir que una bici puede no tener modelo. Entonces modelId pasa a allowNull: true.

Los casos que te pueden pedir

1. "Permite nulos" o campo opcional

En el modelo: allowNull: true. Si es obligatorio: allowNull: false.
En el declare de TypeScript: string | null. Si TypeScript se queja al crear, usa CreationOptional<...>.
En el controller, no marques ese campo como obligatorio en la validación.
Se prueba en Bruno con un POST sin ese campo: si es opcional, debe dar 201; si no, 400 o 500.

2. Relación opcional (la clave foránea puede ser nula)

allowNull: true en la FK. Con eso, onDelete: "SET NULL" pasa a tener sentido (si borras el modelo, la bici se queda sin modelo, no se borra).
En las consultas, un include normal es un LEFT JOIN, así que las bicis sin modelo salen con model: null.
Si el include lleva where o required: true, se convierte en INNER JOIN y esas bicis desaparecen. Si quieres conservarlas, pon required: false.

3. "Tiene que tener uno o más de algo" (por ejemplo, un pedido con al menos una línea)

Esto no se puede forzar con una clave foránea. Se valida en el controller: en el POST exige que venga al menos un elemento y, si no, devuelve un 400.
Si además te piden que no se pueda borrar la última línea de un pedido, la comprobación va en el DELETE.

4. "Solo uno" (1:1)

unique: true en la clave foránea, como hicimos en bicycleDetails. Sin eso se pueden crear dos.

5. Otras restricciones sueltas

unique: true (valores repetidos no).
defaultValue (valor por defecto).
validate: { min: 1 } (cantidad mínima).
DataTypes.ENUM(...) (solo ciertos valores).
Para no fallar
Lee el diagrama con calma, símbolo por símbolo, y apunta al lado de cada relación qué restricción lleva.
Cambiar allowNull en una tabla que ya existe no se aplica: es la misma trampa de siempre, así que borra la base de datos y créala vacía si lo cambias.
Después de cada restricción, pruébala en Bruno con el caso malo (por ejemplo, un POST sin el campo) y con el bueno.

=========================================================
Los operadores que más te pueden salir:

Operador	Significa	SQL
Op.gt	mayor que	>
Op.gte	mayor o igual	>=
Op.lt	menor que	<
Op.lte	menor o igual	<=
Op.ne	distinto de	<>
Op.like	contiene un texto, con %	LIKE

Truco para acordarte: la g es greater (mayor) y la l es less (menor), y la e del final es equal (igual): gte es "mayor o igual".

Con Op.gt y Op.lt, el valor justo en el límite no entra: si pones > 100, una bici de exactamente 100 no sale. Por eso en el pre-examen probé con una bici de 100 exacto.
