# Directorio Rick & Morty

Aplicación web desarrollada con Angular para explorar personajes de Rick and Morty. Permite consultar personajes, buscar por nombre, filtrar resultados, navegar entre páginas y consultar el detalle de un personaje junto con sus episodios relacionados.
**API usada:** [Rick and Morty API](https://rickandmortyapi.com/)

## Reto y alcance

**Objetivo:** listar personajes con filtros y permitir consultar relaciones básicas con episodios y ubicaciones.

### Incluido

- Listado de personajes desde la API pública.
- Búsqueda por nombre y filtros por estado, especie y género.
- Paginación basada en la paginación de la API.
- Vista de detalle a partir del ID del personaje.
- Información básica del personaje, incluyendo origen y ubicación actual.
- Consulta agrupada de los episodios relacionados para mostrar nombre, código y fecha de emisión.
- Estados de carga y mensajes de error.

### Supuestos

- La API pública es la fuente de datos.
- La ubicación se muestra con el nombre proporcionado por el endpoint del personaje.
- Los episodios se consultan usando los IDs extraídos de las URLs recibidas en el personaje.


## Tecnologías

- Angular .
- TypeScript.
- RxJS para coordinar las peticiones asíncronas.
- Angular Signals para el estado de la interfaz.
- Angular Router para la navegación.
- Angular `HttpClient` para las peticiones HTTP.
- Tailwind CSS para los estilos.
- API pública de [Rick and Morty](https://rickandmortyapi.com/documentation).


## Instalación y ejecución

### Requisitos

- Node.js compatible con Angular 21 (se recomienda una versión LTS vigente).
- npm 11 o superior.

### Desarrollo local

```bash
npm install
npm start
```

Abre `http://localhost:4200/`. 

### Calidad y compilación

```bash
npm test
npm run build
```

## Arquitectura y estructura

La aplicación usa componentes *standalone* y una separación sencilla por funcionalidad:

```text
src/app/
├── app.config.ts                     # Providers globales: router y HttpClient
├── app.routes.ts                     # Rutas de la aplicación
└── features/characters/
    ├── models/character.ts           # Contratos de API y modelo de dominio
    ├── services/character.ts         # Acceso HTTP y adaptación mínima de respuestas
    ├── components/character-card/    # Presentación reutilizable de una tarjeta
    └── pages/
        ├── character-list/           # Búsqueda, filtros, listado y paginación
        └── character-detail/         # Perfil y episodios de un personaje
```

Flujo principal:

```text
Vista de lista / detalle → CharacterService → HttpClient → Rick and Morty API
                 ↓
          Signals + templates Angular
```

## Funcionalidades

### Listado y filtros

El listado consume `GET https://rickandmortyapi.com/api/character`. Los filtros disponibles son:

- Nombre.
- Estado.
- Especie.
- Género.

La búsqueda espera brevemente después de los cambios para evitar peticiones por cada tecla. Cuando se modifica un filtro, la paginación vuelve a la primera página.

### Paginación

La aplicación utiliza el parámetro `page` de la API y la información de `info.pages` y `info.count`. El paginador permite avanzar, retroceder y seleccionar páginas directamente.

### Detalle del personaje

La ruta de detalle consulta un personaje por ID y muestra sus datos básicos, origen y ubicación actual. Para los episodios, obtiene los IDs de las URLs incluidas en la respuesta y consulta los episodios en una petición agrupada cuando hay más de uno.

## Estado y navegación

- **Estado de interfaz:** Angular Signals almacena filtros, página actual, resultados, total de coincidencias, total de páginas, estado de carga y errores.
- **Estado derivado:** `computed()` construye la consulta actual y los números visibles del paginador.
- **Peticiones:** `toObservable()` conecta la consulta reactiva con RxJS. `debounceTime()` reduce solicitudes durante la escritura; `distinctUntilChanged()` evita consultas consecutivas iguales; `switchMap()` prioriza la consulta más reciente.
- **Limpieza:** `takeUntilDestroyed()` termina la suscripción cuando se destruye el componente.
- **Navegación:** Angular Router gestiona el listado y el detalle.
- **Persistencia:** no se persisten filtros ni resultados.


## Decisiones técnicas

- **Consultar la API directamente:** evita mantener una base de datos duplicada para un directorio de lectura cuyo origen ya está disponible públicamente.
- **Separar el servicio de los componentes:** centraliza las peticiones HTTP y hace que la interfaz no dependa directamente de la construcción de URLs.
- **Usar paginación del servidor:** limita los resultados recibidos a la página solicitada en lugar de cargar todos los personajes.


## Rendimiento y escalabilidad

- **Separación de capas:** los componentes no hacen HTTP directamente; todo pasa por `CharacterService`. 
- **Componentes presentacionales:** `CharacterCard` recibe datos por `input` y no conoce el servicio.
- **Tipado estricto:** las respuestas de la API están tipadas con interfaces.
- **Crecimiento:** si se agregan más dominios funcionales, se pueden separar por features y mantener los servicios y modelos próximos a su funcionalidad.

## Seguridad y validaciones

- No se almacenan secretos ni credenciales en el código. La URL de la API es pública y se usa solo para lecturas.
- Los filtros se envían como parámetros HTTP mediante `HttpParams`, evitando construir manualmente una URL con valores de búsqueda sin codificar.
- Los fallos de red muestran un mensaje en pantalla y no rompen la aplicación.
- No hay autenticación, autorización ni datos privados.


## Rendimiento y escalabilidad

- La API pagina los resultados, la interfaz renderiza una página, no el catálogo completo.
- La búsqueda espera 400 ms y cancela solicitudes en curso que ya no aplican.
- La consulta de episodios agrupa IDs en una sola llamada al abrir el detalle.

## Accesibilidad

- Los controles tienen `label` asociado y los botones de paginación tienen nombres accesibles.
- Los estados de carga y error usan `role="status"` y `role="alert"`.
- La página actual se expone mediante `aria-current="page"`.
- Los controles muestran foco visible y el diseño cambia de una a varias columnas según el ancho disponible.
- Las imágenes de personajes usan el nombre del personaje como texto alternativo.


## Uso de IA

Herramienta utilizada: **Claude (Anthropic)**, **Codex** y **ChatGPT**

- Al ser mi primer proyecto "completo" en Angular. Usé IA para entender la estructura del proyecto, generar el esqueleto del servicio y los modelos, y entender conceptos nuevos (signals, `computed`, RxJS, rutas con parámetros), pidiendo explicaciones.
- Cree la maquetación (header, buscador, filtros, tarjetas y vista de detalle con Tailwind), la IA me ayudó a conectarlos con la API y la lógica.
- Se utilizó IA para revisar la separación entre páginas, componentes, modelos y servicios de Angular. La propuesta se ajustó a la estructura de carpetas del proyecto.
- Se consultó cómo construir parámetros HTTP y gestionar la búsqueda reactiva con Signals y RxJS. Se mantuvo la petición a la API pública y se revisó el manejo de respuestas vacías y errores.
- **Riesgos detectados y mitigación:**
  - _Rendimiento:_ una petición por cada letra escrita → debounce y cancelación con `switchMap`.
  - _Seguridad:_ no incluí llaves ni credenciales; las plantillas no usan `innerHTML`.
  - _Sesgos/limitaciones:_ las traducciones fijas solo cubren valores comunes para el resto se muestra el valor original de la API.
- Uso de ia para avanzar por pasos pequeños (primero la base, luego la lista, filtros, paginación y detalle), pedir explicaciones, comparar alternativas con sus ventajas y desventajas antes de decidir.

## Limitaciones

- Sin caché de respuestas: volver a una página vuelve a consultar la API.
- Los filtros y la página no se guardan en la URL, así que al volver del detalle se reinician.
- Lista de especies del filtro limitada a unas pocas opciones.
- Sin pruebas unitarias propias más allá de las generadas por el CLI.

### Siguientes pasos

- Guardar filtros y página en la URL (query params) para conservarlos al navegar.
- Caché de respuestas (por ejemplo con `shareReplay`) y virtual scroll o scroll infinito.
- Pruebas unitarias del servicio y de los componentes principales.





