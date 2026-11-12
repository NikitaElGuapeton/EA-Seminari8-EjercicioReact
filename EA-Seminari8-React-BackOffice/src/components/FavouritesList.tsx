import { useStore } from '@nanostores/react';
import { Link } from 'react-router-dom';

import { useApiList } from '../hooks/useApiList';
import { bookService } from '../services/book.service';
import { favouriteIds } from '../stores/favourites';
import { formatPrice } from '../utils/format';
import { FavouriteButton } from './FavouriteButton';

// Muestra solo los libros marcados como favoritos
export function FavouritesList() {
  const ids = useStore(favouriteIds);
  const { items: books, loading, error } = useApiList(bookService.getBooks);

  // Pido los libros a la API y me quedo solo con los que están en la lista de favoritos.
  // Así siempre veo los datos actuales (si un libro se edita, aquí se nota)
  const favourites = books.filter((book) => ids.includes(book._id));

  return (
    <>
      <div className="page-header">
        <h1>Favoritos</h1>
      </div>

      {error && <p className="alert">{error}</p>}
      {loading && <p className="muted">Cargando...</p>}

      {!loading && !error && favourites.length === 0 && (
        <p className="muted">
          Todavía no tienes libros favoritos. Márcalos con ☆ desde el{' '}
          <Link to="/books">listado de libros</Link>.
        </p>
      )}

      {favourites.length > 0 && (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Título</th>
              <th>Autores</th>
              <th>Precio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {favourites.map((book) => (
              <tr key={book._id}>
                <td>
                  <img
                    className="cover"
                    src={`https://picsum.photos/seed/${book._id}/60/80`}
                    alt={`Portada de ${book.title}`}
                  />
                </td>
                <td>{book.title}</td>
                <td>
                  {book.authors.length > 0 ? (
                    book.authors.map((author) => author.name).join(', ')
                  ) : (
                    <span className="muted">Sin autores</span>
                  )}
                </td>
                <td>{formatPrice(book.price)}</td>
                <td className="actions">
                  <FavouriteButton bookId={book._id} title={book.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}