import React, { useEffect, useState } from "react";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import Button from "@atlaskit/button/new";
import { Text } from "@atlaskit/primitives/compiled";
import Form, { Field, HelperMessage } from "@atlaskit/form";
import Textfield from "@atlaskit/textfield";
import {
  getWorkType,
  updateIssue,
  getIssueTransitions,
  getAssignableUsers,
} from "../api/jiraService";
import { requestJira } from "@forge/bridge";
import { Label } from "@atlaskit/form";
import Select from "@atlaskit/select";



const UpdateModal = ({
  updateIssueDefaultData,
  closeUpdateModal,
  onUpdateSuccess,
  updateIssueID,
  selectedProject,
}) => {
  const [workTypes, setWorkTypes] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
const [isLoadingUsers, setIsLoadingUsers] = useState(false);


useEffect(() => {
  const fetchAssignableUsers = async () => {
    if (selectedProject?.value) {
      setIsLoadingUsers(true);
      try {
        const users = await getAssignableUsers(selectedProject.value);
        console.log("Fetched users:", users); // Log để xác nhận API call thành công
        
        const userOptions = users.map(user => ({
          label: user.displayName,
          value: user.accountId,
          avatar: user.avatarUrls["24x24"]
        }));
        userOptions.unshift({
          label: "Unassigned",
          value: "unassigned"
        });
        
        console.log("User options:", userOptions); // Log để xác nhận biến đổi thành công
        setAssignableUsers(userOptions);
      } catch (error) {
        console.error("Failed to load assignable users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    }
  };
  
  fetchAssignableUsers();
}, [selectedProject?.value]);


  useEffect(() => {
    const fetchWorkTypes = async () => {
      try {
        const workList = await getWorkType(selectedProject.id);
        const issueTypes = workList.map((e) => ({
          label: e?.name,
          value: e?.name,
        }));
        setWorkTypes(issueTypes);
      } catch (error) {
        console.log("Lỗi khi fetch types", error);
      }
    };
    fetchWorkTypes();
  }, [selectedProject.id]);

  const [transitions, setTransitions] = useState([]);
  useEffect(() => {
    if (updateIssueID) {
      getIssueTransitions(updateIssueID).then((data) => {
        setTransitions(data);
      });
    }
  }, [updateIssueID]);

  const handleFormSubmit = async (formData) => {
    console.log("🚀 ~ handleFormSubmit ~ formData:", formData);
    try {
      await updateIssue(updateIssueID, formData);
      onUpdateSuccess();
    } catch (error) {
      console.log("Có lỗi khi cập nhật issue:", error);
    } finally {
      closeUpdateModal();
    }
  };
  return (
    <Modal>
      <Form onSubmit={handleFormSubmit}>
        {({ formProps }) => (
          <form {...formProps} id="modal-form">
            <ModalHeader hasCloseButton>
              <ModalTitle>Update issue </ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Field
                name="type"
                label="Work Type"
                defaultValue={updateIssueDefaultData?.fields?.issuetype?.name}
              >
                {({ fieldProps }) => (
                  <Select
                    {...fieldProps}
                    inputId="single-select-example"
                    testId="react-select"
                    options={workTypes}
                    onChange={(selectedOption) =>
                      fieldProps.onChange(selectedOption?.value)
                    }
                    value={workTypes.find(
                      (opt) => opt.value === fieldProps.value
                    )}
                  />
                )}
              </Field>
              <Field
                id="summary"
                name="summary"
                label="Summary"
                defaultValue={updateIssueDefaultData?.fields?.summary}
              >
                {({ fieldProps }) => <Textfield {...fieldProps} />}
              </Field>
              <Field name="transitionId" label="Change Status">
                {({ fieldProps }) => (
                  <Select
                    {...fieldProps}
                    placeholder="Choose a transition..."
                    options={transitions.map((t) => ({
                      label: t.name,
                      value: t.id,
                    }))}
                    onChange={(selectedOption) =>
                      fieldProps.onChange(selectedOption?.value)
                    }
                    value={transitions
                      .map((t) => ({ label: t.name, value: t.id }))
                      .find((opt) => opt.value === fieldProps.value)}
                  />
                )}
              </Field>
                
<Field
  id="assignee"
  name="assignee"
  label="Assignee"
  defaultValue={updateIssueDefaultData?.fields?.assignee?.accountId || "unassigned"}
>
  {({ fieldProps }) => (
    <Select
      {...fieldProps}
      isLoading={isLoadingUsers}
      placeholder="Select assignee..."
      options={assignableUsers}
onChange={option => {
          console.log("Selected option:", option);
          fieldProps.onChange(option?.value);
        }}
              value={assignableUsers.find(opt => opt.value === fieldProps.value)}
    formatOptionLabel={option => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {option.avatar ? (
              <img 
                src={option.avatar} 
                alt={option.label}
                style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8 }}
              />
            ) : (
              <div style={{ 
                width: 24, 
                height: 24, 
                borderRadius: '50%', 
                marginRight: 8, 
                backgroundColor: '#dfe1e6', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <span style={{ fontSize: 12 }}>?</span>
              </div>
            )}
            <span>{option.label}</span>
          </div>
        )}
    
    />
  )}
</Field>
              

            </ModalBody>
            <ModalFooter>
              <Button appearance="subtle" onClick={closeUpdateModal}>
                Cancel
              </Button>
              <Button type="submit" form="modal-form" appearance="primary">
                Update
              </Button>
            </ModalFooter>
          </form>
        )}
      </Form>
    </Modal>
  );
};

export default UpdateModal;
