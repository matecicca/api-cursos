// Script de migración para renombrar el campo 'clase' a 'curso' en inscripciones
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/escolar';

async function migrate() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const db = mongoose.connection.db;
    const inscripcionesCollection = db.collection('inscripcions');

    // Verificar cuántos documentos tienen el campo 'clase'
    const countWithClase = await inscripcionesCollection.countDocuments({ clase: { $exists: true } });
    console.log(`📊 Documentos con campo 'clase': ${countWithClase}`);

    if (countWithClase === 0) {
      console.log('✅ No hay documentos que migrar. Todo está actualizado.');
      await mongoose.connection.close();
      return;
    }

    // Renombrar el campo 'clase' a 'curso'
    const result = await inscripcionesCollection.updateMany(
      { clase: { $exists: true } },
      { $rename: { clase: 'curso' } }
    );

    console.log(`✅ Migración completada:`);
    console.log(`   - Documentos modificados: ${result.modifiedCount}`);
    console.log(`   - Documentos coincidentes: ${result.matchedCount}`);

    // Verificar que no queden documentos con 'clase'
    const remainingWithClase = await inscripcionesCollection.countDocuments({ clase: { $exists: true } });
    console.log(`📊 Documentos con 'clase' restantes: ${remainingWithClase}`);

    // Verificar cuántos tienen ahora 'curso'
    const countWithCurso = await inscripcionesCollection.countDocuments({ curso: { $exists: true } });
    console.log(`📊 Documentos con campo 'curso': ${countWithCurso}`);

    await mongoose.connection.close();
    console.log('✅ Migración finalizada. Conexión cerrada.');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

migrate();
