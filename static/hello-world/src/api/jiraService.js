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
  maxResults = 10
) => {
  if (!projectKey) {
    console.error("Project key is required to fetch issues.");
    return { issues: [], total: 0 }; // Return empty result if no project key
  }

  const jql = `project = "${projectKey}" ORDER BY created DESC`;
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
  console.log("🚀 ~ fetchIssuesByProject ~ result:", result)
  return {
    issues: result.issues,
    total: result.total,
  };
};

// Fetch assignable users for a given project
export const getAssignableUsers = async (projectKey) => {
  if (!projectKey) return [];
  
  const response = await requestJira(
    `/rest/api/3/user/assignable/search?project=${projectKey}`
  );
  
  if (!response.ok) {
    console.error(`Failed to fetch assignable users for project ${projectKey}:`, await response.text());
    return [];
  }
  
  return response.json();
};



export const updateIssue = async (issueId, updateData) => {
  
  const body = {
    fields: {},
  };

  // Handle transition for status update
  if (updateData.transitionId) {
    body.transition = { id: updateData.transitionId };
  }

  // Handle summary
  if (updateData.summary) {
    body.fields.summary = updateData.summary;
  }

  // Handle issuetype (Work Type)
  if (updateData.type) {
    body.fields.issuetype = { name: updateData.type };
  }

  // Handle assignee update
if (updateData.assignee) {
  if (updateData.assignee === 'unassigned') {
    body.fields.assignee = null; // Unassign the issue
  } else {
    body.fields.assignee = { accountId: updateData.assignee };
  }
}

  const response = await requestJira(`/rest/api/3/issue/${issueId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    // Log the error response for better debugging
    const errorText = await response.text();
    console.error(`Failed to update issue ${issueId}:`, response.status, errorText);
    // Re-throw the error to be caught by the calling component
    throw new Error(errorText);
  }

  return response;
};

export const getIssueTransitions = async (issueId) => {
  if (!issueId) {
    return [];
  }
  const response = await requestJira(`/rest/api/3/issue/${issueId}/transitions`);
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
