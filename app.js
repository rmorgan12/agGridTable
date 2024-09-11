let gridApi;

// Merge Rows with the same Consumed Spool Value
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
        rowSpan: (params) => {
          const rowIndex = params.node.rowIndex;
          const rowData = params.data;

          let span = 1;
          let nextRow = params.api.getDisplayedRowAtIndex(rowIndex + span);

          while (nextRow && nextRow.data && nextRow.data.consumedSpool === rowData.consumedSpool) {
            span++;
            nextRow = params.api.getDisplayedRowAtIndex(rowIndex + span);
          }

          return span; // Return how many rows this cell should span
        },
        cellRenderer: (params) => {
          const rowIndex = params.node.rowIndex;
          const previousRow = params.api.getDisplayedRowAtIndex(rowIndex - 1);

          if (previousRow && previousRow.data.consumedSpool === params.data.consumedSpool) {
            return ''; // Hide value for subsequent rows with the same consumedSpool value
          }

          return params.value; // Display value only for the first occurrence
        },
        cellClassRules: {
          'cell-red': params => params.value > 285,
          'cell-span': params => true // Apply 'cell-span' class to all cells in the column
        },
        cellStyle: { textAlign: 'center' } // Center text for merged cells
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
