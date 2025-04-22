// const socket = io();
// const list   = document.getElementById('fileList');
// const fileI  = document.getElementById('fileName');
// const addBtn = document.getElementById('addFile');
// const saveBtn= document.getElementById('save');
// const ta     = document.getElementById('content');
// const curLbl = document.getElementById('currentFile');

// let current = null;

// /* ---- Helper ---- */
// async function loadFiles(){
//   const files = await fetch('/api/files').then(r=>r.json());
//   list.innerHTML='';
//   files.forEach(f=>{
//     const li=document.createElement('li');
//     li.innerHTML=`<a class="p-2 block hover:bg-base-300">${f}</a>`;
//     li.onclick = ()=>openFile(f);
//     list.appendChild(li);
//   });
// }
// async function openFile(name){
//   current=name; curLbl.textContent=name;
//   ta.value= await fetch(`/api/file/${name}`).then(r=>r.json());
// }
// async function save(){
//   if(!current) return alert('kein file');
//   await fetch(`/api/file/${current}`,{
//     method:'POST',headers:{'Content-Type':'application/json'},
//     body:JSON.stringify(ta.value)
//   });
// }

// /* ---- Events ---- */
// addBtn.onclick=async()=>{
//   const n=fileI.value.trim(); if(!n) return;
//   await fetch(`/api/file/${n}`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
//   fileI.value=''; loadFiles();
// };
// saveBtn.onclick=save;

// socket.on('file-updated',id=>{
//   if(id===current) openFile(id);
//   loadFiles();
// });

// /* Init */
// loadFiles();

// import 'boxicons'
// import Prism from 'prismjs';
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // moderner Weg (HTTPS oder localhost)
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback für unsichere Kontexte
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Verhindert Scroll‑Sprünge
    textarea.style.position = 'fixed';
    textarea.style.top = 0;
    textarea.style.left = 0;
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.padding = 0;
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Kopieren fehlgeschlagen', err);
    }
    document.body.removeChild(textarea);
    return Promise.resolve();
  }
}

function showToast(message, type = 'info', time = 2000, wrapperId = 'toast-wrapper') {
  const wrapper = document.getElementById(wrapperId);
  // Neues Toast-Element
  const toast = document.createElement('div');
  toast.role = 'alert';
  toast.className = `
    alert alert-${type} alert-soft
  `;
  toast.innerHTML = `
      <span>${message}</span>
  `;
  wrapper.appendChild(toast);

  // Nach `time` die Out‑Animation starten
  setTimeout(() => {
    toast.classList.remove('animate-slide-in-up');
    // Wenn Animation zu Ende ist, aus DOM nehmen
    // toast.addEventListener('animationend', () => {
    //   wrapper.removeChild(toast);
    // }, { once: true });
    // Alternative: Timeout (z.B. 2s)
    setTimeout(() => {
      toast.classList.add('animate-slide-out-right', 'duration-200');
      setTimeout(() => {
        wrapper.removeChild(toast);
      }, 200);
    }, time);

  });
}