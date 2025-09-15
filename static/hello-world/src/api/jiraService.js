import { requestJira } from "@forge/bridge";

/**
 * Fetches all projects accessible by the user.
 */
export const fetchProjects = async () => {
  const response = await requestJira("/rest/api/3/project");
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch projects:", errorText);
    throw new Error(`Failed to fetch projects: ${response.status}`);
  }
  return response.json();
};

export const fetchIssuesByProject = async (
  projectKey,
  startAt = 0,
  maxResults = 10
) => {
  if (!projectKey) {
    console.error("Project key is required to fetch issues.");
    return { issues: [], total: 0 }; // Return empty result if no project key
  }

  const jql = `project = "${projectKey}" ORDER BY created DESC`;
  // Request specific fields to optimize the API call
  const fields = "summary,status,assignee,issuetype";
  const response = await requestJira(
    `/rest/api/3/search?jql=${encodeURIComponent(
      jql
    )}&startAt=${startAt}&maxResults=${maxResults}&fields=${fields}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `Failed to fetch issues for project ${projectKey}:`,
      errorText
    );
    throw new Error(`Failed to fetch issues: ${response.status}`);
  }

  const result = await response.json();
  return {
    issues: result.issues,
    total: result.total,
  };
};

export const updateIssue = async (issueId, updateData) => {
  const response = await requestJira(`/rest/api/3/issue/${issueId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });
  return response;
};

export const deleteIssue = async (issueId) => {
  const response = await requestJira(`/rest/api/3/issue/${issueId}`, {
    method: "DELETE",
  });

  return response;
};
export const getWorkType = async (projectId) => {
  const response = await requestJira(
    `/rest/api/3/issuetype/project?projectId=${projectId}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  return response.json();
};
