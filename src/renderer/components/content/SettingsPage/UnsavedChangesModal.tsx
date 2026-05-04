import React from 'react';

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({ open, onSave, onDiscard, onCancel }) => {
    if (!open) return null;

    return (
        <div className="modal-backdrop flex-center">
            <div className="modal">
                <div className="modal-header">
                    <div className="modal-icon flex-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2.5L13.5 12.5H2.5L8 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
                            <line x1="8" y1="6.5" x2="8" y2="9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            <circle cx="8" cy="11" r="0.7" fill="currentColor" />
                        </svg>
                    </div>
                    <div>
                        <p className="modal-title">Unsaved changes</p>
                        <p className="modal-desc">You have changes in your settings that haven't been saved yet.</p>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn btn-save" onClick={onSave}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7.5L5.5 11L12 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Save changes
                    </button>
                    <button className="btn btn-discard" onClick={onDiscard}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Discard changes
                    </button>
                    <button className="btn btn-cancel" onClick={onCancel}>
                        Cancel — keep editing
                    </button>
                </div>
            </div>
        </div>
    );
};

interface UnsavedChangesModalProps {
    open: boolean,
    onSave: () => void,
    onDiscard: () => void,
    onCancel: () => void,
}

export default UnsavedChangesModal;
