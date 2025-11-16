// Script para renombrar la colección 'clases' a 'cursos'
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/escolar';

async function renameCollection() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const db = mongoose.connection.db;

    // Verificar si existe la colección 'clases'
    const collections = await db.listCollections({ name: 'clases' }).toArray();

    if (collections.length === 0) {
      console.log('ℹ️  La colección "clases" no existe. Probablemente ya fue migrada o no hay datos.');

      // Verificar si existe 'cursos'
      const cursosCollections = await db.listCollections({ name: 'cursos' }).toArray();
      if (cursosCollections.length > 0) {
        console.log('✅ La colección "cursos" ya existe.');
      }

      await mongoose.connection.close();
      return;
    }

    // Contar documentos en 'clases'
    const clasesCollection = db.collection('clases');
    const count = await clasesCollection.countDocuments();
    console.log(`📊 Documentos en colección 'clases': ${count}`);

    // Renombrar la colección
    await clasesCollection.rename('cursos');
    console.log('✅ Colección renombrada de "clases" a "cursos"');

    // Verificar el resultado
    const cursosCollection = db.collection('cursos');
    const newCount = await cursosCollection.countDocuments();
    console.log(`📊 Documentos en colección 'cursos': ${newCount}`);

    await mongoose.connection.close();
    console.log('✅ Migración de colección completada. Conexión cerrada.');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

renameCollection();
