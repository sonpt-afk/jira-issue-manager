import React, { useState, useEffect } from 'react';
import Toggle from '@atlaskit/toggle';
import Button from '@atlaskit/button/new';
import Spinner from '@atlaskit/spinner';
import { 
  getProjectContext,
  getProjectProperty, 
  setProjectProperty, 
  deleteProjectProperty 
} from './api/jiraService';
const PROPERTY_KEY = 'disable_app';

function App() {
  const [isAppDisabled, setIsAppDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [projectContext, setProjectContext] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    getProjectContext()
    .then(project => {
      if(!project || !project.id) {
        throw new Error('Cannot determine current project ');
      }

      setProjectContext(project);

      //check if disable_app property exists
      return getProjectProperty(project.id, PROPERTY_KEY);
    })
    .then(property => {
      //if property exists, the app is disabled for project
      if(property !== null){
        setIsAppDisabled(true);
      }else{
        setIsAppDisabled(false);
      }
    })
    .catch(error => {
              setError(`Error loading settings: ${error.message}`);
      setIsAppDisabled(false);
    })
    .finally(()=>{
      setIsLoading(false);
    })
  }, []);

  const handleToggleChange = () => {
    setIsAppDisabled(!isAppDisabled);
  };

  const handleSave = () => {
    setIsSaving(true);
    setError(null);

    const projectId = projectContext.id;

    //if toggle to disable then create the property. toggle to enable then delete the property
    const saveOperation = isAppDisabled ? setProjectProperty(projectId, PROPERTY_KEY, true) : deleteProjectProperty(projectId, PROPERTY_KEY);
    saveOperation.then(() => {
      console.log(`App is now ${isAppDisabled ? 'disabled' : 'enabled'} for this project `);
    }).catch(error => {
        console.error("Error saving settings:", error);
        setError(`Error saving settings: ${error.message}`);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Project app Settings</h1>
        {error && (
        <div style={{ 
          padding: '8px 16px', 
          backgroundColor: '#FFEBE6', 
          color: '#DE350B', 
          borderRadius: '3px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}
      {isLoading ? (
        <div style={{ padding: '32px', textAlign: 'center' }}><Spinner size="large" /></div>
      ) : (
        <>
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #DFE1E6', borderRadius: '3px' }}>
            <label htmlFor="app-toggle">
              <strong style={{ fontSize: '16px' }}>Disable app for project {projectContext?.name}</strong>
            </label>
            <Toggle
              id="app-toggle"
              size='large'
              isChecked={isAppDisabled}
              onChange={handleToggleChange}
            />
          </div>

           <div style={{ marginTop: '24px' }}>
            <Button 
              appearance="primary" 
              onClick={handleSave} 
              isLoading={isSaving}
              isDisabled={isLoading}
            >
              Save Settings
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;