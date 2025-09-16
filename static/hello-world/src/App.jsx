import React, { useEffect, useState, useCallback } from "react";
import Select from "@atlaskit/select";
import DynamicTable from "@atlaskit/dynamic-table";
import Pagination from "@atlaskit/pagination";
import Lozenge from "@atlaskit/lozenge";
import Avatar from "@atlaskit/avatar";
import Button from "@atlaskit/button/new";
import TableTree, { Cell, Header, Headers, Row, Rows } from "@atlaskit/table-tree";
import Spinner from "@atlaskit/spinner";
import {
  fetchProjects,
  fetchIssuesByProject,
  deleteIssue,
  updateIssue,
} from "./api/jiraService";
import "./App.css";
import DeleteModal from "./components/DeleteModal";
import UpdateModal from "./components/UpdateModal";
import { view } from "@forge/bridge";

const App = () => {
  // State management
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
    const [rows, setRows] = useState([]);

  const [issues, setIssues] = useState([]);
  const [totalIssues, setTotalIssues] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isOpenDelModal, setIsOpenDelModal] = useState(false);
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  const [updateIssueDefaultData, setUpdateIssueDefaultData] = useState(null);
   const [deleteIssueID, setDeleteIssueID] = useState(null);
  const [updateIssueID, setUpdateIssueID] = useState(null);
  const ISSUES_PER_PAGE = 3;
  const openDeleteModal = () => setIsOpenDelModal(true);
  const openUpdateModal = () => setIsOpenUpdateModal(true);
  const closeDeleteModal = () => setIsOpenDelModal(false);
  const closeUpdateModal = () => setIsOpenUpdateModal(false);


  // Re-fetch issues for current project and page after a successful delete
  const handleDeleteOrUpdateSuccess = () => {
    if (selectedProject) {
      fetchAllIssues(selectedProject.value, currentPage);
    }
  };
 

  // Fetch all projects on initial load
  useEffect(() => {
    setIsLoadingProjects(true);
    fetchProjects()
      .then((data) => {
        const projectOptions = data.map((p) => ({
          label: p.name,
          value: p.key,
          id: p.id,
        }));
        setProjects(projectOptions);

        // Automatically select the first project
        if (projectOptions.length > 0) {
          const firstProject = projectOptions[0];
          setSelectedProject(firstProject); 
          fetchAllIssues(firstProject.value); // Tải issues cho project đó
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setIsLoadingProjects(false));
  }, []);

const fetchAllIssues = async (projectId) => {
  if (!projectId) {
    console.log("No project ID provided");
    return;
  }
  
  console.log("Starting to fetch issues for:", projectId);
  setIsLoading(true);
  
  try {
    console.log("Making API call for project:", projectId);
    const { issues } = await fetchIssuesByProject(
      projectId,
      0,
      100,
      true,
      true
    );
    
    if (!issues) {
      console.log("No issues returned from API");
      setRows([]);
      return;
    }
    
    console.log(" All issues:", issues);
    
  // Use the new function to build TableTree rows
    const tableTreeRows = buildTableTreeRows(issues);
    console.log("TableTree rows built:", tableTreeRows.length, "root items");
    
    // Save state
    setRows(tableTreeRows);
  } catch (err) {
    console.error("Error fetching issues:", err.message);
    console.error("Full error:", JSON.stringify(err, null, 2));
    setRows([]);
  } finally {
    setIsLoading(false);
  }
};
 
const buildTableTreeRows = (allIssues) => {
  const issueMap = new Map();
  const rootRows = [];

  allIssues.forEach(issue => {
    const rowObject = {
      id: issue.key,
      content: [
        {
          id: "type",
         content: (
            <img
              src={issue.fields.issuetype.iconUrl}
              alt={issue.fields.issuetype.name}
              style={{ height: 24 }}
            />
          ),
        },
         { id: "key", content: issue.key },
        { id: "summary", content: issue.fields.summary },
        { 
          id: "status", 
          content: <Lozenge>{issue.fields.status.name}</Lozenge>
        },
        {
          id: "assignee",
          content: issue.fields.assignee ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src={issue.fields.assignee.avatarUrls["24x24"]}
                size="small"
              />
              <span style={{ marginLeft: 8 }}>
                {issue.fields.assignee.displayName}
              </span>
            </div>
          ) : (
            "Unassigned"
          ),
        },
        {
          id: "action",
          content: (
            <div className="action-cell">
              <Button
                className="action-btn"
                appearance="primary"
                onClick={() => {
                  openUpdateModal();
                  setUpdateIssueDefaultData(issue);
                  setUpdateIssueID(issue.id);
                }}
              >
                Update
              </Button>
              <Button
                className="action-btn"
                appearance="danger"
                onClick={() => {
                  openDeleteModal();
                  setDeleteIssueID(issue.id);
                }}
              >
                Delete
              </Button>
            </div>
          ),
        },
      ],
      // Store the original issue for reference
      issue: issue,
      // Children array for nested issues
      children: []
    }
    issueMap.set(issue.key, rowObject);
  })
   allIssues.forEach(issue => {
    const currentKey = issue.key;
    const parentKey = issue.fields.parent?.key;
    
    if (parentKey && issueMap.has(parentKey)) {
      // This issue has a parent in our dataset
      const parentRow = issueMap.get(parentKey);
      const currentRow = issueMap.get(currentKey);
      parentRow.children.push(currentRow);
    } else {
      // No parent or parent not in dataset - this is a root issue
      const currentRow = issueMap.get(currentKey);
      rootRows.push(currentRow);
    }
  });
  
  console.log(`Built TableTree rows with ${rootRows.length} root items`);
  return rootRows;
}

  // Build hierarchy from flat list of issues
  const buildHierarchy = (issues) => {
    // Create a map for quick lookup
    const issueMap = new Map();
    issues.forEach(issue => {
      issueMap.set(issue.id, {
        ...issue,
        children: []
      });
    });

    // Organize issues into a hierarchy
    const rootIssues = [];
    issues.forEach(issue => {
      const issueWithChildren = issueMap.get(issue.id);
      
      // Check if this issue has a parent
      if (issue.fields.parent) {
        const parentId = issue.fields.parent.id;
        // Find the parent in our map
        const parent = issueMap.get(parentId);
        if (parent) {
          // Add this issue as a child of the parent
          parent.children.push(issueWithChildren);
        } else {
          // Parent not in our data, treat as root
          rootIssues.push(issueWithChildren);
        }
      } else {
        // No parent, this is a root issue
        rootIssues.push(issueWithChildren);
      }
    });

    return rootIssues;
  };
 // Handler for project selection change
  const handleProjectChange = (selection) => {
    setSelectedProject(selection);
    fetchAllIssues(selection.value);
  };
  // No longer needed as we're using shouldExpandOnClick
  // This state is now managed by the TableTree component

  // Render issue row
 // No longer needed as we'll use the Rows render prop
// This method is replaced by the render function in the Rows component

  return (
    <div style={{ padding: "16px" }}>
       <div style={{ backgroundColor: "#E3FCEF", padding: "8px", marginBottom: "16px", borderRadius: "3px" }}>
      App is rendering. {projects.length} projects loaded.
      {selectedProject && ` Selected project: ${selectedProject.label}`}
      {isLoading && " Loading issues..."}
      {!isLoading && ` Rows loaded: ${rows.length}`}
    </div>
      <h2>Jira Issue Manager</h2>
      <Select
        inputId="project-select"
        className="single-select"
        classNamePrefix="react-select"
        options={projects}
        value={selectedProject}
        onChange={handleProjectChange}
        placeholder="Select a project"
        isLoading={isLoadingProjects}
        isDisabled={isLoadingProjects}
      />

{selectedProject && (
  <div style={{ marginTop: "16px" }}>
    {isLoading ? (
      <div className="loading-container">
        <Spinner size="large" />
      </div>
    ) : (
      <>
        {rows.length === 0 ? (
          <div style={{ padding: "16px", textAlign: "center", border: "1px solid #DFE1E6", borderRadius: "3px" }}>
            No issues found for this project.
          </div>
        ) : (
          <div style={{ marginTop: "16px", minHeight: "400px" }}>

        <TableTree>
          <Headers>
            <Header width={50}>Type</Header>
            <Header width={120}>Key</Header>
            <Header width={400}>Summary</Header>
            <Header width={100}>Status</Header>
            <Header width={150}>Assignee</Header>
            <Header width={150}>Actions</Header>
          </Headers>
          <Rows
            items={rows}
            render={row => (
              <Row
                itemId={row.id}
                items={row.children}
                hasChildren={row.children.length > 0}
                shouldExpandOnClick
              >
                {row.content.map(cell => (
                  <Cell key={cell.id}>
                    {cell.content}
                  </Cell>
                ))}
              </Row>
            )}
          />
        </TableTree>
  </div>

        )}
      </>
    )}
  </div>
)}

      {isOpenDelModal && (
        <DeleteModal
          closeDeleteModal={closeDeleteModal}
          deleteIssueID={deleteIssueID}
          onDeleteSuccess={handleDeleteOrUpdateSuccess}
        />
      )}

      {isOpenUpdateModal && (
        <UpdateModal
          closeUpdateModal={closeUpdateModal}
          onUpdateSuccess={handleDeleteOrUpdateSuccess}
          updateIssueDefaultData={updateIssueDefaultData}
          updateIssueID={updateIssueID}
          selectedProject={selectedProject}
        />
      )}
    </div>
  );
};

export default App;
