import { NextFunction, Request, Response } from "express";
import { QueryConfig } from "pg";
import { client } from "../database";
import { queryResultProjects } from "../interfaces/projects.interface";

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

export {
  ensureMiddlewareDevExistsForProjects,
  ensureMiddlewareProjectExistsForTechnology,
};
