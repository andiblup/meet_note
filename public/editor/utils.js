//== Utility Functions ==//
// Helpers for editor and storage operations

export function getRole() {
    return localStorage.getItem('role') || 'client';
  }
  
  export function createElementWithClass(tag, className) {
    const element = document.createElement(tag);
    element.className = className;
    return element;
  }
  