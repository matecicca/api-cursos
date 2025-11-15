// controllers/clases.controller.js
const mongoose = require('mongoose');
const Usuario = require('../models/usuario.model.js');
const Clase = require('../models/clase.model.js');

// Crear clase
const crearClase = async (req, res) => {
  try {
    let docenteId = req.body.docente;

    // Validar docente (igual que antes)
    if (mongoose.Types.ObjectId.isValid(docenteId)) {
      const docente = await Usuario.findOne({ _id: docenteId, tipo: 'docente' });
      if (!docente) return res.status(400).json({ mensaje: 'El docente no existe o no es válido' });
    } else {
      const docente = await Usuario.findOne({ email: docenteId, tipo: 'docente' });
      if (!docente) return res.status(400).json({ mensaje: 'El docente no existe o no es válido' });
      docenteId = docente._id;
    }

    // 🚨 Validar límite de clases
    const totalClases = await Clase.countDocuments();
    if (totalClases >= 15) {
      return res.status(400).json({ mensaje: 'No hay espacio: ya existen 15 clases registradas' });
    }

    // 🚨 Validar que el classCode no esté repetido
    const existeClassCode = await Clase.findOne({ classCode: req.body.classCode });
    if (existeClassCode) {
      return res.status(400).json({ mensaje: `El classCode ${req.body.classCode} ya está en uso` });
    }

    // Crear clase
    const nuevaClase = new Clase({
      ...req.body,
      docente: docenteId
    });

    const claseGuardada = await nuevaClase.save();
    res.status(201).json(claseGuardada);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener todas las clases (con filtros por docente y nombre)
const getClases = async (req, res) => {
  try {
    const { docente, nombre } = req.query;
    let filtro = {};

    // 🔹 Filtro por docente (ID, email o nombre)
    if (docente) {
      if (mongoose.Types.ObjectId.isValid(docente)) {
        const existeDocente = await Usuario.findOne({ _id: docente, tipo: 'docente' });
        if (!existeDocente) return res.status(404).json({ mensaje: 'Docente no encontrado' });
        filtro.docente = docente;
      } else if (docente.includes('@')) {
        const docenteEncontrado = await Usuario.findOne({ email: docente, tipo: 'docente' });
        if (!docenteEncontrado) return res.status(404).json({ mensaje: 'Docente no encontrado' });
        filtro.docente = docenteEncontrado._id;
      } else {
        // Buscar por nombre con RegExp
        const docentes = await Usuario.find({ nombre: new RegExp(docente.trim(), 'i'), tipo: 'docente' });
        if (!docentes.length) return res.status(404).json({ mensaje: 'Docente no encontrado' });
        filtro.docente = { $in: docentes.map(d => d._id) };
      }
    }

    // 🔹 Filtro por nombre de clase
    if (nombre) {
      filtro.nombre = new RegExp(nombre.trim(), 'i');
    }

    const clases = await Clase.find(filtro).populate('docente', 'nombre email tipo');
    res.json(clases);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener una clase por ID con info del docente
const getClaseById = async (req, res) => {
  try {
    const clase = await Clase.findById(req.params.id).populate('docente', 'nombre email tipo');
    if (!clase) return res.status(404).json({ mensaje: 'Clase no encontrada' });
    res.json(clase);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

const actualizarClase = async (req, res) => {
  try {
    let docenteId = req.body.docente;

    // Validar docente si se envía uno nuevo
    if (docenteId) {
      if (mongoose.Types.ObjectId.isValid(docenteId)) {
        const docente = await Usuario.findOne({ _id: docenteId, tipo: 'docente' });
        if (!docente) {
          return res.status(400).json({ mensaje: 'El docente no existe o no es válido' });
        }
      } else {
        const docente = await Usuario.findOne({ email: docenteId, tipo: 'docente' });
        if (!docente) {
          return res.status(400).json({ mensaje: 'El docente no existe o no es válido' });
        }
        docenteId = docente._id;
      }
      req.body.docente = docenteId;
    }

    // Validar que el nuevo classCode no esté repetido
    if (req.body.classCode) {
      const existeClassCode = await Clase.findOne({
        classCode: req.body.classCode,
        _id: { $ne: req.params.id }
      });
      if (existeClassCode) {
        return res.status(400).json({ mensaje: `El classCode ${req.body.classCode} ya está en uso` });
      }
    }

    const clase = await Clase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('docente', 'nombre email tipo');

    if (!clase) return res.status(404).json({ mensaje: 'Clase no encontrada' });

    res.json(clase);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Eliminar clase
const eliminarClase = async (req, res) => {
  try {
    const clase = await Clase.findByIdAndDelete(req.params.id);
    if (!clase) return res.status(404).json({ mensaje: 'Clase no encontrada' });
    res.json({ mensaje: 'Clase eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener alumnos inscritos en una clase
const getAlumnosInscritos = async (req, res) => {
  try {
    const Inscripcion = require('../models/inscripcion.model.js');
    const claseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(claseId)) {
      return res.status(400).json({ mensaje: 'ID de clase inválido' });
    }

    const clase = await Clase.findById(claseId);
    if (!clase) {
      return res.status(404).json({ mensaje: 'Clase no encontrada' });
    }

    const inscripciones = await Inscripcion.find({ clase: claseId })
      .populate('alumno', 'nombre email tipo')
      .sort({ createdAt: -1 });

    const alumnos = inscripciones.map(insc => ({
      inscripcionId: insc._id,
      alumno: insc.alumno,
      fechaInscripcion: insc.createdAt
    }));

    res.json(alumnos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

module.exports = {
  getClases,
  getClaseById,
  crearClase,
  actualizarClase,
  eliminarClase,
  getAlumnosInscritos
};
