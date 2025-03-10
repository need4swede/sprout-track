import React, { useEffect } from 'react';
import { X, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/src/lib/utils';
import { sideNavStyles, triggerButtonVariants } from './side-nav.styles';
import { SideNavProps, SideNavTriggerProps, SideNavItemProps } from './side-nav.types';

/**
 * SideNavTrigger component
 * 
 * A button that toggles the side navigation menu
 */
export const SideNavTrigger: React.FC<SideNavTriggerProps> = ({
  onClick,
  isOpen,
  className,
  children,
}) => {
  return (
    <div 
      onClick={onClick}
      className={cn(triggerButtonVariants({ isOpen }), className)}
    >
      {children}
    </div>
  );
};

/**
 * SideNavItem component
 * 
 * An individual navigation item in the side navigation menu
 */
export const SideNavItem: React.FC<SideNavItemProps> = ({
  path,
  label,
  icon,
  isActive,
  onClick,
  className,
}) => {
  return (
    <button
      className={cn(
        sideNavStyles.navItem,
        isActive && sideNavStyles.navItemActive,
        className
      )}
      onClick={() => onClick(path)}
    >
      {icon && <span className={sideNavStyles.navItemIcon}>{icon}</span>}
      <span className={sideNavStyles.navItemLabel}>{label}</span>
    </button>
  );
};

/**
 * SideNav component
 * 
 * A responsive side navigation menu that slides in from the left
 */
export const SideNav: React.FC<SideNavProps> = ({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
  onSettingsClick,
  onLogout,
  isAdmin,
  className,
}) => {
  // Close the side nav when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Prevent scrolling when side nav is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          sideNavStyles.overlay,
          isOpen ? sideNavStyles.overlayOpen : sideNavStyles.overlayClosed
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Navigation Panel */}
      <div
        className={cn(
          sideNavStyles.container,
          isOpen ? sideNavStyles.containerOpen : sideNavStyles.containerClosed,
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className={sideNavStyles.header}>
          <div className={sideNavStyles.logoContainer}>
            <Image
              src="/acorn-128.png"
              alt="Acorn Logo"
              width={40}
              height={40}
              className={sideNavStyles.logo}
              priority
            />
            <span className={sideNavStyles.appName}>Baby Tracker</span>
          </div>
          <button
            onClick={onClose}
            className={sideNavStyles.closeButton}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className={sideNavStyles.navItems}>
          <SideNavItem
            path="/log-entry"
            label="Log Entry"
            isActive={currentPath === '/log-entry'}
            onClick={onNavigate}
          />
          <SideNavItem
            path="/full-log"
            label="Full Log"
            isActive={currentPath === '/full-log'}
            onClick={onNavigate}
          />
        </nav>

        {/* Footer with Settings and Logout */}
        <div className={sideNavStyles.footer}>
          {isAdmin && (
            <button
              className={sideNavStyles.settingsButton}
              onClick={onSettingsClick}
            >
              <Settings className={sideNavStyles.settingsIcon} />
              <span className={sideNavStyles.settingsLabel}>Settings</span>
            </button>
          )}
          <button
            className={sideNavStyles.settingsButton}
            onClick={onLogout}
          >
            <LogOut className={sideNavStyles.settingsIcon} />
            <span className={sideNavStyles.settingsLabel}>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SideNav;