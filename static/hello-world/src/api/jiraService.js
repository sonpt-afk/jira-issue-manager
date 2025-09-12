import { requestJira } from '@forge/bridge';

/**
 * Fetches all projects accessible by the user.
 */
export const fetchProjects = async () => {
  const response = await requestJira('/rest/api/3/project');
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch projects:", errorText);
    throw new Error(`Failed to fetch projects: ${response.status}`);
  }
  return await response.json();
};

/**
 * Fetches issues for a given project key with pagination.
 * @param {string} projectKey - The key of the project (e.g., "TEST").
 * @param {number} startAt - The starting index for pagination.
 * @param {number} maxResults - The number of issues to return per page.
 */
export const fetchIssuesByProject = async (projectKey, startAt = 0, maxResults = 10) => {
  if (!projectKey) {
    console.error("Project key is required to fetch issues.");
    return { issues: [], total: 0 }; // Return empty result if no project key
  }

  const jql = `project = "${projectKey}" ORDER BY created DESC`;
  // Request specific fields to optimize the API call
  const fields = 'summary,status,assignee,issuetype';
  const response = await requestJira(`/rest/api/3/search?jql=${encodeURIComponent(jql)}&startAt=${startAt}&maxResults=${maxResults}&fields=${fields}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch issues for project ${projectKey}:`, errorText);
    throw new Error(`Failed to fetch issues: ${response.status}`);
  }
  
  const result = await response.json();
  return {
    issues: result.issues,
    total: result.total,
  };
};
