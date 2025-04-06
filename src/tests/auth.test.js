require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcrypt");

const app = require("../app");
const Familiar = require("../models/Familiar");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  await Familiar.create({
    nombre: "Rafa",
    apellido: "García",
    dni: "12345678A",
    email: "rafa@test.com",
    contraseña: "123456",
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /api/auth/login", () => {
  it("debe devolver un token si las credenciales son correctas", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "rafa@test.com", contraseña: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario).toBeDefined();
    expect(res.body.usuario.email).toBe("rafa@test.com");
    expect(res.body.usuario.contraseña).toBeUndefined();
  });

  it("debe fallar si la contraseña es incorrecta", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "rafa@test.com", contraseña: "wrongpassword" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Credenciales inválidas");
  });

  it("debe fallar si el email no existe", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "noexiste@test.com", contraseña: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Credenciales inválidas");
  });
});

describe("GET /api/auth/validate-token", () => {
  it("debe validar el token y devolver los datos del usuario", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "rafa@test.com", contraseña: "123456" });

    const token = loginRes.body.token;

    const res = await request(app)
      .get("/api/auth/validate-token")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.usuario).toBeDefined();
    expect(res.body.usuario.email).toBe("rafa@test.com");
    expect(res.body.usuario.rol).toBe("Familiar");
  });

  it("debe devolver 401 si el token no está presente", async () => {
    const res = await request(app).get("/api/auth/validate-token");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Acceso denegado");
  });

  it("debe devolver 401 si el token es inválido", async () => {
    const res = await request(app)
      .get("/api/auth/validate-token")
      .set("Authorization", "Bearer token-falso");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Token inválido");
  });
});
