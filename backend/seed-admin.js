// Script para crear un usuario administrador inicial
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Usuario = require('./models/usuario.model.js');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/escolar';

// Datos del admin por defecto
const adminData = {
  nombre: 'Administrador',
  email: 'admin@escolar.com',
  password: 'admin123',
  tipo: 'admin'
};

async function crearAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const existingAdmin = await Usuario.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log(`⚠️  Ya existe un usuario con el email: ${adminData.email}`);
      console.log(`   ID: ${existingAdmin._id}`);
      console.log(`   Tipo: ${existingAdmin.tipo}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const admin = await Usuario.create({
      nombre: adminData.nombre,
      email: adminData.email,
      password: hashedPassword,
      tipo: adminData.tipo
    });

    console.log('\n✅ Usuario administrador creado exitosamente:');
    console.log('   ==========================================');
    console.log(`   ID:       ${admin._id}`);
    console.log(`   Nombre:   ${admin.nombre}`);
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   Tipo:     ${admin.tipo}`);
    console.log('   ==========================================\n');
    console.log('💡 Usa estas credenciales para iniciar sesión como administrador.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear el administrador:', error.message);
    process.exit(1);
  }
}

crearAdmin();
