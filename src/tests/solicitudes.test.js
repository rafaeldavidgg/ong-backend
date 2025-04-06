require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const Familiar = require("../models/Familiar");
const Usuario = require("../models/Usuario");
const Solicitud = require("../models/SolicitudAsociacion");
const bcrypt = require("bcrypt");

let mongoServer;
let token;
let familiarId;
let usuarioId;
let solicitudId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const familiar = await Familiar.create({
    nombre: "Carlos",
    apellido: "González",
    dni: "12345678X",
    telefono: 666111222,
    email: "carlos@test.com",
    contraseña: "123456",
    tipoDeRelacionConUsuario: "Padre",
  });

  familiarId = familiar._id;

  const usuario = await Usuario.create({
    nombre: "Pepe",
    apellido: "López",
    telefono: 612345678,
    dni: "99999999Y",
    fechaNacimiento: new Date("2010-01-01"),
    tipoAutismo: "ASPERGER",
    gradoAutismo: 70,
    grupoTrabajo: 1,
  });

  usuarioId = usuario._id;

  const res = await request(app).post("/api/auth/login").send({
    email: "carlos@test.com",
    contraseña: "123456",
  });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Solicitudes de asociación", () => {
  it("debe crear una solicitud de asociación", async () => {
    const res = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${token}`)
      .send({ dniUsuario: "99999999Y", familiarId });

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    solicitudId = res.body._id;
  });

  it("debe obtener las solicitudes pendientes", async () => {
    const res = await request(app)
      .get("/api/solicitudes")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.solicitudes)).toBe(true);
    expect(res.body.solicitudes.length).toBeGreaterThan(0);
  });

  it("debe aceptar una solicitud", async () => {
    const res = await request(app)
      .put(`/api/solicitudes/${solicitudId}/aceptar`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Solicitud aceptada correctamente");

    const familiarActualizado = await Familiar.findById(familiarId);
    expect(familiarActualizado.usuariosAsociados).toContainEqual(usuarioId);
  });

  it("debe rechazar (eliminar) una solicitud", async () => {
    const nuevaSolicitud = await Solicitud.create({
      familiar: familiarId,
      usuario: usuarioId,
    });

    const res = await request(app)
      .delete(`/api/solicitudes/${nuevaSolicitud._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Solicitud eliminada");
  });

  it("debe fallar si ya existe una solicitud pendiente", async () => {
    await Solicitud.create({
      familiar: familiarId,
      usuario: usuarioId,
    });

    const res = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${token}`)
      .send({ dniUsuario: "99999999Y", familiarId });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Ya has enviado una solicitud para este usuario."
    );
  });

  it("debe fallar si el usuario no existe", async () => {
    const res = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${token}`)
      .send({ dniUsuario: "00000000Z", familiarId });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Usuario no encontrado");
  });

  it("debe devolver 404 al aceptar una solicitud inexistente", async () => {
    const res = await request(app)
      .put(`/api/solicitudes/605c3c2f72f28e2f88aafabc/aceptar`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Solicitud no encontrada");
  });
});
