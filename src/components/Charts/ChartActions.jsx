import React, { useEffect, useMemo } from 'react';
import './Charts.css';

const ChartActions = React.memo(({ sandboxProxy, isAdding, onAddToPage, onImportCSV, isPro, isProOnlySelected, onOpenUpgradeDrawer }) => {
    // Log when ChartActions component renders
    

    // Determine button text and action
    const buttonConfig = useMemo(() => {
        if (!isPro && isProOnlySelected) {
            return {
                text: 'UPGRADE NOW',
                onClick: onOpenUpgradeDrawer,
                isUpgrade: true
            };
        }
        return {
            text: isAdding ? 'Adding...' : 'Add to Page',
            onClick: onAddToPage,
            isUpgrade: false
        };
    }, [isPro, isProOnlySelected, isAdding, onAddToPage, onOpenUpgradeDrawer]);

    return (
        <div className="chart-actions">
            <button
                className={`add-chart-button ${buttonConfig.isUpgrade ? 'upgrade-button' : ''}`}
                onClick={buttonConfig.onClick}
                disabled={!sandboxProxy || isAdding}
            >
                {buttonConfig.text}
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

