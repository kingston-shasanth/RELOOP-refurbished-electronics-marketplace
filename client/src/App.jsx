import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import { ToastProvider } from './context/ToastContext';

// Customer layout & pages
import CustomerLayout from './components/common/CustomerLayout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import TradeInPage from './pages/TradeInPage';
import ComparePage from './pages/ComparePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminTradeInsPage from './pages/admin/AdminTradeInsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';

// 404 Fallback
function NotFoundPage() {
  return (
    <div className="container py-5 text-center my-5">
      <div className="reloop-card p-5 mx-auto" style={{ maxWidth: '540px' }}>
        <h1 className="display-4 fw-bold text-dark mb-2">404</h1>
        <h4 className="fw-semibold text-muted mb-3">Page Not Found</h4>
        <p className="text-secondary mb-4">
          The refurbished device, category or administrative page you were looking for does not exist or has been moved.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Link to="/" className="btn btn-reloop-primary">
            Back to Homepage
          </Link>
          <Link to="/products" className="btn btn-reloop-outline">
            Browse All Devices
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <ToastProvider>
                <Routes>
                {/* Customer Storefront Routes */}
                <Route
                  path="/"
                  element={
                    <CustomerLayout>
                      <HomePage />
                    </CustomerLayout>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <CustomerLayout>
                      <ProductsPage />
                    </CustomerLayout>
                  }
                />
                <Route
                  path="/products/:id"
                  element={
                    <CustomerLayout>
                      <ProductDetailPage />
                    </CustomerLayout>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <CustomerLayout>
                      <CartPage />
                    </CustomerLayout>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <CustomerLayout>
                      <CheckoutPage />
                    </CustomerLayout>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <CustomerLayout>
                      <AccountPage />
                    </CustomerLayout>
                  }
                />
                <Route
                  path="/orders"
                  element={<Navigate to="/account" replace />}
                />
                <Route
                  path="/trade-in"
                  element={
                    <CustomerLayout>
                      <TradeInPage />
                    </CustomerLayout>
                  }
                />
                <Route
                  path="/compare"
                  element={
                    <CustomerLayout>
                      <ComparePage />
                    </CustomerLayout>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <CustomerLayout>
                      <LoginPage />
                    </CustomerLayout>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <CustomerLayout>
                      <RegisterPage />
                    </CustomerLayout>
                  }
                />

                {/* Admin Management Routes */}
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/products" element={<AdminProductsPage />} />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
                <Route path="/admin/trade-ins" element={<AdminTradeInsPage />} />
                <Route path="/admin/customers" element={<AdminCustomersPage />} />

                {/* 404 Catch-All */}
                <Route
                  path="*"
                  element={
                    <CustomerLayout>
                      <NotFoundPage />
                    </CustomerLayout>
                  }
                />
              </Routes>
            </ToastProvider>
          </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
