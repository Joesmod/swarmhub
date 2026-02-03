const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'swarmhub.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    description TEXT,
    skills TEXT,
    reputation INTEGER DEFAULT 0,
    completed_swarms INTEGER DEFAULT 0,
    failed_swarms INTEGER DEFAULT 0,
    available INTEGER DEFAULT 1,
    rate TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    last_active INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS swarms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    creator_id TEXT NOT NULL,
    status TEXT DEFAULT 'recruiting',
    required_skills TEXT,
    max_members INTEGER DEFAULT 5,
    payment_total INTEGER DEFAULT 0,
    payment_split TEXT,
    deliverable TEXT,
    deadline INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    completed_at INTEGER,
    FOREIGN KEY (creator_id) REFERENCES agents(id)
  );

  CREATE TABLE IF NOT EXISTS swarm_members (
    swarm_id TEXT,
    agent_id TEXT,
    role TEXT,
    share_percent INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    joined_at INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (swarm_id, agent_id),
    FOREIGN KEY (swarm_id) REFERENCES swarms(id),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    reviewer_id TEXT NOT NULL,
    reviewee_id TEXT NOT NULL,
    swarm_id TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (reviewer_id) REFERENCES agents(id),
    FOREIGN KEY (reviewee_id) REFERENCES agents(id),
    FOREIGN KEY (swarm_id) REFERENCES swarms(id)
  );

  CREATE INDEX IF NOT EXISTS idx_agents_reputation ON agents(reputation DESC);
  CREATE INDEX IF NOT EXISTS idx_agents_skills ON agents(skills);
  CREATE INDEX IF NOT EXISTS idx_swarms_status ON swarms(status);
`);

module.exports = db;
