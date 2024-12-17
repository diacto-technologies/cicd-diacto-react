import React from 'react';

const Modal = ({ children }) => {
  return (
    <div className="modal">
      <div className="modal-overlay"></div>
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
};

export default Modal;
