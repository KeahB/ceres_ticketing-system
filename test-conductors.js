const http = require('http');

http.get('http://192.168.1.11:3000/api/admin/conductors', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Data:', data);
    process.exit(0);
  });
}).on('error', e => {
  console.error('Error:', e.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('Timeout');
  process.exit(1);
}, 3000);
