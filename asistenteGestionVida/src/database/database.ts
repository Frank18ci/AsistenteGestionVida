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

    // Migración completa para la tabla tasks - verificar y agregar todas las columnas necesarias
    try {
      const tasksResult = await database.getAllAsync("PRAGMA table_info(tasks)");
      const existingColumns = (tasksResult as any[]).map(col => col.name);

      // Definir todas las columnas que deberían existir
      const requiredColumns = [
        { name: 'title', type: 'TEXT', defaultValue: 'Nueva Tarea' },
        { name: 'description', type: 'TEXT', defaultValue: null },
        { name: 'date', type: 'TEXT', defaultValue: new Date().toISOString().split('T')[0] },
        { name: 'startTime', type: 'TEXT', defaultValue: '09:00' },
        { name: 'endTime', type: 'TEXT', defaultValue: '10:00' },
        { name: 'alarmBefore', type: 'INTEGER', defaultValue: null },
        { name: 'type', type: 'TEXT', defaultValue: 'personal' },
        { name: 'isCompleted', type: 'INTEGER', defaultValue: 0 },
        { name: 'createdAt', type: 'TEXT', defaultValue: new Date().toISOString() },
        { name: 'notificationId', type: 'TEXT', defaultValue: null },
      ];

      // Agregar cada columna que falte
      for (const col of requiredColumns) {
        if (!existingColumns.includes(col.name)) {
          await database.execAsync(`ALTER TABLE tasks ADD COLUMN ${col.name} ${col.type};`);

          // Si hay un valor por defecto y hay registros existentes, actualizarlos
          // Solo actualizar si el defaultValue no es null (para columnas opcionales como description, dejamos null)
          if (col.defaultValue !== null && col.defaultValue !== undefined) {
            if (col.type === 'INTEGER') {
              await database.runAsync(
                `UPDATE tasks SET ${col.name} = ? WHERE ${col.name} IS NULL`,
                [col.defaultValue]
              );
            } else if (col.type === 'TEXT') {
              // Para columnas TEXT, solo actualizar si no es null y no está vacío
              // Si defaultValue es null, no actualizamos (permite valores null)
              await database.runAsync(
                `UPDATE tasks SET ${col.name} = ? WHERE ${col.name} IS NULL OR ${col.name} = ""`,
                [col.defaultValue]
              );
            }
          }
          // Si defaultValue es null, la columna se crea pero no se actualizan registros existentes
          // Esto es correcto para columnas opcionales como description

          console.log(`Added ${col.name} column to tasks table`);
        }
      }
    } catch (error) {
      console.log('Migration check for tasks table failed (might be already up to date):', error);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export default db;
