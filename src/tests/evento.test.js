require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const Trabajador = require("../models/Trabajador");
const Usuario = require("../models/Usuario");
const Evento = require("../models/Evento");

let mongoServer;
let token;
let trabajadorId;
let usuarioId;
let eventoId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const tecnico = await Trabajador.create({
    nombre: "Técnico",
    apellido: "Evento",
    telefono: 600111222,
    dni: "11111111T",
    fechaIncorporacion: "2020-01-01",
    email: "tecnico@evento.com",
    contraseña: "123456",
    tipo: "Tecnico",
  });
  trabajadorId = tecnico._id;

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "tecnico@evento.com", contraseña: "123456" });

  token = login.body.token;

  const usuario = await Usuario.create({
    nombre: "UsuarioEvento",
    apellido: "Test",
    telefono: 666666666,
    dni: "99999999U",
    fechaNacimiento: "2012-06-15",
    tipoAutismo: "ASPERGER",
    gradoAutismo: 60,
    grupoTrabajo: 1,
  });

  usuarioId = usuario._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("CRUD Evento", () => {
  it("debe crear un nuevo evento", async () => {
    const res = await request(app)
      .post("/api/eventos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Evento Test",
        descripcion: "Un evento de prueba",
        fecha: "2024-05-01",
        entradasTotales: 10,
        trabajadoresMinimos: 2,
        creadoPor: trabajadorId,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.evento).toBeDefined();
    eventoId = res.body.evento._id;
  });

  it("debe obtener la lista de eventos", async () => {
    const res = await request(app)
      .get("/api/eventos")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.eventos)).toBe(true);
    expect(res.body.totalEventos).toBeGreaterThan(0);
  });

  it("debe obtener un evento por ID", async () => {
    const res = await request(app)
      .get(`/api/eventos/${eventoId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(eventoId);
  });

  it("debe permitir participar en un evento", async () => {
    const res = await request(app)
      .post(`/api/eventos/${eventoId}/participar`)
      .set("Authorization", `Bearer ${token}`)
      .send({ trabajadorId });

    expect(res.statusCode).toBe(200);
    expect(res.body.evento.participantes).toContainEqual(
      expect.stringMatching(trabajadorId.toString())
    );
  });

  it("debe permitir solicitar entradas", async () => {
    const res = await request(app)
      .post(`/api/eventos/${eventoId}/entradas`)
      .set("Authorization", `Bearer ${token}`)
      .send({ usuarioId, cantidad: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.evento.entradasDisponibles).toBe(8);
  });

  it("debe acumular entradas si ya se ha solicitado anteriormente", async () => {
    const res = await request(app)
      .post(`/api/eventos/${eventoId}/entradas`)
      .set("Authorization", `Bearer ${token}`)
      .send({ usuarioId, cantidad: 2 });

    expect(res.statusCode).toBe(200);

    const entrada = res.body.evento.entradasSolicitadas.find((e) => {
      const id = e.usuario?._id || e.usuario;
      return id?.toString() === usuarioId.toString();
    });

    expect(entrada).toBeDefined();
    expect(entrada.cantidad).toBe(4);
  });

  it("debe obtener eventos por mes", async () => {
    const res = await request(app)
      .get("/api/eventos/por-mes/listado?year=2024&month=5")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("debe actualizar un evento", async () => {
    const res = await request(app)
      .put(`/api/eventos/${eventoId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Evento Actualizado",
        descripcion: "Descripción modificada",
        fecha: "2024-05-02",
        entradasTotales: 10,
        trabajadoresMinimos: 1,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.evento.nombre).toBe("Evento Actualizado");
  });

  it("debe fallar si se intenta establecer menos entradas que las ya solicitadas", async () => {
    const res = await request(app)
      .put(`/api/eventos/${eventoId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Evento Fallido",
        descripcion: "Probando límite",
        fecha: "2024-05-03",
        entradasTotales: 2,
        trabajadoresMinimos: 1,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/No puedes establecer un total menor/);
  });

  it("debe eliminar un evento", async () => {
    const res = await request(app)
      .delete(`/api/eventos/${eventoId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Evento eliminado correctamente");
  });

  it("debe devolver 404 al eliminar un evento inexistente", async () => {
    const res = await request(app)
      .delete(`/api/eventos/${eventoId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Evento no encontrado");
  });
});
