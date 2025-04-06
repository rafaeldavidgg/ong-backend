require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const Familiar = require("../models/Familiar");
const Trabajador = require("../models/Trabajador");
const Usuario = require("../models/Usuario");
const Incidencia = require("../models/Incidencia");

let mongoServer;
let token;
let usuarioId;
let trabajadorId;
let incidenciaId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const familiar = await Familiar.create({
    nombre: "Rafa",
    apellido: "García",
    dni: "12345678A",
    email: "rafa@test.com",
    contraseña: "123456",
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email: "rafa@test.com",
    contraseña: "123456",
  });

  token = loginRes.body.token;

  const trabajador = await Trabajador.create({
    nombre: "Lucía",
    apellido: "Sánchez",
    dni: "23456789B",
    telefono: 666777888,
    email: "lucia@test.com",
    contraseña: "123456",
    fechaIncorporacion: new Date(),
    tipo: "Auxiliar",
  });

  trabajadorId = trabajador._id;

  const usuario = await Usuario.create({
    nombre: "Carlos",
    apellido: "Pérez",
    dni: "34567890C",
    telefono: 611222333,
    fechaNacimiento: new Date("2000-01-01"),
    tipoAutismo: "ASPERGER",
    gradoAutismo: 50,
    grupoTrabajo: 1,
  });

  usuarioId = usuario._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("CRUD Incidencia", () => {
  it("debe crear una incidencia", async () => {
    const res = await request(app)
      .post("/api/incidencias")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fecha: new Date(),
        tipoIncidencia: "AGITACION",
        descripcion: "Incidencia de prueba",
        usuario: usuarioId,
        creadaPor: trabajadorId,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.incidencia).toBeDefined();
    expect(res.body.incidencia.tipoIncidencia).toBe("AGITACION");

    incidenciaId = res.body.incidencia._id;
  });

  it("debe obtener la lista de incidencias", async () => {
    const res = await request(app)
      .get("/api/incidencias")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.incidencias)).toBe(true);
    expect(res.body.totalIncidencias).toBeGreaterThan(0);
  });

  it("debe obtener una incidencia por ID", async () => {
    const res = await request(app)
      .get(`/api/incidencias/${incidenciaId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(incidenciaId);
  });

  it("debe actualizar una incidencia", async () => {
    const res = await request(app)
      .put(`/api/incidencias/${incidenciaId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        fecha: new Date(),
        tipoIncidencia: "AUTOLESION",
        descripcion: "Actualizada",
        usuario: usuarioId,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.incidencia.tipoIncidencia).toBe("AUTOLESION");
  });

  it("debe eliminar una incidencia", async () => {
    const res = await request(app)
      .delete(`/api/incidencias/${incidenciaId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Incidencia eliminada");
  });

  it("debe devolver 404 al eliminar una incidencia inexistente", async () => {
    const res = await request(app)
      .delete(`/api/incidencias/${incidenciaId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Incidencia no encontrada");
  });
});
