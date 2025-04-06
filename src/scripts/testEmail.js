require("dotenv").config();
require("../database");

const enviarNotificaciones = require("../cron/notificacionActividades");

enviarNotificaciones()
  .then(() => {
    console.log("✅ Proceso terminado");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Error al ejecutar manualmente:", err);
    process.exit(1);
  });
