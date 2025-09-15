import React, { useEffect, useState, useCallback } from "react";
import Select from "@atlaskit/select";
import DynamicTable from "@atlaskit/dynamic-table";
import Pagination from "@atlaskit/pagination";
import Lozenge from "@atlaskit/lozenge";
import Avatar from "@atlaskit/avatar";
import { fetchProjects, fetchIssuesByProject,deleteIssue,updateIssue } from "./api/jiraService";
import Button from '@atlaskit/button/new';
import './App.css'
import DeleteModal from "./components/DeleteModal";
const App = () => {
  // State management
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [totalIssues, setTotalIssues] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
	const [isOpenDelModal, setIsOpenDelModal] = useState(false);

  const ISSUES_PER_PAGE = 3;
	const openDeleteModal = useCallback(() => setIsOpenDelModal(true), []);
	const closeDeleteModal = () => setIsOpenDelModal(false);

  const handleDeleteSuccess = () => {
    // Re-fetch issues for the current project and page after a successful delete
    if (selectedProject) {
      getIssues(selectedProject.value, currentPage);
    }
  };
  const [deleteIssueID, setDeleteIssueID] = useState(null);

  console.log('aaaa', selectedProject);
  
  
  // Fetch all projects on initial load
  useEffect(() => {
    setIsLoadingProjects(true);
    fetchProjects()
      .then((data) => {
        const projectOptions = data.map((p) => ({
          label: p.name,
          value: p.key,
        }));
        setProjects(projectOptions);
      })
      .catch(console.error)
      .finally(() => setIsLoadingProjects(false));
  }, []);

  // Function to fetch issues for the selected project and page
  const getIssues = async (projectKey, page) => {
    console.log('2222');
    console.log('projectKey',projectKey);
    
    if (!projectKey) return;
    setIsLoading(true);
    const startAt = (page - 1) * ISSUES_PER_PAGE;
    try {
      const { issues: fetchedIssues, total } = await fetchIssuesByProject(
        projectKey,
        startAt,
        ISSUES_PER_PAGE
      );
        console.log("🚀 ~ App ~ fetchedIssues:", fetchedIssues)
      setIssues(fetchedIssues);
      setTotalIssues(total);
    } catch (error) {
      console.error("Failed to get issues:", error);
      setIssues([]);
      setTotalIssues(0);
    } finally {
      setIsLoading(false);
    }
  }
  // Handler for project selection change
  const handleProjectChange = (selection) => {
    setSelectedProject(selection);
    console.log('selection',selection)
    setCurrentPage(1); // Reset to first page
    getIssues(selection.value, 1);
  };

  // Handler for pagination change
  const handlePageChange = (e, newPage) => {
    setCurrentPage(newPage);
    getIssues(selectedProject.value, newPage);
  };


  // Table configuration
  const head = {
    cells: [
      { key: "type", content: "Type", width: 5 },
      { key: "key", content: "Key", width: 10 },
      { key: "summary", content: "Summary", width: 25 },
      { key: "status", content: "Status", width: 15 },
      { key: "assignee", content: "Assignee", width: 15 },
      { key: "action", content: "Actions", width: 25 },
    ],
  };

  const rows = issues.map((issue, index) => ({
    key: `issue-${issue.id}`,
    cells: [
      {
        key: "type",
        content: (
          <img
            src={issue.fields.issuetype.iconUrl}
            alt={issue.fields.issuetype.name}
          />
        ),
      },
      { key: "key", content: issue.key },
      { key: "summary", content: issue.fields.summary },
      {
        key: "status",
        content: <Lozenge>{issue.fields.status.name}</Lozenge>,
      },
      {
        key: "assignee",
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
        key: "action",
        content:
        <div className="action-cell">
         <Button className="action-btn" appearance="primary">Update</Button>
         <Button className="action-btn" appearance="danger" onClick={()=> {
          openDeleteModal();
          setDeleteIssueID(issue.id);
          
        }}>Delete
        
        </Button>
         </div>
            },
    ],
  }));

  const totalPages = Math.ceil(totalIssues / ISSUES_PER_PAGE);

  return (
    <div style={{ padding: "16px" }}>
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
          <DynamicTable
            head={head}
            rows={rows}
            isLoading={isLoading}
            emptyView={!isLoading && <h4>No issues found for this project.</h4>}
          />
          {totalPages > 1 && (
            <Pagination
              pages={[...Array(totalPages).keys()].map((i) => i + 1)}
              max={totalPages > 10 ? 10 : totalPages}
              value={currentPage}
              onChange={handlePageChange}
            />
          )}
        </div>
      )}

				{isOpenDelModal && <DeleteModal 
        closeDeleteModal={closeDeleteModal} 
        deleteIssueID={deleteIssueID}handleDeleteSuccess
        onDeleteSuccess={handleDeleteSuccess}
      /> }
    </div>
  );
};

export default App;
