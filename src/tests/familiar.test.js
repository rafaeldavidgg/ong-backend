require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const Familiar = require("../models/Familiar");

let mongoServer;
let familiarId;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Creamos un familiar para poder loguearnos
  await Familiar.create({
    nombre: "Rafa",
    apellido: "García",
    telefono: 666777888,
    dni: "12345678Z",
    tipoDeRelacionConUsuario: "Padre",
    email: "nuevofamiliar@test.com",
    contraseña: "123456",
  });

  // Login y guardamos el token
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "nuevofamiliar@test.com", contraseña: "123456" });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("CRUD Familiar", () => {
  it("debe crear un nuevo familiar", async () => {
    const res = await request(app).post("/api/familiares").send({
      nombre: "Nuevo",
      apellido: "Usuario",
      telefono: 999999999,
      dni: "87654321X",
      tipoDeRelacionConUsuario: "Hermano",
      email: "creado@test.com",
      contraseña: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.familiar).toBeDefined();
    expect(res.body.familiar.email).toBe("creado@test.com");

    familiarId = res.body.familiar._id;
  });

  it("debe obtener la lista de familiares", async () => {
    const res = await request(app)
      .get("/api/familiares")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.familiares)).toBe(true);
    expect(res.body.totalFamiliares).toBeGreaterThan(0);
  });

  it("debe obtener un familiar por ID", async () => {
    const res = await request(app)
      .get(`/api/familiares/${familiarId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("creado@test.com");
  });

  it("debe actualizar un familiar existente", async () => {
    const res = await request(app)
      .put(`/api/familiares/${familiarId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Nuevo Actualizado",
        apellido: "Usuario",
        telefono: 999999000,
        dni: "87654321X",
        tipoDeRelacionConUsuario: "Primo",
        email: "creado@test.com", // el mismo email
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.familiar.nombre).toBe("Nuevo Actualizado");
  });

  it("debe eliminar un familiar existente", async () => {
    const res = await request(app)
      .delete(`/api/familiares/${familiarId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Familiar eliminado");

    // Confirmamos que ya no existe
    const check = await request(app)
      .get(`/api/familiares/${familiarId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(check.statusCode).toBe(404);
  });
});

describe("Errores en operaciones con Familiar", () => {
  it("debe fallar al crear un familiar con un email duplicado", async () => {
    const res = await request(app).post("/api/familiares").send({
      nombre: "Duplicado",
      apellido: "Correo",
      telefono: 123123123,
      dni: "11223344X",
      tipoDeRelacionConUsuario: "Tía",
      email: "nuevofamiliar@test.com", // ya existe por login
      contraseña: "123456",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Ya existe un usuario registrado con ese email"
    );
  });

  it("debe fallar al crear un familiar sin campos obligatorios", async () => {
    const res = await request(app).post("/api/familiares").send({
      telefono: 111222333,
      dni: "33445566D",
      tipoDeRelacionConUsuario: "Abuelo",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Todos los campos obligatorios deben ser proporcionados"
    );
  });

  it("debe fallar al actualizar un familiar con un email ya en uso", async () => {
    // Creamos un segundo familiar válido
    const nuevo = await request(app).post("/api/familiares").send({
      nombre: "Segundo",
      apellido: "Familiar",
      telefono: 111111111,
      dni: "11112222A",
      tipoDeRelacionConUsuario: "Madre",
      email: "segundo@test.com",
      contraseña: "123456",
    });

    const id = nuevo.body.familiar._id;

    // Intentamos actualizarlo con un email ya en uso
    const res = await request(app)
      .put(`/api/familiares/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Intento",
        apellido: "Repetido",
        telefono: 222222222,
        dni: "11112222A",
        tipoDeRelacionConUsuario: "Prima",
        email: "nuevofamiliar@test.com", // ya usado
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Ya existe otro usuario con ese email");
  });

  it("debe devolver 404 al buscar un familiar inexistente", async () => {
    const res = await request(app)
      .get(`/api/familiares/605c3c2f72f28e2f88aafabc`) // ID ficticio
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Familiar no encontrado");
  });

  it("debe devolver 404 al eliminar un familiar inexistente", async () => {
    const res = await request(app)
      .delete(`/api/familiares/605c3c2f72f28e2f88aafabc`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Familiar no encontrado");
  });
});
