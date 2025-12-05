export type ModalSize = 'small' | 'medium' | 'large' | 'auto';

export interface ModalButtonConfig {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  action?: () => void;
  type?: 'submit' | 'button';
  disabled?: boolean;
}

export interface ModalConfig {
  title?: string;
  subtitle?: string;
  icon?: 'info' | 'success' | 'warning' | 'error' | 'custom';
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  size?: ModalSize;
  ariaLabel?: string;
  footerButtons?: ModalButtonConfig[];
}
