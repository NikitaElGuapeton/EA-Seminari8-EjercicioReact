import { useStore } from '@nanostores/react';
import { Link, NavLink } from 'react-router-dom';

import { favouriteIds } from '../stores/favourites';

export function Navbar() {
  const favourites = useStore(favouriteIds);

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        Backoffice
      </Link>

      {/* NavLink le pone la clase "active" al enlace de la página en la que estoy */}
      <nav>
        <NavLink to="/authors">Autores</NavLink>
        <NavLink to="/books">Libros</NavLink>
        <NavLink to="/favourites">Favoritos ({favourites.length})</NavLink>
      </nav>
    </header>
  );
}