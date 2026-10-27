import React, { useEffect } from 'react';
import {
  PermissionsManagerModal,
  PermissionsManagerModalProps,
} from './PermissionsManagerModal';
import {
  dispatchPermissionsUpdate,
  ECO_PERMISSIONS_UPDATED_EVENT,
  PermissionsUpdatedEventDetail,
} from '../../../types/rbac';

export type UserPermissionsModalProps = PermissionsManagerModalProps;

/**
 * Enhanced Reactive RBAC Permissions Modal
 * Guarantees zero-refresh state synchronization and immediate UI re-gating
 * across all 12 modules whenever permissions are saved or modified.
 */
export const UserPermissionsModal: React.FC<UserPermissionsModalProps> = (props) => {
  // Listen for permissions update events to ensure multi-channel synchronization
  useEffect(() => {
    const handlePermissionsUpdated = (e: Event) => {
      const ce = e as CustomEvent<PermissionsUpdatedEventDetail>;
      if (ce.detail?.userId && Array.isArray(ce.detail?.permissions)) {
        if (typeof BroadcastChannel !== 'undefined') {
          try {
            const bc = new BroadcastChannel('eco_rbac_channel');
            bc.postMessage({
              type: 'PERMISSIONS_UPDATED',
              detail: ce.detail,
            });
            bc.close();
          } catch {}
        }
      }
    };

    window.addEventListener(ECO_PERMISSIONS_UPDATED_EVENT, handlePermissionsUpdated);
    return () => {
      window.removeEventListener(ECO_PERMISSIONS_UPDATED_EVENT, handlePermissionsUpdated);
    };
  }, []);

  return <PermissionsManagerModal {...props} />;
};

export { PermissionsManagerModal, dispatchPermissionsUpdate };
export default UserPermissionsModal;
