import React, { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { calendarEventFormStyles as styles } from './calendar-event-form.styles';
import { Contact } from '@/src/components/CalendarEvent/calendar-event.types';
import { Check, X, Plus, Phone, Mail } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';

interface ContactSelectorProps {
  contacts: Contact[];
  selectedContactIds: string[];
  onContactsChange: (contactIds: string[]) => void;
  onAddNewContact?: () => void;
}

/**
 * ContactSelector Component
 * 
 * A subcomponent of CalendarEventForm that handles the selection of contacts
 * for calendar events.
 */
const ContactSelector: React.FC<ContactSelectorProps> = ({
  contacts,
  selectedContactIds,
  onContactsChange,
  onAddNewContact,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get selected contacts
  const selectedContacts = contacts.filter(contact => 
    selectedContactIds.includes(contact.id)
  );
  
  // Toggle contact selection
  const toggleContact = (contactId: string) => {
    if (selectedContactIds.includes(contactId)) {
      onContactsChange(selectedContactIds.filter(id => id !== contactId));
    } else {
      onContactsChange([...selectedContactIds, contactId]);
    }
  };
  
  // Remove contact from selection
  const removeContact = (contactId: string) => {
    onContactsChange(selectedContactIds.filter(id => id !== contactId));
  };
  
  // Group contacts by role
  const contactsByRole = filteredContacts.reduce<Record<string, Contact[]>>((acc, contact) => {
    if (!acc[contact.role]) {
      acc[contact.role] = [];
    }
    acc[contact.role].push(contact);
    return acc;
  }, {});
  
  return (
    <div className={styles.multiSelectContainer}>
      {/* Search input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Contact list */}
      <div className={cn(
        styles.multiSelectList,
        'calendar-event-form-multi-select'
      )}>
        {Object.entries(contactsByRole).map(([role, roleContacts]) => (
          <div key={role} className="mb-2 last:mb-0">
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              {role}
            </div>
            {roleContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => toggleContact(contact.id)}
                className={cn(
                  styles.multiSelectItem,
                  selectedContactIds.includes(contact.id) && styles.multiSelectItemSelected,
                  'cursor-pointer'
                )}
              >
                <div className="flex-shrink-0 w-4">
                  {selectedContactIds.includes(contact.id) && (
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  )}
                </div>
                <div className={styles.multiSelectItemLabel}>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
                    {contact.phone && (
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {contact.phone}
                      </span>
                    )}
                    {contact.email && (
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {contact.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {filteredContacts.length === 0 && (
          <div className="p-2 text-sm text-gray-500 dark:text-gray-400 text-center">
            {searchTerm ? 'No contacts found' : 'No contacts available'}
          </div>
        )}
        
        {/* Add new contact button */}
        {onAddNewContact && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onAddNewContact}
              className="w-full"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add New Contact
            </Button>
          </div>
        )}
      </div>
      
      {/* Selected contacts */}
      {selectedContacts.length > 0 && (
        <div className={styles.selectedItemsContainer}>
          {selectedContacts.map(contact => (
            <div key={contact.id} className={styles.selectedItem}>
              <span>{contact.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeContact(contact.id);
                }}
                className={styles.selectedItemRemove}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactSelector;
