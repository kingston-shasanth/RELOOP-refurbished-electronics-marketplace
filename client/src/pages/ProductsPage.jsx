import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, RotateCcw, ShieldCheck, ChevronRight } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import ProductSkeleton from '../components/common/ProductSkeleton';
import api from '../services/api';

export default function ProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(120000);
  const [sortOption, setSortOption] = useState('featured');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Parse URL query parameters on mount or change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    const catParam = params.get('category') || 'All';
    const gradeParam = params.get('grade') || '';
    const brandParam = params.get('brand') || '';
    const sortParam = params.get('sort') || 'featured';
    const pageParam = parseInt(params.get('page') || '1', 10);

    setSearchQuery(searchParam);
    setSelectedCategory(catParam);
    setSelectedGrade(gradeParam);
    setSelectedBrand(brandParam);
    setSortOption(sortParam);
    setCurrentPage(pageParam);

    fetchProducts({
      search: searchParam,
      category: catParam,
      grade: gradeParam,
      brand: brandParam,
      sort: sortParam,
      page: pageParam,
      maxPrice,
    });
  }, [location.search, maxPrice]);

  const fetchProducts = async (filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category && filters.category !== 'All') queryParams.append('category', filters.category);
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.brand) queryParams.append('brand', filters.brand);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.sort && filters.sort !== 'featured') queryParams.append('sort', filters.sort);
      queryParams.append('page', filters.page || 1);
      queryParams.append('limit', 12);

      const res = await api.get(`/products?${queryParams.toString()}`);
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalCount(res.data.total);
        setTotalPages(res.data.pages);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilterChange = (newParams) => {
    const params = new URLSearchParams(location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== 'All') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set('page', '1');
    navigate(`/products?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setMaxPrice(120000);
    navigate('/products');
  };

  const categories = ['All', 'Smartphones', 'Laptops', 'Tablets', 'Audio', 'Wearables', 'Gaming', 'Cameras', 'PC Components'];
  const brands = ['Apple', 'Samsung', 'Dell', 'Lenovo', 'HP', 'Sony', 'NVIDIA', 'Nintendo', 'Canon', 'Google', 'OnePlus', 'Bose', 'JBL', 'Garmin', 'Valve', 'Fujifilm', 'AMD', 'Corsair', 'ASUS'];
  const conditionGrades = ['Pristine', 'Excellent', 'Good', 'Fair'];

  return (
    <div className="py-4">
      <div className="container-xl">
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb small text-muted">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none text-muted">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/products" className="text-decoration-none text-muted">Products</Link>
            </li>
            {selectedCategory !== 'All' && (
              <li className="breadcrumb-item active fw-semibold" aria-current="page">
                {selectedCategory}
              </li>
            )}
          </ol>
        </nav>

        {/* Page Banner */}
        <div className="reloop-card p-4 mb-4 bg-white border-success-subtle shadow-xs">
          <div className="row align-items-center g-3">
            <div className="col-12 col-md-9">
              <span className="badge bg-success text-white text-uppercase mb-2" style={{ fontSize: '0.7rem' }}>
                RELOOP Certified
              </span>
              <h1 className="h3 fw-bold text-dark mb-1">
                {selectedCategory !== 'All' ? `Refurbished ${selectedCategory}` : 'Refurbished Electronics Catalogue'}
              </h1>
              <p className="text-muted small mb-0">
                Every device passes a documented 50-point diagnostic check before listing. Transparent condition grades, battery metrics, and warranty support.
              </p>
            </div>
            <div className="col-12 col-md-3 text-md-end">
              <div className="d-flex align-items-center justify-content-md-end gap-2 text-success fw-semibold small">
                <ShieldCheck size={18} /> Lab-Verified Tech
              </div>
            </div>
          </div>
        </div>

        {/* Catalog Layout Row */}
        <div className="row g-4">
          {/* Mobile Filter Toggle */}
          <div className="col-12 d-lg-none">
            <button
              type="button"
              className="btn btn-reloop-outline w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={() => setShowMobileFilter(!showMobileFilter)}
            >
              <SlidersHorizontal size={16} /> Filters & Sorting ({totalCount} items)
            </button>
          </div>

          {/* Left Sidebar Filters */}
          <aside className={`col-lg-3 ${showMobileFilter ? 'd-block' : 'd-none d-lg-block'}`}>
            <div className="reloop-card p-4 bg-white sticky-top" style={{ top: '85px', zIndex: 10 }}>
              <div className="d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
                <span className="fw-bold text-dark d-flex align-items-center gap-2">
                  <Filter size={18} className="text-success" /> Filter products
                </span>
                <button
                  type="button"
                  className="btn btn-link text-success small p-0 text-decoration-none fw-semibold d-flex align-items-center gap-1"
                  onClick={handleResetFilters}
                >
                  <RotateCcw size={13} /> Reset
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="fw-bold small text-dark mb-2 d-block">Category</label>
                <div className="d-flex flex-column gap-1">
                  {categories.map((cat, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`btn btn-sm text-start py-1 px-2 border-0 rounded ${
                        selectedCategory === cat ? 'bg-success text-white fw-semibold' : 'text-muted hover-bg-light'
                      }`}
                      style={{ fontSize: '0.85rem' }}
                      onClick={() => applyFilterChange({ category: cat })}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Grade Filter */}
              <div className="mb-4">
                <label className="fw-bold small text-dark mb-2 d-block">Condition Grade</label>
                <div className="d-flex flex-column gap-1">
                  {conditionGrades.map((grade, idx) => (
                    <label key={idx} className="form-check d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.85rem' }}>
                      <input
                        type="radio"
                        name="conditionGrade"
                        className="form-check-input mt-0"
                        checked={selectedGrade === grade}
                        onChange={() => applyFilterChange({ grade })}
                      />
                      <span className="form-check-label text-dark">{grade}</span>
                    </label>
                  ))}
                  {selectedGrade && (
                    <button
                      type="button"
                      className="btn btn-link text-muted small p-0 text-start text-decoration-none"
                      onClick={() => applyFilterChange({ grade: '' })}
                    >
                      Clear grade filter
                    </button>
                  )}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-4">
                <label className="fw-bold small text-dark mb-2 d-block">Brand</label>
                <div className="d-flex flex-column gap-1">
                  {brands.map((brand, idx) => (
                    <label key={idx} className="form-check d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.85rem' }}>
                      <input
                        type="radio"
                        name="brandFilter"
                        className="form-check-input mt-0"
                        checked={selectedBrand === brand}
                        onChange={() => applyFilterChange({ brand })}
                      />
                      <span className="form-check-label text-dark">{brand}</span>
                    </label>
                  ))}
                  {selectedBrand && (
                    <button
                      type="button"
                      className="btn btn-link text-muted small p-0 text-start text-decoration-none"
                      onClick={() => applyFilterChange({ brand: '' })}
                    >
                      Clear brand filter
                    </button>
                  )}
                </div>
              </div>

              {/* Max Price Range Slider */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="fw-bold small text-dark">Max Price</label>
                  <span className="fw-bold text-success small tabular-nums">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="5000"
                  max="120000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
                  <span className="tabular-nums">₹5,000</span>
                  <span className="tabular-nums">₹1,20,000</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Product Grid Column */}
          <main className="col-12 col-lg-9">
            {/* Top Toolbar: Count & Consolidated Sort */}
            <div className="reloop-card p-3 mb-4 bg-white d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
              <div className="text-muted small">
                Showing <strong className="text-dark tabular-nums">{products.length}</strong> of{' '}
                <strong className="text-dark tabular-nums">{totalCount}</strong> verified devices
                {searchQuery && (
                  <span> for "<strong>{searchQuery}</strong>"</span>
                )}
              </div>

              <div className="d-flex align-items-center gap-2">
                <label className="small text-muted text-nowrap">Sort by:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto', minWidth: '180px' }}
                  value={sortOption}
                  onChange={(e) => applyFilterChange({ sort: e.target.value })}
                >
                  <option value="featured">Featured Deals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                {products.map((product) => (
                  <div key={product._id} className="col">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="reloop-empty-state">
                <h5 className="text-dark mb-2">No refurbished devices found</h5>
                <p className="text-muted small mb-4">
                  We couldn't find any products matching your current filters.
                </p>
                <button
                  type="button"
                  className="btn btn-reloop-primary btn-sm px-4"
                  onClick={handleResetFilters}
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
                <button
                  type="button"
                  className="btn btn-reloop-outline btn-sm"
                  disabled={currentPage <= 1}
                  onClick={() => applyFilterChange({ page: currentPage - 1 })}
                >
                  Previous
                </button>
                <span className="small text-muted px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-reloop-outline btn-sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => applyFilterChange({ page: currentPage + 1 })}
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
