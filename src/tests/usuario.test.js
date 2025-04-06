require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const Usuario = require("../models/Usuario");
const Familiar = require("../models/Familiar");

let mongoServer;
let usuarioId;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

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
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("CRUD Usuario", () => {
  it("debe crear un nuevo usuario", async () => {
    const res = await request(app)
      .post("/api/usuarios")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Juan",
        apellido: "Pérez",
        telefono: 600123456,
        dni: "12345678A",
        fechaNacimiento: "2000-01-01",
        tipoAutismo: "ASPERGER",
        gradoAutismo: 50,
        grupoTrabajo: 1,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.usuario).toBeDefined();
    expect(res.body.usuario.nombre).toBe("Juan");

    usuarioId = res.body.usuario._id;
  });

  it("debe obtener la lista de usuarios", async () => {
    const res = await request(app)
      .get("/api/usuarios")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.usuarios)).toBe(true);
    expect(res.body.totalUsuarios).toBeGreaterThan(0);
  });

  it("debe obtener un usuario por ID", async () => {
    const res = await request(app)
      .get(`/api/usuarios/${usuarioId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.nombre).toBe("Juan");
  });

  it("debe actualizar un usuario", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${usuarioId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Juan Actualizado",
        apellido: "Pérez",
        telefono: 600999999,
        dni: "12345678A",
        fechaNacimiento: "2000-01-01",
        tipoAutismo: "ASPERGER",
        gradoAutismo: 70,
        grupoTrabajo: 1,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.nombre).toBe("Juan Actualizado");
  });

  it("debe obtener usuarios por IDs", async () => {
    const res = await request(app)
      .post("/api/usuarios/asociados")
      .set("Authorization", `Bearer ${token}`)
      .send({ ids: [usuarioId] });

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]._id).toBe(usuarioId);
  });

  it("debe eliminar un usuario", async () => {
    const res = await request(app)
      .delete(`/api/usuarios/${usuarioId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Usuario eliminado");

    const check = await request(app)
      .get(`/api/usuarios/${usuarioId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(check.statusCode).toBe(404);
  });
});

describe("Errores en operaciones con Usuario", () => {
  it("debe fallar al crear un usuario sin campos obligatorios", async () => {
    const res = await request(app)
      .post("/api/usuarios")
      .set("Authorization", `Bearer ${token}`)
      .send({
        dni: "11111111Z",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Todos los campos obligatorios deben ser proporcionados"
    );
  });

  it("debe devolver 404 al buscar un usuario inexistente", async () => {
    const res = await request(app)
      .get("/api/usuarios/605c3c2f72f28e2f88aafabc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Usuario no encontrado");
  });

  it("debe devolver 404 al actualizar un usuario inexistente", async () => {
    const res = await request(app)
      .put("/api/usuarios/605c3c2f72f28e2f88aafabc")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Fake",
        apellido: "User",
        fechaNacimiento: "2010-01-01",
        tipoAutismo: "ASPERGER",
        grupoTrabajo: 1,
        gradoAutismo: 25,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Usuario no encontrado");
  });

  it("debe devolver 404 al eliminar un usuario inexistente", async () => {
    const res = await request(app)
      .delete("/api/usuarios/605c3c2f72f28e2f88aafabc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Usuario no encontrado");
  });

  it("debe fallar al obtener usuarios por IDs si el array está vacío", async () => {
    const res = await request(app)
      .post("/api/usuarios/asociados")
      .set("Authorization", `Bearer ${token}`)
      .send({ ids: [] });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Debes proporcionar un array de IDs");
  });
});
