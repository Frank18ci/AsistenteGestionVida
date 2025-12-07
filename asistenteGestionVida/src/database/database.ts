import * as SQLite from 'expo-sqlite';


const db = SQLite.openDatabaseAsync('asistente.db');

export const initDatabase = async () => {
  try {
    const database = await db;
    
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        category TEXT,
        description TEXT,
        date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        alarmBefore INTEGER,
        type TEXT NOT NULL,
        isCompleted INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        notificationId TEXT
      );

      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);

    try {
      const result = await database.getAllAsync("PRAGMA table_info(notes)");
      const hasTitle = (result as any[]).some(column => column.name === 'title');
      if (!hasTitle) {
        await database.execAsync('ALTER TABLE notes ADD COLUMN title TEXT;');
        console.log('Added title column to notes table');
      }
    } catch (error) {
      console.log('Migration check failed (might be already up to date):', error);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export default db;