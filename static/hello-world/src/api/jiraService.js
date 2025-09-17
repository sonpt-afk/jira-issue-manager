import { requestJira } from "@forge/bridge";

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
  maxResults = 10,
  includeParent = false,
  fetchAllPages = false
) => {
  if (!projectKey) {
    console.error("Project key is required to fetch issues.");
    return { issues: [], total: 0 }; // Return empty result if no project key
  }

  const jql = `project = "${projectKey}" ORDER BY created DESC`;
  let fields = "summary,status,assignee,issuetype";
  if (includeParent) {
    fields += ",parent";
  }
  if (!fetchAllPages) {
    // Original behavior - fetch single page
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
  } else {
    // New behavior - fetch all pages
    let allIssues = [];
    let currentStartAt = startAt;
    let hasMore = true;
    let total = 0;

    try {
      while (hasMore) {
        const response = await requestJira(
          `/rest/api/3/search?jql=${encodeURIComponent(
            jql
          )}&startAt=${currentStartAt}&maxResults=${maxResults}&fields=${fields}`
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

        if (!result.issues || result.issues.length === 0) {
          break;
        }

        allIssues = [...allIssues, ...result.issues];
        total = result.total;

        currentStartAt += maxResults;
        hasMore = allIssues.length < total;
      }

      return {
        issues: allIssues,
        total: total,
      };
    } catch (error) {
      console.error("Error fetching all issues:", error);
      throw error;
    }
  }
};

export const updateIssue = async (issueId, updateData) => {
  const response = await requestJira(`/rest/api/3/issue/${issueId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData), // Use updateData directly as it's already correctly formatted
  });

  if (!response.ok) {
    // Log the error response for better debugging
    const errorText = await response.text();
    console.error(
      `Failed to update issue ${issueId}:`,
      response.status,
      errorText
    );
    // Re-throw the error to be caught by the calling component
    throw new Error(errorText);
  }

  return response;
};

export const getIssueTransitions = async (issueId) => {
  if (!issueId) {
    return [];
  }
  const response = await requestJira(
    `/rest/api/3/issue/${issueId}/transitions`
  );
  if (!response.ok) {
    console.error(
      `Failed to fetch transitions for issue ${issueId}:`,
      await response.text()
    );
    return [];
  }
  const data = await response.json();
  return data.transitions || [];
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

// Fetch assignable users for a given project
export const getAssignableUsers = async (projectKey) => {
  if (!projectKey) return [];

  const response = await requestJira(
    `/rest/api/3/user/assignable/search?project=${projectKey}`
  );

  if (!response.ok) {
    console.error(
      `Failed to fetch assignable users for project ${projectKey}:`,
      await response.text()
    );
    return [];
  }

  return response.json();
};

export const getProjectProperty = async (projectId, propertyKey) => {
  const response = await requestJira(
    `/rest/api/3/project/${projectId}/properties/${propertyKey}`
  );
  if (!response.ok) {
    if (response.status === 404) {
      return null; // Property not found is not an error
    }
    const errorText = await response.text();
    console.error(`Failed to get project property ${propertyKey}:`, errorText);
    throw new Error(`Failed to get project property: ${response.status}`);
  }
  return response.json();
};

export const setProjectProperty = async (projectId, propertyKey, value) => {
  const response = await requestJira(
    `/rest/api/3/project/${projectId}/properties/${propertyKey}`,
    {
      method: "PUT",
      headers: {
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

export const hasAdminPermission = async (projectId) => {
  try {
    const response = await requestJira(`/rest/api/3/project/${projectId}/role`);
    return response.ok;
  } catch (error) {
    return false;
  }
};
