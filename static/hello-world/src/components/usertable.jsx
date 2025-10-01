import React, { useState, useEffect } from 'react';
import DynamicTable from '@atlaskit/dynamic-table';
import Lozenge from '@atlaskit/lozenge';
import Avatar from '@atlaskit/avatar';
import { fetchAllJiraUsers } from '../api/jiraService';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState('displayName');
  const [sortOrder, setSortOrder] = useState('ASC');

  useEffect(() => {
    setIsLoading(true);
    fetchAllJiraUsers()
      .then((fetchedUsers) => {
        setUsers(fetchedUsers);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setIsLoading(false);
      });
  }, []);

  const handleSort = (data) => {
    setSortKey(data.key);
    setSortOrder(data.sortOrder);
  };

  const head = {
    cells: [
      {
        key: 'accountId',
        content: 'User ID',
        isSortable: true,
      },
      {
        key: 'displayName',
        content: 'Display Name',
        isSortable: true,
      },
      {
        key: 'active',
        content: 'Active',
        isSortable: false,
      },
    ],
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!a[sortKey] || !b[sortKey]) return 0;
    const valA = a[sortKey].toLowerCase();
    const valB = b[sortKey].toLowerCase();

    if (valA < valB) {
      return sortOrder === 'ASC' ? -1 : 1;
    }
    if (valA > valB) {
      return sortOrder === 'ASC' ? 1 : -1;
    }
    return 0;
  });

  const rows = sortedUsers.map((user, index) => ({
    key: `row-${index}-${user.accountId}`,
    cells: [
      {
        key: 'accountId',
        content:  user.accountId
      },
      {
        key: 'displayName',
        content: user.displayName,
      },
      {
        key: 'active',
        content: (
          <Lozenge appearance={user.active ? 'success' : 'default'}>
            {user.active ? 'Active' : 'Inactive'}
          </Lozenge>
        ),
      },
    ],
  }));

  return (
    <div style={{ marginTop: '16px' }}>
        <h2>Jira Users</h2>
        <DynamicTable
          head={head}
          rows={rows}
          isLoading={isLoading}
          onSort={handleSort}
          sortKey={sortKey}
          sortOrder={sortOrder}
          defaultPage={1}
          rowsPerPage={10}
        />
    </div>
  );
};

export default UserTable;
