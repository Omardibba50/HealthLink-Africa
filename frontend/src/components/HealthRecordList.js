import React, { useEffect, useState } from 'react';
import { getHealthRecords } from '../api';

const HealthRecordList = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await getHealthRecords();
        setRecords(response.data);
      } catch (error) {
        console.error('Error fetching health records:', error);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div>
      <h1>Health Records</h1>
      <ul>
        {records.map(record => (
          <li key={record._id}>{record.data}</li>
        ))}
      </ul>
    </div>
  );
};

export default HealthRecordList;
