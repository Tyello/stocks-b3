const express = require("express");
const app = express();
const path = require("path");
const PORT = 8082;
const root = path.join(__dirname, "build");

// Middleware para tratar requisições genéricas
const genericMiddleware = function (req, res, next) {
  next();
};

// Rota para o verificador de saúde da aplicação
const healthCheckRoute = (req, res) => {
  res.json({
    status: "OK",
  });
};

// Rota para informações sobre o recurso
const resourceStatusRoute = (req, res) => {
  res.json({
    createdBy: "Marcelo Oliveira",
    nodeVersion: "v14x",
    applicationName: "stocks-b3",
  });
};

// Rota para informações gerais
const infoRoute = (req, res) => {
  res.json({
    url: root,
  });
};

// Centralizando as rotas num arquivo separado
const routes = {
  "/health": healthCheckRoute,
  "/resource-status": resourceStatusRoute,
  "/info": infoRoute,
};

// Aplicando os middlewares
app.use(express.static(root));
app.use(genericMiddleware);

// Aplicando as rotas
Object.entries(routes).forEach(([route, handler]) => {
  app.get(route, handler);
});

// Iniciando o servidor
app.listen(PORT, () => console.log(`⚡ Server is running in ${PORT}`));