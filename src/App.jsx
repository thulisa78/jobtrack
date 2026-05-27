// ╔══════════════════════════════════════════════════════════════╗
// ║  JOBTRACK — Career Launchpad                                  ║
// ║  Enhanced with Firebase Auth + Firestore                      ║
// ║                                                               ║
// ║  SETUP INSTRUCTIONS:                                          ║
// ║  1. Go to https://console.firebase.google.com                 ║
// ║  2. Create a new project (or use existing)                    ║
// ║  3. Enable Authentication → Email/Password sign-in            ║
// ║  4. Create Firestore Database (start in test mode)            ║
// ║  5. Go to Project Settings → Your Apps → Add Web App          ║
// ║  6. Copy your firebaseConfig and paste it below               ║
// ║  7. In package.json add:                                      ║
// ║       "firebase": "^10.0.0"                                   ║
// ║     Then run: npm install                                      ║
// ╚══════════════════════════════════════════════════════════════╝

import { useState, useEffect, useCallback } from "react";
import { getAnalytics } from "firebase/analytics";
// ── Firebase SDK imports ────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

// ══════════════════════════════════════════════════════════════════════════════
// 🔥 PASTE YOUR FIREBASE CONFIG HERE
// ══════════════════════════════════════════════════════════════════════════════
// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrTwP5nLmhYZ7iI6_m_HCVKvFbnzN0jsQ",
  authDomain: "jobtrack-dc415.firebaseapp.com",
  projectId: "jobtrack-dc415",
  storageBucket: "jobtrack-dc415.firebasestorage.app",
  messagingSenderId: "117688280663",
  appId: "1:117688280663:web:8656ecab6c756ca7a7a512",
  measurementId: "G-Y0DHP7Y2XV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// ══════════════════════════════════════════════════════════════════════════════

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// ── Lucide-style icon set ───────────────────────────────────────────────────
const Icon = ({ d, size = 18, color = "currentColor", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const Icons = {
  home:         "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  briefcase:    ["M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z","M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"],
  file:         ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  bell:         ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"],
  calendar:     ["M8 2v4","M16 2v4","M3 10h18","rect x=3 y=4 width=18 height=18 rx=2"],
  search:       ["circle cx=11 cy=11 r=8","M21 21l-4.35-4.35"],
  plus:         "M12 5v14M5 12h14",
  check:        "M20 6L9 17l-5-5",
  x:            "M18 6L6 18M6 6l12 12",
  edit:         ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  trash:        ["M3 6h18","M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6","M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"],
  link:         ["M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71","M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"],
  award:        ["circle cx=12 cy=8 r=7","M8.21 13.89L7 23l5-3 5 3-1.21-9.12"],
  trend:        "M23 6l-9.5 9.5-5-5L1 18",
  user:         ["circle cx=12 cy=8 r=4","M20 21a8 8 0 1 0-16 0"],
  map:          ["polygon points='1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6'","M8 2v16","M16 6v16"],
  zap:          "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  eye:          ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","circle cx=12 cy=12 r=3"],
  eyeOff:       ["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94","M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19","M1 1l22 22"],
  send:         ["M22 2L11 13","M22 2L15 22l-4-9-9-4 20-7z"],
  menu:         "M3 12h18M3 6h18M3 18h18",
  close:        "M18 6L6 18M6 6l12 12",
  globe:        ["circle cx=12 cy=12 r=10","M2 12h20","M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"],
  chevronRight: "M9 18l6-6-6-6",
  chevronDown:  "M6 9l6 6 6-6",
  star:         "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  building:     ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"],
  clock:        ["circle cx=12 cy=12 r=10","M12 6v6l4 2"],
  logout:       ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"],
  mail:         ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
  lock:         ["rect x=3 y=11 width=18 height=11 rx=2 ry=2","M7 11V7a5 5 0 0 1 10 0v4"],
  loader:       ["line x1=12 y1=2 x2=12 y2=6","line x1=12 y1=18 x2=12 y2=22","line x1=4.93 y1=4.93 x2=7.76 y2=7.76","line x1=16.24 y1=16.24 x2=19.07 y2=19.07","line x1=2 y1=12 x2=6 y2=12","line x1=18 y1=12 x2=22 y2=12","line x1=4.93 y1=19.07 x2=7.76 y2=16.24","line x1=16.24 y1=7.76 x2=19.07 y2=4.93"],
  sparkle:      ["M12 3l1.9 5.8 5.8 1.9-5.8 1.9L12 18.4l-1.9-5.8L4.3 10.7l5.8-1.9z","M5 3l.9 2.6 2.6.9-2.6.9L5 10l-.9-2.6L1.5 6.5l2.6-.9z","M19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z"],
};

// ── Static data ─────────────────────────────────────────────────────────────
const ALERTS = [
  { id: 1, title: "Software Developer Graduate", company: "MTN", location: "Johannesburg", salary: "R20 000–R25 000", posted: "2h ago", type: "Full-time", url: "https://www.careers24.com", urgent: true },
  { id: 2, title: "Data Analyst Learnership", company: "Sasol", location: "Sandton", salary: "R15 000", posted: "5h ago", type: "Learnership", url: "https://za.indeed.com", urgent: false },
  { id: 3, title: "Junior UX Designer", company: "Absa Group", location: "Remote", salary: "R18 000", posted: "1d ago", type: "Full-time", url: "https://www.linkedin.com/jobs", urgent: false },
  { id: 4, title: "IT Graduate Trainee", company: "Eskom", location: "Johannesburg", salary: "R17 000", posted: "2d ago", type: "Graduate", url: "https://www.pnet.co.za", urgent: false },
  { id: 5, title: "Business Analyst Intern", company: "Nedbank", location: "Johannesburg", salary: "R14 000", posted: "3d ago", type: "Internship", url: "https://www.graduategateway.co.za", urgent: false },
];
const JOB_PORTALS = [
  { name: "Careers24", url: "https://www.careers24.com", desc: "SA's top job board", color: "#E63946" },
  { name: "Indeed SA", url: "https://za.indeed.com", desc: "Millions of jobs", color: "#2557A7" },
  { name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs", desc: "Professional network", color: "#0A66C2" },
  { name: "PNet", url: "https://www.pnet.co.za", desc: "Professional jobs SA", color: "#FF6B00" },
  { name: "Graduate Gateway", url: "https://www.graduategateway.co.za", desc: "For SA graduates", color: "#00B894" },
  { name: "Jobmail", url: "https://www.jobmail.co.za", desc: "Find your next role", color: "#6C5CE7" },
];
const CV_TIPS = [
  "Tailor your CV to each job description — use keywords from the posting.",
  "Keep your CV to 2 pages max for entry-level roles.",
  "Lead with a punchy 3-sentence professional summary.",
  "Quantify achievements: 'Increased sales by 15%' beats 'Improved sales'.",
  "List your skills section prominently for ATS (applicant tracking systems).",
  "Include a link to your LinkedIn or GitHub profile.",
  "Use action verbs: Developed, Led, Designed, Analysed, Delivered.",
  "Proofread twice — a single typo can cost you an interview.",
];
const STATUS_CONFIG = {
  Pending:   { bg: "#FFF3CD", text: "#856404", dot: "#FFC107" },
  Interview: { bg: "#D1ECF1", text: "#0C5460", dot: "#17A2B8" },
  Offer:     { bg: "#D4EDDA", text: "#155724", dot: "#28A745" },
  Rejected:  { bg: "#F8D7DA", text: "#721C24", dot: "#DC3545" },
};

// ── Shared CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0B0F1A; --surface: #111827; --surface2: #1A2235; --border: #1E293B;
    --accent: #00E5A0; --accent2: #7C3AED; --accent3: #F59E0B;
    --text: #F1F5F9; --muted: #64748B; --danger: #EF4444; --info: #38BDF8;
    --nav-w: 240px;
  }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

  /* ── Auth Screen ── */
  .auth-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg); position: relative; overflow: hidden; padding: 20px;
  }
  .auth-bg-orb {
    position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.12; pointer-events: none;
  }
  .auth-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 24px;
    padding: 40px 36px; width: 100%; max-width: 440px; position: relative; z-index: 1;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5);
  }
  .auth-logo { text-align: center; margin-bottom: 28px; }
  .auth-logo-mark { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -1px; }
  .auth-logo-mark span { color: var(--accent); }
  .auth-logo-sub { font-size: 12px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
  .auth-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .auth-subtitle { font-size: 14px; color: var(--muted); margin-bottom: 28px; }
  .auth-field { margin-bottom: 16px; }
  .auth-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; margin-bottom: 7px; display: block; }
  .auth-input-wrap { position: relative; }
  .auth-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
  .auth-input {
    width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 12px;
    padding: 12px 14px 12px 42px; color: var(--text); font-size: 14px; font-family: 'DM Sans', sans-serif;
    outline: none; transition: border-color 0.2s;
  }
  .auth-input:focus { border-color: var(--accent); }
  .auth-eye { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); cursor: pointer; color: var(--muted); background: none; border: none; padding: 0; }
  .auth-eye:hover { color: var(--text); }
  .auth-btn {
    width: 100%; padding: 13px; background: var(--accent); color: #000; border: none; border-radius: 12px;
    font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Syne', sans-serif;
    letter-spacing: 0.5px; transition: all 0.2s; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .auth-btn:hover:not(:disabled) { background: #00ffb3; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,229,160,0.3); }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .auth-switch { text-align: center; margin-top: 22px; font-size: 14px; color: var(--muted); }
  .auth-switch button { background: none; border: none; color: var(--accent); cursor: pointer; font-weight: 600; font-size: 14px; padding: 0; }
  .auth-switch button:hover { text-decoration: underline; }
  .auth-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #FCA5A5; margin-bottom: 16px; display: flex; gap: 8px; align-items: flex-start; }
  .auth-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .auth-divider-line { flex: 1; height: 1px; background: var(--border); }
  .auth-divider-text { font-size: 12px; color: var(--muted); }
  .auth-strength { margin-top: 6px; display: flex; gap: 4px; }
  .auth-strength-bar { flex: 1; height: 3px; border-radius: 2px; background: var(--border); transition: background 0.3s; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.8s linear infinite; }

  /* ── App Layout ── */
  .jt-wrap { display: flex; min-height: 100vh; }
  .jt-sidebar {
    width: var(--nav-w); min-height: 100vh; background: var(--surface);
    border-right: 1px solid var(--border); position: fixed; top: 0; left: 0;
    z-index: 100; display: flex; flex-direction: column; transition: transform 0.3s;
  }
  .jt-sidebar.hidden { transform: translateX(-100%); }
  .jt-logo { padding: 28px 24px 20px; border-bottom: 1px solid var(--border); }
  .jt-logo-mark { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .jt-logo-mark span { color: var(--accent); }
  .jt-logo-sub { font-size: 11px; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
  .jt-nav { padding: 16px 12px; flex: 1; }
  .jt-nav-item {
    display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px;
    cursor: pointer; font-size: 14px; font-weight: 500; color: var(--muted); margin-bottom: 4px;
    transition: all 0.2s; border: 1px solid transparent;
  }
  .jt-nav-item:hover { background: var(--surface2); color: var(--text); }
  .jt-nav-item.active { background: linear-gradient(135deg, rgba(0,229,160,0.12), rgba(124,58,237,0.12)); color: var(--accent); border-color: rgba(0,229,160,0.2); }
  .jt-nav-badge { margin-left: auto; background: var(--accent); color: #000; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 20px; }
  .jt-sidebar-footer { padding: 16px; border-top: 1px solid var(--border); }
  .jt-user-card { display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--surface2); border-radius: 12px; margin-bottom: 10px; border: 1px solid var(--border); }
  .jt-user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #000; flex-shrink: 0; }
  .jt-user-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .jt-user-email { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .jt-logout-btn { width: 100%; display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 10px; background: transparent; border: 1px solid var(--border); color: var(--muted); font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .jt-logout-btn:hover { border-color: var(--danger); color: var(--danger); background: rgba(239,68,68,0.05); }
  .jt-main { margin-left: var(--nav-w); flex: 1; min-height: 100vh; }
  .jt-topbar {
    position: sticky; top: 0; z-index: 50; background: rgba(11,15,26,0.9);
    backdrop-filter: blur(12px); border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 28px; gap: 16px;
  }
  .jt-topbar-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; }
  .jt-topbar-right { display: flex; align-items: center; gap: 12px; }
  .jt-content { padding: 28px; }
  .jt-hamburger { display: none; cursor: pointer; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 8px; color: var(--text); }

  /* Cards */
  .jt-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .jt-stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px; position: relative; overflow: hidden; cursor: default; transition: transform 0.2s, border-color 0.2s; }
  .jt-stat-card:hover { transform: translateY(-2px); border-color: var(--accent); }
  .jt-stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--card-accent, var(--accent)); }
  .jt-stat-num { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; line-height: 1; margin-bottom: 6px; }
  .jt-stat-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  .jt-stat-icon { position: absolute; top: 16px; right: 16px; opacity: 0.15; }
  .jt-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
  .jt-card-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 18px; display: flex; align-items: center; gap: 10px; }

  /* Table */
  .jt-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .jt-table th { text-align: left; padding: 10px 14px; color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border); }
  .jt-table td { padding: 13px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  .jt-table tr:last-child td { border-bottom: none; }
  .jt-table tr:hover td { background: var(--surface2); }
  .jt-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .jt-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
  .jt-actions { display: flex; gap: 8px; }
  .jt-btn-icon { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 6px; cursor: pointer; color: var(--muted); transition: all 0.2s; }
  .jt-btn-icon:hover { color: var(--text); border-color: var(--accent); }
  .jt-btn-icon.danger:hover { color: var(--danger); border-color: var(--danger); }

  /* Buttons */
  .jt-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
  .jt-btn-primary { background: var(--accent); color: #000; }
  .jt-btn-primary:hover { background: #00ffb3; transform: translateY(-1px); }
  .jt-btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border); }
  .jt-btn-outline:hover { border-color: var(--accent); color: var(--accent); }
  .jt-btn-sm { padding: 7px 14px; font-size: 13px; }

  /* Search & Filter */
  .jt-filter-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .jt-search { flex: 1; min-width: 200px; position: relative; }
  .jt-search input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px 10px 40px; color: var(--text); font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; }
  .jt-search input:focus { border-color: var(--accent); }
  .jt-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); }
  .jt-filter-pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .jt-pill { padding: 8px 16px; border-radius: 20px; font-size: 13px; cursor: pointer; border: 1px solid var(--border); background: var(--surface2); color: var(--muted); transition: all 0.2s; font-family: 'DM Sans', sans-serif; font-weight: 500; }
  .jt-pill.active { background: var(--accent); color: #000; border-color: var(--accent); }

  /* Modal */
  .jt-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
  .jt-modal { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
  .jt-modal-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }

  /* Form */
  .jt-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .jt-field { display: flex; flex-direction: column; gap: 6px; }
  .jt-field.full { grid-column: 1/-1; }
  .jt-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; }
  .jt-input, .jt-select, .jt-textarea { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px; color: var(--text); font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; width: 100%; }
  .jt-input:focus, .jt-select:focus, .jt-textarea:focus { border-color: var(--accent); }
  .jt-textarea { resize: vertical; min-height: 80px; }
  .jt-select option { background: var(--surface); }

  /* CV Builder */
  .cv-stepper { display: flex; gap: 6px; margin-bottom: 24px; flex-wrap: wrap; }
  .cv-step { flex: 1; min-width: 80px; text-align: center; padding: 8px 6px; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); color: var(--muted); background: var(--surface2); transition: all 0.2s; }
  .cv-step.active { background: var(--accent); color: #000; border-color: var(--accent); }
  .cv-step.done { border-color: rgba(0,229,160,0.4); color: var(--accent); }
  .cv-preview { background: #fff; color: #111; border-radius: 12px; padding: 36px 40px; font-family: 'Georgia', serif; font-size: 14px; line-height: 1.6; margin-top: 24px; }
  .cv-preview h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; color: #111; }
  .cv-preview h2 { font-size: 14px; font-weight: 700; color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 4px; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 1px; }
  .cv-preview .meta { color: #555; font-size: 13px; }
  .cv-preview .skill-tag { display: inline-block; background: #EFF6FF; color: #1D4ED8; padding: 3px 10px; border-radius: 4px; font-size: 12px; margin: 3px; }

  /* Alerts */
  .jt-alert-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 14px; padding: 18px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s; }
  .jt-alert-card:hover { border-color: var(--accent); }
  .jt-alert-card.urgent { border-left: 3px solid var(--accent3); }
  .jt-alert-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .jt-alert-title { font-weight: 700; font-size: 15px; }
  .jt-alert-company { font-size: 13px; color: var(--muted); margin-top: 2px; }
  .jt-alert-tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .jt-tag { padding: 4px 10px; border-radius: 20px; font-size: 12px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); }
  .jt-alert-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .jt-urgent-badge { background: #FEF3C7; color: #92400E; font-size: 11px; padding: 3px 9px; border-radius: 20px; font-weight: 700; }

  /* Portals */
  .jt-portal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
  .jt-portal-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 14px; padding: 22px 18px; cursor: pointer; transition: all 0.2s; text-decoration: none; color: var(--text); display: flex; flex-direction: column; gap: 10px; position: relative; overflow: hidden; }
  .jt-portal-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--portal-color); }
  .jt-portal-card:hover { transform: translateY(-3px); border-color: var(--portal-color); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
  .jt-portal-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; }
  .jt-portal-desc { font-size: 12px; color: var(--muted); }
  .jt-portal-arrow { margin-top: auto; color: var(--muted); }

  /* Progress */
  .jt-progress-bar { background: var(--surface2); border-radius: 20px; height: 8px; overflow: hidden; }
  .jt-progress-fill { height: 100%; border-radius: 20px; background: linear-gradient(90deg, var(--accent), var(--accent2)); transition: width 0.5s; }

  /* Tips */
  .jt-tip { background: rgba(0,229,160,0.06); border: 1px solid rgba(0,229,160,0.15); border-radius: 12px; padding: 14px 16px; font-size: 13.5px; display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; }
  .jt-tip-icon { color: var(--accent); flex-shrink: 0; margin-top: 1px; }

  /* Toast */
  .jt-toast { position: fixed; bottom: 24px; right: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 10px; z-index: 999; font-size: 14px; font-weight: 500; box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: slideUp 0.3s ease; }
  .jt-toast.success { border-left: 3px solid var(--accent); }
  .jt-toast.info { border-left: 3px solid var(--info); }
  .jt-toast.error { border-left: 3px solid var(--danger); }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  /* Bar chart */
  .jt-bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 100px; }
  .jt-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .jt-bar { width: 100%; border-radius: 6px 6px 0 0; background: linear-gradient(180deg, var(--accent), var(--accent2)); transition: height 0.5s; }
  .jt-bar-label { font-size: 11px; color: var(--muted); }

  /* Loading screen */
  .jt-loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg); gap: 16px; }
  .jt-loading-logo { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; }
  .jt-loading-logo span { color: var(--accent); }

  /* Responsive */
  @media (max-width: 768px) {
    .jt-sidebar { transform: translateX(-100%); }
    .jt-sidebar.open { transform: translateX(0); }
    .jt-main { margin-left: 0; }
    .jt-hamburger { display: flex; }
    .jt-content { padding: 16px; }
    .jt-topbar { padding: 12px 16px; }
    .jt-form-grid { grid-template-columns: 1fr; }
    .jt-stat-grid { grid-template-columns: repeat(2, 1fr); }
    .jt-table { font-size: 12px; }
    .jt-table th:nth-child(4), .jt-table td:nth-child(4),
    .jt-table th:nth-child(5), .jt-table td:nth-child(5) { display: none; }
  }
`;

// ════════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ════════════════════════════════════════════════════════════════════════════
function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const clearError = () => setError("");

  const getPasswordStrength = (p) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score; // 0-4
  };

  const strengthColors = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981", "#00E5A0"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const pwStrength = mode === "register" ? getPasswordStrength(form.password) : 0;

  const handleSubmit = async () => {
    clearError();
    if (mode === "register") {
      if (!form.name.trim()) return setError("Please enter your full name.");
      if (!form.email.trim()) return setError("Please enter your email address.");
      if (form.password.length < 6) return setError("Password must be at least 6 characters.");
      if (form.password !== form.confirm) return setError("Passwords do not match.");
    }
    setLoading(true);
    try {
      if (mode === "register") {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(cred.user, { displayName: form.name.trim() });
        onAuthSuccess(cred.user);
      } else {
        const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
        onAuthSuccess(cred.user);
      }
    } catch (e) {
      const msgs = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email": "Invalid email address format.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/too-many-requests": "Too many attempts. Please wait a moment.",
        "auth/api-key-not-valid": "⚠️ Firebase not configured. Please update firebaseConfig in App.jsx.",
      };
      setError(msgs[e.code] || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="auth-wrap">
      <div className="auth-bg-orb" style={{ width: 500, height: 500, background: "#00E5A0", top: -200, right: -200 }} />
      <div className="auth-bg-orb" style={{ width: 400, height: 400, background: "#7C3AED", bottom: -150, left: -150 }} />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">JOB<span>TRACK</span></div>
          <div className="auth-logo-sub">Career Launchpad</div>
        </div>

        <div className="auth-title">{mode === "login" ? "Welcome back" : "Create your account"}</div>
        <div className="auth-subtitle">
          {mode === "login" ? "Sign in to access your career dashboard" : "Start tracking your job applications today"}
        </div>

        {error && (
          <div className="auth-error">
            <Icon d={Icons.x} size={14} color="#FCA5A5" />
            <span>{error}</span>
          </div>
        )}

        {mode === "register" && (
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Icon d={Icons.user} size={15} /></span>
              <input
                className="auth-input" type="text" placeholder="e.g. Thabo Nkosi"
                value={form.name} onChange={e => { set("name", e.target.value); clearError(); }}
                onKeyDown={handleKey}
              />
            </div>
          </div>
        )}

        <div className="auth-field">
          <label className="auth-label">Email Address</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon"><Icon d={Icons.mail} size={15} /></span>
            <input
              className="auth-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => { set("email", e.target.value); clearError(); }}
              onKeyDown={handleKey}
            />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label">Password</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon"><Icon d={Icons.lock} size={15} /></span>
            <input
              className="auth-input" type={showPass ? "text" : "password"}
              placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
              style={{ paddingRight: 42 }}
              value={form.password} onChange={e => { set("password", e.target.value); clearError(); }}
              onKeyDown={handleKey}
            />
            <button className="auth-eye" onClick={() => setShowPass(s => !s)} type="button">
              <Icon d={showPass ? Icons.eyeOff : Icons.eye} size={15} />
            </button>
          </div>
          {mode === "register" && form.password && (
            <>
              <div className="auth-strength">
                {[1,2,3,4].map(i => (
                  <div key={i} className="auth-strength-bar"
                    style={{ background: i <= pwStrength ? strengthColors[pwStrength] : undefined }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: strengthColors[pwStrength], marginTop: 3, fontWeight: 600 }}>
                {strengthLabels[pwStrength]}
              </div>
            </>
          )}
        </div>

        {mode === "register" && (
          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Icon d={Icons.lock} size={15} /></span>
              <input
                className="auth-input" type="password" placeholder="Repeat password"
                value={form.confirm} onChange={e => { set("confirm", e.target.value); clearError(); }}
                onKeyDown={handleKey}
              />
            </div>
          </div>
        )}

        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading
            ? <><Icon d={Icons.loader} size={16} color="#000" /><span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}></span> Please wait...</>
            : mode === "login" ? "Sign In →" : "Create Account →"}
        </button>

        <div className="auth-switch">
          {mode === "login" ? (
            <>Don't have an account? <button onClick={() => { setMode("register"); clearError(); setForm({ name:"", email:"", password:"", confirm:"" }); }}>Register here</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode("login"); clearError(); setForm({ name:"", email:"", password:"", confirm:"" }); }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
function JobTrackApp({ user }) {
  const [page, setPage] = useState("dashboard");
  const [apps, setApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [mobileNav, setMobileNav] = useState(false);
  const [cvStep, setCvStep] = useState(0);
  const [alertFilter, setAlertFilter] = useState("All");
  const [notification, setNotification] = useState(null);
  const [cvData, setCvData] = useState({
    name: user.displayName || "", email: user.email || "", phone: "", location: "", linkedin: "",
    summary: "", school: "", degree: "", gradYear: "", gpa: "",
    employer: "", jobTitle: "", duration: "", duties: "",
    skills: "", ref1Name: "", ref1Contact: "", ref2Name: "", ref2Contact: "",
  });

  const notify = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // ── Firestore helpers ────────────────────────────────────────────────────
  const userAppsRef = useCallback(() =>
    collection(db, "applications"), []);

  const fetchApps = useCallback(async () => {
    setAppsLoading(true);
    try {
      const q = query(collection(db, "applications"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setApps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      // Fallback if index not ready yet
      try {
        const q2 = query(collection(db, "applications"), where("userId", "==", user.uid));
        const snap2 = await getDocs(q2);
        setApps(snap2.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        notify("Could not load applications. Check Firestore rules.", "error");
      }
    } finally {
      setAppsLoading(false);
    }
  }, [user.uid, notify]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const saveApp = async (data) => {
    try {
      if (data.id && !data.id.startsWith("temp-")) {
        // Update existing
        const ref = doc(db, "applications", data.id);
        const { id, ...rest } = data;
        await updateDoc(ref, { ...rest, updatedAt: serverTimestamp() });
        setApps(prev => prev.map(a => a.id === data.id ? data : a));
        notify("Application updated ✓");
      } else {
        // Create new
        const { id: _id, ...rest } = data;
        const docRef = await addDoc(collection(db, "applications"), {
          ...rest,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setApps(prev => [{ ...data, id: docRef.id }, ...prev]);
        notify("Application saved to Firebase ✓");
      }
    } catch (e) {
      notify("Save failed: " + e.message, "error");
    }
    setShowForm(false);
    setEditApp(null);
  };

  const deleteApp = async (id) => {
    try {
      await deleteDoc(doc(db, "applications", id));
      setApps(prev => prev.filter(a => a.id !== id));
      notify("Application removed", "info");
    } catch (e) {
      notify("Delete failed: " + e.message, "error");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = {
    total: apps.length,
    interviews: apps.filter(a => a.status === "Interview").length,
    offers: apps.filter(a => a.status === "Offer").length,
    pending: apps.filter(a => a.status === "Pending").length,
    rejected: apps.filter(a => a.status === "Rejected").length,
  };

  const filteredApps = apps.filter(a => {
    const q = searchQ.toLowerCase();
    const matchQ = a.company?.toLowerCase().includes(q) || a.role?.toLowerCase().includes(q);
    const matchS = filterStatus === "All" || a.status === filterStatus;
    return matchQ && matchS;
  });

  const userInitials = (user.displayName || user.email || "U")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "applications", label: "Applications", icon: "briefcase" },
    { id: "cv", label: "CV Builder", icon: "file" },
    { id: "alerts", label: "Job Alerts", icon: "bell" },
    { id: "portals", label: "Job Portals", icon: "globe" },
  ];
  const pageTitles = { dashboard: "Dashboard", applications: "My Applications", cv: "CV Builder", alerts: "Job Alerts", portals: "Job Portals" };

  // ── Application Form Modal ───────────────────────────────────────────────
  const AppForm = ({ initial, onSave, onClose }) => {
    const [form, setForm] = useState(initial || {
      company: "", role: "", status: "Pending",
      date: new Date().toISOString().split("T")[0],
      location: "", notes: "", salary: "", source: "",
    });
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
      if (!form.company || !form.role) return;
      setSaving(true);
      await onSave(form);
      setSaving(false);
    };

    return (
      <div className="jt-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="jt-modal">
          <div className="jt-modal-title">
            {initial?.id ? "Edit Application" : "Add New Application"}
            <button className="jt-btn-icon" onClick={onClose}><Icon d={Icons.x} /></button>
          </div>
          <div className="jt-form-grid">
            <div className="jt-field">
              <label className="jt-label">Company *</label>
              <input className="jt-input" value={form.company} onChange={e => set("company", e.target.value)} placeholder="e.g. Discovery" />
            </div>
            <div className="jt-field">
              <label className="jt-label">Role *</label>
              <input className="jt-input" value={form.role} onChange={e => set("role", e.target.value)} placeholder="e.g. Graduate Developer" />
            </div>
            <div className="jt-field">
              <label className="jt-label">Status</label>
              <select className="jt-select" value={form.status} onChange={e => set("status", e.target.value)}>
                {["Pending","Interview","Offer","Rejected"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="jt-field">
              <label className="jt-label">Date Applied</label>
              <input className="jt-input" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
            <div className="jt-field">
              <label className="jt-label">Location</label>
              <input className="jt-input" value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Johannesburg" />
            </div>
            <div className="jt-field">
              <label className="jt-label">Salary (approx.)</label>
              <input className="jt-input" value={form.salary} onChange={e => set("salary", e.target.value)} placeholder="e.g. R18 000" />
            </div>
            <div className="jt-field">
              <label className="jt-label">Source</label>
              <select className="jt-select" value={form.source} onChange={e => set("source", e.target.value)}>
                <option value="">Select source</option>
                {["LinkedIn","Careers24","Indeed","PNet","CompanyWebsite","Referral","Other"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="jt-field full">
              <label className="jt-label">Notes</label>
              <textarea className="jt-textarea" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Interview feedback, follow-up reminders..." />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
            <button className="jt-btn jt-btn-outline" onClick={onClose}>Cancel</button>
            <button className="jt-btn jt-btn-primary" onClick={handleSave} disabled={saving}>
              {saving
                ? <><Icon d={Icons.loader} size={14} /><span className="spin" /> Saving...</>
                : <><Icon d={Icons.check} size={16} /> {initial?.id ? "Update" : "Save Application"}</>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Dashboard ────────────────────────────────────────────────────────────
  const DashboardPage = () => {
    const successRate = stats.total ? Math.round(((stats.offers + stats.interviews) / stats.total) * 100) : 0;
    const recentApps = [...apps].slice(0, 4);
    return (
      <div>
        {/* Welcome banner */}
        <div style={{ background: "linear-gradient(135deg, rgba(0,229,160,0.08), rgba(124,58,237,0.08))", border: "1px solid rgba(0,229,160,0.15)", borderRadius: 16, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "Syne", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              Welcome back, {user.displayName?.split(" ")[0] || "there"} 👋
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Your data is securely stored in Firebase. Track every opportunity.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--accent)", background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: 10, padding: "8px 14px" }}>
            <Icon d={Icons.sparkle} size={14} color="var(--accent)" />
            Firebase Synced
          </div>
        </div>

        <div className="jt-stat-grid">
          {[
            { num: stats.total, label: "Applications Sent", icon: "send", color: "#00E5A0" },
            { num: stats.interviews, label: "Interviews", icon: "calendar", color: "#7C3AED" },
            { num: stats.offers, label: "Offers", icon: "award", color: "#F59E0B" },
            { num: stats.pending, label: "Pending", icon: "clock", color: "#38BDF8" },
            { num: stats.rejected, label: "Not Progressed", icon: "x", color: "#EF4444" },
          ].map(s => (
            <div className="jt-stat-card" key={s.label} style={{ "--card-accent": s.color }}>
              <div className="jt-stat-icon"><Icon d={Icons[s.icon]} size={42} color={s.color} /></div>
              <div className="jt-stat-num" style={{ color: s.color }}>{s.num}</div>
              <div className="jt-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="jt-card">
            <div className="jt-card-title"><Icon d={Icons.trend} size={16} color="var(--accent)" /> Success Rate</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>Interview + Offer rate</span>
                <span style={{ fontFamily: "Syne", fontWeight: 700, color: "var(--accent)" }}>{successRate}%</span>
              </div>
              <div className="jt-progress-bar"><div className="jt-progress-fill" style={{ width: `${successRate}%` }} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[{ label:"Pending",val:stats.pending,col:"#FFC107"},{label:"Interview",val:stats.interviews,col:"#17A2B8"},{label:"Offer",val:stats.offers,col:"#28A745"},{label:"Rejected",val:stats.rejected,col:"#EF4444"}].map(s => (
                <div key={s.label} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:s.col, flexShrink:0 }} />
                  <span style={{ color:"var(--muted)" }}>{s.label}</span>
                  <span style={{ marginLeft:"auto", fontWeight:600 }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="jt-card">
            <div className="jt-card-title"><Icon d={Icons.trend} size={16} color="var(--accent2)" /> Activity Overview</div>
            <div className="jt-bar-chart">
              {[{l:"Pending",v:stats.pending,c:"#FFC107"},{l:"Interview",v:stats.interviews,c:"#17A2B8"},{l:"Offer",v:stats.offers,c:"#28A745"},{l:"Rejected",v:stats.rejected,c:"#EF4444"}].map(s => {
                const max = Math.max(stats.pending, stats.interviews, stats.offers, stats.rejected, 1);
                return (
                  <div className="jt-bar-wrap" key={s.l}>
                    <span style={{ fontSize:12, color:s.c, fontWeight:600, marginBottom:4 }}>{s.v}</span>
                    <div className="jt-bar" style={{ height:`${(s.v/max)*70}px`, background: s.c }} />
                    <span className="jt-bar-label">{s.l.slice(0,3)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="jt-card">
          <div className="jt-card-title" style={{ justifyContent:"space-between" }}>
            <span style={{ display:"flex", alignItems:"center", gap:10 }}><Icon d={Icons.briefcase} size={16} color="var(--accent)" /> Recent Applications</span>
            <button className="jt-btn jt-btn-outline jt-btn-sm" onClick={() => setPage("applications")}>View All →</button>
          </div>
          {appsLoading ? (
            <div style={{ textAlign:"center", padding:24, color:"var(--muted)" }}>
              <Icon d={Icons.loader} size={20} /><br />Loading from Firebase...
            </div>
          ) : recentApps.length === 0 ? (
            <div style={{ textAlign:"center", padding:24, color:"var(--muted)" }}>
              No applications yet. <button className="jt-btn jt-btn-primary jt-btn-sm" style={{ marginLeft:8 }} onClick={() => { setPage("applications"); setShowForm(true); }}>Add First App +</button>
            </div>
          ) : (
            <table className="jt-table">
              <thead><tr><th>Company</th><th>Role</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {recentApps.map(a => {
                  const sc = STATUS_CONFIG[a.status];
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight:600 }}>{a.company}</td>
                      <td style={{ color:"var(--muted)" }}>{a.role}</td>
                      <td style={{ color:"var(--muted)", fontSize:12 }}>{a.date}</td>
                      <td><span className="jt-badge" style={{ background:sc.bg, color:sc.text }}><span className="jt-dot" style={{ background:sc.dot }} />{a.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="jt-card">
          <div className="jt-card-title"><Icon d={Icons.zap} size={16} color="var(--accent3)" /> CV & Application Tips</div>
          {CV_TIPS.slice(0,4).map((tip, i) => (
            <div className="jt-tip" key={i}><div className="jt-tip-icon"><Icon d={Icons.check} size={14} /></div><span>{tip}</span></div>
          ))}
          <button className="jt-btn jt-btn-outline jt-btn-sm" style={{ marginTop:8 }} onClick={() => setPage("cv")}>Build My CV →</button>
        </div>
      </div>
    );
  };

  // ── Applications Page ────────────────────────────────────────────────────
  const ApplicationsPage = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"Syne", fontSize:18, fontWeight:700 }}>My Applications</h2>
          <p style={{ color:"var(--muted)", fontSize:13, marginTop:4 }}>{stats.total} applications stored in Firebase</p>
        </div>
        <button className="jt-btn jt-btn-primary" onClick={() => { setEditApp(null); setShowForm(true); }}>
          <Icon d={Icons.plus} size={16} /> New Application
        </button>
      </div>

      <div className="jt-filter-bar">
        <div className="jt-search">
          <span className="jt-search-icon"><Icon d={Icons.search} size={16} /></span>
          <input placeholder="Search by company or role..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        </div>
        <div className="jt-filter-pills">
          {["All","Pending","Interview","Offer","Rejected"].map(s => (
            <button key={s} className={`jt-pill ${filterStatus===s?"active":""}`} onClick={() => setFilterStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="jt-card" style={{ padding:0, overflow:"hidden" }}>
        {appsLoading ? (
          <div style={{ textAlign:"center", padding:40, color:"var(--muted)" }}>Loading from Firebase...</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table className="jt-table">
              <thead>
                <tr><th>Company</th><th>Role</th><th>Date</th><th>Location</th><th>Salary</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:"center", color:"var(--muted)", padding:32 }}>
                    {apps.length === 0 ? "No applications yet. Click 'New Application' to start tracking!" : "No matching applications found."}
                  </td></tr>
                ) : filteredApps.map(a => {
                  const sc = STATUS_CONFIG[a.status] || STATUS_CONFIG.Pending;
                  return (
                    <tr key={a.id}>
                      <td><div style={{ fontWeight:600 }}>{a.company}</div>{a.source && <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>via {a.source}</div>}</td>
                      <td style={{ color:"var(--muted)" }}>{a.role}</td>
                      <td style={{ fontSize:12, color:"var(--muted)" }}>{a.date}</td>
                      <td style={{ fontSize:12, color:"var(--muted)" }}>{a.location}</td>
                      <td style={{ fontSize:12, fontWeight:600, color:"var(--accent)" }}>{a.salary}</td>
                      <td><span className="jt-badge" style={{ background:sc.bg, color:sc.text }}><span className="jt-dot" style={{ background:sc.dot }} />{a.status}</span></td>
                      <td>
                        <div className="jt-actions">
                          <button className="jt-btn-icon" title="Edit" onClick={() => { setEditApp(a); setShowForm(true); }}><Icon d={Icons.edit} size={14} /></button>
                          <button className="jt-btn-icon danger" title="Delete" onClick={() => deleteApp(a.id)}><Icon d={Icons.trash} size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // ── CV Builder Page ──────────────────────────────────────────────────────
  const CVBuilderPage = () => {
    const [preview, setPreview] = useState(false);
    const set = (k, v) => setCvData(d => ({ ...d, [k]: v }));

    const steps = [
      { key:"personal", label:"Personal", fields: [
        ["name","Full Name","text","Your full name"],["email","Email","email","your@email.com"],
        ["phone","Phone","text","e.g. 071 000 0000"],["location","City","text","e.g. Johannesburg"],
        ["linkedin","LinkedIn / Portfolio","text","https://linkedin.com/in/..."],
        ["summary","Professional Summary","textarea","Write 2-3 sentences about who you are..."],
      ]},
      { key:"education", label:"Education", fields: [
        ["school","Institution","text","University / College"],["degree","Degree / Qualification","text","e.g. BSc Computer Science"],
        ["gradYear","Year Completed","text","e.g. 2024"],["gpa","Average / GPA","text","e.g. 68% / 3.2"],
      ]},
      { key:"experience", label:"Experience", fields: [
        ["employer","Employer","text","Company name"],["jobTitle","Title / Internship","text","e.g. IT Intern"],
        ["duration","Duration","text","e.g. Jan 2024 – Mar 2024"],["duties","Duties & Achievements","textarea","Describe what you did..."],
      ]},
      { key:"skills", label:"Skills", fields: [
        ["skills","Skills (comma-separated)","textarea","e.g. Python, Excel, Communication, Teamwork"],
      ]},
      { key:"refs", label:"References", fields: [
        ["ref1Name","Reference 1 – Name","text","Full name & title"],["ref1Contact","Reference 1 – Contact","text","Email or phone"],
        ["ref2Name","Reference 2 – Name","text","Full name & title"],["ref2Contact","Reference 2 – Contact","text","Email or phone"],
      ]},
    ];

    const handlePrint = () => {
      const el = document.getElementById("cv-preview-content");
      if (!el) return;
      const win = window.open("", "_blank");
      win.document.write(`<html><head><title>${cvData.name || "My CV"}</title><style>body{font-family:Georgia,serif;padding:40px;max-width:700px;margin:0 auto}h1{font-size:26px;margin-bottom:4px}h2{font-size:13px;color:#2563EB;border-bottom:2px solid #2563EB;padding-bottom:4px;margin:16px 0 8px;text-transform:uppercase}p{margin:4px 0;font-size:14px;line-height:1.6}.meta{color:#555;font-size:13px}.skill-tag{display:inline-block;background:#EFF6FF;color:#1D4ED8;padding:3px 10px;border-radius:4px;font-size:12px;margin:3px}</style></head><body>${el.innerHTML}</body></html>`);
      win.document.close(); win.print();
    };

    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ fontFamily:"Syne", fontSize:18, fontWeight:700 }}>CV Builder</h2>
            <p style={{ color:"var(--muted)", fontSize:13, marginTop:4 }}>Build a professional CV in minutes — printable & ready to send</p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="jt-btn jt-btn-outline jt-btn-sm" onClick={() => setPreview(!preview)}>
              <Icon d={Icons.eye} size={14} /> {preview ? "Edit" : "Preview"}
            </button>
            <button className="jt-btn jt-btn-primary jt-btn-sm" onClick={handlePrint}>
              <Icon d={Icons.send} size={14} /> Print / PDF
            </button>
          </div>
        </div>

        {!preview ? (
          <>
            <div className="cv-stepper">
              {steps.map((s,i) => (
                <div key={s.key} className={`cv-step ${i===cvStep?"active":i<cvStep?"done":""}`} onClick={() => setCvStep(i)}>
                  {i<cvStep?"✓ ":""}{s.label}
                </div>
              ))}
            </div>
            <div className="jt-card">
              <div className="jt-card-title">{steps[cvStep].label}</div>
              <div className="jt-form-grid">
                {steps[cvStep].fields.map(([k,label,type,ph]) => (
                  <div className={`jt-field ${type==="textarea"?"full":""}`} key={k}>
                    <label className="jt-label">{label}</label>
                    {type==="textarea"
                      ? <textarea className="jt-textarea" value={cvData[k]} onChange={e => set(k, e.target.value)} placeholder={ph} />
                      : <input className="jt-input" type={type} value={cvData[k]} onChange={e => set(k, e.target.value)} placeholder={ph} />}
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:20 }}>
                <button className="jt-btn jt-btn-outline" onClick={() => setCvStep(s => Math.max(0,s-1))} disabled={cvStep===0}>← Previous</button>
                {cvStep < steps.length-1
                  ? <button className="jt-btn jt-btn-primary" onClick={() => setCvStep(s => s+1)}>Next →</button>
                  : <button className="jt-btn jt-btn-primary" onClick={() => { setPreview(true); notify("CV ready! Preview & print below."); }}>Preview CV ✓</button>}
              </div>
            </div>
          </>
        ) : (
          <div id="cv-preview-content">
            <div className="cv-preview">
              <h1>{cvData.name || "Your Name"}</h1>
              <p className="meta">{[cvData.email,cvData.phone,cvData.location,cvData.linkedin].filter(Boolean).join(" • ")}</p>
              {cvData.summary && (<><h2>Profile</h2><p>{cvData.summary}</p></>)}
              <h2>Education</h2>
              <p><strong>{cvData.degree || "Qualification"}</strong> — {cvData.school || "Institution"}</p>
              <p className="meta">{[cvData.gradYear,cvData.gpa].filter(Boolean).join(" | ")}</p>
              <h2>Work Experience</h2>
              <p><strong>{cvData.jobTitle || "Position"}</strong> — {cvData.employer || "Employer"}</p>
              <p className="meta">{cvData.duration}</p>
              {cvData.duties && <p style={{ marginTop:8 }}>{cvData.duties}</p>}
              {cvData.skills && (<><h2>Skills</h2><div>{cvData.skills.split(",").map((s,i) => s.trim() && <span key={i} className="skill-tag">{s.trim()}</span>)}</div></>)}
              {(cvData.ref1Name||cvData.ref2Name) && (<><h2>References</h2>{cvData.ref1Name&&<p><strong>{cvData.ref1Name}</strong> — {cvData.ref1Contact}</p>}{cvData.ref2Name&&<p><strong>{cvData.ref2Name}</strong> — {cvData.ref2Contact}</p>}</>)}
            </div>
          </div>
        )}
        <div className="jt-card" style={{ marginTop:20 }}>
          <div className="jt-card-title"><Icon d={Icons.zap} size={16} color="var(--accent3)" /> All CV Tips</div>
          {CV_TIPS.map((tip,i) => (
            <div className="jt-tip" key={i}><div className="jt-tip-icon"><Icon d={Icons.check} size={14} /></div><span>{tip}</span></div>
          ))}
        </div>
      </div>
    );
  };

  // ── Job Alerts Page ──────────────────────────────────────────────────────
  const AlertsPage = () => {
    const types = ["All","Full-time","Internship","Learnership","Graduate"];
    const filtered = alertFilter==="All" ? ALERTS : ALERTS.filter(a => a.type===alertFilter);
    return (
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ fontFamily:"Syne", fontSize:18, fontWeight:700 }}>Job Alerts</h2>
            <p style={{ color:"var(--muted)", fontSize:13, marginTop:4 }}>Latest opportunities for graduates & youth</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:10, padding:"8px 14px", fontSize:13 }}>
            <Icon d={Icons.bell} size={14} color="var(--accent)" />
            <span style={{ color:"var(--accent)", fontWeight:600 }}>Live alerts active</span>
          </div>
        </div>
        <div className="jt-filter-pills" style={{ marginBottom:20 }}>
          {types.map(t => <button key={t} className={`jt-pill ${alertFilter===t?"active":""}`} onClick={() => setAlertFilter(t)}>{t}</button>)}
        </div>
        {filtered.map(a => (
          <div key={a.id} className={`jt-alert-card ${a.urgent?"urgent":""}`}>
            <div className="jt-alert-header">
              <div>
                <div className="jt-alert-title">{a.title}</div>
                <div className="jt-alert-company">{a.company} • {a.location}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                {a.urgent && <span className="jt-urgent-badge">🔥 Urgent</span>}
                <span style={{ fontSize:12, color:"var(--muted)" }}>{a.posted}</span>
              </div>
            </div>
            <div className="jt-alert-tags">
              <span className="jt-tag">{a.type}</span>
              <span className="jt-tag" style={{ color:"var(--accent)" }}>{a.salary}</span>
            </div>
            <div className="jt-alert-footer">
              <div style={{ display:"flex", gap:10 }}>
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="jt-btn jt-btn-primary jt-btn-sm" style={{ textDecoration:"none" }}>
                  <Icon d={Icons.link} size={13} /> Apply Now
                </a>
                <button className="jt-btn jt-btn-outline jt-btn-sm" onClick={() => saveApp({ company:a.company, role:a.title, status:"Pending", date:new Date().toISOString().split("T")[0], location:a.location, notes:`Applied via ${a.url}`, salary:a.salary, source:"Alert" })}>
                  <Icon d={Icons.plus} size={13} /> Track This
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Portals Page ─────────────────────────────────────────────────────────
  const PortalsPage = () => (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"Syne", fontSize:18, fontWeight:700 }}>Job Portals</h2>
        <p style={{ color:"var(--muted)", fontSize:13, marginTop:4 }}>Trusted South African & global job boards</p>
      </div>
      <div className="jt-portal-grid">
        {JOB_PORTALS.map(p => (
          <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="jt-portal-card" style={{ "--portal-color":p.color }}>
            <div>
              <div className="jt-portal-name">{p.name}</div>
              <div className="jt-portal-desc">{p.desc}</div>
            </div>
            <div className="jt-portal-arrow"><Icon d={Icons.chevronRight} size={16} /></div>
          </a>
        ))}
      </div>
      <div className="jt-card" style={{ marginTop:28 }}>
        <div className="jt-card-title"><Icon d={Icons.star} size={16} color="var(--accent3)" /> Application Strategy Tips</div>
        {["Apply to at least 5 jobs per week.","Follow companies on LinkedIn before applying.","Set up job alerts on each portal.","Apply early — many roles fill within 3-5 days.","Customise your cover letter for each application."].map((tip,i) => (
          <div className="jt-tip" key={i}><div className="jt-tip-icon"><Icon d={Icons.check} size={14} /></div><span>{tip}</span></div>
        ))}
      </div>
    </div>
  );

  const pages = {
    dashboard: <DashboardPage />,
    applications: <ApplicationsPage />,
    cv: <CVBuilderPage />,
    alerts: <AlertsPage />,
    portals: <PortalsPage />,
  };

  return (
    <div className="jt-wrap">
      <nav className={`jt-sidebar ${mobileNav ? "open" : ""}`}>
        <div className="jt-logo">
          <div className="jt-logo-mark">JOB<span>TRACK</span></div>
          <div className="jt-logo-sub">Career Launchpad</div>
        </div>
        <div className="jt-nav">
          {navItems.map(n => (
            <div key={n.id} className={`jt-nav-item ${page===n.id?"active":""}`} onClick={() => { setPage(n.id); setMobileNav(false); }}>
              <Icon d={Icons[n.icon]} size={17} />
              {n.label}
              {n.id==="alerts" && <span className="jt-nav-badge">{ALERTS.length}</span>}
              {n.id==="applications" && apps.length>0 && <span className="jt-nav-badge" style={{ background:"var(--accent2)" }}>{apps.length}</span>}
            </div>
          ))}
        </div>
        <div className="jt-sidebar-footer">
          <div className="jt-user-card">
            <div className="jt-user-avatar">{userInitials}</div>
            <div style={{ overflow:"hidden" }}>
              <div className="jt-user-name">{user.displayName || "User"}</div>
              <div className="jt-user-email">{user.email}</div>
            </div>
          </div>
          <button className="jt-logout-btn" onClick={handleLogout}>
            <Icon d={Icons.logout} size={14} /> Sign Out
          </button>
        </div>
      </nav>

      <main className="jt-main">
        <div className="jt-topbar">
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button className="jt-hamburger" onClick={() => setMobileNav(!mobileNav)}>
              <Icon d={mobileNav ? Icons.close : Icons.menu} size={18} />
            </button>
            <div className="jt-topbar-title">{pageTitles[page]}</div>
          </div>
          <div className="jt-topbar-right">
            <div style={{ fontSize:13, color:"var(--muted)", display:"flex", alignItems:"center", gap:6 }}>
              <Icon d={Icons.user} size={14} color="var(--accent)" />
              <span>{user.displayName?.split(" ")[0] || user.email}</span>
            </div>
            {page==="applications" && (
              <button className="jt-btn jt-btn-primary jt-btn-sm" onClick={() => { setEditApp(null); setShowForm(true); }}>
                <Icon d={Icons.plus} size={14} /> Add
              </button>
            )}
          </div>
        </div>

        <div className="jt-content">{pages[page]}</div>
      </main>

      {mobileNav && <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:90 }} onClick={() => setMobileNav(false)} />}
      {showForm && <AppForm initial={editApp} onSave={saveApp} onClose={() => { setShowForm(false); setEditApp(null); }} />}

      {notification && (
        <div className={`jt-toast ${notification.type}`}>
          <Icon d={notification.type==="success"?Icons.check:notification.type==="error"?Icons.x:Icons.bell} size={16}
            color={notification.type==="success"?"var(--accent)":notification.type==="error"?"var(--danger)":"var(--info)"} />
          {notification.msg}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT — Auth gate
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [authState, setAuthState] = useState("loading"); // "loading" | "unauthenticated" | "authenticated"
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthState(user ? "authenticated" : "unauthenticated");
    });
    return () => unsub();
  }, []);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {authState === "loading" && (
        <div className="jt-loading">
          <div className="jt-loading-logo">JOB<span>TRACK</span></div>
          <div style={{ color:"var(--muted)", fontSize:14 }}>Loading your session...</div>
          <div style={{ marginTop:8 }}><Icon d={Icons.loader} size={24} color="var(--accent)" /></div>
        </div>
      )}
      {authState === "unauthenticated" && (
        <AuthScreen onAuthSuccess={(user) => setCurrentUser(user)} />
      )}
      {authState === "authenticated" && currentUser && (
        <JobTrackApp user={currentUser} />
      )}
    </>
  );
}
