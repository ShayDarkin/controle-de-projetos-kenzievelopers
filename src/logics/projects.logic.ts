import { Request, Response } from "express";
import {
  iProjectRequest,
  iTech,
  iTechRequest,
  queryResultProjectTech,
  queryResultProjects,
  queryResultTech,
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
  const techName: iTechRequest = request.body;
  const projectId: number = parseInt(request.params.id);

  const queryStringSelectTech: string = `
    SELECT 
      * 
    FROM 
      technologies 
    WHERE 
      name = $1

  `;
  const queryConfigSelectTech: QueryConfig = {
    text: queryStringSelectTech,
    values: [techName],
  };
  const queryResultSelectTech: queryResultTech = await client.query(
    queryConfigSelectTech
  );
  const tech: iTech = queryResultSelectTech.rows[0];

  const payloadInsertProject = {
    addedIn: new Date().toISOString().split("T")[0],
    technologyId: tech.id,
    projectId: projectId,
  };

  const queryStringProjectTech: string = format(
    `
  INSERT INTO
    projects_technologies(%I)
  VALUES
    (%L)
  RETURNING *;
  `,
    Object.keys(payloadInsertProject),
    Object.values(payloadInsertProject)
  );

  const queryResultProjectTech: queryResultProjectTech = await client.query(
    queryStringProjectTech
  );

  return response.status(201);
};

const insertQueryCreateTechnologies = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const projInfo = request.body;
  const projectId: number = parseInt(request.params.id);
  console.log(projInfo);
  const data = { ...projInfo, projectId };
  let queryString: string = `    
  SELECT      
    *    
  FROM     
    projects_technologies    
  WHERE      
    "technologyId" = $1 AND "projectId" = $2;  `;

  let queryConfig: QueryConfig = {
    text: queryString,
    values: [data.projectId, data.technologyId],
  };

  let queryResult = await client.query(queryConfig);
  queryString = `SELECT * FROM technologies WHERE "name" = $1;`;
  queryConfig = { text: queryString, values: [projInfo.name] };
  queryResult = await client.query(queryConfig);
  const techId = queryResult.rows[0].id;
  queryString = `      INSERT INTO       projects_technologies ("addedIn", "technologyId", "projectId")      VALUES($1, $2, $3);`;
  queryConfig = {
    text: queryString,
    values: [new Date().toISOString().split("T")[0], techId, projectId],
  };
  await client.query(queryConfig);
  queryString = `    
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

  queryConfig = { text: queryString, values: [projectId] };
  const queryStringNames: string = `SELECT * FROM technologies WHERE "name" = $1;`;
  const queryConfigNames: QueryConfig = {
    text: queryStringNames,
    values: [techId],
  };
  const queryResultNames = await client.query(queryConfigNames);
  console.log(queryResultNames);
  if (queryResultNames.rowCount === 0) {
    return response.status(409).json({
      message: "This technology is already associated with the project",
    });
  }
  queryResult = await client.query(queryConfig);
  return response.status(201).json(queryResult.rows[0]);
};

export {
  createProject,
  readProjectsById,
  updateProject,
  deleteProject,
  createTechnology,
  insertQueryCreateTechnologies,
};
