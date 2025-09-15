import React,{useEffect, useState} from 'react'
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTransition,
} from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';
import { Text } from '@atlaskit/primitives/compiled';
import Form, { Field, HelperMessage } from '@atlaskit/form';
import Textfield from '@atlaskit/textfield';
import { getWorkType, updateIssue } from '../api/jiraService';
import { requestJira } from "@forge/bridge";
import { Label } from '@atlaskit/form';
import Select from '@atlaskit/select';
const UpdateModal = ({updateIssueDefaultData,closeUpdateModal,onUpdateSuccess,updateIssueID,selectedProject}) => {
   const [workTypes, setWorkTypes] = useState([]);
    useEffect( () => {
        const fetchWorkTypes = async () => {
            try {
    const workList = await getWorkType(selectedProject.id);
    const issueTypes = workList.map((e) => 
        ({
            label: e?.name,
            value: e?.name,
        }));
        setWorkTypes(issueTypes);
            } catch (error) {
                console.log("Lỗi khi fetch types",error);
            }
        }
  fetchWorkTypes();
    }, [])
    

     const  handleFormSubmit = async (formData) => {
        try {
            await updateIssue(updateIssueID, formData);
            onUpdateSuccess();
        } catch (error) {
            console.log('Có lỗi khi cập nhật issue:', error);  
        }finally {          
            closeUpdateModal();
        }
     }
  return (
    <Modal >
						<Form onSubmit={handleFormSubmit}>
							{({ formProps }) => (
								<form {...formProps} id="modal-form">
									<ModalHeader hasCloseButton>
										<ModalTitle>Update issue </ModalTitle>
									</ModalHeader>
									<ModalBody>
										{/* <Field
											id="type"
											name="type"
											label="Work Type"
											defaultValue={updateIssueDefaultData?.fields?.issuetype?.name}
										>
											{({ fieldProps }) => (
													<Textfield {...fieldProps} />
											)}
										</Field> */}

<Label htmlFor="single-select-example">Work Type</Label>
		<Select
			inputId="single-select-example"
			testId="react-select"
			options={workTypes}
		/>
										<Field
											id="summary"
											name="summary"
											label="Summary"
											defaultValue={updateIssueDefaultData?.fields?.summary}
										>
											{({ fieldProps }) => (
													<Textfield {...fieldProps} />
											)}
										</Field>
										<Field
											id="status"
											name="status"
											label="Status"
											defaultValue={updateIssueDefaultData?.fields?.status?.name}
										>
											{({ fieldProps }) => (
													<Textfield {...fieldProps} />
											)}
										</Field>
										<Field
											id="assignee"
											name="assignee"
											label="Assignee"
											defaultValue={updateIssueDefaultData?.fields?.assignee}
										>
											{({ fieldProps }) => (
													<Textfield {...fieldProps} />
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
  )
}

export default UpdateModal