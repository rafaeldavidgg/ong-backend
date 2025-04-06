require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const Familiar = require("../models/Familiar");
const TipoActividad = require("../models/TipoActividad");

let mongoServer;
let token;
let tipoActividadId;

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

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "token@test.com", contraseña: "123456" });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("CRUD TipoActividad", () => {
  it("debe crear un nuevo tipo de actividad", async () => {
    const res = await request(app)
      .post("/api/tipo-actividades")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombreTipo: "Psicomotricidad",
        descripcion: "Actividades de desarrollo motor",
        duracion: 60,
        materiales: "Colchonetas, pelotas",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.tipoActividad).toBeDefined();
    expect(res.body.tipoActividad.nombreTipo).toBe("Psicomotricidad");

    tipoActividadId = res.body.tipoActividad._id;
  });

  it("debe obtener la lista de tipos de actividad", async () => {
    const res = await request(app)
      .get("/api/tipo-actividades")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.tipoActividades)).toBe(true);
    expect(res.body.totalTipoActividades).toBeGreaterThan(0);
  });

  it("debe obtener un tipo de actividad por ID", async () => {
    const res = await request(app)
      .get(`/api/tipo-actividades/${tipoActividadId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(tipoActividadId);
  });

  it("debe actualizar un tipo de actividad", async () => {
    const res = await request(app)
      .put(`/api/tipo-actividades/${tipoActividadId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombreTipo: "Terapia sensorial",
        descripcion: "Estimulación de los sentidos",
        duracion: 90,
        materiales: "Texturas, luces",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.tipoActividad.nombreTipo).toBe("Terapia sensorial");
  });

  it("debe eliminar un tipo de actividad", async () => {
    const res = await request(app)
      .delete(`/api/tipo-actividades/${tipoActividadId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Tipo de actividad eliminado");

    const check = await request(app)
      .get(`/api/tipo-actividades/${tipoActividadId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(check.statusCode).toBe(404);
  });
});

describe("Errores en operaciones con TipoActividad", () => {
  it("debe fallar al crear un tipo de actividad sin campos obligatorios", async () => {
    const res = await request(app)
      .post("/api/tipo-actividades")
      .set("Authorization", `Bearer ${token}`)
      .send({
        descripcion: "Faltan campos",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Los campos 'nombreTipo' y 'duracion' son obligatorios"
    );
  });

  it("debe devolver 404 al buscar un tipo de actividad inexistente", async () => {
    const res = await request(app)
      .get("/api/tipo-actividades/605c3c2f72f28e2f88aafabc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Tipo de actividad no encontrado");
  });

  it("debe devolver 404 al actualizar un tipo de actividad inexistente", async () => {
    const res = await request(app)
      .put("/api/tipo-actividades/605c3c2f72f28e2f88aafabc")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombreTipo: "Ficticia",
        duracion: 30,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Tipo de actividad no encontrado");
  });

  it("debe devolver 404 al eliminar un tipo de actividad inexistente", async () => {
    const res = await request(app)
      .delete("/api/tipo-actividades/605c3c2f72f28e2f88aafabc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Tipo de actividad no encontrado");
  });
});
