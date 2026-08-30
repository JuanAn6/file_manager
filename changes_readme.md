# Cambios en el front-end

Registro del rediseño con el sistema **Modernist** y de los defectos que aparecieron al
recorrer el código para aplicarlo. Todo lo listado aquí está ya aplicado en `web_file_manager/`.

---

## 1. Sistema de diseño

Se añadió `src/design-system/` con tres archivos:

| Archivo | Qué es |
| --- | --- |
| `styles.css` | La **única** hoja de estilos: tokens (`:root`), rampas OKLCH 100–900, tipografía base, capa de componentes y la composición del shell de la app |
| `theme.json` | Registro legible por máquina de los parámetros de los que deriva el CSS |
| `readme.md` | Guía de uso: direction, color, tipografía, iconos, estados y tabla de componentes |

- Se importa una sola vez, en `src/main.jsx`.
- `index.html` carga **Archivo** (400–800) desde Google Fonts y fija `theme-color`.
- Iconos **Lucide** vendorizados como path data en `src/components/custom/Icon.jsx`
  (sin dependencia nueva en `package.json`).

### Reglas aplicadas

- Radio 0 en todo. Reglas de 2px (`--color-divider`) entre secciones; nada de hairlines.
- Todo alineado a la izquierda, incluidas las etiquetas dentro de botones anchos
  (`.btn { justify-content: flex-start }`).
- Acento `#ec3013` reservado para la acción primaria y el énfasis pequeño. El único sitio
  donde el rojo corre como campo es el póster del login.
- Estados temáticos: hover/pressed desde la rampa del acento, foco
  `:focus-visible { outline: 2px solid var(--color-accent) }`, `::selection` tintada,
  deshabilitado al 45%. Se eliminó por completo el anillo azul del navegador y el
  `box-shadow: 0 0 0 5px #007bff3e` que hacía de foco.
- Imágenes de contenido (avatar de perfil) dentro de `.grayscale`.

### CSS eliminado

Se borraron `src/index.css`, `src/App.css` y **los 13 archivos de `src/styles/`**
(`Breadcrumbs`, `DropFiles`, `FileList`, `Home`, `Inputs`, `List`, `Loader`, `Login`,
`Menu`, `Modal`, `Profile`, `SearchBar`). Motivos:

- `Inputs.css` y `SearchBar.css` eran **idénticos** (duplicado literal).
- `.list` estaba definido con significados distintos en `FileList.css` y `List.css`,
  y ambos se importaban en la misma sesión → colisión según el orden de import.
- Colores, radios y sombras estaban hard-codeados en cada archivo (`#ccc`, `7px`,
  `#007bff3e`), justo lo que los tokens vienen a resolver.

### Layout

La navegación lateral usaba `position: absolute` con `left: -220px` para ocultarse y un
`margin-left: 210px` en el contenido para compensar. Se sustituyó por un **CSS grid**
(`.shell`): dos columnas, dos filas, áreas nombradas. Colapsar la barra es cambiar la
columna a `0`, no mover un elemento fuera de la pantalla.

---

## 2. Bugs corregidos

### `Home.jsx` — la validación del nombre de carpeta nunca saltaba
```js
if (newFolderName.trim() == '' || newFolderName.trim() >= 1024)
```
Comparaba un **string contra un número**: `'abc' >= 1024` es siempre `false`. Se cambió por
`name.length > 255` con mensaje de error visible en el formulario.

### `Home.jsx` — spinner infinito ante cualquier fallo
`getDirectory()` solo hacía `setLoadingComplete(true)` en el camino feliz. Si la petición
fallaba, la vista se quedaba cargando para siempre. Ahora va en `finally` y hay un estado
de error.

### `Home.jsx` — `reverse()` mutaba la respuesta del servidor
`data.breadcrumbs.reverse()` invierte el array in situ. Se copia antes.

### `UsersList.jsx` — la paginación concatenaba en vez de sumar
El `<input type='number'>` devuelve un **string**, así que `page + 1` producía `"11"` desde
la página 1. Además `page - 1` podía bajar de 1 y `page + 1` pasar de `last_page`. Ahora se
convierte a número, se recorta al rango `[1, last_page]` y los botones se deshabilitan en
los extremos.

### `FileList.jsx` — columnas de fecha intercambiadas
`Modified at` mostraba `created_at` y `Created at` mostraba `updated_at`.

### `FileList.jsx` — icono de carpeta para todo
Todas las filas pintaban 📁, también los archivos. Ahora se decide por `item.type`.

### `FileList.jsx` — `item.user.name` sin guarda
Petaba la fila entera si la API no traía la relación. Ahora `item.user?.name ?? '—'`.

### `FileList.jsx` — el checkbox propagaba el click de la fila
Marcar la casilla disparaba también el `onClick` de la fila, que volvía a invertir la
selección: el checkbox no hacía nada. Se añadió `stopPropagation`.

### `utils.js` — `formatDateFromDatabse` lanzaba con fechas inválidas
`new Date(basura).toISOString()` lanza `RangeError`. Ahora devuelve `'—'`.

### `DropFiles.jsx` — listeners de `document` sin limpiar
Registraba handlers con `getElementById` + `addEventListener` en el `useEffect` y **nunca
los quitaba**, así que se acumulaban en cada montaje. Reescrito con los handlers de drag de
React, sin acceso directo al DOM.

### `DropFiles.jsx` — la subida no daba señal ni refrescaba
No había estado de progreso, error ni éxito, y el listado seguía mostrando la carpeta
anterior. Ahora hay mensaje de estado y un callback `onUploaded` que recarga el directorio.

### `App.jsx` / `Profile.jsx` — `let on = 0` como guarda de efecto
```js
let on = 0;
useEffect(() => { if (on == 0) { getUser(); on = 1; } }, []);
```
La variable se re-inicializa en cada render, así que no guardaba nada. Sustituido por
dependencias correctas del efecto y una bandera `cancelled` para no hacer `setState` tras
desmontar.

### `App.jsx` — `location` global en vez de `useLocation()`
El efecto leía el `window.location` global pero lo declaraba como dependencia; con
navegación de cliente el valor podía ir por detrás de la ruta real. Ahora usa `useLocation()`.

### `App.jsx` / `Profile.jsx` — fugas de blob URL
`URL.createObjectURL()` sin su `revokeObjectURL()`: una imagen retenida en memoria por cada
visita al perfil. Ahora se revocan en la limpieza del efecto.

### `App.jsx` — logout que dejaba la sesión colgada
Si `POST /logout` fallaba, no se llamaba a `logout()` ni se navegaba: el usuario se quedaba
dentro con un token que el servidor ya rechazaba. El descarte local va ahora en `finally`.

### `Login.jsx` — error dentro del manejador de errores
`error.response.data` explota en un fallo de red (no hay `response`). Además usaba `alert()`.
Ahora lee con `?.` y muestra el mensaje en el formulario, con estado de envío.

### `AuthContext.jsx` — `JSON.parse` sin protección al arrancar
Un `authUser` corrupto en localStorage tiraba la app entera antes del primer render.

### `AuthContext.jsx` — el value del contexto se recreaba en cada render
Sin `useMemo`/`useCallback`, todos los consumidores se re-renderizaban siempre. Además
`checkToken` no era estable, lo que impedía declararlo como dependencia del efecto de ruta.

### Rutas del menú que caían en 404
El menú lateral enlazaba `/pdfs`, `/documents`, `/images`, `/videos`, `/audios` y `/storage`,
y **ninguna** existía en el router. Se añadió un `Placeholder` que dice explícitamente que la
sección no está disponible. También:
- `Documnes` → `Documents` (typo).
- `Images` apuntaba a `/documents`; ahora a `/images`.

---

## 3. Código muerto eliminado

- `components/custom/ActionMenu.jsx` — copia casi literal de `Menu.jsx`, solo usada en un
  bloque comentado de `FileList.jsx`.
- `src/assets/react.svg` y los SVG de `src/icons/` (`dots`, `edit`, `edit` sin extensión,
  `eye-filled`, `eye-outlined`, `home`, `layout-sidebar-*`, `menu-2`, `trash`), sustituidos
  por el set Lucide. Se conserva `icons/profile.png` (avatar por defecto).
- Clases de `index.css` sin uso (`.d-none`, `.no-margin`, `.position-out`, `.custom-container`…).
- `Home.jsx`: estado inicial de `items` con una fila de prueba hard-codeada.
- `Profile.jsx`: `formData.append('user_data', {...user})` que se construía y nunca se enviaba.
- `List.jsx`: `console.log(pagination)` en cada render.
- Imports sin usar en `Home.jsx`, `UsersList.jsx`, `SearchBar.jsx`, `Profile.jsx`
  (`useNavigate`, `Menu`, `api`, `Modal`…).
- `UsersList.jsx`: `headers` estaba en `useState` sin setter; ahora es una constante.

---

## 4. Accesibilidad

- Todos los `<input>` tienen `<label>` asociada por `id`/`htmlFor`.
- Botones de solo icono con `aria-label` y `title`.
- El toggle de contraseña usa `aria-pressed`; el de la barra lateral, `aria-expanded`.
- Errores con `role='alert'`, estados de carga con `role='status'` y `aria-live`.
- El modal es `role='dialog' aria-modal='true'`, cierra con **Escape** y con click en el
  fondo. El menú también cierra con Escape.
- Filas de tabla seleccionadas marcadas con `aria-selected`.
- Enlaces de navegación con `NavLink`, que aporta `aria-current='page'` (de donde el CSS
  toma el estado activo).
- `@media (prefers-reduced-motion: reduce)` desactiva animaciones y transiciones.
- Los `<div onClick>` de breadcrumbs pasaron a `<button>`, accesibles por teclado.

---

## 5. Estructura

- `context/AuthContext.jsx` exportaba a la vez el provider y el hook `useAuth`, lo que
  rompía Fast Refresh (era el único **error** de ESLint del proyecto). Se separó en
  `context/authContextValue.js` (el contexto) y `context/useAuth.js` (el hook).
- Se añadieron `components/Placeholder.jsx` y `components/NotFound.jsx`; el 404 era un `<h1>`
  suelto en el router.
- `.claude/launch.json` para arrancar el dev server desde el editor.

---

## 6. Verificación

```bash
npm run lint --prefix web_file_manager
```
```bash
npm run build --prefix web_file_manager
```

Ambos pasan sin errores ni warnings (antes: 1 error y 2 warnings). El login y el shell
autenticado se revisaron en el navegador.

---

## 7. Funcionalidad completada (segunda pasada)

Lo que quedaba pendiente exigía endpoints que no existían. Se implementaron en la API y se
conectaron en el front.

### Endpoints nuevos — `routes/api.php`

| Método | Ruta | Qué hace |
| --- | --- | --- |
| POST | `/rename_item` | Renombra un archivo o carpeta |
| POST | `/delete_items` | Borra en lote; las carpetas se llevan su subárbol |
| GET | `/search` | Búsqueda por nombre en archivos y carpetas |
| GET | `/get_files_by_category` | Archivos de una categoría, paginados |
| GET | `/storage_usage` | Totales y reparto por categoría |
| GET | `/roles` | Catálogo de roles (superadmin) |
| GET | `/users/{id}` | Un usuario (superadmin) |
| PUT | `/users/{id}` | Edición administrativa de un usuario (superadmin) |

Decisiones de implementación:

- **Propiedad en la consulta, no después.** Cada búsqueda de un item incluye
  `where('user_id', ...)`, así que un id ajeno devuelve 404 en vez de tocar otra fila.
  Verificado con un id inexistente → 404.
- **Borrado recursivo por niveles.** `directory.parent_id` es una FK sobre la propia tabla,
  así que no se puede borrar un padre antes que sus hijos. Se recorre el árbol en anchura y
  se borra de la hoja hacia la raíz, dentro de una transacción.
- **Los blobs se borran después del commit.** Un fallo al borrar del disco deja un huérfano;
  el orden inverso dejaría una fila apuntando a la nada.
- **`escapeLike`** en las búsquedas: un `%` literal en el término ya no hace match con todo.
- Las categorías se resuelven por `mime` con la extensión como respaldo, en una constante
  única compartida por el listado y por el cálculo de almacenamiento.

### Front conectado

- **`Home.jsx`** — **Rename** (habilitado solo con un item seleccionado) y **Delete** con
  diálogo de confirmación que avisa explícitamente cuando hay carpetas en la selección.
- **`SearchBar.jsx`** — búsqueda real con *debounce* de 300 ms y descarte de respuestas
  fuera de orden (una petición lenta ya no puede pisar a una más reciente). Al elegir un
  resultado se abre la carpeta; si es un archivo, la carpeta que lo contiene.
- **`FilesByCategory.jsx`** (nuevo) — una sola vista para Pdf, Documents, Images, Videos y
  Audios; la categoría llega por prop.
- **`Storage.jsx`** (nuevo) — total usado, número de archivos y carpetas, y el reparto por
  categoría con un `.meter` (componente nuevo del sistema, rectangular y con regla de 2px).
- **`UsersList.jsx`** — `goEditUser` abre un modal de edición real (nombre, apellidos, email
  y rol desde `/roles`), y muestra el mensaje de validación que devuelve Laravel.
- `Placeholder.jsx` se eliminó: ya no hay ninguna sección sin contenido.

### Más bugs corregidos en esta pasada

- **Claves de React duplicadas en `FileList`.** Carpetas y archivos tienen secuencias de id
  independientes, así que la carpeta 1 y el archivo 1 colisionaban al fundirse en una sola
  tabla: React duplicaba filas y los checkboxes dejaban de responder. Se observó en el
  navegador. La clave es ahora `${type}-${id}`.
- **Regresión propia en `Profile.jsx`.** Al reescribir el componente pasé a enviar
  `profile_img` vacío para borrar la imagen, pero la API espera la cadena `'null'`. Se
  restauró, y de paso el backend acepta ahora ambas formas.
- **La API respondía 302 en vez de 422.** Sin cabecera `Accept: application/json`, un fallo
  de validación se contestaba con una redirección a una web que no existe, que llegaba al
  front como un error opaco. Nuevo middleware `ForceJsonResponse`, aplicado al grupo `api`.
- **Validación ausente en la API.** `getDirectory`, `createNewFolder` y `uploadFiles` leían
  `$request->all()` sin comprobar nada: un `parent_id` ausente provocaba un 500. Ahora todos
  validan, y `getList` tiene valores por defecto para `page` y `pageSize`.
- **La carpeta abierta vive en la URL.** `Home` la lee de `?folder=`, así que sobrevive a un
  refresco y un resultado de búsqueda puede enlazar directamente a ella.
- **`getProfileImage` construía la ruta a mano** (`storage_path('app/private/' . $path)`),
  lo que se rompe con cualquier otra configuración de disco. Ahora usa `Storage::path()`.
- **`updateProfile` no validaba** y accedía a `$data['name']` a ciegas.
- `List.jsx` quedó sin uso al reescribir `UsersList` y se eliminó.
- `ModalNewFolder.jsx` pasó a llamarse `Modal.jsx`: es un modal genérico y ya lo usan tres
  pantallas.

### Verificación de esta pasada

Endpoints probados contra la API en local con un usuario real: alta de carpeta, carpeta
anidada, renombrado, renombrado de un id ajeno (404), borrado recursivo (2 carpetas, sin
dejar restos), búsqueda, listado por categoría, uso de almacenamiento, listado y edición de
usuarios, y email duplicado (422). Los datos de prueba se crearon y se borraron.

En el navegador se recorrieron login, home con selección y ambos diálogos, búsqueda,
sección Pdf, Storage y Users con su modal de edición.

## 8. Drag and drop (tercera pasada)

Dos cosas distintas que comparten mecánica y que no deben confundirse nunca:

| Arrastre | Lo transporta | Qué hace |
| --- | --- | --- |
| Interno | `application/x-file-manager-items` | Mueve items entre carpetas |
| Externo | `Files` (del sistema operativo) | Sube archivos a la carpeta abierta |

Durante `dragover` el navegador **no** deja leer el contenido del `dataTransfer`, solo la
lista de tipos. Por eso toda la decisión (aceptar o no el drop) se toma mirando el tipo, y
el contenido real vive en un `useRef` de `Home` compartido con la lista y las migas
([drag.js](web_file_manager/src/utils/drag.js)).

### Mover items — `POST /move_items`

- Arrastra una fila sobre una **carpeta** de la lista para meterla dentro.
- Arrastra sobre una **miga de pan** para subirla en el árbol, incluido `Home` (la raíz).
- Si arrastras una fila que está seleccionada, se mueve **toda la selección**; si no lo
  está, solo esa fila. Es lo que hace cualquier gestor de archivos.
- La carpeta de destino se marca con la regla del acento y el origen baja a 45% de opacidad.

Guardas, en el cliente y repetidas en el servidor:

- Una carpeta no se acepta a sí misma como destino.
- **Ciclos**: mover una carpeta dentro de su propio subárbol devuelve 422. Sin esto la rama
  entera quedaría desconectada de la raíz para siempre.
- Destino inexistente o ajeno → 404, porque la búsqueda del destino incluye `user_id`.
- Soltar algo en la carpeta en la que ya está no genera petición.

### Subida global — `GlobalDropUpload`

Un overlay cubre todo el viewport en cuanto entra un arrastre de archivos del sistema, así
que el drop no tiene que acertar en ningún widget concreto. Los archivos van a la carpeta
abierta en el listado; desde cualquier otra sección van a la raíz y la app navega allí para
que se vea dónde han caído.

- `dragenter`/`dragleave` se disparan por **cada** elemento que se cruza, así que se lleva un
  contador de profundidad: el overlay solo se cierra cuando el puntero sale de la ventana de
  verdad.
- Sin `preventDefault` en `dragover` el navegador abandona la SPA y abre el archivo soltado.
- Los arrastres internos no llevan `Files`, así que nunca levantan el overlay y siguen
  llegando a la lista de debajo.
- Tras subir se emite un evento `file-manager:files-uploaded` y el listado se recarga solo si
  está mostrando esa misma carpeta.
- `DropFiles` dejó de gestionar el drop y se quedó como selector de archivos. Si mantuviera
  sus propios handlers, un drop sobre ese recuadro se procesaría **dos veces**: una por él y
  otra al burbujear hasta el overlay.

### Otro bug corregido de paso

Un usuario ya autenticado que iba a `/login` veía el formulario de acceso **incrustado**
dentro del shell, con barra lateral y todo. Esa ruta redirige ahora a `/`.

### Verificación

En la API: ciclo → 422, destino inexistente → 404, mover a la raíz → 200, con limpieza de
los datos de prueba.

En el navegador, con eventos `DragEvent` reales y su `DataTransfer`: mover un archivo a una
carpeta (desaparece del origen, aparece dentro), devolverlo soltándolo en la miga `Home`,
resaltado del destino y atenuación del origen, rechazo de una carpeta sobre sí misma, y
subida global (overlay, subida, toast y recarga automática del listado). El archivo de
prueba se borró.

## 9. Mover archivos: el resto de caminos (cuarta pasada)

Arrastrar solo alcanza lo que está en pantalla. Faltaban las dos vías explícitas.

### Diálogo de destino — `MoveToDialog`

`GET /directory_tree` devuelve las carpetas del usuario **planas** (`id`, `parent_id`,
`name`); el árbol lo monta el cliente. Anidar la respuesta solo complicaría paginarla más
adelante.

El diálogo muestra el árbol completo con `Home` como raíz, plegable por nivel, y:

- Marca con la etiqueta `Current` la carpeta en la que ya están los items, y deshabilita
  **Move here** si no cambias de destino.
- Deshabilita las carpetas que se están moviendo **y todo su subárbol**: recorre los
  descendientes en el cliente para no ofrecer siquiera un destino que el servidor va a
  rechazar con 422.
- Funciona con teclado, cosa que arrastrar no.

### Menú de acciones por fila

Cada fila tiene ahora un botón `⋮` con **Rename / Move to / Delete**, que actúa solo sobre
esa fila. Es lo que el código original tenía comentado en `FileList.jsx` con un `ActionMenu`
que nunca llegó a usarse.

Para que ambos caminos acaben en la misma operación, `Home` guarda en `actionItems` sobre
qué actúa el diálogo abierto: la barra de herramientas pasa la selección, el menú de la fila
pasa esa fila. Antes rename y delete leían la selección directamente y no había forma de
actuar sobre una fila sin seleccionarla.

La barra de herramientas gana también **Move to**, junto a Rename y Delete.

### Detalles corregidos al verificar

- `.tree-item.is-selected` perdía contra `.tree-item:hover`: `:hover` pesa más que una clase
  a secas, así que la carpeta elegida perdía el fondo del acento al pasar el ratón por
  encima. El estado seleccionado reclama ahora también el caso hover.
- El menú de la fila se quedaba abierto **detrás** del diálogo que acababa de abrir. `Menu`
  cierra ahora al elegir un item (`closeOnSelect`, activado por defecto).
- El click del menú se detiene en su celda: la fila entera alterna la selección al pulsarla,
  y abrir el menú no debe marcarla.

### Verificación

`__probe__` (carpeta desechable creada para la prueba) movida a `cvs` desde el menú de la
fila: desaparece de la raíz, `directory_tree` la devuelve con `parent_id: 1`. Con dos items
seleccionados —uno de ellos la carpeta `cvs`— el diálogo la ofrece deshabilitada y deja
`Move here` bloqueado sobre `Home`, que es donde ya están. Los datos de prueba se borraron.

> **Nota:** durante la verificación de la pasada anterior, dos PDF de la raíz acabaron
> dentro de `cvs` por los eventos de arrastre que disparé en el navegador. Se devolvieron a
> la raíz y el estado quedó como estaba.

## 10. Pendiente (no tocado)

- La subida no trocea archivos grandes; sigue siendo un único `multipart`.
- No hay endpoint de descarga ni de previsualización, así que un archivo se lista pero no se
  abre.
- Un árbol de carpetas permanente en la barra lateral, que sirva además de destino de arrastre.
- Los campos `items` y `size` de `directory` se guardan a 0 y nadie los recalcula.
