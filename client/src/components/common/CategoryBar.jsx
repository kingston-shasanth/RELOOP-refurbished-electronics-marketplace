import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRightLeft } from 'lucide-react';

export default function CategoryBar() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get('category');
  const isFeatured = searchParams.get('featured') === 'true';

  const categories = [
    { name: 'All Categories', path: '/products', key: 'all' },
    { name: 'Smartphones', path: '/products?category=Smartphones', key: 'Smartphones' },
    { name: 'Laptops', path: '/products?category=Laptops', key: 'Laptops' },
    { name: 'Tablets', path: '/products?category=Tablets', key: 'Tablets' },
    { name: 'Audio', path: '/products?category=Audio', key: 'Audio' },
    { name: 'Wearables', path: '/products?category=Wearables', key: 'Wearables' },
    { name: 'Gaming', path: '/products?category=Gaming', key: 'Gaming' },
    { name: 'Cameras', path: '/products?category=Cameras', key: 'Cameras' },
    { name: 'PC Components', path: '/products?category=PC%20Components', key: 'PC Components' },
  ];

  const isCatActive = (cat) => {
    if (location.pathname !== '/products') return false;
    if (cat.key === 'all') {
      return !currentCategory && !isFeatured && !searchParams.get('search');
    }
    return currentCategory === cat.key;
  };

  return (
    <nav className="reloop-catbar shadow-sm">
      <div className="container-xl d-flex align-items-center justify-content-between overflow-x-auto py-1">
        <div className="d-flex align-items-center gap-1 flex-nowrap">
          {categories.map((cat, idx) => (
            <NavLink
              key={idx}
              to={cat.path}
              className={`text-nowrap rounded ${isCatActive(cat) ? 'active' : ''}`}
            >
              {cat.name}
            </NavLink>
          ))}
        </div>

        <div className="d-none d-lg-flex align-items-center gap-2 flex-nowrap ps-3 border-start border-secondary">
          <NavLink
            to="/trade-in"
            className="text-nowrap d-flex align-items-center gap-1 text-warning fw-semibold rounded"
          >
            <ArrowRightLeft size={15} /> Trade-In
          </NavLink>
          <NavLink
            to="/products?featured=true"
            className="text-nowrap d-flex align-items-center gap-1 text-info fw-semibold rounded"
          >
            <Sparkles size={15} /> Deals
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
