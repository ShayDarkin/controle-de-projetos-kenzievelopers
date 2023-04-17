import { Request, Response } from "express";
import {
  iProjectRequest,
  iTechRequest,
  queryResultProjects,
} from "../interfaces/projects.interface";
import format from "pg-format";
import { client } from "../database";
import { QueryConfig } from "pg";

const createProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const payload: iProjectRequest = request.body;

  const queryString: string = format(
    `
    INSERT INTO projects(%I)
    VALUES(%L)
    RETURNING *;
  `,
    Object.keys(payload),
    Object.values(payload)
  );

  const queryResult: queryResultProjects = await client.query(queryString);
  return response.status(201).json(queryResult.rows[0]);
};

const readProjectsById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);

  const queryString: string = `
    SELECT 
    pj."id"            AS "projectId",
    pj."name"          AS "projectName",
    pj."description"   AS "projectDescription",
    pj."estimatedTime" AS "projectEstimatedTime",
    pj."repository"    AS "projectRepository",
    pj."startDate"     AS "projectStartDate",
    pj."endDate"       AS "projectEndDate",
    pj."developerId"   AS "projectDeveloperId",
    pt."technologyId",
    th."name"          AS "technologyName"

    FROM projects AS pj

    LEFT JOIN projects_technologies AS pt
     ON pj.id = pt."projectId"

     LEFT JOIN technologies AS th
      ON pt."projectId" = th.id

      WHERE pj.id =$1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: queryResultProjects = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows);
};

const updateProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);
  const payload: iProjectRequest = request.body;

  const queryString: string = format(
    `
    UPDATE projects
        SET(%I) = ROW(%L)

    WHERE id = %L
    RETURNING *;
  `,
    Object.keys(payload),
    Object.values(payload),
    id
  );

  const queryResult: queryResultProjects = await client.query(queryString);

  return response.status(200).json(queryResult.rows[0]);
};

const deleteProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);

  const queryString: string = `
  DELETE FROM projects
  WHERE id =$1
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: queryResultProjects = await client.query(queryConfig);

  return response.status(204).send();
};

const createTechnology = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const payload: iTechRequest = request.body;
  const id: number = parseInt(request.params.id);

  const queryString: string = format(
    `

   INSERT INTO technologies(%I)
    VALUES(%L)
   RETURNING *;

  `,
    Object.keys(payload),
    Object.values(payload)
  );

  return response.status(201);
};
export { createProject, readProjectsById, updateProject, deleteProject };
