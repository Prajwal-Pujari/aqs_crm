import { useState, useEffect } from 'react';
import { companyApi, contactApi } from '@/api/services';
import type { CompanyDto, ContactDto } from '@/types';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  X,
  CreditCard,
  Gift,
  Megaphone,
} from 'lucide-react';

interface ContactWithCompany extends ContactDto {
  companyName: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactWithCompany[]>([]);
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BILLING' | 'GREETINGS' | 'PROMOS'>('ALL');

  // Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [isBilling, setIsBilling] = useState(false);
  const [optedInGreetings, setOptedInGreetings] = useState(true);
  const [optedInPromos, setOptedInPromos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const compRes = await companyApi.getAll();
      const comps = compRes.content || [];
      setCompanies(comps);

      // Fetch contacts for each company
      const allContacts: ContactWithCompany[] = [];
      await Promise.all(
        comps.map(async (c) => {
          try {
            const list = await contactApi.getByCompany(c.id);
            list.forEach((contact) => {
              allContacts.push({
                ...contact,
                companyName: c.name,
              });
            });
          } catch (e) {
            // ignore
          }
        })
      );

      setContacts(allContacts);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId || !firstName.trim()) return;

    setIsSubmitting(true);
    try {
      await contactApi.create(Number(selectedCompanyId), {
        firstName,
        lastName: lastName || undefined,
        email: email || undefined,
        phone: phone || undefined,
        role: role || undefined,
        isBilling,
        optedInGreetings,
        optedInPromos,
      });

      setIsAddOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setRole('');
      setIsBilling(false);
      loadData();
    } catch (err) {
      alert('Failed to create contact.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    // Filter tab
    if (activeFilter === 'BILLING' && !c.isBilling) return false;
    if (activeFilter === 'GREETINGS' && !c.optedInGreetings) return false;
    if (activeFilter === 'PROMOS' && !c.optedInPromos) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${c.firstName} ${c.lastName || ''}`.toLowerCase().includes(q);
      const matchEmail = (c.email || '').toLowerCase().includes(q);
      const matchComp = c.companyName.toLowerCase().includes(q);
      const matchRole = (c.role || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchComp || matchRole;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-text text-label-sm font-medium">
            <Users className="h-4 w-4 text-sage" />
            <span>Client Stakeholders &amp; Billing Leads</span>
          </div>
          <h1 className="mt-1 font-headline text-headline-xl text-ink font-medium">
            Contacts Directory
          </h1>
          <p className="mt-0.5 text-body-sm text-stone-text">
            Enterprise contacts, billing authorities, and marketing opt-in preferences.
          </p>
        </div>

        <button
          onClick={() => {
            if (companies.length > 0) setSelectedCompanyId(companies[0].id);
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Contact</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: 'ALL', label: 'All Contacts', count: contacts.length },
              { key: 'BILLING', label: 'Billing Leads', count: contacts.filter((c) => c.isBilling).length },
              { key: 'GREETINGS', label: 'Festival Greetings', count: contacts.filter((c) => c.optedInGreetings).length },
              { key: 'PROMOS', label: 'Promos Opt-in', count: contacts.filter((c) => c.optedInPromos).length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-pill text-label-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeFilter === tab.key
                  ? 'bg-sage text-white'
                  : 'bg-card text-stone-text border border-divider hover:text-ink hover:bg-divider/40'
              }`}
            >
              {tab.label} <span className="opacity-75 text-xs">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-text" />
          <input
            type="text"
            placeholder="Search contact, company, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-body-sm bg-card border border-divider rounded-input focus:outline-none focus:border-sage"
          />
        </div>
      </div>

      {/* Contacts Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-body-sm text-stone-text">
          Loading contact directory...
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="py-20 text-center rounded-card border border-divider bg-card p-8 shadow-card">
          <Users className="mx-auto h-12 w-12 text-stone-border mb-3" />
          <h3 className="font-headline text-headline-sm text-ink">No contacts found</h3>
          <p className="mt-1 text-body-sm text-stone-text max-w-sm mx-auto">
            {searchQuery
              ? 'No contacts matched your search query.'
              : 'Add contacts under client companies to keep billing and communication channels active.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContacts.map((contact) => (
            <div
              key={`${contact.companyId}-${contact.id}`}
              className="rounded-card border border-divider bg-card p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-sage-light text-sage-dark flex items-center justify-center font-headline text-headline-xs font-bold">
                      {contact.firstName.charAt(0)}
                      {(contact.lastName || '').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-headline text-body-md font-semibold text-ink leading-tight">
                        {contact.firstName} {contact.lastName || ''}
                      </h3>
                      <p className="text-body-xs text-stone-text mt-0.5">
                        {contact.role || 'Stakeholder'}
                      </p>
                    </div>
                  </div>

                  {contact.isBilling && (
                    <span
                      title="Designated Annual PO Billing Contact"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-label-xs font-semibold border border-amber-200"
                    >
                      <CreditCard className="h-3 w-3" />
                      <span>Billing</span>
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-divider/60 space-y-2">
                  <div className="flex items-center gap-2 text-body-xs text-stone-text">
                    <Building2 className="h-3.5 w-3.5 text-sage shrink-0" />
                    <span className="font-medium text-ink truncate">{contact.companyName}</span>
                  </div>

                  {contact.email && (
                    <div className="flex items-center gap-2 text-body-xs text-stone-text">
                      <Mail className="h-3.5 w-3.5 text-stone-text shrink-0" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:text-sage hover:underline truncate"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}

                  {contact.phone && (
                    <div className="flex items-center gap-2 text-body-xs text-stone-text">
                      <Phone className="h-3.5 w-3.5 text-stone-text shrink-0" />
                      <a
                        href={`tel:${contact.phone}`}
                        className="hover:text-sage hover:underline truncate"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Opt-in Preferences Footer */}
              <div className="mt-4 pt-3 border-t border-divider/40 flex items-center justify-between text-label-xs text-stone-text">
                <span className="flex items-center gap-1.5">
                  <Gift
                    className={`h-3.5 w-3.5 ${
                      contact.optedInGreetings ? 'text-sage' : 'text-stone-border'
                    }`}
                  />
                  <span className={contact.optedInGreetings ? 'text-ink font-medium' : 'text-stone-text/70'}>
                    {contact.optedInGreetings ? 'Greetings Opt-in' : 'No Greetings'}
                  </span>
                </span>

                <span className="flex items-center gap-1.5">
                  <Megaphone
                    className={`h-3.5 w-3.5 ${
                      contact.optedInPromos ? 'text-sage' : 'text-stone-border'
                    }`}
                  />
                  <span className={contact.optedInPromos ? 'text-ink font-medium' : 'text-stone-text/70'}>
                    {contact.optedInPromos ? 'Promos Opt-in' : 'No Promos'}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Contact */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-card border border-divider bg-card p-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <h2 className="font-headline text-headline-sm text-ink">Add Client Contact</h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-stone-text hover:text-ink cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="mt-4 space-y-4">
              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                  Client Company *
                </label>
                <select
                  required
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
                  className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. John"
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  />
                </div>
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@enterprise.com"
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  />
                </div>
                <div>
                  <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-xs font-semibold uppercase tracking-wider text-stone-text mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. VP Procurement / Plant Head"
                  className="w-full rounded-input border border-divider bg-canvas px-3 py-2 text-body-sm text-ink focus:outline-none focus:border-sage"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-divider">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBilling}
                    onChange={(e) => setIsBilling(e.target.checked)}
                    className="rounded border-divider text-sage focus:ring-sage"
                  />
                  <span className="text-body-sm text-ink font-medium">
                    Primary Billing Contact (Receives annual PO renewal reminders)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optedInGreetings}
                    onChange={(e) => setOptedInGreetings(e.target.checked)}
                    className="rounded border-divider text-sage focus:ring-sage"
                  />
                  <span className="text-body-sm text-stone-text">
                    Opted in to annual Festival Greetings (Diwali, New Year)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optedInPromos}
                    onChange={(e) => setOptedInPromos(e.target.checked)}
                    className="rounded border-divider text-sage focus:ring-sage"
                  />
                  <span className="text-body-sm text-stone-text">
                    Opted in to Product Upgrade &amp; Promotional Announcements
                  </span>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-card border border-divider text-stone-text hover:text-ink text-label-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-card bg-sage hover:bg-sage-hover text-white text-label-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

