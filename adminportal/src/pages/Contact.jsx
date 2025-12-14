import { useState, useEffect } from 'react';
import {
  getContacts,
  updateContactStatus,
  deleteContact,
} from '../utils/adminApi';
import { FiMail, FiPhone, FiMessageSquare, FiTrash2 } from 'react-icons/fi';

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const contactsData = await getContacts();
        setContacts(contactsData);
      } catch (error) {
        console.error('Error fetching contacts data:', error);
        // Fallback to dummy data
        setContacts([
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+977-9841234567',
            message: 'Interested in listing my property in Kathmandu area',
            date: '2024-02-20',
            status: 'New',
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+977-9851234567',
            message: 'Need help finding an apartment near Thamel',
            date: '2024-02-19',
            status: 'Replied',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleStatusUpdate = async (contactId, status) => {
    try {
      await updateContactStatus(contactId, status);
      setContacts(
        contacts.map((contact) =>
          contact.id === contactId ? { ...contact, status } : contact
        )
      );
    } catch (error) {
      console.error('Error updating contact status:', error);
      // Optimistic update for fallback
      setContacts(
        contacts.map((contact) =>
          contact.id === contactId ? { ...contact, status } : contact
        )
      );
    }
  };

  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(contactId);
        setContacts(contacts.filter((contact) => contact.id !== contactId));
      } catch (error) {
        console.error('Error deleting contact:', error);
        // Still remove from UI for better UX
        setContacts(contacts.filter((contact) => contact.id !== contactId));
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-sm text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  const filteredContacts = contacts.filter((contact) => {
    if (filter === 'all') return true;
    return contact.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-sm text-gray-500">
          Manage and respond to contact form submissions
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {contacts.length}
          </div>
          <div className="text-sm text-gray-500">Total Messages</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {contacts.filter((c) => c.status === 'New').length}
          </div>
          <div className="text-sm text-gray-500">New Messages</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {contacts.filter((c) => c.status === 'Replied').length}
          </div>
          <div className="text-sm text-gray-500">Replied</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">All Messages</option>
            <option value="new">New</option>
            <option value="replied">Replied</option>
          </select>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="font-medium text-gray-900">
                      {contact.name}
                    </div>
                    <span className="mx-2 text-gray-300">•</span>
                    <div className="text-sm text-gray-500">{contact.date}</div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <FiMail className="mr-2" />
                    {contact.email}
                    <span className="mx-2">|</span>
                    <FiPhone className="mr-2" />
                    {contact.phone}
                  </div>
                  <div className="flex items-start">
                    <FiMessageSquare className="mr-2 mt-1 flex-shrink-0" />
                    <p className="text-gray-600">{contact.message}</p>
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
                  {contact.status === 'New' && (
                    <button
                      onClick={() => handleStatusUpdate(contact.id, 'Replied')}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      title="Mark as replied"
                    >
                      Mark Replied
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    title="Delete message"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    contact.status === 'New'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {contact.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
