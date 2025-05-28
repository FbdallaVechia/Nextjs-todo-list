'use client';

import React from 'react';

const Header = ({ onClear }) => {
  return (
    <header>
      <nav className="navbar navbar-expand-sm navbar-light bg-light border-bottom px-4">
        <div className="container-sm">
          <img src="/img/icon.png" alt="Check" width="30" height="30" className="me-2" />
          <span className="fw-bold fs-5">To do List</span>

          <div className="d-flex align-items-center">
            <button className="btn btn-light me-2" onClick={onClear}>Limpar</button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
