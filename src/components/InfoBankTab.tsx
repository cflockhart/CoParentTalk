import React, { useState } from 'react';
import { User, Phone, Shield, GraduationCap, Shirt, Edit2 } from 'lucide-react';
import type { ChildProfile, ParentId } from '../types';

interface InfoBankTabProps {
  childrenProfiles: ChildProfile[];
  updateChildProfile: (profile: ChildProfile) => void;
  activeParent: ParentId;
}

export const InfoBankTab: React.FC<InfoBankTabProps> = ({ childrenProfiles, updateChildProfile }) => {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenProfiles[0]?.id || '');
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [editShirt, setEditShirt] = useState('');
  const [editPants, setEditPants] = useState('');
  const [editShoes, setEditShoes] = useState('');
  
  const [editInsProvider, setEditInsProvider] = useState('');
  const [editInsPolicy, setEditInsPolicy] = useState('');
  const [editInsGroup, setEditInsGroup] = useState('');

  const [editSchName, setEditSchName] = useState('');
  const [editSchTeacher, setEditSchTeacher] = useState('');
  const [editSchContact, setEditSchContact] = useState('');

  const [editPediatrician, setEditPediatrician] = useState('');
  const [editDentist, setEditDentist] = useState('');
  const [editEmergency, setEditEmergency] = useState('');

  const activeChild = childrenProfiles.find(c => c.id === selectedChildId);

  const handleOpenEdit = () => {
    if (!activeChild) return;
    
    setEditShirt(activeChild.clothingSizes.shirt);
    setEditPants(activeChild.clothingSizes.pants);
    setEditShoes(activeChild.clothingSizes.shoes);

    setEditInsProvider(activeChild.insuranceInfo.provider);
    setEditInsPolicy(activeChild.insuranceInfo.policyNumber);
    setEditInsGroup(activeChild.insuranceInfo.groupNumber);

    setEditSchName(activeChild.schoolInfo.name);
    setEditSchTeacher(activeChild.schoolInfo.teacher);
    setEditSchContact(activeChild.schoolInfo.contact);

    setEditPediatrician(activeChild.contacts.pediatrician);
    setEditDentist(activeChild.contacts.dentist);
    setEditEmergency(activeChild.contacts.emergency);

    setShowEditModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChild) return;

    const updated: ChildProfile = {
      ...activeChild,
      clothingSizes: {
        shirt: editShirt,
        pants: editPants,
        shoes: editShoes
      },
      insuranceInfo: {
        provider: editInsProvider,
        policyNumber: editInsPolicy,
        groupNumber: editInsGroup
      },
      schoolInfo: {
        name: editSchName,
        teacher: editSchTeacher,
        contact: editSchContact
      },
      contacts: {
        pediatrician: editPediatrician,
        dentist: editDentist,
        emergency: editEmergency
      }
    };

    updateChildProfile(updated);
    setShowEditModal(false);
  };

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Children switch pills */}
      <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '6px', borderRadius: '50px', border: '1px solid var(--border-light)' }}>
        {childrenProfiles.map(child => (
          <button
            key={child.id}
            onClick={() => setSelectedChildId(child.id)}
            style={{
              flex: 1,
              border: 'none',
              padding: '8px 12px',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: selectedChildId === child.id ? 'var(--primary)' : 'transparent',
              color: selectedChildId === child.id ? 'white' : 'var(--text-secondary)'
            }}
          >
            {child.name} (Age {calculateAge(child.birthdate)})
          </button>
        ))}
      </div>

      {activeChild ? (
        <div className="info-card-grid">
          
          {/* Header Card with Child Overview */}
          <div className="info-item-card" style={{ background: 'linear-gradient(135deg, var(--primary-light), white)', borderColor: 'var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: 'Outfit', fontWeight: 700 }}>{activeChild.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Born: {activeChild.birthdate}</p>
                </div>
              </div>
              <button 
                onClick={handleOpenEdit}
                style={{ 
                  background: 'white', 
                  border: '1px solid var(--border-light)', 
                  padding: '6px', 
                  borderRadius: '50%', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
                aria-label="Edit Child Profile"
              >
                <Edit2 size={14} className="text-primary" />
              </button>
            </div>
          </div>

          {/* Clothing & Sizes Card */}
          <div className="info-item-card">
            <div className="info-item-header">
              <Shirt size={16} className="text-muted" style={{ color: 'var(--primary)' }} />
              <h4 className="info-item-title">Clothing & Shoe Sizes</h4>
            </div>
            <div className="info-detail-row">
              <span className="info-detail-label">Shirt Size</span>
              <span className="info-detail-val">{activeChild.clothingSizes.shirt || 'Not Set'}</span>
            </div>
            <div className="info-detail-row">
              <span className="info-detail-label">Pants Size</span>
              <span className="info-detail-val">{activeChild.clothingSizes.pants || 'Not Set'}</span>
            </div>
            <div className="info-detail-row">
              <span className="info-detail-label">Shoes Size</span>
              <span className="info-detail-val">{activeChild.clothingSizes.shoes || 'Not Set'}</span>
            </div>
          </div>

          {/* Insurance Card */}
          <div className="info-item-card">
            <div className="info-item-header">
              <Shield size={16} className="text-muted" style={{ color: 'var(--primary)' }} />
              <h4 className="info-item-title">Medical Insurance Policy</h4>
            </div>
            <div className="info-detail-row">
              <span className="info-detail-label">Provider</span>
              <span className="info-detail-val">{activeChild.insuranceInfo.provider || 'Not Set'}</span>
            </div>
            <div className="info-detail-row">
              <span className="info-detail-label">Policy Number</span>
              <span className="info-detail-val">{activeChild.insuranceInfo.policyNumber || 'Not Set'}</span>
            </div>
            <div className="info-detail-row">
              <span className="info-detail-label">Group Number</span>
              <span className="info-detail-val">{activeChild.insuranceInfo.groupNumber || 'Not Set'}</span>
            </div>
          </div>

          {/* School details Card */}
          <div className="info-item-card">
            <div className="info-item-header">
              <GraduationCap size={16} className="text-muted" style={{ color: 'var(--primary)' }} />
              <h4 className="info-item-title">School Enrollment</h4>
            </div>
            <div className="info-detail-row">
              <span className="info-detail-label">School Name</span>
              <span className="info-detail-val">{activeChild.schoolInfo.name || 'Not Set'}</span>
            </div>
            <div className="info-detail-row">
              <span className="info-detail-label">Primary Teacher</span>
              <span className="info-detail-val">{activeChild.schoolInfo.teacher || 'Not Set'}</span>
            </div>
            <div className="info-detail-row">
              <span className="info-detail-label">Office Contact</span>
              <span className="info-detail-val">{activeChild.schoolInfo.contact || 'Not Set'}</span>
            </div>
          </div>

          {/* Key Contacts Card */}
          <div className="info-item-card">
            <div className="info-item-header">
              <Phone size={16} className="text-muted" style={{ color: 'var(--primary)' }} />
              <h4 className="info-item-title">Medical & Emergency Contacts</h4>
            </div>
            <div className="info-detail-row">
              <span className="info-detail-label">Pediatrician</span>
              <span className="info-detail-val">{activeChild.contacts.pediatrician || 'Not Set'}</span>
            </div>
            <div className="info-detail-row">
              <span className="info-detail-label">Primary Dentist</span>
              <span className="info-detail-val">{activeChild.contacts.dentist || 'Not Set'}</span>
            </div>
            <div className="info-detail-row">
              <span className="info-detail-label">Emergency Contact</span>
              <span className="info-detail-val" style={{ color: 'var(--danger)' }}>{activeChild.contacts.emergency || 'Not Set'}</span>
            </div>
          </div>

        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No child profiles found.</p>
      )}

      {/* Edit Child Info Modal Sheet */}
      {showEditModal && activeChild && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit {activeChild.name}'s Profile</h3>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>Close</button>
            </div>
            
            <form onSubmit={handleSave}>
              
              {/* Section: Sizes */}
              <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px', fontSize: '0.8rem', color: 'var(--primary)' }}>Sizes</h4>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Shirt Size</label>
                  <input type="text" className="form-input" value={editShirt} onChange={e => setEditShirt(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pants Size</label>
                  <input type="text" className="form-input" value={editPants} onChange={e => setEditPants(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Shoes Size</label>
                <input type="text" className="form-input" value={editShoes} onChange={e => setEditShoes(e.target.value)} />
              </div>

              {/* Section: Medical Insurance */}
              <h4 style={{ margin: '14px 0 10px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px', fontSize: '0.8rem', color: 'var(--primary)' }}>Medical Insurance</h4>
              <div className="form-group">
                <label className="form-label">Insurance Provider</label>
                <input type="text" className="form-input" value={editInsProvider} onChange={e => setEditInsProvider(e.target.value)} />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Policy Number</label>
                  <input type="text" className="form-input" value={editInsPolicy} onChange={e => setEditInsPolicy(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Group Number</label>
                  <input type="text" className="form-input" value={editInsGroup} onChange={e => setEditInsGroup(e.target.value)} />
                </div>
              </div>

              {/* Section: School info */}
              <h4 style={{ margin: '14px 0 10px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px', fontSize: '0.8rem', color: 'var(--primary)' }}>School Enrollment</h4>
              <div className="form-group">
                <label className="form-label">School Name</label>
                <input type="text" className="form-input" value={editSchName} onChange={e => setEditSchName(e.target.value)} />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Primary Teacher</label>
                  <input type="text" className="form-input" value={editSchTeacher} onChange={e => setEditSchTeacher(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Office Contact</label>
                  <input type="text" className="form-input" value={editSchContact} onChange={e => setEditSchContact(e.target.value)} />
                </div>
              </div>

              {/* Section: Contacts */}
              <h4 style={{ margin: '14px 0 10px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px', fontSize: '0.8rem', color: 'var(--primary)' }}>Contacts</h4>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Pediatrician</label>
                  <input type="text" className="form-input" value={editPediatrician} onChange={e => setEditPediatrician(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Primary Dentist</label>
                  <input type="text" className="form-input" value={editDentist} onChange={e => setEditDentist(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact Phone</label>
                <input type="text" className="form-input" value={editEmergency} onChange={e => setEditEmergency(e.target.value)} />
              </div>

              <button type="submit" className="form-submit-btn">
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
