import React from 'react';
import './Charts.css';

const ChartActions = React.memo(({ sandboxProxy, isAdding, onAddToPage, onImportCSV }) => {
    return (
        <div className="chart-actions">
            <button
                className="add-chart-button"
                onClick={onAddToPage}
                disabled={!sandboxProxy || isAdding}
            >
                {isAdding ? 'Adding...' : 'Add to Page'}
            </button>
            <button
                className="import-csv-button"
                onClick={onImportCSV}
                disabled={!sandboxProxy}
            >
                Import CSV
            </button>
        </div>
    );
});

ChartActions.displayName = 'ChartActions';

export default ChartActions;

