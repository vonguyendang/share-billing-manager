const Database = require('better-sqlite3');
const db = new Database(':memory:');

db.exec(`
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    start_date TEXT,
    next_due_date TEXT,
    amount_due REAL,
    billing_cycle_months INTEGER,
    status TEXT,
    plan_id TEXT,
    member_id TEXT
);
INSERT INTO subscriptions (id) VALUES ('sub1'), ('sub2');
`);

db.exec(`ALTER TABLE subscriptions ADD COLUMN send_email INTEGER DEFAULT 1;`);

db.prepare(`UPDATE subscriptions SET send_email = 0 WHERE id = 'sub1'`).run();

const rows = db.prepare('SELECT * FROM subscriptions').all();
console.log(rows);
