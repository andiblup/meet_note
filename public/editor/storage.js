//== Storage Management ==//
// Save and load editor content from localStorage

import { getRole } from './utils.js';

export function saveContent() {
  const content = document.getElementById('editor').innerHTML;
  const role = getRole();
  const key = (role === 'host') ? 'meet_note_host' : 'meet_note_client';
  localStorage.setItem(key, content);
}

export function loadContent() {
  const role = getRole();
  const key = (role === 'host') ? 'meet_note_host' : 'meet_note_client';
  const savedContent = localStorage.getItem(key);
  if (savedContent) {
    document.getElementById('editor').innerHTML = savedContent;
  }
}

export function endSession() {
  if (confirm('Möchtest du die Session wirklich beenden?')) {
    localStorage.clear();
    window.location.href = '/index.html';
  }
}

export function leaveSession() {
  if (confirm('Möchtest du die Session wirklich verlassen?')) {
    window.location.href = '/index.html';
  }
}
