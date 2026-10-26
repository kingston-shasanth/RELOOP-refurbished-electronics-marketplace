import React from 'react';
import Navbar from './Navbar';
import CategoryBar from './CategoryBar';
import Footer from './Footer';
import CompareTray from '../compare/CompareTray';

export default function CustomerLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--reloop-bg)' }}>
      <Navbar />
      <CategoryBar />
      <main className="flex-grow-1">
        {children}
      </main>
      <CompareTray />
      <Footer />
    </div>
  );
}
