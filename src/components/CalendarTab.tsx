import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, AlertTriangle } from 'lucide-react';
import type { CalendarEvent, ParentId } from '../types';

interface CalendarTabProps {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  activeParent: ParentId;
  parentNames: { sarah: string; david: string };
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ events, addEvent, updateEvent, activeParent, parentNames }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 4, 1)); // Start on May 2026 for demonstration stability
  const [selectedDate, setSelectedDate] = useState<string>('2026-05-15');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'appointment' | 'school' | 'medical' | 'other' | 'custody'>('appointment');
  const [newEventParent, setNewEventParent] = useState<ParentId | 'both'>('both');
  const [newTime, setNewTime] = useState('10:00');
  const [newDesc, setNewDesc] = useState('');
  const [isSwapRequest, setIsSwapRequest] = useState(false);


  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Helper to determine custody parent for a date
  // Standard custody: Alternating weeks or 2-2-5-5. Let's make a clear, predictable algorithm:
  // Sarah (Parent A) has Mon, Tue. David (Parent B) has Wed, Thu. Alternating Fri, Sat, Sun.
  const getCustodyParent = (dateString: string): ParentId => {
    // Check if there is an approved swap request overriding this date
    const approvedSwap = events.find(e => 
      e.date === dateString && 
      e.type === 'custody' && 
      e.swapRequest?.status === 'approved'
    );
    if (approvedSwap) {
      return approvedSwap.parent as ParentId;
    }

    const date = new Date(dateString + 'T12:00:00');
    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ...
    
    // Sarah: Mon, Tue
    if (dayOfWeek === 1 || dayOfWeek === 2) return 'sarah';
    // David: Wed, Thu
    if (dayOfWeek === 3 || dayOfWeek === 4) return 'david';
    
    // Fri, Sat, Sun alternates based on the week number of the year
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
    
    return weekNumber % 2 === 0 ? 'sarah' : 'david';
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month buffer days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const prevMonthDate = new Date(year, month - 1, d);
    const yStr = prevMonthDate.getFullYear();
    const mStr = (prevMonthDate.getMonth() + 1).toString().padStart(2, '0');
    const dStr = d.toString().padStart(2, '0');
    days.push({
      dateStr: `${yStr}-${mStr}-${dStr}`,
      dayNum: d,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const mStr = (month + 1).toString().padStart(2, '0');
    const dStr = i.toString().padStart(2, '0');
    days.push({
      dateStr: `${year}-${mStr}-${dStr}`,
      dayNum: i,
      isCurrentMonth: true
    });
  }

  // Next month buffer days to fill a 6-week grid (42 days)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    const yStr = nextMonthDate.getFullYear();
    const mStr = (nextMonthDate.getMonth() + 1).toString().padStart(2, '0');
    const dStr = i.toString().padStart(2, '0');
    days.push({
      dateStr: `${yStr}-${mStr}-${dStr}`,
      dayNum: i,
      isCurrentMonth: false
    });
  }

  // Filter events for selected date
  const selectedDateEvents = events.filter(e => e.date === selectedDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (isSwapRequest) {
      const targetParent: ParentId = activeParent === 'sarah' ? 'david' : 'sarah';
      const event: CalendarEvent = {
        id: Date.now().toString(),
        title: `Swap Request: ${newTitle}`,
        date: selectedDate,
        time: newTime,
        parent: activeParent, // Current parent owns the custody for now
        type: 'custody',
        description: `Swap custody request for this date. Sent by ${activeParent === 'sarah' ? parentNames.sarah : parentNames.david}.`,
        swapRequest: {
          id: Date.now().toString(),
          requestedParent: targetParent,
          status: 'pending',
          originalParent: activeParent
        }
      };
      addEvent(event);
    } else {
      const event: CalendarEvent = {
        id: Date.now().toString(),
        title: newTitle,
        date: selectedDate,
        time: newTime,
        parent: newEventParent,
        type: newType,
        description: newDesc
      };
      addEvent(event);
    }

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setIsSwapRequest(false);
    setShowAddModal(false);
  };

  const handleSwapAction = (event: CalendarEvent, status: 'approved' | 'declined') => {
    if (!event.swapRequest) return;
    
    // Create copy with updated swap state
    const updated: CalendarEvent = {
      ...event,
      title: status === 'approved' ? `Custody Swap Approved (${event.swapRequest.originalParent === 'sarah' ? parentNames.sarah : parentNames.david} ➔ ${event.swapRequest.requestedParent === 'sarah' ? parentNames.sarah : parentNames.david})` : 'Custody Swap Declined',
      parent: status === 'approved' ? event.swapRequest.requestedParent : event.swapRequest.originalParent, // Shift custody
      swapRequest: {
        ...event.swapRequest,
        status: status
      }
    };
    updateEvent(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Monthly Calendar Grid */}
      <div className="calendar-container">
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={prevMonth} aria-label="Previous Month">
            <ChevronLeft size={20} />
          </button>
          <h3>{monthNames[month]} {year}</h3>
          <button className="calendar-nav-btn" onClick={nextMonth} aria-label="Next Month">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="weekdays-grid">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        <div className="days-grid">
          {days.map((day, idx) => {
            const custody = getCustodyParent(day.dateStr);
            const isSelected = selectedDate === day.dateStr;
            const isCurrentToday = new Date().toISOString().split('T')[0] === day.dateStr;
            
            // Events for this specific day
            const dayEvents = events.filter(e => e.date === day.dateStr);

            return (
              <div
                key={idx}
                className={`day-cell 
                  ${!day.isCurrentMonth ? 'other-month' : ''} 
                  ${isCurrentToday ? 'today' : ''}
                  ${custody === 'sarah' ? 'sarah-parenting' : 'david-parenting'}
                `}
                style={{
                  border: isSelected ? '2px solid var(--primary)' : undefined,
                  boxShadow: isSelected ? 'inset 0 0 4px var(--primary-glow)' : undefined
                }}
                onClick={() => setSelectedDate(day.dateStr)}
              >
                <span className="day-cell-num">{day.dayNum}</span>
                
                {/* Visual custody bottom indicator */}
                <div className={`day-custody-strip ${custody}`} />

                {/* Day events bullets */}
                {dayEvents.length > 0 && (
                  <div className="day-events-dots">
                    {dayEvents.slice(0, 3).map((e, eidx) => (
                      <span 
                        key={eidx} 
                        className={`event-dot 
                          ${e.type === 'medical' ? 'medical' : e.type === 'school' ? 'school' : e.parent === 'sarah' ? 'parent-a' : 'parent-b'}
                        `} 
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda List */}
      <div className="events-section-header">
        <h3>Schedule for {new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</h3>
        <button className="event-add-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={14} /> Add Event
        </button>
      </div>

      <div className="events-list">
        {/* Custody summary card */}
        <div className="event-item-card">
          <div className="event-item-time">All Day</div>
          <div className="event-item-info">
            <h4 className="event-item-title">Custody: {getCustodyParent(selectedDate) === 'sarah' ? parentNames.sarah : parentNames.david}</h4>
            <p className="event-item-desc">Regular parenting schedule</p>
          </div>
          <div className={`event-item-indicator ${getCustodyParent(selectedDate)}`} />
        </div>

        {/* Dynamic events */}
        {selectedDateEvents.map((event) => (
          <div key={event.id} className="event-item-card">
            <div className="event-item-time">{event.time || 'All Day'}</div>
            <div className="event-item-info">
              <h4 className="event-item-title">{event.title}</h4>
              {event.description && <p className="event-item-desc">{event.description}</p>}
              
              {/* Swap request check */}
              {event.swapRequest && event.swapRequest.status === 'pending' && (
                <div className="swap-request-box">
                  <div className="swap-request-header">
                    <AlertTriangle size={14} />
                    <span>Swap Request Pending Decision</span>
                  </div>
                  {event.swapRequest.requestedParent === activeParent ? (
                    <div>
                      <p style={{ margin: '0 0 6px 0' }}>Can you take parenting time on this day?</p>
                      <div className="swap-btns">
                        <button className="swap-action-btn approve" onClick={() => handleSwapAction(event, 'approved')}>
                          Approve Swap
                        </button>
                        <button className="swap-action-btn decline" onClick={() => handleSwapAction(event, 'declined')}>
                          Decline
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.8 }}>Waiting for response from {event.swapRequest.requestedParent === 'sarah' ? parentNames.sarah : parentNames.david}</p>
                  )}
                </div>
              )}
            </div>
            <div className={`event-item-indicator ${event.type === 'medical' ? 'medical' : event.type === 'school' ? 'school' : event.parent}`} />
          </div>
        ))}

        {selectedDateEvents.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '10px 0' }}>No separate schedule events for this day</p>
        )}
      </div>

      {/* Add Event Modal Sheet */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Event on {selectedDate}</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>Close</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ flexDirection: 'row', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
                <input 
                  type="checkbox" 
                  id="swap-chk" 
                  checked={isSwapRequest} 
                  onChange={(e) => setIsSwapRequest(e.target.checked)} 
                />
                <label htmlFor="swap-chk" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                  Request Custody Swap (Trade Day)
                </label>
              </div>

              {!isSwapRequest ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Event Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Pediatric Dentist, Soccer Match"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Event Category</label>
                      <select 
                        className="form-input"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                      >
                        <option value="appointment">Appointment</option>
                        <option value="school">School / Class</option>
                        <option value="medical">Medical / Health</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Parent Responsible</label>
                      <select 
                        className="form-input"
                        value={newEventParent}
                        onChange={(e) => setNewEventParent(e.target.value as any)}
                      >
                        <option value="both">Both Parents</option>
                        <option value="sarah">{parentNames.sarah}</option>
                        <option value="david">{parentNames.david}</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label className="form-label">Swap Reason / Note</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Work travel, Family wedding"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    This will send a request to {activeParent === 'sarah' ? parentNames.david : parentNames.sarah} to trade custody for this day.
                  </p>
                </div>
              )}

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input 
                    type="time" 
                    className="form-input"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date Selected</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    disabled
                  />
                </div>
              </div>

              {!isSwapRequest && (
                <div className="form-group">
                  <label className="form-label">Description / Location</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Add details, address, or phone number"
                    style={{ height: '60px', resize: 'none' }}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
              )}

              <button type="submit" className="form-submit-btn">
                {isSwapRequest ? 'Send Custody Swap Request' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
