import React, { useState } from 'react';
import { Calculator, Table, Download, Search } from 'lucide-react';

interface ColumnDefinition {
  id: string;
  name: string;
  type: 'id' | 'grade';
}

interface GradeData {
  [key: string]: string | number;
}

function App() {
  const [columns, setColumns] = useState<ColumnDefinition[]>([
    { id: 'col1', name: 'ID', type: 'id' },
    { id: 'col2', name: 'Grade 1', type: 'grade' }
  ]);
  const [rawData, setRawData] = useState<string>('');
  const [parsedData, setParsedData] = useState<GradeData[]>([]);
  const [searchId, setSearchId] = useState<string>('');
  const [result, setResult] = useState<{ rank?: number; percentage?: number }>({});

  const addColumn = () => {
    const newColumn: ColumnDefinition = {
      id: `col${columns.length + 1}`,
      name: `Grade ${columns.filter(col => col.type === 'grade').length + 1}`,
      type: 'grade'
    };
    setColumns([...columns, newColumn]);
  };

  const updateColumnName = (id: string, name: string) => {
    setColumns(columns.map(col => 
      col.id === id ? { ...col, name } : col
    ));
  };

  const parseData = () => {
    const rows = rawData.trim().split('\n');
    const parsed = rows.map(row => {
      // Changed to split only by spaces
      const values = row.split(' ').filter(value => value.trim() !== '');
      const data: GradeData = {};
      columns.forEach((col, index) => {
        data[col.id] = values[index] || '';
      });
      return data;
    });
    setParsedData(parsed);
  };

  const calculateResults = () => {
    if (!searchId) return;
    
    const totalStudents = parsedData.length;
    const studentData = parsedData.find(data => data[columns[0].id].toString() === searchId);
    
    if (!studentData) {
      setResult({});
      return;
    }

    const gradeColumns = columns.filter(col => col.type === 'grade');
    const average = gradeColumns.reduce((sum, col) => sum + Number(studentData[col.id] || 0), 0) / gradeColumns.length;
    
    const rank = parsedData.filter(data => {
      const otherAverage = gradeColumns.reduce((sum, col) => sum + Number(data[col.id] || 0), 0) / gradeColumns.length;
      return otherAverage > average;
    }).length + 1;

    setResult({
      rank,
      percentage: ((rank / totalStudents) * 100).toFixed(2)
    });
  };

  const downloadCSV = () => {
    const headers = columns.map(col => col.name).join(',');
    const rows = parsedData.map(data => 
      columns.map(col => data[col.id]).join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grade_results.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Calculator className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800">Grade Calculator</h1>
        </div>

        {/* Column Definitions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-700">Table Format</h2>
            <button
              onClick={addColumn}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              Add Column
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {columns.map(col => (
              <input
                key={col.id}
                value={col.name}
                onChange={(e) => updateColumnName(col.id, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Column name"
              />
            ))}
          </div>
        </div>

        {/* Data Input */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Data Input</h2>
          <textarea
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Paste your data here (space separated only)"
          />
          <button
            onClick={parseData}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Table className="w-4 h-4 inline-block mr-2" />
            Parse Data
          </button>
        </div>

        {/* Results Table */}
        {parsedData.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-700">Data Preview</h2>
              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Download className="w-4 h-4 inline-block mr-2" />
                Download CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    {columns.map(col => (
                      <th key={col.id} className="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-500">
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parsedData.map((row, index) => (
                    <tr key={index}>
                      {columns.map(col => (
                        <td key={col.id} className="px-4 py-2 text-sm text-gray-900">
                          {row[col.id]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Search by ID */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Calculate Your Results</h2>
          <div className="flex gap-2">
            <input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your ID"
            />
            <button
              onClick={calculateResults}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Search className="w-4 h-4 inline-block mr-2" />
              Calculate
            </button>
          </div>
        </div>

        {/* Results Display */}
        {result.rank && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Your Results</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-md shadow">
                <p className="text-sm text-gray-500">Rank</p>
                <p className="text-xl font-bold text-indigo-600">{result.rank} of {parsedData.length}</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow">
                <p className="text-sm text-gray-500">Percentile</p>
                <p className="text-xl font-bold text-indigo-600">Top {result.percentage}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;