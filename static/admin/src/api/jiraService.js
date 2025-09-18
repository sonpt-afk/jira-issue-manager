import { requestJira } from "@forge/bridge";


export const getProjectContext = async() => {
  try {
    const response = await requestJira('/rest/api/3/project/search');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`);
    }
    
    const data = await response.json();
    const projects = data.values;
    
    if (!projects || projects.length === 0) {
      throw new Error("No projects found");
    }
    
    const targetProject = projects[0]; 
    return targetProject;
  } catch (error) {
    console.error("Failed to get project context:", error);
  }
}

export const getProjectProperty = async (projectId, propertyKey) => {
  const response = await requestJira(
    `/rest/api/3/project/${projectId}/properties/${propertyKey}`
  );
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const errorText = await response.text();
    console.error(`Failed to get project property ${propertyKey}:`, errorText);
  }
  return response.json();
};

export const setProjectProperty = async (projectId, propertyKey, value) => {
  const response = await requestJira(
    `/rest/api/3/project/${projectId}/properties/${propertyKey}`,
    {
      method: "PUT",
      headers: {
        'Accept': 'application/json',
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to set project property ${propertyKey}:`, errorText);
    throw new Error(`Failed to set project property: ${response.status}`);
  }
};

export const deleteProjectProperty = async (projectId, propertyKey) => {
  const response = await requestJira(
    `/rest/api/3/project/${projectId}/properties/${propertyKey}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok && response.status !== 204) {
    const errorText = await response.text();
    console.error(`Failed to delete project property ${propertyKey}:`, errorText);
    throw new Error(`Failed to delete project property: ${response.status}`);
  }
};
