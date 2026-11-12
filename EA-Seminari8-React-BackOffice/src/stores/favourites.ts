import { atom } from 'nanostores';

const STORAGE_KEY = 'favourite-books';

// Lee los favoritos guardados en el navegador. Solo acepto una lista de textos (ids);
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

// Caja global con los ids de los libros favoritos
export const favouriteIds = atom<string[]>(loadIds());

// Cada vez que cambia la lista, la guardo en el navegador
favouriteIds.listen((ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // si no se puede guardar, la app sigue funcionando igual
  }
});

// Si el libro ya es favorito lo quita; si no, lo añade
export function toggleFavourite(id: string) {
  const current = favouriteIds.get();
  favouriteIds.set(
    current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
  );
}

// Quita un libro de favoritos si estaba (se usa cuando se borra el libro)
export function removeFavourite(id: string) {
  const current = favouriteIds.get();
  if (current.includes(id)) {
    favouriteIds.set(current.filter((x) => x !== id));
  }
}