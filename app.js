let gridApi;

// Merge Rows with same Consumed Spool Value
const columnDefs = [
  {
    suppressStickyLabel: true,
    children: [
      {
        field: "consumedSpool",
        pinned: true,
        colId: "consumedSpool",
        sortable: true,
        sort: 'asc',
      },
    ],
  },
  {
    headerName: "Spoil Details",
    suppressStickyLabel: true,
    openByDefault: true,
    children: [
      { field: "spoolID", colId: "spoolID", sortable: true },
      { field: "processSetting", colId: "processSetting", columnGroupShow: "open", sortable: true },
      { field: "DisplayValue", colId: "DisplayValue", columnGroupShow: "open", sortable: true },
      {
        headerName: 'in',
        children: [
          { 
            field: "maxValue", 
            colId: "maxValue", 
            columnGroupShow: "open", 
            sortable: true,
            cellClassRules: {
              // If maxValue is above 285, apply the 'cell-red' CSS class
              'cell-red': params => params.value > 285
            }
          },
        ],
      },
    ],
  },
];

const gridOptions = {
  defaultColDef: {
    width: 200,
    sortable: true, // Enable sorting globally by default
  },
  columnDefs: columnDefs,
  rowData: null, // Initially null, data will be set later
};

// Function to build the table and fetch data
async function buildTable() {
  try {
    // Fetch data from Domo API
    const response = await domo.get('/data/v2/tableData');
    console.log(response);

    // Ensure gridApi is initialized
    if (gridApi && response) {
      // Convert response to an array if it's a single object
      const rowData = Array.isArray(response) ? response : [response];

      // Set the fetched data into the grid
      gridApi.applyTransaction({ add: rowData });
    } else {
      console.error("Grid API not initialized or no data available");
    }
  } catch (error) {
    console.error("Error fetching data from Domo:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const gridDiv = document.querySelector("#myGrid");

  // Initialize the grid and store the API reference
  gridApi = agGrid.createGrid(gridDiv, gridOptions);

  // Fetch and load data into the grid
  buildTable();
});

// Add a CSS class for the conditional formatting
const style = document.createElement('style');
style.innerHTML = `
  .cell-red {
    background-color: #ffcccc; /* Light red background */
    color: black;
  }
`;
document.head.appendChild(style);
