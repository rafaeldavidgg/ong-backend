// seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const { fakerES: faker } = require("@faker-js/faker");

const Familiar = require("../models/Familiar");
const Trabajador = require("../models/Trabajador");
const Usuario = require("../models/Usuario");
const TipoActividad = require("../models/TipoActividad");
const Actividad = require("../models/Actividad");
const Asistencia = require("../models/Asistencia");
const Evento = require("../models/Evento");
const Incidencia = require("../models/Incidencia");
const SolicitudAsociacion = require("../models/SolicitudAsociacion");

function generarDNI() {
  const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
  const numero = Math.floor(Math.random() * 100000000);
  const letra = letras[numero % 23];
  return numero.toString().padStart(8, "0") + letra;
}

const nombresActividades = [
  "Taller de pintura creativa",
  "Sesión de musicoterapia",
  "Clase de cocina saludable",
  "Yoga adaptado",
  "Taller de cerámica",
  "Juegos cooperativos",
  "Cuentacuentos interactivo",
  "Manualidades con papel",
  "Danza libre",
  "Horticultura terapéutica",
  "Taller de teatro",
  "Juegos de mesa educativos",
  "Estimulación sensorial",
  "Taller de dibujo libre",
  "Sesión de relajación guiada",
];

const eventosData = [
  {
    nombre: "Fiesta de bienvenida",
    descripcion:
      "Celebramos la llegada de nuevos participantes con juegos y música.",
  },
  {
    nombre: "Salida al parque",
    descripcion: "Disfrutaremos de un día al aire libre en el parque cercano.",
  },
  {
    nombre: "Cine en familia",
    descripcion: "Proyección de una película adaptada para todos los públicos.",
  },
  {
    nombre: "Tarde de karaoke",
    descripcion: "Canta tus canciones favoritas en un ambiente divertido.",
  },
  {
    nombre: "Taller de repostería",
    descripcion: "Aprenderemos a hacer galletas y bizcochos de forma sencilla.",
  },
  {
    nombre: "Jornada deportiva",
    descripcion:
      "Competencias amistosas y juegos de equipo para fomentar el movimiento.",
  },
  {
    nombre: "Día de disfraces",
    descripcion:
      "Trae tu disfraz favorito y participa en el desfile de personajes.",
  },
  {
    nombre: "Fiesta temática",
    descripcion:
      "Decoramos y ambientamos según una temática divertida elegida por todos.",
  },
  {
    nombre: "Concierto de talentos",
    descripcion: "Un espacio para mostrar tus habilidades artísticas.",
  },
  {
    nombre: "Encuentro con familias",
    descripcion:
      "Actividades colaborativas para fortalecer vínculos familiares.",
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("\n🔌 Conectado a MongoDB\n");

    await Promise.all([
      Familiar.deleteMany(),
      Trabajador.deleteMany(),
      Usuario.deleteMany(),
      TipoActividad.deleteMany(),
      Actividad.deleteMany(),
      Asistencia.deleteMany(),
      Evento.deleteMany(),
      Incidencia.deleteMany(),
      SolicitudAsociacion.deleteMany(),
    ]);
    console.log("📦 Datos anteriores eliminados");

    const trabajadorTecnico = new Trabajador({
      nombre: "Javier",
      apellido: "López",
      telefono: 600000001,
      dni: "12345678T",
      email: "tecnico@gmail.com",
      contraseña: "tecnico123",
      tipo: "Tecnico",
      fechaIncorporacion: new Date(),
    });
    await trabajadorTecnico.save();

    const trabajadorAuxiliar = new Trabajador({
      nombre: "María",
      apellido: "Ruiz",
      telefono: 600000002,
      dni: "23456789A",
      email: "auxiliar@gmail.com",
      contraseña: "auxiliar123",
      tipo: "Auxiliar",
      fechaIncorporacion: new Date(),
    });
    await trabajadorAuxiliar.save();

    const familiarFijo = new Familiar({
      nombre: "Carmen",
      apellido: "Fernández",
      telefono: 600000003,
      dni: "34567890B",
      email: "familiar@gmail.com",
      contraseña: "familiar123",
      tipoDeRelacionConUsuario: "Madre",
    });
    await familiarFijo.save();

    const trabajadores = [trabajadorTecnico, trabajadorAuxiliar];
    for (let i = 0; i < 30; i++) {
      const t = new Trabajador({
        nombre: faker.person.firstName(),
        apellido: faker.person.lastName(),
        telefono: Number("6" + faker.string.numeric(8)),
        dni: generarDNI(),
        email: faker.internet.email(),
        contraseña: "123456",
        tipo: i % 2 === 0 ? "Auxiliar" : "Tecnico",
        fechaIncorporacion: faker.date.past({ years: 3 }),
      });
      await t.save();
      trabajadores.push(t);
    }
    console.log("👷‍♂️ Trabajadores creados");

    const familiares = [familiarFijo];
    for (let i = 0; i < 30; i++) {
      const f = new Familiar({
        nombre: faker.person.firstName(),
        apellido: faker.person.lastName(),
        telefono: Number("6" + faker.string.numeric(8)),
        dni: generarDNI(),
        email: faker.internet.email(),
        contraseña: "123456",
        tipoDeRelacionConUsuario: "Padre",
      });
      await f.save();
      familiares.push(f);
    }
    console.log("👨‍👩‍👧‍👦 Familiares creados");

    const usuarios = [];
    for (let i = 0; i < 30; i++) {
      const u = new Usuario({
        nombre: faker.person.firstName(),
        apellido: faker.person.lastName(),
        telefono: Number("6" + faker.string.numeric(8)),
        dni: generarDNI(),
        fechaNacimiento: faker.date.birthdate({
          min: 10,
          max: 25,
          mode: "age",
        }),
        tipoAutismo: faker.helpers.arrayElement([
          "ASPERGER",
          "AUTISMO_CLASICO",
          "TGD_NE",
          "TRASTORNO_DESINTEGRATIVO",
        ]),
        gradoAutismo: faker.number.int({ min: 1, max: 100 }),
        grupoTrabajo: faker.number.int({ min: 1, max: 3 }),
      });
      await u.save();
      usuarios.push(u);
    }
    console.log("🧒 Usuarios creados");

    familiares.forEach(async (f, i) => {
      f.usuariosAsociados = usuarios
        .slice(i % 25, (i % 25) + 2)
        .map((u) => u._id);
      await f.save();
    });

    const tipos = [
      {
        nombreTipo: "Pintura terapéutica",
        descripcion: "Actividad de expresión creativa con pinturas.",
        duracion: 60,
        materiales: "Acuarelas, pinceles, papel",
      },
      {
        nombreTipo: "Música y movimiento",
        descripcion: "Baile libre y ritmos para liberar tensiones.",
        duracion: 45,
        materiales: "Altavoz, música",
      },
      {
        nombreTipo: "Cocina fácil",
        descripcion: "Preparación de recetas sencillas.",
        duracion: 90,
        materiales: "Ingredientes, utensilios básicos",
      },
    ];
    const tipoDocs = [];
    for (const t of tipos) {
      const doc = new TipoActividad(t);
      await doc.save();
      tipoDocs.push(doc);
    }
    console.log("🏷️ Tipos de actividad creados");

    for (let i = 0; i < 30; i++) {
      const actividad = new Actividad({
        nombre: faker.helpers.arrayElement(nombresActividades),
        fecha: faker.date.recent({ days: 30 }),
        realizadaPor: faker.helpers.arrayElements(
          usuarios.map((u) => u._id),
          2
        ),
        ejecutadaPor: faker.helpers.arrayElements(
          trabajadores.map((t) => t._id),
          2
        ),
        creadaPor: faker.helpers.arrayElement(
          trabajadores.filter((t) => t.tipo === "Tecnico")
        )._id,
        tipoActividad: faker.helpers.arrayElement(tipoDocs)._id,
      });
      await actividad.save();
    }
    console.log("📆 Actividades creadas");

    for (let i = 0; i < 60; i++) {
      const asistencia = new Asistencia({
        fecha: faker.date.recent({ days: 30 }),
        presente: faker.datatype.boolean(),
        justificada: faker.datatype.boolean(),
        descripcion: faker.lorem.sentence(),
        usuario: faker.helpers.arrayElement(usuarios)._id,
        justificadaPor: faker.helpers.arrayElement(familiares)._id,
      });
      await asistencia.save();
    }
    console.log("📋 Asistencias creadas");

    for (let i = 0; i < eventosData.length; i++) {
      const e = eventosData[i];
      const entradasTotales = faker.number.int({ min: 15, max: 50 });
      const evento = new Evento({
        nombre: e.nombre,
        descripcion: e.descripcion,
        fecha: faker.date.future({ days: 60 }),
        entradasTotales,
        entradasDisponibles: entradasTotales,
        trabajadoresMinimos: faker.number.int({ min: 1, max: 3 }),
        participantes: faker.helpers.arrayElements(
          trabajadores.map((t) => t._id),
          3
        ),
        creadoPor: faker.helpers.arrayElement(
          trabajadores.filter((t) => t.tipo === "Tecnico")
        )._id,
      });
      await evento.save();
    }
    console.log("🎟️ Eventos creados");

    for (let i = 0; i < 30; i++) {
      const incidencia = new Incidencia({
        fecha: faker.date.recent(),
        tipoIncidencia: faker.helpers.arrayElement([
          "AGITACION",
          "AUTOLESION",
          "AGRESION_VERBAL",
          "AGRESION_FISICA",
          "SOBRECARGA_SENSORIAL",
          "OTRO",
        ]),
        descripcion: faker.lorem.sentence(),
        usuario: faker.helpers.arrayElement(usuarios)._id,
        creadaPor: faker.helpers.arrayElement(
          trabajadores.filter((t) => t.tipo === "Tecnico")
        )._id,
      });
      await incidencia.save();
    }
    console.log("⚠️ Incidencias creadas");

    for (let i = 0; i < 10; i++) {
      const solicitud = new SolicitudAsociacion({
        familiar: faker.helpers.arrayElement(familiares)._id,
        usuario: faker.helpers.arrayElement(usuarios)._id,
        estado: "pendiente",
      });
      await solicitud.save();
    }
    console.log("📨 Solicitudes de asociación creadas");

    console.log("\n✅ Seed completado correctamente\n");
    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error en el seed:", error);
    mongoose.disconnect();
  }
})();
