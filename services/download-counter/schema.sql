CREATE TABLE IF NOT EXISTS counters (
  project TEXT NOT NULL, event TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0 CHECK (value >= 0), updated_at TEXT NOT NULL,
  PRIMARY KEY (project, event)
);
CREATE TABLE IF NOT EXISTS download_events (
  project TEXT NOT NULL, event_id TEXT NOT NULL, event TEXT NOT NULL, created_at TEXT NOT NULL,
  PRIMARY KEY (project, event_id)
);
-- The event insert and counter update are one atomic SQLite statement/transaction.
-- A duplicate event cannot fire this trigger a second time.
CREATE TRIGGER IF NOT EXISTS count_download AFTER INSERT ON download_events
BEGIN
  INSERT INTO counters (project, event, value, updated_at)
  VALUES (NEW.project, NEW.event, 1, NEW.created_at)
  ON CONFLICT(project, event) DO UPDATE SET value = value + 1, updated_at = NEW.created_at;
END;
