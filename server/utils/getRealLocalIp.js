// /server/utils/getRealLocalIp.js
// TODO: On hosting startup save as env variable for later use & implement later use from env variable
const os = require('os');

/**
 * Get the best available private local IP (192/10/172).
 * Falls nichts gefunden wird, fallback auf 'localhost'
 */
function getRealLocalIp() {
  const interfaces = os.networkInterfaces();
  const preferred = ['Wi-Fi', 'WLAN', 'LAN', 'Ethernet'];

  for (const [name, infos] of Object.entries(interfaces)) {
    if (!preferred.some(word => name.toLowerCase().includes(word.toLowerCase()))) continue;

    for (const info of infos) {
      if (info.family === 'IPv4' && !info.internal) {
        return info.address;
      }
    }
  }

  // Falls nichts unter bevorzugten Adaptern gefunden: irgendeine private IP nehmen
  const fallback = Object.values(interfaces).flat()
    .find(i => i.family === 'IPv4' && !i.internal && (
      i.address.startsWith('192.') ||
      i.address.startsWith('10.') ||
      i.address.startsWith('172.')
    ));

  return fallback?.address || 'localhost';
}

module.exports = getRealLocalIp;
