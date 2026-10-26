import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Wrench, Battery, Cpu, Monitor, Wifi, Volume2, Camera, Download } from 'lucide-react';
import ConditionBadge from '../common/ConditionBadge';
import ProductImage from '../common/ProductImage';

export default function DigitalPassportModal({ product, passport, onClose }) {
  if (!product) return null;

  const data = passport || product.digitalPassportId || {};
  const score = data.diagnosticSummaryScore || (product.conditionGrade === 'Pristine' ? 98 : 94);
  const batteryPercent = data.subsystemChecks?.battery?.healthPercent || product.specifications?.batteryHealthPercent || 94;
  const serial = data.deviceSerialNumber || `RLP-${product.slug?.substring(0, 6)?.toUpperCase() || 'REFURB'}-2026`;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(16, 42, 69, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px', overflow: 'hidden' }}>
          {/* Header */}
          <div className="modal-header bg-dark text-white border-0 py-3 px-4" style={{ backgroundColor: 'var(--reloop-navy)' }}>
            <div className="d-flex align-items-center gap-2">
              <ShieldCheck size={22} className="text-success" />
              <div>
                <span className="badge bg-success-subtle text-success text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                  RELOOP Verified Record
                </span>
                <h5 className="modal-title mb-0 text-white fw-bold" style={{ fontSize: '1.2rem' }}>
                  Digital Product Passport
                </h5>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm text-white-50 p-1 border-0"
              onClick={onClose}
              title="Close Passport"
            >
              <X size={22} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4" style={{ backgroundColor: 'var(--reloop-bg)' }}>
            {/* Top Device Banner Card */}
            <div className="reloop-card p-3 mb-4 bg-white">
              <div className="row align-items-center g-3">
                <div className="col-auto">
                  <div
                    className="border rounded p-1 bg-light d-flex align-items-center justify-content-center"
                    style={{ width: '90px', height: '90px' }}
                  >
                    <ProductImage
                      src={product.primaryImage || (product.images && product.images[0])}
                      alt={product.title}
                      slug={product.slug}
                      category={product.category}
                      productTitle={product.title}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                </div>

                <div className="col">
                  <h5 className="fw-bold text-dark mb-1">{product.title}</h5>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <ConditionBadge grade={product.conditionGrade} />
                    <span className="text-muted small">·</span>
                    <span className="text-muted small">Serial: {serial}</span>
                    <span className="text-muted small">·</span>
                    <span className="text-muted small">Warranty: {product.warrantyMonths || 12} Months</span>
                  </div>
                  <p className="text-muted small mb-0">{product.conditionSummary}</p>
                </div>

                <div className="col-auto text-center ps-md-4 border-start">
                  <div className="fw-bold text-success display-6 tabular-nums" style={{ lineHeight: 1 }}>
                    {score}
                  </div>
                  <span className="text-muted small fw-semibold">/ 100 Score</span>
                  <div className="badge bg-success text-white d-block mt-1" style={{ fontSize: '0.7rem' }}>
                    Certified Pass
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Diagnostic Cards */}
            <div className="row g-3 mb-4">
              {/* Card 1: Hardware Functionality */}
              <div className="col-md-4">
                <div className="reloop-card p-3 h-100 bg-white">
                  <div className="d-flex align-items-center gap-2 mb-3 text-dark fw-bold small text-uppercase">
                    <Cpu size={16} className="text-success" />
                    <span>Hardware Function</span>
                  </div>
                  <ul className="list-unstyled mb-0 small">
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Display & Touch:</span>
                      <span className="fw-semibold text-success">PASS</span>
                    </li>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Logic Board & CPU:</span>
                      <span className="fw-semibold text-success">PASS</span>
                    </li>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Keyboard / Sensors:</span>
                      <span className="fw-semibold text-success">PASS</span>
                    </li>
                    <li className="d-flex justify-content-between py-1">
                      <span className="text-muted">I/O Ports & Charge:</span>
                      <span className="fw-semibold text-success">PASS</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card 2: Battery or Power Delivery */}
              <div className="col-md-4">
                <div className="reloop-card p-3 h-100 bg-white">
                  {['Smartphones', 'Laptops', 'Tablets', 'Wearables', 'Audio'].includes(product.category) ? (
                    <>
                      <div className="d-flex align-items-center gap-2 mb-3 text-dark fw-bold small text-uppercase">
                        <Battery size={16} className="text-success" />
                        <span>Battery & Health</span>
                      </div>
                      <div className="text-center py-2">
                        <div className="h3 fw-bold text-success mb-1">{batteryPercent}%</div>
                        <span className="text-muted small">Original Battery Health</span>
                        <div className="progress mt-2" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${batteryPercent}%` }}
                            aria-valuenow={batteryPercent}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-between small text-muted mt-2 border-top pt-2">
                        <span>Cycle Count:</span>
                        <span className="fw-semibold text-dark">{data.subsystemChecks?.battery?.cycleCount || 110}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="d-flex align-items-center gap-2 mb-3 text-dark fw-bold small text-uppercase">
                        <Cpu size={16} className="text-success" />
                        <span>Power & Thermals</span>
                      </div>
                      <div className="text-center py-2">
                        <div className="h4 fw-bold text-success mb-1">Mains Powered</div>
                        <span className="text-muted small">Continuous Load Stability</span>
                        <div className="progress mt-2" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: '100%' }}
                            aria-valuenow={100}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-between small text-muted mt-2 border-top pt-2">
                        <span>Voltage Delivery:</span>
                        <span className="fw-semibold text-dark">Stable (Pass)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Card 3: Cosmetic Condition */}
              <div className="col-md-4">
                <div className="reloop-card p-3 h-100 bg-white">
                  <div className="d-flex align-items-center gap-2 mb-3 text-dark fw-bold small text-uppercase">
                    <Monitor size={16} className="text-success" />
                    <span>Cosmetic Tier</span>
                  </div>
                  <ul className="list-unstyled mb-0 small">
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Chassis:</span>
                      <span className="fw-semibold text-dark">
                        {data.subsystemChecks?.chassis?.status || 'Flawless'}
                      </span>
                    </li>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Screen Marks:</span>
                      <span className="fw-semibold text-dark">None Reported</span>
                    </li>
                    <li className="d-flex justify-content-between py-1">
                      <span className="text-muted">Thermal State:</span>
                      <span className="fw-semibold text-success">Optimal</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Refurbishment Ledger / Device History */}
            <div className="reloop-card p-3 mb-3 bg-white">
              <div className="d-flex align-items-center gap-2 mb-3 text-dark fw-bold small text-uppercase">
                <Wrench size={16} className="text-success" />
                <span>Refurbishment & Verification Ledger</span>
              </div>

              <div className="border-start border-2 border-success ps-3 ms-2">
                <div className="mb-3 position-relative">
                  <div className="fw-semibold small text-dark">50-Point Diagnostic Protocol Complete</div>
                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                    Certified by RELOOP Hardware Lab 4.2 · All sensory, audio, power, and display sub-assemblies passed.
                  </div>
                </div>

                {data.partsReplaced && data.partsReplaced.length > 0 ? (
                  data.partsReplaced.map((part, idx) => (
                    <div key={idx} className="mb-3 position-relative">
                      <div className="fw-semibold small text-success">
                        Component Replaced: {part.partName} ({part.replacementType})
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                        Replaced using certified OEM specification components.
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="mb-2 position-relative">
                    <div className="fw-semibold small text-dark">100% Original OEM Factory Components</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                      No third-party component replacements needed. Deep sanitized and acoustically tuned.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ethical Transparency & Demonstration Disclosure */}
            <div className="p-3 rounded bg-light border text-muted small" style={{ fontSize: '0.78rem' }}>
              <strong>Demonstration Disclosure:</strong> Diagnostic scores, battery health telemetry, and carbon offset calculations in this educational platform represent illustrative engineering benchmarks and simulated quality inspections. Device serial numbers are anonymized to protect customer privacy.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-white border-top py-2 px-4 d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-sm btn-reloop-outline"
              onClick={() => {
                alert(`Inspection Report PDF for ${product.title} (Serial: ${serial}) downloaded.`);
              }}
            >
              <Download size={14} /> Download Certificate (PDF)
            </button>
            <button type="button" className="btn btn-sm btn-reloop-navy" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
