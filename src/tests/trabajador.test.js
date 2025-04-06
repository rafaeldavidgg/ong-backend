require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const Familiar = require("../models/Familiar");
const Trabajador = require("../models/Trabajador");

let mongoServer;
let token;
let trabajadorId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Crear familiar para obtener token
  await Familiar.create({
    nombre: "Token",
    apellido: "Tester",
    telefono: 600000000,
    dni: "00000000Z",
    tipoDeRelacionConUsuario: "Hermano",
    email: "token@test.com",
    contraseña: "123456",
  });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "token@test.com", contraseña: "123456" });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("CRUD Trabajador", () => {
  it("debe crear un nuevo trabajador", async () => {
    const res = await request(app)
      .post("/api/trabajadores")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Laura",
        apellido: "Sánchez",
        telefono: 612345678,
        dni: "11111111Z",
        fechaIncorporacion: "2024-01-15",
        email: "laura@test.com",
        contraseña: "123456",
        tipo: "Auxiliar",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.trabajador).toBeDefined();
    expect(res.body.trabajador.email).toBe("laura@test.com");

    trabajadorId = res.body.trabajador._id;
  });

  it("debe obtener la lista de trabajadores", async () => {
    const res = await request(app)
      .get("/api/trabajadores")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.trabajadores)).toBe(true);
    expect(res.body.totalTrabajadores).toBeGreaterThan(0);
  });

  it("debe obtener un trabajador por ID", async () => {
    const res = await request(app)
      .get(`/api/trabajadores/${trabajadorId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("laura@test.com");
  });

  it("debe actualizar un trabajador", async () => {
    const res = await request(app)
      .put(`/api/trabajadores/${trabajadorId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Laura Actualizada",
        apellido: "Sánchez",
        telefono: 699999999,
        dni: "11111111Z",
        fechaIncorporacion: "2024-01-15",
        email: "laura@test.com",
        tipo: "Tecnico",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.trabajador.nombre).toBe("Laura Actualizada");
  });

  it("debe eliminar un trabajador", async () => {
    const res = await request(app)
      .delete(`/api/trabajadores/${trabajadorId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Trabajador eliminado");

    const check = await request(app)
      .get(`/api/trabajadores/${trabajadorId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(check.statusCode).toBe(404);
  });
});

describe("Errores en operaciones con Trabajador", () => {
  it("debe fallar al crear un trabajador con email duplicado", async () => {
    // Crear primero uno válido
    await request(app)
      .post("/api/trabajadores")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Carlos",
        apellido: "Molina",
        telefono: 666666666,
        dni: "22222222Y",
        fechaIncorporacion: "2023-05-20",
        email: "carlos@test.com",
        contraseña: "123456",
        tipo: "Tecnico",
      });

    // Intentar crear otro con el mismo email
    const res = await request(app)
      .post("/api/trabajadores")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Otro",
        apellido: "Usuario",
        telefono: 666000000,
        dni: "33333333W",
        fechaIncorporacion: "2023-05-21",
        email: "carlos@test.com", // duplicado
        contraseña: "123456",
        tipo: "Auxiliar",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Ya existe un usuario registrado con ese email"
    );
  });

  it("debe fallar al crear un trabajador con tipo inválido", async () => {
    const res = await request(app)
      .post("/api/trabajadores")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Error",
        apellido: "Tipo",
        telefono: 600000000,
        dni: "44444444H",
        fechaIncorporacion: "2024-03-01",
        email: "error@tipo.com",
        contraseña: "123456",
        tipo: "Jefe", // inválido
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Tipo de trabajador no válido");
  });

  it("debe fallar al crear un trabajador sin campos obligatorios", async () => {
    const res = await request(app)
      .post("/api/trabajadores")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Todos los campos obligatorios deben ser proporcionados"
    );
  });

  it("debe devolver 404 al actualizar un trabajador inexistente", async () => {
    const res = await request(app)
      .put("/api/trabajadores/605c3c2f72f28e2f88aafabc")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Noexiste",
        apellido: "Trabajador",
        telefono: 666000111,
        dni: "00000000T",
        fechaIncorporacion: "2022-01-01",
        email: "no@existe.com",
        tipo: "Auxiliar",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Trabajador no encontrado");
  });

  it("debe devolver 404 al eliminar un trabajador inexistente", async () => {
    const res = await request(app)
      .delete("/api/trabajadores/605c3c2f72f28e2f88aafabc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Trabajador no encontrado");
  });
});
