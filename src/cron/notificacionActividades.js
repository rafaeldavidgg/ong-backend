const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Actividad = require("../models/Actividad");
const Familiar = require("../models/Familiar");
require("../models/Usuario");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function formatearEmailHTML(familiarNombre, actividadesPorUsuario) {
  const logoUrl =
    "https://aittea.autismosevilla.org/wp-content/uploads/2021/02/Reestyling.png";

  const fechaFormateada = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  let html = `
      <div style="font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 10px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${logoUrl}" alt="Logo" style="max-height: 60px; margin-bottom: 10px;" />
          <h1 style="color: #104572; font-size: 24px; margin: 0;">Recordatorio de Actividades</h1>
          <p style="color: #888; font-size: 14px; margin: 0;">${fechaFormateada}</p>
        </div>
  
        <p style="font-size: 16px;">Hola ${familiarNombre},</p>
    `;

  for (let usuarioId in actividadesPorUsuario) {
    const { nombre, actividades } = actividadesPorUsuario[usuarioId];

    html += `
        <p style="font-size: 15px; margin-top: 20px;">Hoy <strong>${nombre}</strong> tiene las siguientes actividades:</p>
        <ul style="padding-left: 20px; margin-top: 5px; font-size: 14px;">
          ${actividades.map((a) => `<li>${a}</li>`).join("")}
        </ul>
      `;
  }

  html += `
        <p style="margin-top: 30px; font-size: 15px;">Gracias por confiar en nosotros.</p>
      </div>
    `;

  return html;
}

const enviarNotificacionesActividades = async () => {
  try {
    const hoy = new Date().toISOString().split("T")[0];

    const actividades = await Actividad.find({ fecha: hoy }).populate(
      "realizadaPor"
    );

    const familiaresMap = {};

    for (let actividad of actividades) {
      for (let usuario of actividad.realizadaPor) {
        if (!usuario?._id) continue;

        const familiares = await Familiar.find({
          usuariosAsociados: usuario._id,
        });

        for (let familiar of familiares) {
          const familiarId = familiar._id.toString();
          const usuarioId = usuario._id.toString();

          if (!familiaresMap[familiarId]) {
            familiaresMap[familiarId] = {
              familiar,
              actividadesPorUsuario: {},
            };
          }

          if (!familiaresMap[familiarId].actividadesPorUsuario[usuarioId]) {
            familiaresMap[familiarId].actividadesPorUsuario[usuarioId] = {
              nombre: usuario.nombre || "Familiar",
              actividades: [],
            };
          }

          familiaresMap[familiarId].actividadesPorUsuario[
            usuarioId
          ].actividades.push(actividad.nombre);
        }
      }
    }

    for (let clave in familiaresMap) {
      const { familiar, actividadesPorUsuario } = familiaresMap[clave];

      const fechaFormateada = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: familiar.email,
        subject: `Recordatorio actividades (${fechaFormateada})`,
        html: formatearEmailHTML(familiar.nombre, actividadesPorUsuario),
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Email enviado a ${familiar.email}`);
    }
  } catch (err) {
    console.error("❌ Error al enviar notificaciones:", err);
  }
};

cron.schedule("0 7 * * *", enviarNotificacionesActividades);

module.exports = enviarNotificacionesActividades;
