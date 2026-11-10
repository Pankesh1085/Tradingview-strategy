(function() {
    let allTradesMap = new Map();
    let headerRow = "";

    function captureVisibleTrades() {
        const rows = document.querySelectorAll('[class*="row-"], tr');
        rows.forEach((row) => {
            const cells = row.querySelectorAll('[class*="cell-"], td, th');
            if (cells.length > 0) {
                const rowData = Array.from(cells).map(cell => {
                    return `"${cell.innerText.replace(/\n/g, ' ').replace(/"/g, '""').trim()}"`;
                });
                
                const combinedString = rowData.join(",");
                // Use the text string as a key to prevent duplicates
                if (combinedString.toLowerCase().includes("trade number")) {
                    headerRow = combinedString;
                } else if (rowData[0] && rowData[0] !== '""') {
                    allTradesMap.set(rowData[0], combinedString);
                }
            }
        });
    }

    // Run capturing continuously every 300ms while you scroll
    const scanInterval = setInterval(captureVisibleTrades, 300);
    console.log("🚀 Scraper armed! Now slowly scroll down your list of trades from top to bottom.");
    console.log("➡️ Once you reach the bottom, type: downloadTrades() and press Enter.");

    // Expose the download function to the global window environment
    window.downloadTrades = function() {
        clearInterval(scanInterval);
        
        if (allTradesMap.size === 0) {
            console.error("❌ No trades captured. Did you scroll down the list?");
            return;
        }

        // Sort trades cleanly by their index number descending
        const sortedRows = Array.from(allTradesMap.values()).sort((a, b) => {
            const numA = parseInt(a.replace(/"/g, '')) || 0;
            const numB = parseInt(b.replace(/"/g, '')) || 0;
            return numB - numA;
        });

        const csvContent = (headerRow ? headerRow + "\n" : "") + sortedRows.join("\n") + "\n";
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `tradingview_scrolled_${allTradesMap.size}_trades.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`🎉 Success! Exported ${allTradesMap.size} unique trades to your CSV.`);
    };
})();
