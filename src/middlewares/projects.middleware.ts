import { NextFunction, Request, Response } from "express";
import { QueryConfig } from "pg";
import { client } from "../database";
import {
  iTech,
  iTechRequest,
  queryResultProjectTech,
  queryResultProjects,
  queryResultTech,
} from "../interfaces/projects.interface";

const ensureMiddlewareDevExistsForProjects = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id: number = parseInt(request.body.developerId);

  const queryString: string = `
  SELECT * 
  FROM developers 
  WHERE id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: queryResultProjects = await client.query(queryConfig);

  if (queryResult.rowCount === 0) {
    return response.status(404).json({ message: "Developer not found." });
  }
  return next();
};

const ensureMiddlewareProjectExistsForTechnology = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id: number = parseInt(request.params.id);

  const queryString: string = `
    SELECT * 
    FROM projects 
    WHERE id = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: queryResultProjects = await client.query(queryConfig);

  if (queryResult.rowCount === 0) {
    return response.status(404).json({ message: "Project not found." });
  }
  return next();
};

const ensureTechAlreadyAssociatedIsProject = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  let techName: string = request.body.name;
  if (request.route.path === "/projects/:id/technologies/:name") {
    techName = request.params.name;
  }

  const id: number = parseInt(request.params.id);

  const queryString: string = `
  SELECT 
    * 
  FROM 
    technologies 
  WHERE 
    "name" = $1;
  `;

  const queryConfigTech: QueryConfig = {
    text: queryString,
    values: [techName],
  };

  const queryResultTech: queryResultTech = await client.query(queryConfigTech);
  const tech: iTech = queryResultTech.rows[0];
  response.locals.tech = tech;

  if (queryResultTech.rowCount === 0) {
    return response.status(400).json({
      message: "Technology not supported.",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ],
    });
  }

  const queryStringVerifyTech: string = `
    SELECT 
      * 
    FROM 
      projects_technologies 
    WHERE "technologyId" = $1 AND "projectId" = $2
    `;

  const queryConfigVerifyTech: QueryConfig = {
    text: queryStringVerifyTech,
    values: [tech.id, id],
  };

  const queryResultVerifyTech: queryResultProjectTech = await client.query(
    queryConfigVerifyTech
  );

  if (queryResultVerifyTech.rowCount !== 0) {
    return response.status(409).json({
      message: "This technology is already associated with the project",
    });
  }

  return next();
};

const ensureDeleteMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const techName: string = request.params.name;

  const id: number = parseInt(request.params.id);

  const queryString: string = `
  SELECT 
    * 
  FROM 
    technologies 
  WHERE 
    "name" = $1;
  `;

  const queryConfigTech: QueryConfig = {
    text: queryString,
    values: [techName],
  };

  const queryResultTech: queryResultTech = await client.query(queryConfigTech);
  const tech: iTech = queryResultTech.rows[0];
  response.locals.tech = tech;

  if (queryResultTech.rowCount === 0) {
    return response.status(400).json({
      message: "Technology not supported.",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ],
    });
  }

  const queryStringVerifyTech: string = `
    SELECT 
      * 
    FROM 
      projects_technologies 
    WHERE "technologyId" = $1 AND "projectId" = $2
    `;

  const queryConfigVerifyTech: QueryConfig = {
    text: queryStringVerifyTech,
    values: [tech.id, id],
  };

  const queryResultVerifyTech: queryResultProjectTech = await client.query(
    queryConfigVerifyTech
  );

  if (queryResultVerifyTech.rowCount === 0) {
    return response.status(400).json({
      message: "Technology not related to the project.",
    });
  }

  return next();
};
export {
  ensureMiddlewareDevExistsForProjects,
  ensureMiddlewareProjectExistsForTechnology,
  ensureTechAlreadyAssociatedIsProject,
  ensureDeleteMiddleware,
};
