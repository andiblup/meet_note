const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const PORT = 6060;
const dataDir = path.join(__dirname,'../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'../public')));

const srv = http.createServer(app);
const io  = new Server(srv,{cors:{origin:'*'}});

/* ---------- API ---------- */
app.get('/api/files',(_req,res)=>{
  const files = fs.readdirSync(dataDir).map(f=>path.basename(f,'.json'));
  res.json(files);
});
app.get('/api/file/:id',(req,res)=>{
  const f = path.join(dataDir,`${req.params.id}.json`);
  if (!fs.existsSync(f)) return res.status(404).json({error:'not found'});
  res.json(JSON.parse(fs.readFileSync(f)));
});
app.post('/api/file/:id',(req,res)=>{
  fs.writeFileSync(path.join(dataDir,`${req.params.id}.json`),
                   JSON.stringify(req.body,null,2));
  io.emit('file-updated',req.params.id);
  res.json({status:'ok'});
});
app.get('/api/info',(_q,res)=>{
  res.json({ip:'localhost',port:PORT,status:'online',version:'0.1.0'});
});

/* ---------- Socket.IO ---------- */
io.on('connection',s=>{
  console.log('🔵',s.id);
  s.on('disconnect',()=>console.log('🔴',s.id));
});

/* ---------- Start ---------- */
srv.listen(PORT,'0.0.0.0',()=>console.log(`🌐 http://localhost:${PORT}`));
