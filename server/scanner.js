#!/usr/bin/env node
// // scan55555.js
// // Node.js LAN port scanner for a single TCP port (default: 55555)

// const os = require('os');
// const net = require('net');

// // ---- config ----
// const PORT = Number(process.argv[2] || process.env.PORT || 55555);
// const CONNECT_TIMEOUT_MS = Number(process.env.TIMEOUT || 500);
// const CONCURRENCY = Number(process.env.CONCURRENCY || 128);

// // ---- helpers: IPv4 math (no deps) ----
// function ipToInt(ip) {
//   return ip.split('.').reduce((acc, oct) => (acc << 8) + (oct >>> 0), 0) >>> 0;
// }
// function intToIp(int) {
//   return [
//     (int >>> 24) & 0xff,
//     (int >>> 16) & 0xff,
//     (int >>> 8) & 0xff,
//     int & 0xff,
//   ].join('.');
// }
// function maskFromNetmask(netmask) {
//   // netmask like "255.255.255.0" -> number of mask bits (CIDR)
//   const n = ipToInt(netmask);
//   return n.toString(2).replace(/0+$/, '').length; // count leading 1s
// }
// function networkRange(ip, netmask) {
//   const ipInt = ipToInt(ip);
//   const maskInt = ipToInt(netmask);
//   const network = ipInt & maskInt;
//   const broadcast = network | (~maskInt >>> 0);
//   const firstHost = network + 1;
//   const lastHost = broadcast - 1;
//   const size = (lastHost >= firstHost) ? (lastHost - firstHost + 1) : 0;
//   return {
//     cidr: `${ip}/${maskFromNetmask(netmask)}`,
//     network: intToIp(network),
//     broadcast: intToIp(broadcast),
//     firstHost,
//     lastHost,
//     size,
//   };
// }
// function isPrivateIPv4(ip) {
//   // RFC1918 ranges + link-local 169.254/16 (skip link-local later)
//   const n = ipToInt(ip);
//   return (
//     (n >= ipToInt('10.0.0.0')     && n <= ipToInt('10.255.255.255')) ||
//     (n >= ipToInt('172.16.0.0')   && n <= ipToInt('172.31.255.255')) ||
//     (n >= ipToInt('192.168.0.0')  && n <= ipToInt('192.168.255.255'))
//   );
// }
// function isLinkLocal(ip) {
//   const n = ipToInt(ip);
//   return (n >= ipToInt('169.254.0.0') && n <= ipToInt('169.254.255.255'));
// }

// // ---- discover local IPv4 subnets ----
// function getLocalSubnets() {
//   const interfaces = os.networkInterfaces();
//   const subnets = [];

//   for (const [name, addrs] of Object.entries(interfaces)) {
//     for (const addr of addrs || []) {
//       if (addr.family !== 'IPv4' || addr.internal) continue;
//       if (!isPrivateIPv4(addr.address) || isLinkLocal(addr.address)) continue;

//       const r = networkRange(addr.address, addr.netmask);
//       if (r.size <= 0) continue;

//       subnets.push({
//         iface: name,
//         address: addr.address,
//         netmask: addr.netmask,
//         ...r,
//       });
//     }
//   }

//   // Deduplicate identical network ranges (some OSes duplicate entries)
//   const seen = new Set();
//   return subnets.filter(s => {
//     const key = `${s.network}-${s.broadcast}`;
//     if (seen.has(key)) return false;
//     seen.add(key);
//     return true;
//   });
// }

// // ---- TCP check ----
// function checkPort(host, port, timeoutMs) {
//   return new Promise((resolve) => {
//     const socket = new net.Socket();
//     let settled = false;

//     const onDone = (ok) => {
//       if (!settled) {
//         settled = true;
//         socket.destroy();
//         resolve(ok);
//       }
//     };

//     socket.setTimeout(timeoutMs);
//     socket.once('connect', () => onDone(true));
//     socket.once('timeout', () => onDone(false));
//     socket.once('error', () => onDone(false));
//     socket.connect(port, host);
//   });
// }

// // ---- simple promise pool ----
// async function mapWithConcurrency(items, limit, worker) {
//   const results = new Array(items.length);
//   let i = 0;

//   async function runNext() {
//     const idx = i++;
//     if (idx >= items.length) return;
//     try {
//       results[idx] = await worker(items[idx], idx);
//     } catch (e) {
//       results[idx] = undefined;
//     }
//     return runNext();
//   }

//   const runners = Array.from({ length: Math.min(limit, items.length) }, runNext);
//   await Promise.all(runners);
//   return results;
// }

// // ---- main scan ----
// async function scan() {
//   const subnets = getLocalSubnets();

//   if (subnets.length === 0) {
//     console.error('No suitable IPv4 private subnets found on this machine.');
//     process.exitCode = 1;
//     return;
//   }

//   console.log(`Scanning TCP port ${PORT} across ${subnets.length} subnet(s)...\n`);

//   const found = [];

//   for (const s of subnets) {
//     console.log(
//       `Interface ${s.iface} ${s.address} (${s.cidr} → ${s.network}..${s.broadcast}) — ${s.size} hosts`
//     );

//     // Build host list (exclude network/broadcast)
//     const hosts = [];
//     for (let h = s.firstHost; h <= s.lastHost; h++) {
//       hosts.push(intToIp(h));
//     }

//     const results = await mapWithConcurrency(hosts, CONCURRENCY, async (ip) => {
//       const ok = await checkPort(ip, PORT, CONNECT_TIMEOUT_MS);
//       if (ok) return ip;
//       return null;
//     });

//     const hits = results.filter(Boolean);
//     hits.forEach(ip => {
//       found.push({ iface: s.iface, ip });
//       console.log(`  ✓ ${ip} has something listening on ${PORT}`);
//     });

//     if (hits.length === 0) {
//       console.log('  (no hosts found on this subnet)');
//     }
//     console.log('');
//   }

//   if (found.length === 0) {
//     console.log('No services found.');
//   } else {
//     console.log('Discovered hosts:');
//     for (const { ip } of found) console.log(`- ${ip}:${PORT}`);
//   }
// }

// scan().catch(err => {
//   console.error('Scan failed:', err);
//   process.exitCode = 1;
// });

// //////////////////////////////

// scanner-fast.js
// Node-only, no deps. Scans hosts for an open TCP port (default 55555).
// Features: CIDR / range / file targets, ping-prefilter, multi-worker fork.

const os = require('os');
const net = require('net');
const fs = require('fs');
const { spawn } = require('child_process');
const { cpus } = require('os');

const argv = require('process').argv.slice(2);

// --- simple arg parsing ---
const args = {};
for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
        const k = a.replace(/^--/, '');
        const maybeVal = argv[i + 1];
        if (!maybeVal || maybeVal.startsWith('--')) {
            args[k] = true;
        } else {
            args[k] = maybeVal;
            i++;
        }
    } else if (!args._) {
        args._ = [a];
    } else {
        args._.push(a);
    }
}

if (args.help || args.h) {
    console.log(`Usage: node scanner-fast.js [options]
Options:
  --port <n>             TCP port to check (default 55555)
  --cidr <cidr>          target CIDR (can repeat) e.g. 192.168.1.0/24
  --range <start-end>    IP range e.g. 192.168.1.1-192.168.1.255 (can repeat)
  --file <path>          file with one IP/CIDR per line
  --timeout <ms>         tcp connect timeout (default 250)
  --concurrency <n>      concurrent sockets per worker (default 512)
  --workers <n>          number of worker processes (default: cpu cores)
  --ping                 use system ping to prefilter unreachable IPs
  --exclude-iface <name> exclude interface by substring (can repeat)
  --help
`);
    process.exit(0);
}

const PORT = Number(args.port || process.env.PORT || 55555);
const TIMEOUT = Number(args.timeout || process.env.TIMEOUT || 250);
const CONCURRENCY = Number(args.concurrency || process.env.CONCURRENCY || 512);
const WORKERS = Number(args.workers || cpus().length);
const USE_PING = !!args.ping;
const EXCLUDE_IFACE = args['exclude-iface'] ? (Array.isArray(args['exclude-iface']) ? args['exclude-iface'] : [args['exclude-iface']]) : [];

// --- IP utils ---
function ipToInt(ip) {
    return ip.split('.').reduce((acc, oct) => (acc << 8) + (+oct >>> 0), 0) >>> 0;
}
function intToIp(i) {
    return [(i >>> 24) & 255, (i >>> 16) & 255, (i >>> 8) & 255, i & 255].join('.');
}
function cidrToRange(cidr) {
    const [ip, prefix] = cidr.split('/');
    const ipInt = ipToInt(ip);
    const mask = prefix ? (~((1 << (32 - +prefix)) - 1) >>> 0) : 0xFFFFFFFF;
    const net = ipInt & mask;
    const first = net + 1;
    const last = (net | (~mask >>> 0)) - 1;
    return { first, last };
}
function parseRange(r) {
    const [a, b] = r.split('-');
    return { first: ipToInt(a.trim()), last: ipToInt(b.trim()) };
}

// --- gather targets from CLI / file / local subnets ---
function getLocalSubnets() {
    const ifs = os.networkInterfaces();
    const out = [];
    for (const [name, addrs] of Object.entries(ifs)) {
        if (EXCLUDE_IFACE.some(s => name.toLowerCase().includes(s.toLowerCase()))) continue;
        for (const a of addrs || []) {
            if (a.family !== 'IPv4' || a.internal) continue;
            // skip link-local
            if (a.address.startsWith('169.254.')) continue;
            out.push(`${a.address}/${netmaskToPrefix(a.netmask)}`);
        }
    }
    return out;
}
function netmaskToPrefix(mask) {
    return mask.split('.').map(Number).map(b => b.toString(2)).join('').split('1').length - 1
        ? maskStringToPrefix(mask) : 24; // fallback
}
function maskStringToPrefix(mask) {
    return ipToInt(mask).toString(2).split('1').length - 1;
}
// more robust:
function maskToPrefix(mask) {
    return ipToInt(mask).toString(2).split('1').length - 1;
}

// Build target list
async function buildTargets() {
    const targets = [];
    // from --cidr
    if (args.cidr) {
        const cidrs = Array.isArray(args.cidr) ? args.cidr : [args.cidr];
        for (const c of cidrs) {
            const { first, last } = cidrToRange(c);
            for (let n = first; n <= last; n++) targets.push(intToIp(n));
        }
    }
    // from --range
    if (args.range) {
        const ranges = Array.isArray(args.range) ? args.range : [args.range];
        for (const r of ranges) {
            const { first, last } = parseRange(r);
            for (let n = first; n <= last; n++) targets.push(intToIp(n));
        }
    }
    // from file
    if (args.file) {
        const lines = fs.readFileSync(args.file, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        for (const line of lines) {
            if (line.includes('/')) {
                const { first, last } = cidrToRange(line);
                for (let n = first; n <= last; n++) targets.push(intToIp(n));
            } else if (line.includes('-')) {
                const { first, last } = parseRange(line);
                for (let n = first; n <= last; n++) targets.push(intToIp(n));
            } else {
                targets.push(line);
            }
        }
    }

    // if none specified -> use detected subnets (but limited to non /16 by default)
    if (targets.length === 0) {
        const localCidrs = getLocalSubnets();
        for (const c of localCidrs) {
            const [ip, prefix] = c.split('/');
            const p = Number(prefix || 24);
            const cidr = `${ip}/${p}`;
            const { first, last } = cidrToRange(cidr);
            // if /16, reduce to /24 of the host's own subnet to avoid huge scan unless explicitly given
            if (p <= 16) {
                // pick host /24 (same third octet)
                const hostParts = ip.split('.').map(Number);
                const startIp = `${hostParts[0]}.${hostParts[1]}.${hostParts[2]}.1`;
                const endIp = `${hostParts[0]}.${hostParts[1]}.${hostParts[2]}.254`;
                const start = ipToInt(startIp), end = ipToInt(endIp);
                for (let n = start; n <= end; n++) targets.push(intToIp(n));
            } else {
                for (let n = first; n <= last; n++) targets.push(intToIp(n));
            }
        }
    }

    // dedupe
    return Array.from(new Set(targets));
}

// --- ping prefilter (system ping) ---
function pingIp(ip, timeoutMs = 300) {
    return new Promise((resolve) => {
        const plat = process.platform;
        let cmd, args;
        if (plat === 'win32') {
            // -n 1 (one echo), -w timeout in ms
            cmd = 'ping'; args = ['-n', '1', '-w', String(timeoutMs), ip];
        } else {
            // -c 1 (one), -W timeout in seconds (Linux) or -t on Mac is different; use -W in Linux
            // We'll convert ms -> sec (ceiling)
            const sec = Math.max(1, Math.ceil(timeoutMs / 1000));
            cmd = 'ping'; args = ['-c', '1', '-W', String(sec), ip];
        }
        const p = spawn(cmd, args, { stdio: 'ignore' });
        p.on('close', (code) => resolve(code === 0));
        p.on('error', () => resolve(false));
    });
}

async function prefilterWithPing(ips, concurrency = 200, timeout = 300) {
    const alive = [];
    let i = 0;
    async function worker() {
        while (i < ips.length) {
            const idx = i++;
            const ip = ips[idx];
            try {
                if (await pingIp(ip, timeout)) alive.push(ip);
            } catch (e) { }
        }
    }
    const proms = Array.from({ length: Math.min(concurrency, 200) }, worker);
    await Promise.all(proms);
    return alive;
}

// --- check TCP port ---
function checkPort(host, port, timeoutMs) {
    return new Promise((resolve) => {
        const s = new net.Socket();
        let done = false;
        function finish(v) { if (!done) { done = true; try { s.destroy(); } catch (e) { }; resolve(v); } }
        s.setTimeout(timeoutMs);
        s.once('connect', () => finish(true));
        s.once('timeout', () => finish(false));
        s.once('error', () => finish(false));
        s.connect(port, host);
    });
}

// --- chunk helper ---
function chunkArray(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

// --- orchestration ---
(async function main() {
    console.log(`scanner-fast: port=${PORT} timeout=${TIMEOUT} concurrency=${CONCURRENCY} workers=${WORKERS} ping=${USE_PING}\n`);
    let targets = await buildTargets();
    console.log(`Targets to consider: ${targets.length} IPs`);

    if (USE_PING) {
        console.log('Prefiltering with ping (this can drastically reduce workload)...');
        const alive = await prefilterWithPing(targets, Math.min(200, Math.floor(CONCURRENCY / 2)), Math.max(200, TIMEOUT));
        console.log(`Alive after ping: ${alive.length}/${targets.length}`);
        targets = alive;
    }

    if (targets.length === 0) {
        console.log('No targets to scan after prefilter. Exiting.');
        return;
    }

    // split work between worker processes (lightweight): simple approach - spawn workers using child_process.fork could be used.
    // For simplicity and portability we will run scanning in the current process but chunk the targets and run concurrent checks.
    // If WORKERS > 1 then we use splitting + Promise.all for chunks (still single process but concurrency helps).
    // (Alternative: implement real fork-based workers if desired).
    const results = [];
    const CHUNK = Math.max(1, Math.floor(targets.length / WORKERS));
    const chunks = chunkArray(targets, CHUNK);

    let checked = 0;
    for (const c of chunks) {
        // do concurrent checks within this chunk
        const pool = [];
        let idx = 0;
        async function runNext() {
            const id = idx++;
            if (id >= c.length) return;
            const ip = c[id];
            const ok = await checkPort(ip, PORT, TIMEOUT);
            if (ok) results.push(ip);
            checked++;
            if (checked % 100 === 0) process.stdout.write(`.${checked}`);
            return runNext();
        }
        const runners = Array.from({ length: Math.min(CONCURRENCY, c.length) }, runNext);
        await Promise.all(runners);
    }

    console.log('\nScan complete.');
    if (results.length === 0) {
        console.log('No hosts found.');
    } else {
        console.log('Found hosts:');
        for (const r of results) console.log(` - ${r}:${PORT}`);
    }
})();
