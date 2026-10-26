import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, RefreshCw, ShieldCheck } from 'lucide-react';
import ConditionBadge from '../common/ConditionBadge';
import ProductImage from '../common/ProductImage';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { useToast } from '../../context/ToastContext';

export default function ProductCard({ product, showCompare = true }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { showToast } = useToast();

  if (!product) return null;

  const isFavorited = isInWishlist(product._id);
  const isCompared = isInCompare(product._id);

  // Dynamic mathematically accurate discount %
  const original = Number(product.originalRetailPrice || product.refurbishedPrice || 0);
  const current = Number(product.refurbishedPrice || 0);
  const discountPercent = original > current ? Math.round(((original - current) / original) * 100) : 0;

  // Build clean spec summary
  const specItems = [];
  if (product.specifications?.processor && product.specifications.processor !== 'N/A') {
    specItems.push(product.specifications.processor);
  }
  if (product.specifications?.ram && product.specifications.ram !== 'N/A') {
    specItems.push(product.specifications.ram);
  }
  if (product.specifications?.storage && product.specifications.storage !== 'N/A') {
    specItems.push(product.specifications.storage);
  }
  const specSummary = specItems.length > 0 ? specItems.join(' · ') : product.subcategory || product.category;

  const displayImage = product.primaryImage || (product.images && product.images[0]);

  return (
    <div className="reloop-card reloop-card-hover h-100 d-flex flex-column position-relative p-3">
      {/* Top Badges & Actions Row */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <ConditionBadge grade={product.conditionGrade} />

        <div className="d-flex align-items-center gap-1">
          {showCompare && (
            <button
              type="button"
              className={`btn btn-sm p-1 rounded-circle border-0 ${isCompared ? 'text-success bg-light' : 'text-muted'}`}
              onClick={(e) => {
                e.preventDefault();
                if (isCompared) {
                  removeFromCompare(product._id);
                  showToast('Removed from compare tray', 'info');
                } else {
                  addToCompare(product);
                  showToast('Added to compare tray', 'info');
                }
              }}
              title={isCompared ? 'Remove from compare' : 'Add to compare'}
              aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
            >
              <RefreshCw size={15} />
            </button>
          )}

          <button
            type="button"
            className={`btn btn-sm p-1 rounded-circle border-0 ${isFavorited ? 'text-danger' : 'text-muted'}`}
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
              showToast(isFavorited ? 'Removed from wishlist' : 'Added to wishlist', 'info');
            }}
            title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Product Image Stage */}
      <Link
        to={`/products/${product.slug || product._id}`}
        className="product-image-container my-2 text-decoration-none"
        title={product.title}
      >
        <ProductImage
          src={displayImage}
          alt={product.title}
          slug={product.slug}
          category={product.category}
          productTitle={product.title}
        />
      </Link>

      {/* Product Information */}
      <div className="flex-grow-1 mt-1 d-flex flex-column">
        <div className="d-flex align-items-center gap-1 mb-1 text-muted small" style={{ fontSize: '0.78rem' }}>
          <span className="text-uppercase fw-semibold">{product.brand}</span>
          <span>·</span>
          <span className="text-truncate">{product.category}</span>
        </div>

        <Link
          to={`/products/${product.slug || product._id}`}
          className="text-decoration-none text-dark"
        >
          <h6
            className="mb-1 line-clamp-2"
            style={{
              fontSize: '0.94rem',
              fontWeight: 700,
              minHeight: '2.5rem',
              lineHeight: 1.35,
              color: '#151B26',
            }}
          >
            {product.title}
          </h6>
        </Link>

        <p className="text-muted small mb-2 text-truncate" style={{ fontSize: '0.8rem' }} title={specSummary}>
          {specSummary}
        </p>

        {/* Quality Diagnostics Badge & Optional Battery Health */}
        <div className="d-flex align-items-center justify-content-between mb-2 text-muted small" style={{ fontSize: '0.78rem' }}>
          <span className="d-flex align-items-center gap-1">
            <ShieldCheck size={14} className="text-success" />
            <span>50-Point Lab Check</span>
          </span>
          {product.specifications?.batteryHealthPercent && (
            <span className="badge bg-success-subtle text-success tabular-nums fw-bold" style={{ fontSize: '0.68rem' }}>
              ⚡ {product.specifications.batteryHealthPercent}% Health
            </span>
          )}
        </div>
      </div>

      {/* Pricing & Add to Cart Action Row */}
      <div className="pt-2 border-top mt-auto">
        <div className="d-flex align-items-baseline gap-2 mb-2">
          <span className="fw-bold tabular-nums" style={{ fontSize: '1.25rem', color: '#0B1220' }}>
            ₹{current.toLocaleString('en-IN')}
          </span>
          {original > current && (
            <span className="text-muted text-decoration-line-through small tabular-nums" style={{ fontSize: '0.82rem' }}>
              ₹{original.toLocaleString('en-IN')}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="reloop-badge-discount ms-auto tabular-nums">
              SAVE {discountPercent}%
            </span>
          )}
        </div>

        <div className="d-grid gap-2">
          <button
            type="button"
            className="btn btn-reloop-primary btn-sm py-2"
            onClick={() => {
              addToCart(product, 1);
              showToast(`Added ${product.title} to cart`, 'success');
            }}
            disabled={product.stockCount <= 0}
          >
            <ShoppingBag size={15} />
            {product.stockCount > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
