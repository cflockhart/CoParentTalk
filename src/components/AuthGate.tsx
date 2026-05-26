import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Users, Shield, ArrowRight, Sparkles } from 'lucide-react';
import type { ParentId } from '../types';

interface AuthGateProps {
  onLoginSuccess: (session: { name: string; email: string; role: ParentId; familyId: string }) => void;
}

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

export const AuthGate: React.FC<AuthGateProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [coParentEmail, setCoParentEmail] = useState('');
  const [coParentName, setCoParentName] = useState('');
  const [inviteCoParent, setInviteCoParent] = useState(false);

  // Invitation Mode State
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [targetInvite, setTargetInvite] = useState<Invitation | null>(null);
  const [targetFamily, setTargetFamily] = useState<Family | null>(null);

  // Errors / Success Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [simulatedOutbox, setSimulatedOutbox] = useState<{
    to: string;
    toName: string;
    subject: string;
    body: string;
    link: string;
  } | null>(null);

  // Parse invite code from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('inviteCode');
    if (code) {
      setInviteCode(code);
      // Fetch invitation from localStorage
      const invitations: Invitation[] = JSON.parse(localStorage.getItem('coparent_invitations') || '[]');
      const invite = invitations.find(i => i.id === code && i.status === 'pending');
      
      if (invite) {
        setTargetInvite(invite);
        setEmail(invite.inviteeEmail);
        setName(invite.inviteeName);
        setActiveTab('signup'); // Go straight to register

        // Find the family
        const families: Family[] = JSON.parse(localStorage.getItem('coparent_families') || '[]');
        const fam = families.find(f => f.id === invite.familyId);
        if (fam) {
          setTargetFamily(fam);
        }
      } else {
        setErrorMsg('The invitation link is invalid or has already been used.');
      }
    }
  }, []);

  // Initialize Demo Database in localStorage if empty
  useEffect(() => {
    if (!localStorage.getItem('coparent_users')) {
      const demoUsers = [
        { email: 'sarah@example.com', password: 'password', name: 'Sarah', familyId: 'demo-family', role: 'sarah' },
        { email: 'david@example.com', password: 'password', name: 'David', familyId: 'demo-family', role: 'david' }
      ];
      localStorage.setItem('coparent_users', JSON.stringify(demoUsers));
    }
    if (!localStorage.getItem('coparent_families')) {
      const demoFamilies: Family[] = [
        {
          id: 'demo-family',
          name: 'Demo Family',
          parentA: { name: 'Sarah', email: 'sarah@example.com', registered: true },
          parentB: { name: 'David', email: 'david@example.com', registered: true }
        }
      ];
      localStorage.setItem('coparent_families', JSON.stringify(demoFamilies));
    }
  }, []);

  const handleDemoBypass = (role: 'sarah' | 'david') => {
    const emailMap = {
      sarah: 'sarah@example.com',
      david: 'david@example.com'
    };
    onLoginSuccess({
      name: role === 'sarah' ? 'Sarah' : 'David',
      email: emailMap[role],
      role,
      familyId: 'demo-family'
    });
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const users = JSON.parse(localStorage.getItem('coparent_users') || '[]');
    const families: Family[] = JSON.parse(localStorage.getItem('coparent_families') || '[]');

    if (activeTab === 'login') {
      // LOGIN LOGIC
      if (!email.trim() || !password) {
        setErrorMsg('Please enter both email and password.');
        return;
      }

      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!user) {
        setErrorMsg('Invalid email or password.');
        return;
      }

      onLoginSuccess({
        name: user.name,
        email: user.email,
        role: user.role,
        familyId: user.familyId
      });
    } else {
      // SIGN UP / REGISTER LOGIC
      if (!name.trim() || !email.trim() || !password) {
        setErrorMsg('Please fill in name, email, and password.');
        return;
      }

      // Check if email already registered
      const userExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        setErrorMsg('Email address already registered.');
        return;
      }

      if (inviteCode && targetInvite && targetFamily) {
        // ACCEPTING INVITATION LOGIC
        // 1. Create User as Parent B role
        const newUser = {
          email: email.toLowerCase(),
          password,
          name,
          familyId: targetFamily.id,
          role: 'david' as ParentId // Invited co-parent is Parent B
        };
        users.push(newUser);
        localStorage.setItem('coparent_users', JSON.stringify(users));

        // 2. Mark Parent B registered in Family
        const updatedFamilies = families.map(f => {
          if (f.id === targetFamily.id) {
            return {
              ...f,
              parentB: {
                name,
                email: email.toLowerCase(),
                registered: true
              }
            };
          }
          return f;
        });
        localStorage.setItem('coparent_families', JSON.stringify(updatedFamilies));

        // 3. Mark Invite as Accepted
        const invites: Invitation[] = JSON.parse(localStorage.getItem('coparent_invitations') || '[]');
        const updatedInvites = invites.map(i => i.id === targetInvite.id ? { ...i, status: 'accepted' as const } : i);
        localStorage.setItem('coparent_invitations', JSON.stringify(updatedInvites));

        // Clear query parameters
        window.history.replaceState({}, document.title, window.location.pathname);

        setSuccessMsg('Account created successfully! Welcome to the family workspace.');
        setTimeout(() => {
          onLoginSuccess({
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            familyId: newUser.familyId
          });
        }, 1500);
      } else {
        // REGISTERING NEW FAMILY LOGIC
        if (!familyName.trim()) {
          setErrorMsg('Please enter a Family Name (e.g. Smith Family).');
          return;
        }

        const newFamilyId = 'fam-' + Date.now();
        
        // 1. Create Family
        const newFamily: Family = {
          id: newFamilyId,
          name: familyName,
          parentA: {
            name,
            email: email.toLowerCase(),
            registered: true
          }
        };

        // 2. Create User as Parent A
        const newUser = {
          email: email.toLowerCase(),
          password,
          name,
          familyId: newFamilyId,
          role: 'sarah' as ParentId // Creator co-parent is Parent A
        };

        // 3. Set Co-parent profile if inviting
        let generatedLink = '';
        if (inviteCoParent && coParentEmail.trim() && coParentName.trim()) {
          if (coParentEmail.toLowerCase() === email.toLowerCase()) {
            setErrorMsg("You cannot invite yourself as the co-parent.");
            return;
          }

          newFamily.parentB = {
            name: coParentName,
            email: coParentEmail.toLowerCase(),
            registered: false
          };

          // Generate simulated invitation
          const newInviteId = 'inv-' + Math.random().toString(36).substring(2, 9);
          const newInvite: Invitation = {
            id: newInviteId,
            familyId: newFamilyId,
            inviterEmail: email.toLowerCase(),
            inviteeEmail: coParentEmail.toLowerCase(),
            inviteeName: coParentName,
            status: 'pending'
          };

          const invitations = JSON.parse(localStorage.getItem('coparent_invitations') || '[]');
          invitations.push(newInvite);
          localStorage.setItem('coparent_invitations', JSON.stringify(invitations));

          const origin = window.location.origin + window.location.pathname;
          generatedLink = `${origin}?inviteCode=${newInviteId}`;
        }

        // Write users and families to localStorage
        users.push(newUser);
        localStorage.setItem('coparent_users', JSON.stringify(users));

        families.push(newFamily);
        localStorage.setItem('coparent_families', JSON.stringify(families));

        if (generatedLink) {
          // Show simulated email overlay before entering dashboard
          setSimulatedOutbox({
            to: coParentEmail.toLowerCase(),
            toName: coParentName,
            subject: `${name} invited you to CoParent Talk`,
            body: `Hi ${coParentName},\n\n${name} has created a co-parenting record hub for your family ("${familyName}") on CoParent Talk and has invited you to connect.\n\nUse this shared portal to log parenting schedules, document split child expenses, and send tone-analyzed co-parenting messages. Click the button below to register your account and join.`,
            link: generatedLink
          });
        } else {
          setSuccessMsg('Account and family created successfully!');
          setTimeout(() => {
            onLoginSuccess({
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
              familyId: newUser.familyId
            });
          }, 1500);
        }
      }
    }
  };

  return (
    <div className="auth-gate-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>CoParent Talk</h2>
          <p>Shared Parenting Records & Expenses Hub</p>
        </div>

        {/* Tab Selection (only show if not in invitation accept mode) */}
        {!inviteCode ? (
          <div className="auth-tabs">
            <button
              className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
              }}
            >
              Log In
            </button>
            <button
              className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
              }}
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', padding: '10px 14px', borderRadius: 'var(--border-radius-sm)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Sparkles size={16} style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
              Joining family: "{targetFamily?.name || 'Shared Family'}"
            </span>
          </div>
        )}

        {/* Errors/Success Notifications */}
        {errorMsg && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', padding: '10px 14px', borderRadius: 'var(--border-radius-sm)', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 500 }}>
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', padding: '10px 14px', borderRadius: 'var(--border-radius-sm)', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 500 }}>
            ✅ {successMsg}
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleAuth} className="auth-form">
          {activeTab === 'signup' && (
            <div className="form-group">
              <label className="auth-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Jane Doe"
                  style={{ paddingLeft: '38px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="auth-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input
                type="email"
                className="auth-input"
                placeholder="email@example.com"
                style={{ paddingLeft: '38px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!inviteCode}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="auth-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                style={{ paddingLeft: '38px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {activeTab === 'signup' && !inviteCode && (
            <>
              <div className="form-group">
                <label className="auth-label">Family / Registry Name</label>
                <div style={{ position: 'relative' }}>
                  <Users size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Davis Family Records"
                    style={{ paddingLeft: '38px' }}
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Invitation Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  id="invite-chk"
                  checked={inviteCoParent}
                  onChange={(e) => setInviteCoParent(e.target.checked)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <label htmlFor="invite-chk" style={{ fontSize: '0.75rem', color: 'hsl(220 20% 85%)', cursor: 'pointer', fontWeight: 600 }}>
                  Invite Co-Parent to sign up now
                </label>
              </div>

              {inviteCoParent && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--border-radius-sm)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.2s ease-out' }}>
                  <div className="form-group">
                    <label className="auth-label">Co-Parent's Name</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. John Doe"
                      value={coParentName}
                      onChange={(e) => setCoParentName(e.target.value)}
                      required={inviteCoParent}
                    />
                  </div>
                  <div className="form-group">
                    <label className="auth-label">Co-Parent's Email</label>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="co-parent@example.com"
                      value={coParentEmail}
                      onChange={(e) => setCoParentEmail(e.target.value)}
                      required={inviteCoParent}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <button type="submit" className="auth-submit-btn">
            {activeTab === 'login' ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Log In <ArrowRight size={16} />
              </span>
            ) : inviteCode ? (
              'Join Family Workspace'
            ) : (
              'Create Family Account'
            )}
          </button>
        </form>

        {/* Demo Accounts Quick Login */}
        {!inviteCode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <div className="demo-divider">Demo Accounts Sandbox</div>
            <div className="demo-logins-grid">
              <button className="demo-login-btn" onClick={() => handleDemoBypass('sarah')}>
                Sarah <span>Parent A (Demo)</span>
              </button>
              <button className="demo-login-btn" onClick={() => handleDemoBypass('david')}>
                David <span>Parent B (Demo)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Simulated Email Outbox Modal */}
      {simulatedOutbox && (
        <div className="sim-outbox-overlay">
          <div className="sim-outbox-card">
            <div className="sim-outbox-header">
              <h3>
                <Shield size={18} style={{ color: '#0284c7' }} /> Outbox Simulator
              </h3>
              <span className="sim-outbox-badge">Email Sent</span>
            </div>
            
            <div className="sim-email-envelope">
              <div className="sim-email-fields">
                <div className="sim-email-field">
                  <span className="field-label">To:</span>
                  <span className="field-val">{simulatedOutbox.toName} &lt;{simulatedOutbox.to}&gt;</span>
                </div>
                <div className="sim-email-field">
                  <span className="field-label">Subject:</span>
                  <span className="field-val">{simulatedOutbox.subject}</span>
                </div>
              </div>

              <div className="sim-email-body">
                <p style={{ margin: '0 0 16px 0' }}>Hi {simulatedOutbox.toName},</p>
                <p style={{ margin: '0 0 16px 0' }}>Your co-parent has invited you to connect on CoParent Talk family hub.</p>
                <div style={{ textAlign: 'center' }}>
                  <a 
                    href={simulatedOutbox.link} 
                    className="sim-email-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      // Redirect in current tab to test
                      window.location.href = simulatedOutbox.link;
                    }}
                  >
                    Accept Invitation & Register
                  </a>
                </div>
                <p style={{ margin: '16px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  If the button above does not work, copy and paste this link in a new browser tab:
                </p>
                <div className="sim-email-link-copy">
                  {simulatedOutbox.link}
                </div>
              </div>
            </div>

            <div className="sim-outbox-footer">
              <button 
                className="form-submit-btn" 
                style={{ background: '#0284c7', color: 'white', margin: 0, padding: '8px 16px', fontSize: '0.8rem' }}
                onClick={() => {
                  // Direct bypass login for Parent A immediately
                  const users = JSON.parse(localStorage.getItem('coparent_users') || '[]');
                  const creator = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
                  setSimulatedOutbox(null);
                  if (creator) {
                    onLoginSuccess({
                      name: creator.name,
                      email: creator.email,
                      role: creator.role,
                      familyId: creator.familyId
                    });
                  }
                }}
              >
                Go to Dashboard as Inviter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
