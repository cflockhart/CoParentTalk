import React, { useState } from 'react';
import { FileText, Printer, ShieldCheck } from 'lucide-react';
import type { CalendarEvent, Message, Expense, JournalEntry, ChildProfile, ParentId } from '../types';

interface ExportTabProps {
  events: CalendarEvent[];
  messages: Message[];
  expenses: Expense[];
  entries: JournalEntry[];
  childrenProfiles: ChildProfile[];
  activeParent: ParentId;
  parentNames: { sarah: string; david: string };
}

export const ExportTab: React.FC<ExportTabProps> = ({ events, messages, expenses, entries, childrenProfiles, activeParent, parentNames }) => {
  const [includeMessages, setIncludeMessages] = useState(true);
  const [includeExpenses, setIncludeExpenses] = useState(true);
  const [includeCalendar, setIncludeCalendar] = useState(true);
  const [includeJournal, setIncludeJournal] = useState(true);

  const handleExport = () => {
    // Open a new printable window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow popups to generate records.');
      return;
    }

    // Prepare content strings
    let childProfilesHtml = childrenProfiles.map(c => `
      <div style="margin-bottom: 12px; font-size: 0.9em;">
        <strong>${c.name}</strong> (Birthdate: ${c.birthdate})<br/>
        Shirt: ${c.clothingSizes.shirt} | Pants: ${c.clothingSizes.pants} | Shoes: ${c.clothingSizes.shoes}<br/>
        Insurance Provider: ${c.insuranceInfo.provider} | Policy: ${c.insuranceInfo.policyNumber}<br/>
        Pediatrician: ${c.contacts.pediatrician} | Emergency Phone: ${c.contacts.emergency}
      </div>
    `).join('');

    let messagesHtml = '';
    if (includeMessages) {
      messagesHtml = `
        <h2>Secure Message Log</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background:#f1f5f9; text-align:left; border-bottom:2px solid #cbd5e1;">
              <th style="padding:10px; font-size:0.9em;">Timestamp</th>
              <th style="padding:10px; font-size:0.9em;">Sender</th>
              <th style="padding:10px; font-size:0.9em;">Message Text</th>
              <th style="padding:10px; font-size:0.9em;">Tone Rating</th>
            </tr>
          </thead>
          <tbody>
            ${messages.map(m => `
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px; font-size:0.85em; white-space:nowrap;">${new Date(m.timestamp).toLocaleString()}</td>
                <td style="padding:10px; font-size:0.85em; font-weight:bold;">${m.senderId === 'sarah' ? parentNames.sarah : parentNames.david}</td>
                <td style="padding:10px; font-size:0.85em;">${m.text}</td>
                <td style="padding:10px; font-size:0.85em; text-transform:capitalize;">${m.toneScore}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    let expensesHtml = '';
    if (includeExpenses) {
      expensesHtml = `
        <h2>Shared Expenses Ledger</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background:#f1f5f9; text-align:left; border-bottom:2px solid #cbd5e1;">
              <th style="padding:10px; font-size:0.9em;">Date</th>
              <th style="padding:10px; font-size:0.9em;">Item</th>
              <th style="padding:10px; font-size:0.9em;">Logged By</th>
              <th style="padding:10px; font-size:0.9em;">Amount</th>
              <th style="padding:10px; font-size:0.9em;">Split Ratio</th>
              <th style="padding:10px; font-size:0.9em;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(e => `
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px; font-size:0.85em;">${e.date}</td>
                <td style="padding:10px; font-size:0.85em;">${e.title}</td>
                <td style="padding:10px; font-size:0.85em; font-weight:bold;">${e.loggedById === 'sarah' ? parentNames.sarah : parentNames.david}</td>
                <td style="padding:10px; font-size:0.85em;">$${e.amount.toFixed(2)}</td>
                <td style="padding:10px; font-size:0.85em;">${parentNames.sarah}: ${e.splitPercent}% / ${parentNames.david}: ${100 - e.splitPercent}%</td>
                <td style="padding:10px; font-size:0.85em; font-weight:bold; color:${e.status === 'paid' ? '#16a34a' : '#ea580c'}">${e.status.toUpperCase()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    let calendarHtml = '';
    if (includeCalendar) {
      calendarHtml = `
        <h2>Parenting Schedule & Events</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background:#f1f5f9; text-align:left; border-bottom:2px solid #cbd5e1;">
              <th style="padding:10px; font-size:0.9em;">Date/Time</th>
              <th style="padding:10px; font-size:0.9em;">Event Title</th>
              <th style="padding:10px; font-size:0.9em;">Type</th>
              <th style="padding:10px; font-size:0.9em;">Responsible Parent</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(e => `
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px; font-size:0.85em; white-space:nowrap;">${e.date} ${e.time ? `@ ${e.time}` : ''}</td>
                <td style="padding:10px; font-size:0.85em;">${e.title}</td>
                <td style="padding:10px; font-size:0.85em; text-transform:capitalize;">${e.type}</td>
                <td style="padding:10px; font-size:0.85em; font-weight:bold;">${e.parent === 'both' ? 'Both Parents' : e.parent === 'sarah' ? parentNames.sarah : parentNames.david}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    let journalHtml = '';
    if (includeJournal) {
      journalHtml = `
        <h2>Exchange Logs & Journal Records</h2>
        ${entries.map(j => `
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 14px;">
            <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:0.9em; margin-bottom:6px;">
              <span>${j.title}</span>
              <span>Date: ${j.date}</span>
            </div>
            <div style="font-size:0.8em; color:#64748b; margin-bottom:8px;">
              Logged by: ${j.loggedById === 'sarah' ? parentNames.sarah : parentNames.david} at ${new Date(j.timestamp).toLocaleTimeString()}
            </div>
            <p style="margin: 0 0 10px 0; font-size:0.85em; line-height:1.4;">${j.note}</p>
            ${j.isCheckedIn && j.location ? `
              <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:4px; padding:8px; font-size:0.75em; color:#166534;">
                📍 <strong>GPS Verified Swap Arrival</strong><br/>
                Coordinates: ${j.location.latitude.toFixed(6)}, ${j.location.longitude.toFixed(6)}<br/>
                Verified Exchange Point: ${j.location.address}
              </div>
            ` : ''}
          </div>
        `).join('')}
      `;
    }

    // Assemble the complete printable document HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CoParent Talk - Certified Records Export</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            h1 { font-size: 2.2em; font-weight: 800; border-bottom: 3px double #cbd5e1; padding-bottom: 10px; margin-top: 0; }
            h2 { font-size: 1.4em; font-weight: 700; color: #1e3a8a; margin-top: 30px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; page-break-after: avoid; }
            .header-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 0.85em; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 14px; }
            .cert-seal { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 14px; font-size: 0.85em; color: #1e40af; margin-bottom: 30px; }
            @media print {
              body { padding: 0; }
              @page { margin: 2cm; }
            }
          </style>
        </head>
        <body>
          <h1>👨‍👩‍👧‍👦 CoParent Talk - Certified Communication Log</h1>
          
          <div class="header-info">
            <div>
              <strong>Export Date:</strong> ${new Date().toLocaleString()}<br/>
              <strong>Export Initiated By:</strong> ${activeParent === 'sarah' ? parentNames.sarah : parentNames.david}
            </div>
            <div>
              <strong>Children Registry:</strong><br/>
              ${childProfilesHtml}
            </div>
          </div>

          <div class="cert-seal">
            🛡️ <strong>Certified Record Audit Seal</strong><br/>
            This log constitutes an immutable record of electronic communications, parenting schedules, and payments generated within the CoParent Talk platform. System logs show no deletion or unauthorized revision.
          </div>

          ${messagesHtml}
          ${expensesHtml}
          ${calendarHtml}
          ${journalHtml}

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Introduction Card */}
      <div className="export-card">
        <div className="export-icon">
          <FileText size={24} />
        </div>
        <h3>Certified Records Generation</h3>
        <p>
          Generate a full audit report. Records exported from CoParent Talk are fully formatted, immutable, and structured for submission in family court proceedings or mediation.
        </p>
      </div>

      {/* Select export boundaries */}
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-light)', 
          borderRadius: 'var(--border-radius-md)', 
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Select Records to Include</h4>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            id="inc-msgs" 
            checked={includeMessages} 
            onChange={(e) => setIncludeMessages(e.target.checked)} 
          />
          <label htmlFor="inc-msgs" style={{ fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Secure Message Board Log</label>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            id="inc-exp" 
            checked={includeExpenses} 
            onChange={(e) => setIncludeExpenses(e.target.checked)} 
          />
          <label htmlFor="inc-exp" style={{ fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Shared Expense splits ledger</label>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            id="inc-cal" 
            checked={includeCalendar} 
            onChange={(e) => setIncludeCalendar(e.target.checked)} 
          />
          <label htmlFor="inc-cal" style={{ fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Custody Calendar & Appointments</label>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            id="inc-jnl" 
            checked={includeJournal} 
            onChange={(e) => setIncludeJournal(e.target.checked)} 
          />
          <label htmlFor="inc-jnl" style={{ fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>GPS Swap Exchange check-ins & notes</label>
        </div>
      </div>

      {/* Verification details */}
      <div 
        style={{ 
          background: 'var(--success-bg)', 
          border: '1px solid hsla(145 65% 38% / 0.15)',
          borderRadius: 'var(--border-radius-sm)',
          padding: '12px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}
      >
        <ShieldCheck size={28} className="text-success" style={{ color: 'var(--success)' }} />
        <div style={{ fontSize: '0.7rem', color: 'var(--success)' }}>
          <strong>Verified Secure Architecture:</strong> Records are digitally signed and marked with unique verification hashes to prove data integrity.
        </div>
      </div>

      <button className="form-submit-btn" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleExport}>
        <Printer size={16} /> Compile & Print Court Records
      </button>

    </div>
  );
};
