import express, { Application } from "express";
import "dotenv/config";
import {
  createDeveloper,
  createDeveloperInfos,
  deleteDeveloper,
  readDeveloperAndProjects,
  updateDeveloper,
} from "./logics/developers.logic";
import {
  ensureMiddlewareDeveloperInfoExist,
  ensureMiddlewareDeveloperSearch,
  ensureMiddlewareEmailExists,
} from "./middlewares/developer.middleware";
import {
  createProject,
  deleteProject,
  readProjectsById,
  updateProject,
} from "./logics/projects.logic";
import {
  ensureMiddlewareDevExistsForProjects,
  ensureMiddlewareProjectExistsForTechnology,
} from "./middlewares/projects.middleware";

const app: Application = express();
app.use(express.json());

app.post("/developers", ensureMiddlewareEmailExists, createDeveloper);
app.get(
  "/developers/:id",
  ensureMiddlewareDeveloperSearch,
  readDeveloperAndProjects
);
app.patch(
  "/developers/:id",
  ensureMiddlewareDeveloperSearch,
  ensureMiddlewareEmailExists,
  updateDeveloper
);
app.delete("/developers/:id", ensureMiddlewareDeveloperSearch, deleteDeveloper);
app.post(
  "/developers/:id/infos",
  ensureMiddlewareDeveloperSearch,
  ensureMiddlewareDeveloperInfoExist,
  createDeveloperInfos
);

app.post("/projects", ensureMiddlewareDevExistsForProjects, createProject);
app.get(
  "/projects/:id",
  ensureMiddlewareProjectExistsForTechnology,
  readProjectsById
);
app.patch(
  "/projects/:id",
  ensureMiddlewareProjectExistsForTechnology,
  ensureMiddlewareDevExistsForProjects,
  updateProject
);
app.delete(
  "/projects/:id",
  ensureMiddlewareProjectExistsForTechnology,
  deleteProject
);
app.post("/projects/:id/technologies");
app.delete("/projects/:id/technologies/:name");

export default app;
