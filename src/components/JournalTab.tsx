import React, { useState } from 'react';
import { Plus, MapPin, Camera, Compass } from 'lucide-react';
import type { JournalEntry, ParentId } from '../types';

interface JournalTabProps {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => void;
  activeParent: ParentId;
  parentNames: { sarah: string; david: string };
}

export const JournalTab: React.FC<JournalTabProps> = ({ entries, addEntry, activeParent, parentNames }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // New Journal Entry Form State
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [photoMocked, setPhotoMocked] = useState(false);

  const simulateGpsCheckIn = () => {
    // Generate typical custody swap coordinates
    const locations = [
      { lat: 34.0522, lng: -118.2437, addr: 'Central Police Station Exchange Zone, Los Angeles' },
      { lat: 40.7128, lng: -74.0060, addr: 'Public Library Custody Safety Drop-off, New York' },
      { lat: 41.8781, lng: -87.6298, addr: 'Target Center Plaza Transfer Area, Chicago' },
      { lat: 29.7604, lng: -95.3698, addr: 'Walgreens Parking Lot Safe Exchange Node, Houston' }
    ];
    
    // Choose one at random
    const selected = locations[Math.floor(Math.random() * locations.length)];
    
    setGpsLocation({
      latitude: selected.lat,
      longitude: selected.lng,
      address: selected.addr
    });
    setIsCheckedIn(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !note.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      loggedById: activeParent,
      title,
      note,
      isCheckedIn: isCheckedIn,
      location: gpsLocation || undefined,
      photoUrl: photoMocked ? 'exchange_photo.jpg' : undefined
    };

    addEntry(newEntry);

    // Reset Form State
    setTitle('');
    setNote('');
    setIsCheckedIn(false);
    setGpsLocation(null);
    setPhotoMocked(false);
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Check-in explanation card */}
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-light)', 
          borderRadius: 'var(--border-radius-md)', 
          padding: '16px', 
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ padding: '8px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '50%' }}>
            <Compass size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontFamily: 'Outfit' }}>GPS Custody Check-in</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Log your arrival at transfer exchanges to prevent custody delays disputes.</p>
          </div>
        </div>
      </div>

      {/* Title block */}
      <div className="events-section-header">
        <h3>Journal & Swap Check-ins</h3>
        <button className="event-add-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={14} /> Log Check-in / Note
        </button>
      </div>

      {/* Journal entries stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {entries.map((entry) => {
          const loggedByLabel = entry.loggedById === 'sarah' ? parentNames.sarah : parentNames.david;
          
          return (
            <div key={entry.id} className="journal-item-card">
              <div className="journal-top">
                <h4 className="journal-title">{entry.title}</h4>
                <span className="journal-date">{entry.date}</span>
              </div>
              
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                Logged by {loggedByLabel} at {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              <p className="journal-note">{entry.note}</p>

              {entry.isCheckedIn && entry.location && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <div className="gps-badge">
                    <MapPin size={12} />
                    <span>GPS Verified: {entry.location.latitude.toFixed(4)}, {entry.location.longitude.toFixed(4)}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500, paddingLeft: '4px' }}>
                    Address: {entry.location.address}
                  </div>
                  
                  {/* Bouncing Map Simulation */}
                  <div className="simulated-map">
                    <div className="map-bg-lines" />
                    <MapPin className="map-marker" size={24} fill="currentColor" />
                    <span style={{ position: 'absolute', bottom: '6px', right: '8px', fontSize: '0.6rem', background: 'rgba(255,255,255,0.8)', padding: '2px 4px', borderRadius: '4px', color: '#64748b' }}>
                      Satellite Lock Active
                    </span>
                  </div>
                </div>
              )}

              {entry.photoUrl && (
                <div 
                  style={{ 
                    marginTop: '12px', 
                    borderRadius: 'var(--border-radius-sm)', 
                    overflow: 'hidden', 
                    border: '1px solid var(--border-light)',
                    height: '120px',
                    position: 'relative',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Camera size={32} style={{ opacity: 0.3 }} />
                  <span style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '0.65rem', color: 'white', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '50px' }}>
                    📷 Exchange Handover Photo Attached
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {entries.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px 0' }}>No journal or check-in logs recorded yet</p>
        )}
      </div>

      {/* Log Entry Modal Sheet */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Journal Entry</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>Close</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Entry Subject / Event</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Custody Transfer, Kindergarten pickup note"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Note Description</label>
                <textarea 
                  className="form-input" 
                  placeholder="Log specific detail (e.g., child was picked up on time, details of clothing swap, mood notes)"
                  style={{ height: '80px', resize: 'none' }}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  required
                />
              </div>

              {/* GPS Check in component */}
              <div 
                style={{ 
                  border: '1px solid var(--border-light)', 
                  borderRadius: 'var(--border-radius-sm)', 
                  padding: '12px',
                  background: 'var(--bg-app)',
                  marginBottom: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="form-label">GPS Timestamp verification</span>
                  <span className={`gps-badge ${isCheckedIn ? 'success' : ''}`} style={{ background: isCheckedIn ? 'var(--success-bg)' : 'var(--border-light)', color: isCheckedIn ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {isCheckedIn ? 'GPS Logged' : 'Not Shared'}
                  </span>
                </div>
                
                {isCheckedIn && gpsLocation ? (
                  <div style={{ fontSize: '0.75rem' }}>
                    <p style={{ margin: '0 0 4px 0' }}><strong>Lock Location:</strong> {gpsLocation.address}</p>
                    <p style={{ margin: 0, opacity: 0.8 }}>Coord: {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}</p>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="expense-action-btn pay" 
                    style={{ background: 'var(--primary)', width: '100%', margin: 0 }}
                    onClick={simulateGpsCheckIn}
                  >
                    <MapPin size={14} /> Stamp Current GPS Location
                  </button>
                )}
              </div>

              {/* Photo Attach Mock */}
              <div className="form-group">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    id="photo-chk" 
                    checked={photoMocked} 
                    onChange={(e) => setPhotoMocked(e.target.checked)} 
                  />
                  <label htmlFor="photo-chk" className="form-label" style={{ margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Camera size={14} /> Attach Mock Handover Photo
                  </label>
                </div>
              </div>

              <button type="submit" className="form-submit-btn">
                Log Private Journal Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
