import React from 'react'
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTransition,
} from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';
import { Text } from '@atlaskit/primitives/compiled';
import { deleteIssue } from "../api/jiraService";

const DeleteModal = ({closeDeleteModal, deleteIssueID, onDeleteSuccess}) => {
  return (
    <Modal>
						<ModalHeader hasCloseButton>
							<ModalTitle>Confirm delete</ModalTitle>
						</ModalHeader>
						<ModalBody>
							<Text weight="bold">Are you sure about deleting this issue ?</Text> 
						</ModalBody>
						<ModalFooter>
							<Button appearance="subtle" onClick={closeDeleteModal}>
								Cancel
							</Button>
							<Button appearance="primary" onClick={async () =>{
                                try {
                                    await deleteIssue(deleteIssueID);
                                    onDeleteSuccess();
                                } catch (error) {
                                    console.log('Có lỗi khi fetch issues');
                                }finally{
                                    closeDeleteModal();

                                }

                                }} >
								Confirm
							</Button>
						</ModalFooter>
					</Modal>
  )
}

export default DeleteModal;
     