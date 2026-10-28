const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/app.db');

const now = new Date(2026, 9, 28); // Oct 28, 2026

function toIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const scheduleUpdates = [
  // Discovery & Research (Oct 24 - Oct 27)
  { title: 'User interviews', date: toIso(addDays(now, -4)), start: toIso(addDays(now, -4)), end: toIso(addDays(now, -3)) },
  { title: 'Market research', date: toIso(addDays(now, -4)), start: toIso(addDays(now, -4)), end: toIso(addDays(now, -2)) },
  { title: 'Competitive analysis', date: toIso(addDays(now, -3)), start: toIso(addDays(now, -3)), end: toIso(addDays(now, -1)) },

  // Design & Planning (Oct 26 - Oct 30)
  { title: 'Create wireframes', date: toIso(addDays(now, -2)), start: toIso(addDays(now, -2)), end: toIso(addDays(now, 0)) },
  { title: 'Design system', date: toIso(addDays(now, -1)), start: toIso(addDays(now, -1)), end: toIso(addDays(now, 1)) },
  { title: 'Prototype', date: toIso(addDays(now, 0)), start: toIso(addDays(now, 0)), end: toIso(addDays(now, 2)) },

  // Development (Oct 27 - Nov 03)
  { title: 'Frontend development', date: toIso(addDays(now, -1)), start: toIso(addDays(now, -1)), end: toIso(addDays(now, 3)) },
  { title: 'Backend development', date: toIso(addDays(now, 0)), start: toIso(addDays(now, 0)), end: toIso(addDays(now, 2)) },
  { title: 'API integration', date: toIso(addDays(now, 1)), start: toIso(addDays(now, 1)), end: toIso(addDays(now, 3)) },

  // Review & QA (Nov 01 - Nov 04)
  { title: 'Testing', date: toIso(addDays(now, 3)), start: toIso(addDays(now, 3)), end: toIso(addDays(now, 4)) },
  { title: 'Client review', date: toIso(addDays(now, 4)), start: toIso(addDays(now, 4)), end: toIso(addDays(now, 5)) },
  { title: 'Fixes', date: toIso(addDays(now, 4)), start: toIso(addDays(now, 4)), end: toIso(addDays(now, 6)) },

  // Launch (Nov 05 - Nov 06)
  { title: 'Deploy to production', date: toIso(addDays(now, 5)), start: toIso(addDays(now, 5)), end: toIso(addDays(now, 6)) },
  { title: 'Monitor & support', date: toIso(addDays(now, 6)), start: toIso(addDays(now, 6)), end: toIso(addDays(now, 7)) }
];

db.serialize(() => {
  for (const s of scheduleUpdates) {
    db.run(
      'UPDATE schedules SET date = ?, start_date = ?, end_date = ? WHERE title = ?',
      [s.date, s.start, s.end, s.title],
      function(err) {
        if (err) console.error(err);
        else console.log('Updated ' + s.title + ': ' + s.start + ' -> ' + s.end);
      }
    );
  }
});
db.close();
