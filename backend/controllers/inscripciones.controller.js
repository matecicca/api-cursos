// controllers/inscripciones.controller.js
const mongoose = require('mongoose');
const Usuario = require('../models/usuario.model.js');
const Clase = require('../models/clase.model.js');
const Inscripcion = require('../models/inscripcion.model.js');

const crearInscripcion = async (req, res) => {
  try {
    let alumnoId = req.body.alumno;
    let claseInput = req.body.clase;

    // === Validar alumno (ID, email o nombre) ===
    if (mongoose.Types.ObjectId.isValid(alumnoId)) {
      const alumno = await Usuario.findOne({ _id: alumnoId, tipo: 'alumno' });
      if (!alumno) return res.status(400).json({ mensaje: 'El alumno no existe o no es válido' });
    } else if (typeof alumnoId === 'string' && alumnoId.includes('@')) {
      const alumno = await Usuario.findOne({ email: alumnoId, tipo: 'alumno' });
      if (!alumno) return res.status(400).json({ mensaje: 'El alumno no existe o no es válido' });
      alumnoId = alumno._id;
    } else if (typeof alumnoId === 'string') {
      const alumno = await Usuario.findOne({ nombre: new RegExp(alumnoId.trim(), 'i'), tipo: 'alumno' });
      if (!alumno) return res.status(400).json({ mensaje: 'El alumno no existe o no es válido' });
      alumnoId = alumno._id;
    } else {
      return res.status(400).json({ mensaje: 'Formato de alumno inválido' });
    }

    // === Validar que los alumnos solo se inscriban a sí mismos ===
    if (req.user && req.user.role === 'alumno') {
      if (req.user.id !== alumnoId.toString()) {
        return res.status(403).json({ mensaje: 'Los alumnos solo pueden inscribirse a sí mismos' });
      }
    }

    // === Validar clase (ID, classCode numérico o nombre exacto) ===
    let claseDoc;
    if (mongoose.Types.ObjectId.isValid(claseInput)) {
      claseDoc = await Clase.findById(claseInput);
    } else {
      const asNumber = Number(claseInput);
      if (!Number.isNaN(asNumber)) {
        claseDoc = await Clase.findOne({ classCode: asNumber });
      } else if (typeof claseInput === 'string') {
        claseDoc = await Clase.findOne({ nombre: new RegExp(`^${claseInput.trim()}$`, 'i') });
      }
    }
    if (!claseDoc) return res.status(400).json({ mensaje: 'La clase indicada no existe' });

    // === Validar que no exista inscripción previa (alumno, clase) ===
    const existe = await Inscripcion.findOne({ alumno: alumnoId, clase: claseDoc._id });
    if (existe) {
      return res.status(400).json({ mensaje: 'El alumno ya está inscripto en esta clase' });
    }

    // Crear
    const nueva = await Inscripcion.create({ alumno: alumnoId, clase: claseDoc._id });
    return res.status(201).json(nueva);
  } catch (err) {
    // Duplicate key (índice único alumno+clase)
    if (err && err.code === 11000) {
      return res.status(400).json({ mensaje: 'Inscripción duplicada (alumno ya inscripto en esta clase)' });
    }
    return res.status(500).json({ mensaje: err.message });
  }
};

// Obtener todas las inscripciones (filtro por alumno, clase o docente)
const getInscripciones = async (req, res) => {
  try {
    const { alumno, clase, docente } = req.query;
    const filtro = {};

    // Filtrar por alumno (ID, email o nombre)
    if (alumno) {
      if (mongoose.Types.ObjectId.isValid(alumno)) {
        const alumnoDoc = await Usuario.findOne({ _id: alumno, tipo: 'alumno' });
        if (!alumnoDoc) return res.status(404).json({ mensaje: 'Alumno no encontrado' });
        filtro.alumno = alumnoDoc._id;
      } else if (typeof alumno === 'string' && alumno.includes('@')) {
        const alumnoDoc = await Usuario.findOne({ email: alumno, tipo: 'alumno' });
        if (!alumnoDoc) return res.status(404).json({ mensaje: 'Alumno no encontrado' });
        filtro.alumno = alumnoDoc._id;
      } else if (typeof alumno === 'string') {
        const alumnoDoc = await Usuario.findOne({ nombre: new RegExp(alumno.trim(), 'i'), tipo: 'alumno' });
        if (!alumnoDoc) return res.status(404).json({ mensaje: 'Alumno no encontrado' });
        filtro.alumno = alumnoDoc._id;
      } else {
        return res.status(400).json({ mensaje: 'Parámetro alumno inválido' });
      }
    }

    // Filtrar por clase (ID, classCode o nombre)
    if (clase) {
      let claseDoc;
      if (mongoose.Types.ObjectId.isValid(clase)) {
        claseDoc = await Clase.findById(clase);
      } else {
        const asNumber = Number(clase);
        if (!Number.isNaN(asNumber)) {
          claseDoc = await Clase.findOne({ classCode: asNumber });
        } else if (typeof clase === 'string') {
          claseDoc = await Clase.findOne({ nombre: new RegExp(clase.trim(), 'i') });
        } else {
          return res.status(400).json({ mensaje: 'Parámetro clase inválido' });
        }
      }
      if (!claseDoc) return res.status(404).json({ mensaje: 'Clase no encontrada' });
      filtro.clase = claseDoc._id;
    }

    // Filtrar por docente (nombre → resuelve docentes → clases del docente)
    if (docente) {
      if (typeof docente !== 'string' || !docente.trim()) {
        return res.status(400).json({ mensaje: 'Parámetro docente inválido' });
      }
      const docentes = await Usuario.find({ nombre: new RegExp(docente.trim(), 'i'), tipo: 'docente' });
      if (!docentes.length) return res.status(404).json({ mensaje: 'Docente no encontrado' });

      const clasesDocente = await Clase.find({ docente: { $in: docentes.map(d => d._id) } });
      if (!clasesDocente.length) return res.status(404).json({ mensaje: 'No se encontraron clases para este docente' });

      filtro.clase = { $in: clasesDocente.map(c => c._id) };
    }

    // Buscar inscripciones con populate
    const inscripciones = await Inscripcion.find(filtro)
      .populate('alumno', 'nombre email tipo')
      .populate({
        path: 'clase',
        select: 'nombre classCode fecha docente',
        populate: { path: 'docente', select: 'nombre email' }
      });

    res.json(inscripciones);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Eliminar inscripción
const eliminarInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'ID inválido' });
    }

    const inscripcion = await Inscripcion.findByIdAndDelete(id);
    if (!inscripcion) return res.status(404).json({ mensaje: 'Inscripción no encontrada' });
    res.json({ mensaje: 'Inscripción eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

module.exports = {
  crearInscripcion,
  getInscripciones,
  eliminarInscripcion
};
