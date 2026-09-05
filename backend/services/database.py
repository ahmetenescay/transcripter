import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'transcripter.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS transcripts (
            id TEXT,
            url TEXT NOT NULL,
            title TEXT,
            language TEXT,
            raw_text TEXT NOT NULL,
            summary TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id, language)
        )
    ''')
    conn.commit()
    conn.close()

def get_transcript(video_id: str, language: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM transcripts WHERE id = ? AND language = ?', (video_id, language))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def save_transcript(video_id: str, url: str, title: str, language: str, raw_text: str):
    conn = get_connection()
    c = conn.cursor()
    # Fetch existing summary to preserve it
    c.execute('SELECT summary FROM transcripts WHERE id = ? AND language = ?', (video_id, language))
    row = c.fetchone()
    existing_summary = row['summary'] if row else None
    
    c.execute('''
        INSERT OR REPLACE INTO transcripts (id, url, title, language, raw_text, summary)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (video_id, url, title, language, raw_text, existing_summary))
    conn.commit()
    conn.close()

def save_summary(video_id: str, language: str, summary: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        UPDATE transcripts SET summary = ? WHERE id = ? AND language = ?
    ''', (summary, video_id, language))
    conn.commit()
    conn.close()
