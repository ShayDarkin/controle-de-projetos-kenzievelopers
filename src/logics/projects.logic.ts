import { Request, Response } from "express";
import {
  iProjectRequest,
  iProjectTechnology,
  iTech,
  iTechRequest,
  queryResultProjectTech,
  queryResultProjects,
  queryResultTech,
} from "../interfaces/projects.interface";
import format from "pg-format";
import { client } from "../database";
import { QueryConfig, QueryResult } from "pg";

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

const createTechnologyForProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const techName: iTechRequest = request.body.name;
  const id: number = parseInt(request.params.id);
  const tech: iTech = response.locals.tech;

  const payloadTech = {
    addedIn: new Date().toISOString().split("T")[0],
    technologyId: tech.id,
    projectId: id,
  };

  const queryStringInsertProjectTech: string = format(
    `
  INSERT INTO 
    projects_technologies(%I)
  
  VALUES
    (%L)

  RETURNING *;
  `,
    Object.keys(payloadTech),
    Object.values(payloadTech)
  );

  const queryResultInsertProjectTech: queryResultProjectTech =
    await client.query(queryStringInsertProjectTech);

  const queryStringResponseTech: string = `    
  SELECT       
    tech."id"            AS "technologyId",       
    tech."name"          AS "technologyName",       
    proj."id"            AS "projectId",       
    proj."name"          AS "projectName",       
    proj."description"   AS "projectDescription",       
    proj."estimatedTime" AS "projectEstimatedTime",       
    proj."repository"    AS "projectRepository",       
    proj."startDate"     AS "projectStartDate",       
    proj."endDate"       AS "projectEndDate"      
  
  FROM        
    projects proj      
  
  JOIN       
    projects_technologies pt 
  
  ON pt."projectId" = proj."id"      
  
  JOIN technologies tech ON tech.id = pt."technologyId"      
  
  WHERE proj.id = $1;  `;

  const queryConfigResponseTech: QueryConfig = {
    text: queryStringResponseTech,
    values: [id],
  };

  const queryResultResponseTech = await client.query(queryConfigResponseTech);

  return response.status(201).json(queryResultResponseTech.rows[0]);
};

const deleteTechForProjects = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const nameTech: string = request.params.name;
  const idProject: number = parseInt(request.params.id);

  const queryStringTech: string = `
  SELECT 
    *
  FROM
    technologies

  WHERE "name"= $1
  `;

  const queryConfigTech: QueryConfig = {
    text: queryStringTech,
    values: [nameTech],
  };

  const queryResultTech: queryResultTech = await client.query(queryConfigTech);
  const tech: iTech = queryResultTech.rows[0];

  const queryStringDelete: string = `
  DELETE 

  FROM 
    projects_technologies

    WHERE "technologyId" = $1 AND "projectId" = $2
  `;

  const queryConfigDelete: QueryConfig = {
    text: queryStringDelete,
    values: [tech.id, idProject],
  };

  const queryResultDelete: queryResultProjectTech = await client.query(
    queryConfigDelete
  );
  return response.status(204).send();
};

export {
  createProject,
  readProjectsById,
  updateProject,
  deleteProject,
  createTechnologyForProject,
  deleteTechForProjects,
};
