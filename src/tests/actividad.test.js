require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const Familiar = require("../models/Familiar");
const Usuario = require("../models/Usuario");
const Trabajador = require("../models/Trabajador");
const TipoActividad = require("../models/TipoActividad");

let mongoServer;
let token;
let actividadId;
let usuarioId;
let trabajadorId;
let tipoActividadId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Crear usuario, trabajador, tipoActividad y familiar (para login)
  await Familiar.create({
    nombre: "Token",
    apellido: "Tester",
    telefono: 600000000,
    dni: "00000000Z",
    tipoDeRelacionConUsuario: "Hermano",
    email: "token@test.com",
    contraseña: "123456",
  });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "token@test.com", contraseña: "123456" });

  token = loginRes.body.token;

  const usuario = await Usuario.create({
    nombre: "Pepe",
    apellido: "Pérez",
    telefono: 600111222,
    dni: "88888888H",
    fechaNacimiento: "2010-01-01",
    tipoAutismo: "ASPERGER",
    gradoAutismo: 40,
    grupoTrabajo: 1,
  });

  usuarioId = usuario._id;

  const trabajador = await Trabajador.create({
    nombre: "Laura",
    apellido: "García",
    telefono: 600999888,
    dni: "99999999Y",
    fechaIncorporacion: "2023-01-01",
    email: "laura@test.com",
    contraseña: "123456",
    tipo: "Tecnico",
  });

  trabajadorId = trabajador._id;

  const tipo = await TipoActividad.create({
    nombreTipo: "Juegos cognitivos",
    descripcion: "Estimulación mental",
    duracion: 45,
    materiales: "Puzzles",
  });

  tipoActividadId = tipo._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("CRUD Actividad", () => {
  it("debe crear una nueva actividad", async () => {
    const res = await request(app)
      .post("/api/actividades")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Actividad de prueba",
        fecha: "2024-04-10",
        realizadaPor: [usuarioId],
        ejecutadaPor: [trabajadorId],
        tipoActividad: tipoActividadId,
        creadaPor: trabajadorId,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.actividad).toBeDefined();
    expect(res.body.actividad.nombre).toBe("Actividad de prueba");

    actividadId = res.body.actividad._id;
  });

  it("debe obtener la lista de actividades", async () => {
    const res = await request(app)
      .get("/api/actividades")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.actividades)).toBe(true);
    expect(res.body.totalActividades).toBeGreaterThan(0);
  });

  it("debe obtener una actividad por ID", async () => {
    const res = await request(app)
      .get(`/api/actividades/${actividadId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(actividadId);
  });

  it("debe actualizar una actividad", async () => {
    const res = await request(app)
      .put(`/api/actividades/${actividadId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Actividad actualizada",
        fecha: "2024-04-12",
        realizadaPor: [usuarioId],
        ejecutadaPor: [trabajadorId],
        tipoActividad: tipoActividadId,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.actividad.nombre).toBe("Actividad actualizada");
  });

  it("debe eliminar una actividad", async () => {
    const res = await request(app)
      .delete(`/api/actividades/${actividadId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Actividad eliminada");

    const check = await request(app)
      .get(`/api/actividades/${actividadId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(check.statusCode).toBe(404);
  });
});

describe("Errores en operaciones con Actividad", () => {
  it("debe fallar al crear una actividad sin campos obligatorios", async () => {
    const res = await request(app)
      .post("/api/actividades")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fecha: "2024-04-11",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Faltan campos obligatorios");
  });

  it("debe devolver 404 al obtener una actividad inexistente", async () => {
    const res = await request(app)
      .get("/api/actividades/605c3c2f72f28e2f88aafabc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Actividad no encontrada");
  });

  it("debe devolver 404 al actualizar una actividad inexistente", async () => {
    const res = await request(app)
      .put("/api/actividades/605c3c2f72f28e2f88aafabc")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Ficticia",
        fecha: "2024-05-01",
        realizadaPor: [],
        ejecutadaPor: [],
        tipoActividad: tipoActividadId,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Actividad no encontrada");
  });

  it("debe devolver 404 al eliminar una actividad inexistente", async () => {
    const res = await request(app)
      .delete("/api/actividades/605c3c2f72f28e2f88aafabc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Actividad no encontrada");
  });

  it("debe devolver error si falta el usuarioId en la ruta de actividades por usuario", async () => {
    const res = await request(app)
      .get("/api/actividades/usuario")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Falta el parámetro usuarioId");
  });

  it("debe devolver error si falta el año o mes en actividades por usuario y mes", async () => {
    const res = await request(app)
      .get(`/api/actividades/por-usuario/${usuarioId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Faltan parámetros de año o mes");
  });
});
