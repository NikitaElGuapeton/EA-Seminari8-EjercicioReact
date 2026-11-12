import { useStore } from '@nanostores/react';

import { favouriteIds, toggleFavourite } from '../stores/favourites';

interface FavouriteButtonProps {
  bookId: string;
  title: string;
}

// Estrella que marca y desmarca un libro como favorito
export function FavouriteButton({ bookId, title }: FavouriteButtonProps) {
  // useStore "se suscribe" al atom: si cambia, este componente se repinta solo
  const ids = useStore(favouriteIds);
  const isFavourite = ids.includes(bookId);
  const label = isFavourite
    ? `Quitar "${title}" de favoritos`
    : `Añadir "${title}" a favoritos`;

  return (
    <button
      type="button"
      className="favourite"
      aria-pressed={isFavourite}
      aria-label={label}
      title={label}
      onClick={() => toggleFavourite(bookId)}
    >
      {isFavourite ? '★' : '☆'}
    </button>
  );
}