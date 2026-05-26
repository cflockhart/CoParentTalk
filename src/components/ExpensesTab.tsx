import React, { useState } from 'react';
import { Plus, Receipt, Check } from 'lucide-react';
import type { Expense, ParentId } from '../types';

interface ExpensesTabProps {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  activeParent: ParentId;
  parentNames: { sarah: string; david: string };
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({ expenses, addExpense, updateExpense, activeParent, parentNames }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Expense | null>(null);

  // New Expense Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('medical');
  const [splitPercent, setSplitPercent] = useState<number>(50); // Sarah's split percentage
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [desc, setDesc] = useState('');
  const [hasReceipt, setHasReceipt] = useState(true);

  // Net balance calculations
  // Let's compute who owes whom:
  // For each UNPAID expense:
  // - If logged by Sarah: David owes Sarah (amount * (1 - splitPercent/100))
  // - If logged by David: Sarah owes David (amount * (splitPercent/100))
  let davidOwesSarah = 0;
  let sarahOwesDavid = 0;

  expenses.forEach(e => {
    if (e.status === 'unpaid') {
      const sarahShare = (e.amount * e.splitPercent) / 100;
      const davidShare = e.amount - sarahShare;

      if (e.loggedById === 'sarah') {
        davidOwesSarah += davidShare;
      } else {
        sarahOwesDavid += sarahShare;
      }
    }
  });

  const netBalance = davidOwesSarah - sarahOwesDavid;
  const absNet = Math.abs(netBalance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      title,
      amount: parseFloat(amount),
      category,
      splitPercent,
      loggedById: activeParent,
      date,
      status: 'unpaid',
      payments: [],
      description: desc,
      receiptUrl: hasReceipt ? 'mock_receipt.png' : undefined
    };

    addExpense(newExpense);
    
    // Reset Form
    setTitle('');
    setAmount('');
    setDesc('');
    setShowAddModal(false);
  };

  const handlePayExpense = (expense: Expense) => {
    const updated: Expense = {
      ...expense,
      status: 'paid',
      payments: [
        {
          id: Date.now().toString(),
          paidById: activeParent,
          amount: expense.loggedById === 'sarah' 
            ? expense.amount * (1 - expense.splitPercent / 100)
            : expense.amount * (expense.splitPercent / 100),
          date: new Date().toISOString().split('T')[0]
        }
      ]
    };
    updateExpense(updated);
  };

  const getCategoryEmoji = (cat: Expense['category']) => {
    switch (cat) {
      case 'medical': return '🏥';
      case 'education': return '📚';
      case 'extracurricular': return '⚽';
      case 'clothing': return '👕';
      default: return '🛒';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Balance Summary Card */}
      <div className="balance-card">
        <span className="balance-header">Net Reimbursement Balance</span>
        <div className="balance-amounts">
          <span className={`balance-total ${netBalance > 0 ? 'positive' : netBalance < 0 ? 'negative' : 'neutral'}`}>
            {netBalance === 0 ? '$0.00' : `$${absNet.toFixed(2)}`}
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            {netBalance > 0 
              ? activeParent === 'sarah' ? `${parentNames.david} owes you` : `You owe ${parentNames.sarah}`
              : netBalance < 0
              ? activeParent === 'david' ? `${parentNames.sarah} owes you` : `You owe ${parentNames.david}`
              : 'All settled'
            }
          </span>
        </div>
        
        <div className="balance-breakdown">
          <div className="breakdown-item">
            {parentNames.sarah} is owed: <span style={{ color: 'var(--parent-a)' }}>${davidOwesSarah.toFixed(2)}</span>
          </div>
          <div className="breakdown-item">
            {parentNames.david} is owed: <span style={{ color: 'var(--parent-b)' }}>${sarahOwesDavid.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions and List Title */}
      <div className="events-section-header">
        <h3>Shared Child Expenses</h3>
        <button className="event-add-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={14} /> Log Expense
        </button>
      </div>

      {/* Expenses Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {expenses.map((expense) => {
          const isMyLogged = expense.loggedById === activeParent;
          const sarahCost = (expense.amount * expense.splitPercent) / 100;
          const davidCost = expense.amount - sarahCost;
          
          // Determine who owes what for this item
          const activeOwes = activeParent === 'sarah' ? sarahCost : davidCost;
          const otherOwes = activeParent === 'sarah' ? davidCost : sarahCost;
          
          return (
            <div key={expense.id} className="expense-item-card">
              <div className="expense-top">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div className="expense-category-icon">
                    <span style={{ fontSize: '1.2rem' }}>{getCategoryEmoji(expense.category)}</span>
                  </div>
                  <div>
                    <h4 className="expense-title">{expense.title}</h4>
                    <div className="expense-date-cat">
                      <span>{expense.date}</span>
                      <span style={{ margin: '0 6px' }}>•</span>
                      <span style={{ textTransform: 'capitalize' }}>{expense.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="expense-cost-split">
                  <div className="expense-amount">${expense.amount.toFixed(2)}</div>
                  <div className="expense-split-tag">
                    {parentNames.sarah} pays {expense.splitPercent}% / {parentNames.david} {100 - expense.splitPercent}%
                  </div>
                </div>
              </div>

              {expense.description && (
                <p style={{ margin: '0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {expense.description}
                </p>
              )}

              <div className="expense-mid">
                <span className={`expense-status-badge ${expense.status}`}>
                  {expense.status === 'paid' ? 'Paid / Settled' : 'Payment Outstanding'}
                </span>
                
                {expense.receiptUrl && (
                  <button className="receipt-attachment-btn" onClick={() => setSelectedReceipt(expense)}>
                    <Receipt size={12} /> View Receipt
                  </button>
                )}
              </div>

              {expense.status === 'unpaid' && (
                <div className="expense-actions">
                  {isMyLogged ? (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic', width: '100%', textAlign: 'center' }}>
                      Waiting for payment of ${otherOwes.toFixed(2)} from {activeParent === 'sarah' ? parentNames.david : parentNames.sarah}
                    </div>
                  ) : (
                    <button 
                      className="expense-action-btn pay"
                      onClick={() => handlePayExpense(expense)}
                    >
                      <Check size={14} /> Settle My Share (${activeOwes.toFixed(2)})
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {expenses.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px 0' }}>No logged child expenses yet</p>
        )}
      </div>

      {/* Log Expense Modal Sheet */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log Shared Child Expense</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>Close</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Expense Title / Item</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Asthma Inhaler, School Field Trip"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Total Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    className="form-input" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="medical">Medical / Pharmacy</option>
                    <option value="education">Education / Books</option>
                    <option value="extracurricular">Extracurriculars</option>
                    <option value="clothing">Clothing / Shoes</option>
                    <option value="other">Other / Groceries</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                  <label className="form-label">Reimbursement Split</label>
                  <span>{parentNames.sarah}: {splitPercent}% / {parentNames.david}: {100 - splitPercent}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  style={{ width: '100%', margin: '10px 0', accentColor: 'var(--primary)' }}
                  value={splitPercent}
                  onChange={(e) => setSplitPercent(parseInt(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  <span>{parentNames.sarah} pays all</span>
                  <span>50/50 Split</span>
                  <span>{parentNames.david} pays all</span>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Date Purchased</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Receipt Proof</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '40px' }}>
                    <input 
                      type="checkbox" 
                      id="receipt-chk" 
                      checked={hasReceipt} 
                      onChange={(e) => setHasReceipt(e.target.checked)} 
                    />
                    <label htmlFor="receipt-chk" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                      Attach Receipt (Simulate)
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Optional Description / Store</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Walgreens Pharmacy, Target Store"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              <button type="submit" className="form-submit-btn">
                Log Expense & Request Split
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Visualizer Dialog Modal Sheet */}
      {selectedReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '350px', margin: 'auto' }}>
            <div className="modal-header">
              <h3>Simulated Receipt</h3>
              <button className="modal-close-btn" onClick={() => setSelectedReceipt(null)}>Close</button>
            </div>
            
            {/* Styled Retail Receipt */}
            <div 
              style={{ 
                background: '#fafafa', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '24px 16px', 
                fontFamily: 'monospace', 
                color: '#1e293b',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)',
                fontSize: '0.8rem'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', textTransform: 'uppercase' }}>COPARENT COMMERCE</h4>
                <p style={{ margin: 0 }}>STORE #4829 - PHARMACY/RETAIL</p>
                <p style={{ margin: 0 }}>PH: 555-019-2831</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>DATE: {selectedReceipt.date}</span>
                <span>TIME: 14:32</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <span>TXN: {selectedReceipt.id.slice(-6)}</span>
              </div>

              <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>ITEM DESCRIPTION</span>
                  <span>AMT</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span>1. {selectedReceipt.title.toUpperCase()}</span>
                <span>${selectedReceipt.amount.toFixed(2)}</span>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <span>TOTAL:</span>
                <span>${selectedReceipt.amount.toFixed(2)}</span>
              </div>

              <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>VERIFIED RECORD</p>
                <p style={{ margin: 0 }}>COURT ADMISSIBLE PROOF</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '1.2rem' }}>👨‍👩‍👧‍👦</p>
              </div>
            </div>
            
            <button 
              className="form-submit-btn" 
              style={{ background: 'var(--primary)', marginTop: '16px' }}
              onClick={() => setSelectedReceipt(null)}
            >
              Done Viewing
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
