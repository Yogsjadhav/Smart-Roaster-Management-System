import React from 'react';
import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  const buttonClass = type === 'danger' ? 'btn-danger' : 'btn-primary';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="py-4">
        <p className="text-gray-700">{message}</p>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button onClick={onClose} className="btn-secondary">
          {cancelText}
        </button>
        <button onClick={onConfirm} className={buttonClass}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
