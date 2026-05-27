import { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  DollarSign, 
  BookOpen, 
  FileText, 
  User, 
  ArrowRightLeft, 
  ArrowLeftRight,
  Mail,
  X
} from 'lucide-react';
import type { ChildProfile, CalendarEvent, Message, Expense, JournalEntry, ParentId } from './types';
import { PhoneFrame } from './components/PhoneFrame';
import { CalendarTab } from './components/CalendarTab';
import { MessagesTab } from './components/MessagesTab';
import { ExpensesTab } from './components/ExpensesTab';
import { JournalTab } from './components/JournalTab';
import { InfoBankTab } from './components/InfoBankTab';
import { ExportTab } from './components/ExportTab';
import { AuthGate } from './components/AuthGate';

// Seed Data
const defaultChildren: ChildProfile[] = [
  {
    id: 'emma',
    name: 'Emma',
    birthdate: '2018-03-12',
    clothingSizes: { shirt: '8Y', pants: '8Y', shoes: '2Y' },
    insuranceInfo: { provider: 'Blue Cross Blue Shield', policyNumber: 'BCB-8931298', groupNumber: '90210' },
    schoolInfo: { name: 'Sunset Elementary', teacher: 'Mrs. Davis', contact: '555-014-9922' },
    contacts: { pediatrician: 'Dr. Sarah Stevens (555-019-3321)', dentist: 'Dr. Alan Mercer (555-012-4411)', emergency: 'Grandma Helen (555-010-4499)' },
    approvalStatus: 'approved',
    addedBy: 'sarah'
  },
  {
    id: 'lucas',
    name: 'Lucas',
    birthdate: '2021-08-25',
    clothingSizes: { shirt: '5T', pants: '5T', shoes: '11C' },
    insuranceInfo: { provider: 'Blue Cross Blue Shield', policyNumber: 'BCB-8931298', groupNumber: '90210' },
    schoolInfo: { name: 'Sunny Days Preschool', teacher: 'Miss Garcia', contact: '555-011-8833' },
    contacts: { pediatrician: 'Dr. Sarah Stevens (555-019-3321)', dentist: 'Dr. Alan Mercer (555-012-4411)', emergency: 'Grandma Helen (555-010-4499)' },
    approvalStatus: 'approved',
    addedBy: 'sarah'
  }
];

const defaultEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Emma Dentist Checkup',
    date: '2026-05-15',
    time: '14:00',
    parent: 'both',
    type: 'medical',
    description: 'Routine cleaning. Dental clinic on Oak street.'
  },
  {
    id: 'event-2',
    title: 'Lucas Soccer Practice',
    date: '2026-05-12',
    time: '16:30',
    parent: 'david',
    type: 'school',
    description: 'Bring water bottle and shin guards.'
  },
  {
    id: 'event-swap-1',
    title: 'Custody Swap Request: Work Travel',
    date: '2026-05-18',
    time: '08:00',
    parent: 'sarah',
    type: 'custody',
    description: 'Sarah requests David to take custody because she has business travel.',
    swapRequest: {
      id: 'swap-1',
      requestedParent: 'david',
      status: 'pending',
      originalParent: 'sarah'
    }
  }
];

const defaultMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'david',
    timestamp: '2026-05-22T15:45:00.000Z',
    text: "Hey Sarah, I'll drop off Emma at 5pm tomorrow instead of 4pm as my meeting is running late.",
    toneScore: 'neutral',
    readBy: ['david', 'sarah']
  },
  {
    id: 'msg-2',
    senderId: 'sarah',
    timestamp: '2026-05-22T16:02:00.000Z',
    text: 'Ok David, thank you for the heads up. We will see you at 5.',
    toneScore: 'positive',
    readBy: ['sarah', 'david']
  },
  {
    id: 'msg-3',
    senderId: 'david',
    timestamp: '2026-05-22T16:05:00.000Z',
    text: 'Thanks! Appreciate it.',
    toneScore: 'positive',
    readBy: ['david', 'sarah']
  }
];

const defaultExpenses: Expense[] = [
  {
    id: 'exp-1',
    title: 'Emma Math Tutoring',
    amount: 120.00,
    category: 'education',
    splitPercent: 50, // 50/50 split
    loggedById: 'sarah',
    date: '2026-05-10',
    status: 'unpaid',
    payments: [],
    description: 'Weekly algebra support session.'
  },
  {
    id: 'exp-2',
    title: 'Lucas Soccer Uniform',
    amount: 60.00,
    category: 'extracurricular',
    splitPercent: 50,
    loggedById: 'david',
    date: '2026-05-14',
    status: 'unpaid',
    payments: [],
    description: 'Jersey and socks for spring league.',
    receiptUrl: 'mock_receipt.png'
  }
];

const defaultJournal: JournalEntry[] = [
  {
    id: 'jnl-1',
    date: '2026-05-15',
    timestamp: '2026-05-15T17:15:00.000Z',
    loggedById: 'david',
    title: 'Custody Handover - Walgreens Exchange Point',
    note: 'Picked up Lucas and Emma from the Walgreens safe exchange parking lot. Transfer was prompt at 5:15 PM. Kids are in good spirits and had a snack on the drive home.',
    isCheckedIn: true,
    location: {
      latitude: 29.7604,
      longitude: -95.3698,
      address: 'Walgreens Parking Lot Safe Exchange Node, Houston'
    }
  }
];

type TabId = 'home' | 'calendar' | 'messages' | 'expenses' | 'journal' | 'infobank' | 'export';

interface FamilyMember {
  name: string;
  email: string;
  registered: boolean;
}

interface Family {
  id: string;
  name: string;
  parentA: FamilyMember;
  parentB?: FamilyMember;
}

interface Invitation {
  id: string;
  familyId: string;
  inviterEmail: string;
  inviteeEmail: string;
  inviteeName: string;
  status: 'pending' | 'accepted';
}

interface DashboardProps {
  session: { name: string; email: string; role: ParentId; familyId: string };
  onLogout: () => void;
  onUpdateSession: (session: { name: string; email: string; role: ParentId; familyId: string }) => void;
}

function Dashboard({ session, onLogout, onUpdateSession }: DashboardProps) {
  const activeParent = session.role;
  const familyId = session.familyId;
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // Load from local storage or fallback to seed data, partitioned by familyId
  const [childrenProfiles, setChildrenProfiles] = useState<ChildProfile[]>(() => {
    const saved = localStorage.getItem(`ofw_children_${familyId}`);
    return saved ? JSON.parse(saved) : (familyId === 'demo-family' ? defaultChildren : []);
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(`ofw_events_${familyId}`);
    return saved ? JSON.parse(saved) : (familyId === 'demo-family' ? defaultEvents : []);
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(`ofw_messages_${familyId}`);
    return saved ? JSON.parse(saved) : (familyId === 'demo-family' ? defaultMessages : []);
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`ofw_expenses_${familyId}`);
    return saved ? JSON.parse(saved) : (familyId === 'demo-family' ? defaultExpenses : []);
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(`ofw_journal_${familyId}`);
    return saved ? JSON.parse(saved) : (familyId === 'demo-family' ? defaultJournal : []);
  });

  // Resolve active family member names
  const families: Family[] = JSON.parse(localStorage.getItem('coparent_families') || '[]');
  const activeFamily = families.find(f => f.id === familyId) || {
    id: 'demo-family',
    name: 'Demo Family',
    parentA: { name: 'Sarah', email: 'sarah@example.com', registered: true },
    parentB: { name: 'David', email: 'david@example.com', registered: true }
  };

  const parentNames = {
    sarah: activeFamily.parentA.name,
    david: activeFamily.parentB?.name || 'Invited Co-Parent'
  };

  // Simulated Email Notification Toast State
  const [sentEmailNotification, setSentEmailNotification] = useState<{
    to: string;
    toName: string;
    subject: string;
    body: string;
  } | null>(null);
  const [emailTimeoutId, setEmailTimeoutId] = useState<number | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (emailTimeoutId) clearTimeout(emailTimeoutId);
    };
  }, [emailTimeoutId]);

  const triggerEmailNotification = (
    type: 'event' | 'message' | 'expense' | 'journal' | 'child_added' | 'child_approved' | 'child_rejected',
    itemDetails: any
  ) => {
    const recipientName = activeParent === 'sarah' ? parentNames.david : parentNames.sarah;
    const recipientEmail = activeParent === 'sarah' 
      ? (activeFamily.parentB?.email || 'david@example.com')
      : activeFamily.parentA.email;
      
    const senderName = activeParent === 'sarah' ? parentNames.sarah : parentNames.david;

    let subject = '';
    let body = '';

    if (type === 'message') {
      subject = `[CoParent Talk] Secure message posted by ${senderName}`;
      body = `Hi ${recipientName},\n\n${senderName} has logged a secure message:\n\n"${itemDetails.text}"\n\nLog in to CoParent Talk to read and reply.`;
    } else if (type === 'expense') {
      subject = `[CoParent Talk] Shared child expense logged by ${senderName}`;
      body = `Hi ${recipientName},\n\n${senderName} has logged a new shared expense:\n\n- Item: ${itemDetails.title}\n- Amount: $${itemDetails.amount.toFixed(2)}\n- Split: ${parentNames.sarah} pays ${itemDetails.splitPercent}% / ${parentNames.david} ${100 - itemDetails.splitPercent}%\n\nLog in to CoParent Talk to settle your share.`;
    } else if (type === 'event') {
      const isSwap = !!itemDetails.swapRequest;
      subject = isSwap 
        ? `[CoParent Talk] Custody swap requested by ${senderName}`
        : `[CoParent Talk] New schedule event added by ${senderName}`;
      body = isSwap
         ? `Hi ${recipientName},\n\n${senderName} has requested a custody swap for ${itemDetails.date} @ ${itemDetails.time || 'All Day'}.\n\nReason: "${itemDetails.title}"\n\nLog in to CoParent Talk to approve or decline the swap.`
         : `Hi ${recipientName},\n\n${senderName} has added a new event to your shared calendar:\n\n- Title: ${itemDetails.title}\n- Date: ${itemDetails.date} @ ${itemDetails.time || 'All Day'}\n- Description: ${itemDetails.description || 'No description'}\n\nLog in to CoParent Talk to review the details.`;
    } else if (type === 'journal') {
      subject = `[CoParent Talk] Exchange check-in logged by ${senderName}`;
      body = `Hi ${recipientName},\n\n${senderName} has checked in and created a journal entry:\n\n- Title: ${itemDetails.title}\n- Location Verified: ${itemDetails.isCheckedIn ? 'GPS Verified Lock' : 'No GPS'}\n- Note: "${itemDetails.note}"\n\nLog in to review the shared log.`;
    } else if (type === 'child_added') {
      subject = `[CoParent Talk] Child profile added by ${senderName} (Pending Approval)`;
      body = `Hi ${recipientName},\n\n${senderName} has added a new child profile to your workspace:\n\n- Name: ${itemDetails.name}\n- Birthdate: ${itemDetails.birthdate}\n\nFamily court guidelines require both parents to review and approve child details. Log in to CoParent Talk to approve or reject this child profile.`;
    } else if (type === 'child_approved') {
      subject = `[CoParent Talk] Child profile approved by ${senderName}`;
      body = `Hi ${recipientName},\n\n${senderName} has approved the profile for "${itemDetails.name}". The child is now fully verified in your shared workspace.`;
    } else if (type === 'child_rejected') {
      subject = `[CoParent Talk] Child profile details rejected by ${senderName}`;
      body = `Hi ${recipientName},\n\n${senderName} has rejected or declined the profile details for "${itemDetails.name}". Please discuss with ${senderName} directly to resolve the discrepancies.`;
    }

    if (emailTimeoutId) {
      clearTimeout(emailTimeoutId);
    }

    setSentEmailNotification({
      to: recipientEmail,
      toName: recipientName,
      subject,
      body
    });

    // Dispatch actual EmailJS notification if credentials are set
    const emailJsServiceId = localStorage.getItem('emailjs_service_id') || import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    const emailJsTemplateId = localStorage.getItem('emailjs_template_id') || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    const emailJsPublicKey = localStorage.getItem('emailjs_public_key') || import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

    if (emailJsServiceId && emailJsTemplateId && emailJsPublicKey) {
      fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: emailJsServiceId,
          template_id: emailJsTemplateId,
          user_id: emailJsPublicKey,
          template_params: {
            to_email: recipientEmail,
            to_name: recipientName,
            from_name: senderName,
            name: senderName,
            time: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
            subject: subject,
            message: body
          }
        })
      })
      .then(res => {
        if (!res.ok) {
          console.error('EmailJS Send error:', res.statusText);
        } else {
          console.log('Email successfully dispatched via EmailJS!');
        }
      })
      .catch(err => {
        console.error('EmailJS Fetch Exception:', err);
      });
    }

    const timeout = window.setTimeout(() => {
      setSentEmailNotification(null);
    }, 7000);

    setEmailTimeoutId(timeout);
  };

  // Persist State Updates
  useEffect(() => {
    localStorage.setItem(`ofw_children_${familyId}`, JSON.stringify(childrenProfiles));
  }, [childrenProfiles, familyId]);

  useEffect(() => {
    localStorage.setItem(`ofw_events_${familyId}`, JSON.stringify(events));
  }, [events, familyId]);

  useEffect(() => {
    localStorage.setItem(`ofw_messages_${familyId}`, JSON.stringify(messages));
  }, [messages, familyId]);

  useEffect(() => {
    localStorage.setItem(`ofw_expenses_${familyId}`, JSON.stringify(expenses));
  }, [expenses, familyId]);

  useEffect(() => {
    localStorage.setItem(`ofw_journal_${familyId}`, JSON.stringify(journalEntries));
  }, [journalEntries, familyId]);

  // Read message handler when entering messages tab
  useEffect(() => {
    if (activeTab === 'messages') {
      const unreadMsgs = messages.filter(m => !m.readBy.includes(activeParent));
      if (unreadMsgs.length > 0) {
        const updated = messages.map(m => {
          if (!m.readBy.includes(activeParent)) {
            return { ...m, readBy: [...m.readBy, activeParent] };
          }
          return m;
        });
        setMessages(updated);
      }
    }
  }, [activeTab, activeParent, messages]);

  // Helpers
  const addEvent = (event: CalendarEvent) => {
    setEvents([...events, event]);
    triggerEmailNotification('event', event);
  };
  const updateEvent = (updated: CalendarEvent) => {
    setEvents(events.map(e => e.id === updated.id ? updated : e));
  };
  
  const addMessage = (message: Message) => {
    setMessages([...messages, message]);
    triggerEmailNotification('message', message);
  };
  
  const addExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
    triggerEmailNotification('expense', expense);
  };
  const updateExpense = (updated: Expense) => {
    setExpenses(expenses.map(e => e.id === updated.id ? updated : e));
  };

  const addJournalEntry = (entry: JournalEntry) => {
    setJournalEntries([entry, ...journalEntries]);
    triggerEmailNotification('journal', entry);
  };
  
  const updateChildProfile = (updated: ChildProfile) => {
    setChildrenProfiles(childrenProfiles.map(c => c.id === updated.id ? updated : c));
  };

  const addChildProfile = (child: ChildProfile) => {
    setChildrenProfiles([...childrenProfiles, child]);
    triggerEmailNotification('child_added', child);
  };

  const approveChildProfile = (childId: string) => {
    const updated = childrenProfiles.map(c => {
      if (c.id === childId) {
        const approved = { ...c, approvalStatus: 'approved' as const };
        triggerEmailNotification('child_approved', approved);
        return approved;
      }
      return c;
    });
    setChildrenProfiles(updated);
  };

  const rejectChildProfile = (childId: string) => {
    const child = childrenProfiles.find(c => c.id === childId);
    if (child) {
      triggerEmailNotification('child_rejected', child);
    }
    setChildrenProfiles(childrenProfiles.filter(c => c.id !== childId));
  };

  // Quick stats calculations for Home Dashboard
  const pendingSwapCount = events.filter(e => 
    e.type === 'custody' && 
    e.swapRequest?.status === 'pending' && 
    e.swapRequest.requestedParent === activeParent
  ).length;

  const unreadMessageCount = messages.filter(m => !m.readBy.includes(activeParent)).length;

  const nextEvent = [...events]
    .filter(e => {
      const eventDate = new Date(e.date + 'T23:59:59');
      return eventDate.getTime() >= new Date().setHours(0,0,0,0);
    })
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))[0];

  const calculateOwedBalance = () => {
    let balance = 0;
    expenses.forEach(e => {
      if (e.status === 'unpaid') {
        const sarahShare = (e.amount * e.splitPercent) / 100;
        const davidShare = e.amount - sarahShare;
        
        if (e.loggedById === 'sarah') {
          if (activeParent === 'david') balance -= davidShare; // I owe
          else balance += davidShare; // Owed to me
        } else {
          if (activeParent === 'sarah') balance -= sarahShare; // I owe
          else balance += sarahShare; // Owed to me
        }
      }
    });
    return balance;
  };

  const owedBalance = calculateOwedBalance();

  const handleSwitchRole = (role: ParentId) => {
    const users = JSON.parse(localStorage.getItem('coparent_users') || '[]');
    const matchingUser = users.find((u: any) => u.familyId === familyId && u.role === role);
    const resolvedName = matchingUser ? matchingUser.name : (role === 'sarah' ? parentNames.sarah : parentNames.david);
    const resolvedEmail = matchingUser ? matchingUser.email : '';

    const updatedSession = { 
      name: resolvedName, 
      email: resolvedEmail, 
      role, 
      familyId 
    };
    localStorage.setItem('coparent_session', JSON.stringify(updatedSession));
    onUpdateSession(updatedSession);
  };

  // Render active tab panel
  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <CalendarTab 
            events={events} 
            addEvent={addEvent} 
            updateEvent={updateEvent} 
            activeParent={activeParent} 
            parentNames={parentNames}
          />
        );
      case 'messages':
        return (
          <MessagesTab 
            messages={messages} 
            addMessage={addMessage} 
            activeParent={activeParent} 
            parentNames={parentNames}
          />
        );
      case 'expenses':
        return (
          <ExpensesTab 
            expenses={expenses} 
            addExpense={addExpense} 
            updateExpense={updateExpense} 
            activeParent={activeParent} 
            parentNames={parentNames}
          />
        );
      case 'journal':
        return (
          <JournalTab 
            entries={journalEntries} 
            addEntry={addJournalEntry} 
            activeParent={activeParent} 
            parentNames={parentNames}
          />
        );
      case 'infobank':
        return (
          <InfoBankTab 
            childrenProfiles={childrenProfiles} 
            updateChildProfile={updateChildProfile} 
            addChildProfile={addChildProfile}
            approveChildProfile={approveChildProfile}
            rejectChildProfile={rejectChildProfile}
            activeParent={activeParent}
            parentNames={parentNames}
          />
        );
      case 'export':
        return (
          <ExportTab 
            events={events} 
            messages={messages} 
            expenses={expenses} 
            entries={journalEntries}
            childrenProfiles={childrenProfiles}
            activeParent={activeParent}
            parentNames={parentNames}
          />
        );
      default: // Home Dashboard
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Premium Dashboard Welcome Banner */}
            <div className="welcome-card">
              <h2>CoParent Talk Dashboard</h2>
              <p>Welcome back, {activeParent === 'sarah' ? parentNames.sarah : parentNames.david}. You have co-parenting updates.</p>
            </div>

            {/* Child Profile Approval Quick Alert */}
            {childrenProfiles.filter(c => c.approvalStatus === 'pending' && c.addedBy !== activeParent).map(child => (
              <div 
                key={child.id}
                style={{ 
                  background: 'rgba(59, 130, 246, 0.05)', 
                  border: '1px solid var(--primary)', 
                  borderRadius: 'var(--border-radius-md)', 
                  padding: '12px 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveTab('infobank')}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Child Approval Request</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{child.name} has been added by {child.addedBy === 'sarah' ? parentNames.sarah : parentNames.david}. Click to review and approve details.</p>
                </div>
              </div>
            ))}

            {/* Quick Alerts Banner */}
            {pendingSwapCount > 0 && (
              <div 
                style={{ 
                  background: 'var(--warning-bg)', 
                  border: '1px solid var(--warning)', 
                  borderRadius: 'var(--border-radius-md)', 
                  padding: '12px 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveTab('calendar')}
              >
                <ArrowLeftRight size={24} style={{ color: 'var(--warning)' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Custody Swap Awaiting Approval</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>You have {pendingSwapCount} swap request from {activeParent === 'sarah' ? parentNames.david : parentNames.sarah}.</p>
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="quick-stats-grid">
              <div className="stat-card" onClick={() => setActiveTab('messages')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon purple">
                  <MessageSquare size={20} />
                </div>
                <div className="stat-info">
                  <h4>New Messages</h4>
                  <p>{unreadMessageCount > 0 ? `${unreadMessageCount} Unread` : '0 Unread'}</p>
                </div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab('expenses')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon green">
                  <DollarSign size={20} />
                </div>
                <div className="stat-info">
                  <h4>Balance</h4>
                  <p style={{ color: owedBalance > 0 ? 'var(--success)' : owedBalance < 0 ? 'var(--danger)' : undefined }}>
                    {owedBalance === 0 ? '$0.00' : owedBalance > 0 ? `+$${owedBalance.toFixed(2)}` : `-$${Math.abs(owedBalance).toFixed(2)}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Today Custody Highlight */}
            <div className="custody-today-card">
              <div className="custody-today-header">
                <h3>Parenting Responsibility Today</h3>
                <span className={`custody-badge ${activeParent}`}>Active User: {activeParent === 'sarah' ? parentNames.sarah : parentNames.david}</span>
              </div>
              
              <div className="custody-visual">
                <div className="custody-parent">
                  <div className="custody-parent-avatar sarah">{parentNames.sarah.charAt(0).toUpperCase()}</div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{parentNames.sarah}</span>
                </div>
                <div className="custody-arrow">
                  <ArrowRightLeft size={20} />
                </div>
                <div className="custody-parent">
                  <div className="custody-parent-avatar david">{parentNames.david.charAt(0).toUpperCase()}</div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{parentNames.david}</span>
                </div>
              </div>
              
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: 500 }}>
                Alternate custody control panel by clicking <strong>"Switch Parent"</strong> in the left console.
              </div>
            </div>

            {/* Next Scheduled Event */}
            <div 
              style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-light)', 
                borderRadius: 'var(--border-radius-md)', 
                padding: '16px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: nextEvent ? 'pointer' : 'default'
              }}
              onClick={() => nextEvent && setActiveTab('calendar')}
            >
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Next Event</h4>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>
                  {nextEvent ? nextEvent.title : 'No Upcoming Events'}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {nextEvent 
                    ? `${new Date(nextEvent.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${nextEvent.time ? ` @ ${nextEvent.time}` : ''}`
                    : 'Use the calendar tab to schedule'
                  }
                </p>
              </div>
              <CalendarIcon size={24} style={{ color: 'var(--primary)' }} />
            </div>

          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Info & Parent Switcher Console */}
      <div className="promo-panel">
        <h1>CoParent<br/>Talk.</h1>
        <p>
          A premium Family Law compliant communications hub. Keep messaging objective, schedules clear, and split expenses fully documented.
        </p>

        {/* Feature badges */}
        <div className="feature-pill-list">
          <span className="feature-pill">🛡️ Secure Records</span>
          <span className="feature-pill">📅 Joint Custody Calendar</span>
          <span className="feature-pill">💬 Sentiment ToneMeter</span>
          <span className="feature-pill">💸 Split Expense Tracker</span>
          <span className="feature-pill">📍 GPS Swap Check-ins</span>
          <span className="feature-pill">⚖️ Court Admissible Exports</span>
        </div>

        {/* Parent Switcher Card */}
        <div className="parent-selector-card">
          <h3>Simulation Switcher</h3>
          <p style={{ fontSize: '0.85rem', color: 'hsl(220 20% 85%)', margin: '0 0 4px 0', fontWeight: 600 }}>
            Family: "{activeFamily.name}"
          </p>
          <p style={{ fontSize: '0.8rem', color: 'hsl(220 20% 75%)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
            Click buttons below to toggle between co-parents and test real-time notification handshakes, messaging read-receipts, expense settle approvals, and custody trades.
          </p>
          <div className="parent-btns">
            <button 
              className={`parent-btn sarah ${session.role === 'sarah' ? 'active' : ''}`}
              onClick={() => handleSwitchRole('sarah')}
            >
              {parentNames.sarah} (Parent A)
              <span>Primary Custody Owner</span>
            </button>
            
            <button 
              className={`parent-btn david ${session.role === 'david' ? 'active' : ''}`}
              onClick={() => {
                if (activeFamily.parentB?.registered) {
                  handleSwitchRole('david');
                }
              }}
              style={{
                opacity: activeFamily.parentB?.registered ? 1 : 0.6,
                cursor: activeFamily.parentB?.registered ? 'pointer' : 'not-allowed'
              }}
              disabled={!activeFamily.parentB?.registered}
            >
              {parentNames.david} (Parent B)
              <span>{activeFamily.parentB?.registered ? 'Connected' : 'Invite Pending'}</span>
            </button>
          </div>

          {activeFamily.parentB && !activeFamily.parentB.registered && (
            <div style={{ marginTop: '16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px dashed rgba(59, 130, 246, 0.3)', borderRadius: 'var(--border-radius-sm)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'hsl(220 20% 85%)', fontWeight: 600 }}>Invite Sent: {activeFamily.parentB.name}</span>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'hsl(220 20% 70%)', lineHeight: 1.3 }}>
                Simulate registration for {activeFamily.parentB.name} by clicking below to register them and complete the handshake:
              </p>
              <button
                className="form-submit-btn"
                style={{ background: 'var(--primary)', margin: 0, padding: '6px 12px', fontSize: '0.7rem' }}
                onClick={() => {
                  const invites: Invitation[] = JSON.parse(localStorage.getItem('coparent_invitations') || '[]');
                  const invite = invites.find(i => i.familyId === familyId && i.status === 'pending');
                  if (invite) {
                    window.location.href = `${window.location.origin}${window.location.pathname}?inviteCode=${invite.id}`;
                  }
                }}
              >
                Complete Invite Handshake
              </button>
            </div>
          )}

          <button 
            onClick={onLogout}
            style={{ 
              marginTop: '16px', 
              width: '100%', 
              background: 'rgba(255,255,255,0.06)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: 'white', 
              padding: '10px', 
              borderRadius: 'var(--border-radius-sm)', 
              fontWeight: 600, 
              fontSize: '0.8rem', 
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'var(--danger)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            Log Out Account
          </button>
        </div>
      </div>

      {/* Main Smartphone Shell */}
      <PhoneFrame>
        {/* Header App Title Bar */}
        <header className="app-header">
          <div className="app-logo">
            👨‍👩‍👧‍👦 <span>CoParent Talk</span>
          </div>
          
          <div className={`current-parent-indicator ${activeParent}`}>
            <User size={12} />
            <span>{activeParent === 'sarah' ? parentNames.sarah : parentNames.david}</span>
          </div>
        </header>

        {/* App Tab views renderer */}
        <main className="main-scroll-content">
          {renderTabContent()}
        </main>

        {/* Bottom Tab Bar Navigation */}
        <nav className="tab-bar">
          <button className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <div className="tab-icon-wrapper">
              <HomeIcon size={18} />
            </div>
            <span>Home</span>
          </button>

          <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
            <div className="tab-icon-wrapper">
              <CalendarIcon size={18} />
            </div>
            <span>Calendar</span>
          </button>

          <button className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
            <div className="tab-icon-wrapper" style={{ position: 'relative' }}>
              <MessageSquare size={18} />
              {unreadMessageCount > 0 && (
                <span 
                  style={{ 
                    position: 'absolute', 
                    top: '2px', 
                    right: '2px', 
                    background: 'var(--danger)', 
                    color: 'white', 
                    fontSize: '0.55rem', 
                    borderRadius: '50%', 
                    width: '14px', 
                    height: '14px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 700 
                  }}
                >
                  {unreadMessageCount}
                </span>
              )}
            </div>
            <span>Messages</span>
          </button>

          <button className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
            <div className="tab-icon-wrapper">
              <DollarSign size={18} />
            </div>
            <span>Expenses</span>
          </button>

          <button className={`tab-btn ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => setActiveTab('journal')}>
            <div className="tab-icon-wrapper">
              <BookOpen size={18} />
            </div>
            <span>Journal</span>
          </button>

          <button className={`tab-btn ${activeTab === 'infobank' ? 'active' : ''}`} onClick={() => setActiveTab('infobank')}>
            <div className="tab-icon-wrapper">
              <User size={18} />
            </div>
            <span>Info</span>
          </button>
          
          <button className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`} onClick={() => setActiveTab('export')}>
            <div className="tab-icon-wrapper">
              <FileText size={18} />
            </div>
            <span>Export</span>
          </button>
        </nav>
      </PhoneFrame>

      {/* Simulated Email Notification Toast */}
      {sentEmailNotification && (
        <div className="email-toast-container">
          <div className="email-toast-card">
            <div className="email-toast-header">
              <span className="email-toast-title">
                <Mail size={14} /> Simulated Email Notification
              </span>
              <button 
                className="email-toast-close" 
                onClick={() => setSentEmailNotification(null)}
                aria-label="Dismiss Notification"
              >
                <X size={14} />
              </button>
            </div>
            <div className="email-toast-body">
              <div className="email-toast-meta">
                <div className="email-toast-meta-row">
                  <span className="email-toast-meta-label">To:</span>
                  <span className="email-toast-meta-val">
                    {sentEmailNotification.toName} &lt;{sentEmailNotification.to}&gt;
                  </span>
                </div>
                <div className="email-toast-meta-row">
                  <span className="email-toast-meta-label">Subject:</span>
                  <span className="email-toast-meta-val">{sentEmailNotification.subject}</span>
                </div>
              </div>
              <div className="email-toast-content">
                {sentEmailNotification.body.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            </div>
            <div className="email-toast-progress-container">
              <div className="email-toast-progress-bar" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [session, setSession] = useState<{ name: string; email: string; role: ParentId; familyId: string } | null>(() => {
    const saved = localStorage.getItem('coparent_session');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (newSession: { name: string; email: string; role: ParentId; familyId: string }) => {
    localStorage.setItem('coparent_session', JSON.stringify(newSession));
    setSession(newSession);
  };

  const handleLogout = () => {
    localStorage.removeItem('coparent_session');
    setSession(null);
  };

  if (!session) {
    return <AuthGate onLoginSuccess={handleLogin} />;
  }

  return (
    <Dashboard 
      key={session.familyId + '_' + session.role} 
      session={session} 
      onLogout={handleLogout} 
      onUpdateSession={setSession}
    />
  );
}

export default App;
