require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const Familiar = require("../models/Familiar");
const Usuario = require("../models/Usuario");
const Asistencia = require("../models/Asistencia");

let mongoServer;
let token;
let usuarioId;
let familiarId;
let asistenciaId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const familiar = await Familiar.create({
    nombre: "FamiliarTest",
    apellido: "Uno",
    telefono: 600123456,
    dni: "12345678F",
    tipoDeRelacionConUsuario: "Padre",
    email: "familiar@test.com",
    contraseña: "123456",
  });
  familiarId = familiar._id;

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "familiar@test.com", contraseña: "123456" });

  token = login.body.token;

  const usuario = await Usuario.create({
    nombre: "UsuarioTest",
    apellido: "Uno",
    telefono: 600654321,
    dni: "12345678U",
    fechaNacimiento: "2010-01-01",
    tipoAutismo: "ASPERGER",
    gradoAutismo: 70,
    grupoTrabajo: 1,
  });
  usuarioId = usuario._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("CRUD Asistencia", () => {
  it("debe crear una nueva asistencia", async () => {
    const res = await request(app)
      .post("/api/asistencias")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fecha: "2024-04-05",
        presente: false,
        justificada: false,
        descripcion: "Ausencia sin justificar",
        usuario: usuarioId,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    asistenciaId = res.body._id;
  });

  it("debe fallar si se crea una asistencia duplicada en el mismo día", async () => {
    const res = await request(app)
      .post("/api/asistencias")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fecha: "2024-04-05",
        presente: false,
        justificada: false,
        descripcion: "Intento duplicado",
        usuario: usuarioId,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Ya hay una falta para este usuario en ese día."
    );
  });

  it("debe obtener todas las asistencias", async () => {
    const res = await request(app)
      .get("/api/asistencias")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.asistencias)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });

  it("debe obtener asistencia por ID", async () => {
    const res = await request(app)
      .get(`/api/asistencias/${asistenciaId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(asistenciaId);
    expect(res.body.usuario).toBeDefined();
  });

  it("debe obtener asistencias por usuario", async () => {
    const res = await request(app)
      .get(`/api/asistencias/usuario/${usuarioId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.asistencias)).toBe(true);
    expect(res.body.currentPage).toBe(1);
  });

  it("debe actualizar una asistencia para justificarla", async () => {
    const res = await request(app)
      .put(`/api/asistencias/${asistenciaId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        justificada: true,
        descripcion: "Justificada por enfermedad",
        justificadaPor: familiarId,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.justificada).toBe(true);
    expect(res.body.descripcion).toBe("Justificada por enfermedad");
  });

  it("debe fallar al obtener una asistencia inexistente", async () => {
    const res = await request(app)
      .get("/api/asistencias/605c3c2f72f28e2f88aafabc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.mensaje).toBe("Asistencia no encontrada");
  });

  it("debe fallar al editar una asistencia inexistente", async () => {
    const res = await request(app)
      .put("/api/asistencias/605c3c2f72f28e2f88aafabc")
      .set("Authorization", `Bearer ${token}`)
      .send({ justificada: true });

    expect(res.statusCode).toBe(404);
    expect(res.body.mensaje).toBe("Asistencia no encontrada");
  });
});
