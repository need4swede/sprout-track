import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { styles } from './baby-quick-info.styles';
import { ContactsTabProps } from './baby-quick-info.types';

/**
 * ContactsTab Component
 * 
 * Displays the contacts associated with a baby
 */
const ContactsTab: React.FC<ContactsTabProps> = ({
  contacts,
  selectedBaby
}) => {
  // Filter contacts that are associated with the baby
  // Since we don't have a direct relationship in the data model,
  // we'll display all contacts for now. In a real implementation,
  // we would filter based on a relationship table.
  
  return (
    <div className={cn(styles.contactsContainer, "baby-quick-info-contacts-container")}>
      <h3 className={cn(styles.sectionTitle, "baby-quick-info-section-title")}>
        {selectedBaby.firstName}'s Contacts
      </h3>
      
      {contacts && contacts.length > 0 ? (
        <div>
          {contacts.map((contact) => (
            <div 
              key={contact.id} 
              className={cn(styles.contactItem, "baby-quick-info-contact-item")}
            >
              <div className={cn(styles.contactInfo, "baby-quick-info-contact-info")}>
                <div className={cn(styles.contactName, "baby-quick-info-contact-name")}>
                  {contact.name}
                </div>
                <div className={cn(styles.contactRole, "baby-quick-info-contact-role")}>
                  {contact.role}
                </div>
                
                <div className={cn(styles.contactDetails, "baby-quick-info-contact-details")}>
                  {contact.phone && (
                    <div className={cn(styles.contactDetail, "baby-quick-info-contact-detail")}>
                      <Phone className={cn(styles.contactIcon, "baby-quick-info-contact-icon")} />
                      {contact.phone}
                    </div>
                  )}
                  
                  {contact.email && (
                    <div className={cn(styles.contactDetail, "baby-quick-info-contact-detail")}>
                      <Mail className={cn(styles.contactIcon, "baby-quick-info-contact-icon")} />
                      {contact.email}
                    </div>
                  )}
                  
                  {contact.address && (
                    <div className={cn(styles.contactDetail, "baby-quick-info-contact-detail")}>
                      <MapPin className={cn(styles.contactIcon, "baby-quick-info-contact-icon")} />
                      {contact.address}
                    </div>
                  )}
                </div>
                
                {contact.notes && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    {contact.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={cn(styles.emptyMessage, "baby-quick-info-empty-message")}>
          No contacts available. Contacts can be added in the Calendar Event form or Settings.
        </div>
      )}
    </div>
  );
};

export default ContactsTab;
