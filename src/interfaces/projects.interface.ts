import { QueryResult } from "pg";

interface iProject {
  id: number;
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: Date;
  endDate: Date;
  developerId: number;
}

interface iProjectTechnology {
  addedIn: Date;
  technologyId: number;
  projectId: number;
}

interface iTech {
  id: number;
  name: string;
}

type iTechRequest = Omit<iTech, "id">;

type iProjectRequest = Omit<iProject, "id">;

type queryResultProjects = QueryResult<iProject>;

type queryResultTech = QueryResult<iTech>;

type queryResultProjectTech = QueryResult<iProjectTechnology>;

export {
  iProject,
  iProjectRequest,
  queryResultProjects,
  iTech,
  iTechRequest,
  queryResultTech,
  iProjectTechnology,
  queryResultProjectTech,
};
