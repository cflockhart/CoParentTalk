import React, { useState, useEffect } from 'react';
import { User, Phone, Shield, GraduationCap, Shirt, Edit2, Plus, Check, X, Mail } from 'lucide-react';
import type { ChildProfile, ParentId } from '../types';

interface InfoBankTabProps {
  childrenProfiles: ChildProfile[];
  updateChildProfile: (profile: ChildProfile) => void;
  addChildProfile: (profile: ChildProfile) => void;
  approveChildProfile: (childId: string) => void;
  rejectChildProfile: (childId: string) => void;
  activeParent: ParentId;
  parentNames: { sarah: string; david: string };
}

export const InfoBankTab: React.FC<InfoBankTabProps> = ({ 
  childrenProfiles, 
  updateChildProfile,
  addChildProfile,
  approveChildProfile,
  rejectChildProfile,
  activeParent,
  parentNames
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenProfiles[0]?.id || '');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add child form state
  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthdate, setNewChildBirthdate] = useState('');

  // EmailJS settings state
  const [serviceId, setServiceId] = useState(() => localStorage.getItem('emailjs_service_id') || '');
  const [templateId, setTemplateId] = useState(() => localStorage.getItem('emailjs_template_id') || '');
  const [publicKey, setPublicKey] = useState(() => localStorage.getItem('emailjs_public_key') || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveEmailSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('emailjs_service_id', serviceId.trim());
    localStorage.setItem('emailjs_template_id', templateId.trim());
    localStorage.setItem('emailjs_public_key', publicKey.trim());
    setSaveStatus('Integration settings saved successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

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

  // Ensure a child is selected when list changes or child is added
  useEffect(() => {
    if (childrenProfiles.length > 0) {
      const exists = childrenProfiles.some(c => c.id === selectedChildId);
      if (!exists || !selectedChildId) {
        setSelectedChildId(childrenProfiles[0].id);
      }
    } else {
      setSelectedChildId('');
    }
  }, [childrenProfiles, selectedChildId]);

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

  const handleAddChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;

    const newChild: ChildProfile = {
      id: 'child-' + Date.now(),
      name: newChildName.trim(),
      birthdate: newChildBirthdate || new Date().toISOString().split('T')[0],
      clothingSizes: { shirt: '', pants: '', shoes: '' },
      insuranceInfo: { provider: '', policyNumber: '', groupNumber: '' },
      schoolInfo: { name: '', teacher: '', contact: '' },
      contacts: { pediatrician: '', dentist: '', emergency: '' },
      approvalStatus: 'pending',
      addedBy: activeParent
    };

    addChildProfile(newChild);
    setSelectedChildId(newChild.id);
    setNewChildName('');
    setNewChildBirthdate('');
    setShowAddModal(false);
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
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        background: 'var(--bg-card)', 
        padding: '6px', 
        borderRadius: '50px', 
        border: '1px solid var(--border-light)',
        alignItems: 'center',
        overflowX: 'auto',
        maxWidth: '100%'
      }}>
        {childrenProfiles.map(child => (
          <button
            key={child.id}
            onClick={() => setSelectedChildId(child.id)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: selectedChildId === child.id ? 'var(--primary)' : 'transparent',
              color: selectedChildId === child.id ? 'white' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {child.name}
            {child.approvalStatus === 'pending' && <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>⏳</span>}
          </button>
        ))}
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px dashed var(--primary)',
            color: 'var(--primary)',
            padding: '8px 16px',
            borderRadius: '50px',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Plus size={14} /> Add Child
        </button>
      </div>

      {activeChild ? (
        <div className="info-card-grid">
          
          {/* Pending Child Approval Banner */}
          {activeChild.approvalStatus === 'pending' && (
            <div style={{
              gridColumn: '1 / -1',
              background: activeChild.addedBy === activeParent ? 'rgba(59, 130, 246, 0.05)' : 'rgba(245, 158, 11, 0.05)',
              border: `1px solid ${activeChild.addedBy === activeParent ? 'var(--primary)' : 'var(--warning)'}`,
              borderRadius: 'var(--border-radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                  ⏳ Child Profile Pending Approval
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {activeChild.addedBy === activeParent ? (
                    `You added ${activeChild.name}. Awaiting review and approval from your co-parent (${activeParent === 'sarah' ? parentNames.david : parentNames.sarah}).`
                  ) : (
                    `${activeChild.addedBy === 'sarah' ? parentNames.sarah : parentNames.david} registered ${activeChild.name}'s profile. Under shared-parenting rules, please verify and approve these details.`
                  )}
                </p>
              </div>

              {activeChild.addedBy !== activeParent && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => approveChildProfile(activeChild.id)}
                    style={{
                      background: 'var(--success)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 'var(--border-radius-sm)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'background 0.2s'
                    }}
                  >
                    <Check size={14} /> Approve Details
                  </button>
                  <button
                    onClick={() => rejectChildProfile(activeChild.id)}
                    style={{
                      background: 'var(--danger)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 'var(--border-radius-sm)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'background 0.2s'
                    }}
                  >
                    <X size={14} /> Decline Profile
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Header Card with Child Overview */}
          <div className="info-item-card" style={{ background: 'linear-gradient(135deg, var(--primary-light), white)', borderColor: 'var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: 'Outfit', fontWeight: 700 }}>{activeChild.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Born: {activeChild.birthdate} (Age {calculateAge(activeChild.birthdate)})</p>
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

      {/* EmailJS Integration Settings */}
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-light)', 
          borderRadius: 'var(--border-radius-md)', 
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
          marginTop: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Mail size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontFamily: 'Outfit', fontWeight: 700 }}>📬 Real Email Alert Integration (EmailJS)</h3>
        </div>
        
        <p style={{ margin: '0 0 16px 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Connect your GMail/EmailJS account to send real email notifications to the co-parent when schedule events, messages, expenses, or check-ins are added. Setup a free account at <strong>emailjs.com</strong>.
        </p>

        {saveStatus && (
          <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', padding: '10px', borderRadius: 'var(--border-radius-sm)', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '14px' }}>
            ✅ {saveStatus}
          </div>
        )}

        <form onSubmit={handleSaveEmailSettings} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: 700 }}>EmailJS Service ID</label>
            <input 
              type="text" 
              className="form-input" 
              value={serviceId} 
              onChange={e => setServiceId(e.target.value)} 
              placeholder="e.g. service_xxxxxx"
            />
          </div>

          <div className="form-row-2">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: 700 }}>EmailJS Template ID</label>
              <input 
                type="text" 
                className="form-input" 
                value={templateId} 
                onChange={e => setTemplateId(e.target.value)} 
                placeholder="e.g. template_xxxxxx"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.7rem', fontWeight: 700 }}>EmailJS Public Key</label>
              <input 
                type="text" 
                className="form-input" 
                value={publicKey} 
                onChange={e => setPublicKey(e.target.value)} 
                placeholder="e.g. user_xxxxxxxxxxxxxx"
              />
            </div>
          </div>

          <div style={{ background: 'rgba(2, 132, 199, 0.04)', border: '1px solid rgba(2, 132, 199, 0.1)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
            <strong>EmailJS Template Configuration Guide:</strong> In your template settings, set the recipient to <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 3px', borderRadius: '3px', margin: '0 2px', fontFamily: 'monospace' }}>{"{{to_email}}"}</code> and subject to <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 3px', borderRadius: '3px', margin: '0 2px', fontFamily: 'monospace' }}>{"{{subject}}"}</code>. Your HTML body should contain variables matching exactly: 
            <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 3px', borderRadius: '3px', margin: '0 2px', fontFamily: 'monospace' }}>{"{{name}}"}</code> (sender name), 
            <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 3px', borderRadius: '3px', margin: '0 2px', fontFamily: 'monospace' }}>{"{{time}}"}</code> (date/time), and 
            <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 3px', borderRadius: '3px', margin: '0 2px', fontFamily: 'monospace' }}>{"{{message}}"}</code> (detailed notification body).
          </div>

          <button 
            type="submit" 
            className="form-submit-btn" 
            style={{ 
              margin: 0, 
              background: serviceId && templateId && publicKey ? 'var(--primary)' : 'rgba(59, 130, 246, 0.1)',
              color: serviceId && templateId && publicKey ? 'white' : 'var(--text-secondary)',
              border: serviceId && templateId && publicKey ? 'none' : '1px solid var(--border-light)'
            }}
          >
            Save EmailJS Credentials
          </button>
        </form>
      </div>

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

      {/* Add Child Modal Sheet */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Child Profile</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>Close</button>
            </div>
            
            <form onSubmit={handleAddChildSubmit}>
              <div className="form-group">
                <label className="form-label">Child's Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newChildName} 
                  onChange={e => setNewChildName(e.target.value)} 
                  placeholder="e.g. Liam"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Child's Birthdate</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={newChildBirthdate} 
                  onChange={e => setNewChildBirthdate(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ marginTop: '12px', background: 'rgba(2, 132, 199, 0.05)', border: '1px solid rgba(2, 132, 199, 0.2)', padding: '12px', borderRadius: 'var(--border-radius-sm)' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong>Note:</strong> Under parenting agreement policies, new child profiles start as <strong>Pending Approval</strong>. Your co-parent will be notified to review and approve the child's details.
                </p>
              </div>

              <button type="submit" className="form-submit-btn" style={{ marginTop: '16px' }}>
                Add Child Profile
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
