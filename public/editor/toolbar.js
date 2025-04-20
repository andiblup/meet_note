//== Toolbar Management ==//
// Create toolbar dynamically depending on role (Host / Client)

import { applyFormat, insertCodeBlock } from './editor.js';
import { leaveSession, endSession } from './storage.js';
import { getRole } from './utils.js';

export function createToolbar() {
  const toolbar = document.getElementById('toolbar');
  toolbar.innerHTML = ''; // Clear existing buttons

  const role = getRole();

  // Common buttons
  toolbar.appendChild(createButton('B', () => applyFormat('bold')));
  toolbar.appendChild(createButton('I', () => applyFormat('italic')));
  toolbar.appendChild(createButton('U', () => applyFormat('underline')));
  toolbar.appendChild(createButton('Code', () => insertCodeBlock()));

  // Role-specific buttons
  if (role === 'host') {
    toolbar.appendChild(createButton('🔚 Session beenden', endSession));
  } else if (role === 'client') {
    toolbar.appendChild(createButton('🚪 Session verlassen', leaveSession));
  }
}

function createButton(label, onClick) {
  const button = document.createElement('button');
  button.className = 'btn btn-sm btn-primary';
  button.innerText = label;
  button.onclick = onClick;
  return button;
}
