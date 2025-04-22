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