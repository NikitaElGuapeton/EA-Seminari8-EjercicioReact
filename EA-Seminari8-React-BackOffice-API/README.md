## Video: 

https://drive.google.com/file/d/1obFlBU-cxMrpqz3CsLKsHJyz7x1E14mQ/view?usp=drive_link



## Uso de la IA

Claude (claude.ai).

### prompt 1

> Tengo un proyecto de libros con un backend y un frontend en React. En el frontend quiero añadir un apartado de favoritos para marcar libros. Lo primero que no tengo claro es cómo guardar cuáles son los favoritos y cómo leerlos después. Tengo que mandarlos al servidor?

**Respuesta:** que no hace falta mandarlos al servidor. La API no tiene ningún campo ni endpoint de favoritos, y el ejercicio pide compartir el estado entre componentes con Nanostores. Así que los favoritos viven en el navegador. Me propuso crear `src/stores/favourites.ts` con un `atom` (una caja global fuera de los componentes) y explicó cada parte:

```ts
import { atom } from 'nanostores';

const STORAGE_KEY = 'favourite-books';

// lee lo guardado la última vez (o empieza vacío)
function loadIds(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved)
      ? saved.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

export const favouriteIds = atom<string[]>(loadIds());

// cada vez que cambia la lista, la guardo en el navegador
favouriteIds.listen((ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // si no se puede guardar, la app sigue funcionando
  }
});

// si ya es favorito lo quita; si no, lo añade
export function toggleFavourite(id: string) {
  const current = favouriteIds.get();
  favouriteIds.set(
    current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
  );
}
```

`toggleFavourite` crea siempre un array nuevo en vez de modificar el anterior, porque Nanostores solo avisa del cambio si el valor es otro objeto. El `localStorage` se copia del patrón que ya usa `viewMode.ts`, para que los favoritos no se pierdan al recargar.

### prompt 2

> Cómo añado un botón de favorito en cada libro del listado?

**Respuesta:** crear un componente `FavouriteButton` que recibe el id y el título del libro, lee el atom con `useStore` y llama a `toggleFavourite` al hacer clic:

```tsx
export function FavouriteButton({ bookId, title }: FavouriteButtonProps) {
  const ids = useStore(favouriteIds);
  const isFavourite = ids.includes(bookId);
  // ...
  return (
    <button type="button" className="favourite" aria-pressed={isFavourite}
      onClick={() => toggleFavourite(bookId)}>
      {isFavourite ? '★' : '☆'}
    </button>
  );
}
```

Luego se pone en `BooksList.tsx`, dentro de la columna de acciones de la tabla y de las tarjetas. Así no hay que tocar el `colSpan`. Para el color de la estrella se añaden unas reglas en `index.css` que usan `aria-pressed`.
No se usa un `useState` para saber si es favorito. Se calcula mirando si el id está en la lista global, y así no se puede desincronizar.

### prompt 3

> En el atom de favoritos, es mejor guardar solo el id del libro o el libro entero?

**Respuesta:** guardar solo el id es lo más limpio y no se queda desactualizado, pero hay que pedir los libros a la API para pintar la lista. Guardar el libro entero evita esa petición, pero la copia se queda vieja si el libro se edita después.

**Decisión:** guardo solo los ids. En este proyecto sí se pueden editar y borrar libros, así que una copia guardada acabaría mostrando datos antiguos o libros que ya no existen.

### prompt 4

> Cómo hago la pantalla que muestra solo los favoritos y cómo llego a ella?

**Respuesta:** crear `FavouritesList.tsx`, que pide todos los libros con `useApiList(bookService.getBooks)` y se queda con los que están en el atom:

```tsx
const ids = useStore(favouriteIds);
const { items: books, loading, error } = useApiList(bookService.getBooks);
const favourites = books.filter((book) => ids.includes(book._id));
```

Después hay que añadir la ruta `/favourites` en `App.tsx` y un enlace en `Navbar.tsx`. En la barra puse un contador con `favourites.length`, que sirve para comprobar que el estado se comparte de verdad entre componentes. Si desmarco un libro desde esta pantalla, desaparece solo, porque la lista se recalcula cuando cambia el atom.

### prompt 5

> Qué pasa con los favoritos si edito o borro un libro?

**Respuesta:** si edito un libro, la lista de favoritos ya muestra los datos nuevos, porque se calcula con los libros que devuelve la API. Si borro un libro, su id se queda guardado y el contador saldría mal. La solución fue añadir una función `removeFavourite(id)` al store y llamarla en `confirmDelete` de `BooksList.tsx`, justo después de `removeItem`:

```tsx
await bookService.deleteBook(bookToDelete._id);
removeItem(bookToDelete._id);
removeFavourite(bookToDelete._id);
```