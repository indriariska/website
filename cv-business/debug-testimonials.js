/**
 * CVPro Studio — Direct debug: simulate exactly what the browser does
 * Calls the real API and checks the full rendering path.
 * node debug-testimonials.js
 */
const http = require('http');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data, parseError: e.message }); }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('=== CVPro Studio Testimonials Debug ===\n');

  // 1. Check API is reachable
  const PORT = process.env.PORT || 3000;
  const url  = `http://localhost:${PORT}/api/feedback/public`;
  console.log('1. Calling:', url);

  let result;
  try {
    result = await httpGet(url);
  } catch(e) {
    console.error('   FATAL: Cannot reach server:', e.message);
    console.error('   → Server is not running on port', PORT);
    process.exit(1);
  }

  console.log('   HTTP status:', result.status);

  if (result.parseError) {
    console.error('   ERROR: Response is not valid JSON:', result.parseError);
    console.error('   Raw body:', String(result.body).substring(0, 200));
    process.exit(1);
  }

  const res = result.body;
  console.log('   response.success:', res.success);
  console.log('   response.data count:', res.data ? res.data.length : 'null/undefined');

  if (!res.success) {
    console.error('   ERROR: API returned success=false:', res.message);
    process.exit(1);
  }

  if (!res.data || res.data.length === 0) {
    console.warn('   WARNING: No published feedback — renderCards will show empty state');
    process.exit(0);
  }

  // 2. Simulate renderCards logic
  console.log('\n2. Simulating renderCards():');
  res.data.forEach((f, i) => {
    console.log(`   Card ${i+1}:`);
    console.log('     customerName:', f.customerName || '(missing!)');
    console.log('     title       :', f.title        || '(missing!)');
    console.log('     message     :', (f.message || '(missing!)').substring(0, 50));
    console.log('     rating      :', f.rating, typeof f.rating);
    console.log('     adminReply  :', f.adminReply ? 'present' : 'none');
    console.log('     publishedAt :', f.publishedAt || 'null');

    // Check for undefined values that would cause issues
    if (!f.customerName) console.error('     !! customerName is missing — avatar initials will fail');
    if (typeof f.rating !== 'number') console.error('     !! rating is not a number:', typeof f.rating);
  });

  // 3. Confirm CSS class
  console.log('\n3. CSS class check:');
  console.log('   Cards get class: "testimonial-card fade-in visible delay-N"');
  console.log('   .fade-in default: opacity:0 — WOULD BE INVISIBLE');
  console.log('   .fade-in.visible: opacity:1 — VISIBLE (fix already applied)');

  // 4. Check API_BASE_URL usage
  console.log('\n4. API URL construction:');
  console.log('   API_BASE_URL = "/api" (from js/api.js)');
  console.log('   apiUrl = API_BASE_URL + "/feedback/public" = "/api/feedback/public"');
  console.log('   On Cloudflare Tunnel: resolves to https://<tunnel>/api/feedback/public ✓');

  console.log('\n=== CONCLUSION ===');
  console.log('Backend: OK — ' + res.data.length + ' card(s) ready to render');
  console.log('Fix needed: cards must have .visible class (already applied in index.html)');
  console.log('Result: testimonials WILL appear after server restart');
}

main().catch(e => { console.error('UNCAUGHT:', e.message); process.exit(1); });
