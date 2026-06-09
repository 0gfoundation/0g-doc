import React, { useEffect } from 'react';

interface RemoveNewtonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RemoveNewtonModal: React.FC<RemoveNewtonModalProps> = ({ isOpen, onClose }) => {

  // Effect to prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]); // Rerun effect when isOpen changes

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Modal Header */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Remove Old Testnet</h2>
          <button onClick={onClose} style={styles.closeButton}>&times;</button> {/* Close icon */}
        </div>

        {/* Modal Body */}
        <div style={styles.modalBody}>
          <p>
            The old Testnet versions are no longer active. 
            Please remove it from your MetaMask network list before adding the current <strong>0G Galileo Testnet</strong> to avoid potential conflicts.
          </p>
          <ol>
            <li>Open MetaMask and click the network dropdown menu at the top.</li>
            {/* TODO: Add image showing network dropdown */}
            
            <li>Select any network <em>other</em> than <strong>0G-Testnet</strong>.</li>
            {/* TODO: Add image showing switching network */}
            <img src="/img/step 1.png" alt="MetaMask network dropdown" style={styles.image} />

            <li>Open the network dropdown menu again.</li>
            
            <li>Find <strong>0G-Testnet</strong> in the list and click the three vertical dots icon next to it.</li>
             {/* TODO: Add image showing the three dots menu */}
             <img src="/img/step 2.png" alt="Switching network" style={styles.image} />

            <li>Select the <strong>Delete</strong> option from the menu.</li>
             {/* TODO: Add image showing the delete option */}
             <img src="/img/step 3.png" alt="Three dots menu for network" style={styles.image} />

            <li>Confirm the deletion when prompted by MetaMask.</li>
            
            <li>Once removed, you can close this message and click the "Add 0G Testnet" button again.</li>
          </ol>
          {/* Removed general image placeholder */}
        </div>
        
        {/* Modal Footer (optional, but good for button placement) */}
        <div style={styles.modalFooter}>
            <button onClick={onClose} style={styles.button}>
              Got it, Close
            </button>
        </div>
      </div>
    </div>
  );
};

// Basic styling (consider moving to a CSS file or using a UI library)
const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    maxWidth: '550px',
    width: '90%',
    maxHeight: '85vh',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    color: '#333',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 25px',
    borderBottom: '1px solid #eee',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.75rem',
    color: '#aaa',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0 5px',
  },
  modalBody: {
    padding: '20px 25px',
    overflowY: 'auto',
    flexGrow: 1,
  },
  modalFooter: {
    padding: '15px 25px',
    borderTop: '1px solid #eee',
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#E2761B',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '15px',
  },
  image: {
    maxWidth: '100%',
    marginTop: '15px',
    marginBottom: '10px',
    border: '1px solid #eee',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: '4px',
  },
};

export default RemoveNewtonModal; 