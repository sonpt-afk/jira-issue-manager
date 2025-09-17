import React, { useState, useEffect } from 'react';
import Toggle from '@atlaskit/toggle';
import Button from '@atlaskit/button/new';
import Spinner from '@atlaskit/spinner';
import { getAppProperty, setAppProperty } from './api/jiraService';

const PROPERTY_KEY = 'disable_app';

function App() {
  const [isAppDisabled, setIsAppDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getAppProperty(PROPERTY_KEY)
      .then(property => {
        // The property value is the boolean itself, or null if not set
        if (property && property.value === true) {
          setIsAppDisabled(true);
        } else {
          setIsAppDisabled(false); // Default to not disabled
        }
      })
      .catch(error => {
        console.error("Error fetching app property:", error);
        // In case of error, default to enabled so the app is not blocked
        setIsAppDisabled(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleToggleChange = () => {
    setIsAppDisabled(!isAppDisabled);
  };

  const handleSave = () => {
    setIsSaving(true);
    // The value we store is the boolean itself
    setAppProperty(PROPERTY_KEY, isAppDisabled)
      .then(() => {
        alert('Settings saved successfully!');
      })
      .catch(error => {
        console.error("Error saving app property:", error);
        alert('Error saving settings. Please check the console.');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>App Access Settings</h1>
      <p>This setting controls the visibility of the app across all projects.</p>
      
      {isLoading ? (
        <div style={{ padding: '32px', textAlign: 'center' }}><Spinner size="large" /></div>
      ) : (
        <>
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #DFE1E6', borderRadius: '3px' }}>
            <label htmlFor="app-toggle">
              <strong style={{ fontSize: '16px' }}>Disable app for all projects</strong>
              <div style={{ color: '#6B778C', fontSize: '12px', marginTop: '4px' }}>If toggled on, the "carter-issue-manager" will be hidden from all projects.</div>
            </label>
            <Toggle
              id="app-toggle"
              size='large'
              isChecked={isAppDisabled}
              onChange={handleToggleChange}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <Button appearance="primary" onClick={handleSave} isLoading={isSaving}>
              Save Settings
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;