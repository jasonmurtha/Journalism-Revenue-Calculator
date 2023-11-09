(function(){
const colorScheme = [
        "#25CCF7","#FD7272","#54a0ff","#00d2d3",
        "#1abc9c","#2ecc71","#3498db","#9b59b6","#34495e",
        "#16a085","#27ae60","#2980b9","#8e44ad","#2c3e50",
        "#f1c40f","#e67e22","#e74c3c","#ecf0f1","#95a5a6",
        "#f39c12","#d35400","#c0392b","#bdc3c7","#7f8c8d",
        "#55efc4","#81ecec","#74b9ff","#a29bfe","#dfe6e9",
        "#00b894","#00cec9","#0984e3","#6c5ce7","#ffeaa7",
        "#fab1a0","#ff7675","#fd79a8","#fdcb6e","#e17055",
        "#d63031","#feca57","#5f27cd","#54a0ff","#01a3a4"
    ]

let revenueSources = [];
let barChart;

/*
    When the MSC is updated, update the quarterly target numbers in the table and the msc text.

*/
function updateMSC(){

    var rangeValue = document.getElementById('mscRange').value;
    var growthRate = parseFloat(document.getElementById('growthRate').value) / 100;

    let formatValue = parseInt(rangeValue).toLocaleString('en-US');
    const quarterlyValue = parseInt(rangeValue) / 4;
    const formattedQuarterlyValue = quarterlyValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    document.getElementById('msc').textContent = '$' + formatValue + '/year';
    document.getElementById('msc1').textContent = '$' + formatValue + '/year';
    document.getElementById('desiredRevenue').textContent = formattedQuarterlyValue + '/quarter';

    let target = quarterlyValue;
    for (let i = 8; i >= 1; i--) {
        document.getElementById(`q${i}Target`).textContent = target.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        target /= (1 + growthRate);
    }
}


function updateCards() {
    var rangeValue = document.getElementById('mscRange').value;
    let totalPercentage = 0;
    document.getElementById('card-container').innerHTML = "";
    revenueSources.forEach(function(currentElement) { 
        
        currentElement.salesNeeded = Math.ceil((rangeValue * (currentElement.revPercent / 100)) / (currentElement.saleValue * currentElement.salesFreqFactor));
        currentElement.eventsNeeded = Math.ceil(currentElement.salesNeeded / (currentElement.conversionRate / 100) );

        // Create card elements
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card mb-3';

        const cardBodyDiv = document.createElement('div');
        cardBodyDiv.className = 'card-body';

        const titleH5 = document.createElement('h5');
        titleH5.className = 'card-title';
        titleH5.textContent = currentElement.revSource;

        const subtitleH6 = document.createElement('h6');
        subtitleH6.className = 'card-subtitle mb-2 text-muted';
        subtitleH6.textContent = `${currentElement.revPercent}% of revenue. ${currentElement.saleValue.toLocaleString('en-US', { style: 'currency', currency: 'USD',minimumFractionDigits: 0,
maximumFractionDigits: 0, })}/sale, ${currentElement.saleFreq}.`;

        const textP = document.createElement('p');
        textP.className = 'card-text';
        textP.textContent = `You'll need ${currentElement.salesNeeded.toLocaleString('en-US')} active customers. At a conversion rate of ${currentElement.conversionRate}%, you'll need ${currentElement.eventsNeeded.toLocaleString('en-US')} events.`;

        const deleteLink = document.createElement('a');
        deleteLink.href = '#';
        deleteLink.className = 'card-link';
        deleteLink.textContent = 'Remove';
        deleteLink.addEventListener('click', function(event) {
            event.preventDefault();
            removeRevenueSource(currentElement.id);
        });

        // Append elements
        cardBodyDiv.appendChild(titleH5);
        cardBodyDiv.appendChild(subtitleH6);
        cardBodyDiv.appendChild(textP);
        cardBodyDiv.appendChild(deleteLink);
        cardDiv.appendChild(cardBodyDiv);

        // Append the card to the container
        document.getElementById('card-container').appendChild(cardDiv);

        // update the total percentage of revenue to include this source
        totalPercentage += currentElement.revPercent;

        })
        document.getElementById('revenuePercentage').textContent = totalPercentage + '% of revenue';
}


function removeRevenueSource(id) {
    // Find the index of the revenue source with the given ID
    const index = revenueSources.findIndex(source => source.id === id);
    if (index > -1) {
        revenueSources.splice(index, 1);  // Remove the revenue source
        updateChart();
        updateCards();
        updateTable();
        updateUrlWithEncodedArray(revenueSources);
    }
}


function updateChart(){
    if(revenueSources.length==0){
        barChart.data.datasets = [];
        barChart.update();
        return;
    }
    barChart.data = {};
    

    const revValue = document.getElementById('mscRange').value;

    revenueSources.forEach(function(currentElement) { 
        let values;
        let backgroundColors = currentElement.backgroundColor;
        
        values = (currentElement.revPercent / 100) * parseFloat(revValue); 
        
        
        // Create a new dataset
        const newDataset = {
            label: currentElement.revSource,
            data: [values],
            backgroundColor: backgroundColors,
            stack: "Stack 0"
        };
        
        // Push the new dataset to the chart's datasets
        
        barChart.data.labels = ['Sources'];
        barChart.data.datasets.push(newDataset);
        barChart.update();
    })
}    


function updateTable(){
    // Get the table body
    const tableBody = document.getElementById('growthRateTable').getElementsByTagName('tbody')[0];
    const table = document.getElementById('growthRateTable');
    const thead = table.getElementsByTagName('thead')[0];

    // Remove all columns after the first two in the table body
    for (let i = 0; i < tableBody.rows.length; i++) {
        while (tableBody.rows[i].cells.length > 2) {
            tableBody.rows[i].deleteCell(-1);
        }
    }

    // Remove all columns after the first two in the table header
    while (thead.rows[0].cells.length > 2) {
        thead.rows[0].deleteCell(-1);
    }

    revenueSources.forEach(function(currentElement) { 
        for (let i = 0; i < tableBody.rows.length; i++) {
            // Create a new cell in the current row
            const newCell = tableBody.rows[i].insertCell(-1);
            
            // calculate sales needed
            switch(currentElement.saleFreq){
                case "one-time": 
                    quarterlyRevDivisor = 1; 
                    saleText = 'sales';
                    break;
                case "yearly":
                    quarterlyRevDivisor = 1; 
                    saleText = 'sales';
                    break;
                case "quarterly":
                    quarterlyRevDivisor = 1; 
                    saleText = 'actives';
                    break;
                case "monthly":
                    quarterlyRevDivisor = 3; 
                    saleText = 'actives';
                    break;
                default:
                    quarterlyRevDivisor = 1; break;   
            }
            salesNeeded = Math.ceil(((parseFloat(tableBody.rows[i].cells[1].innerText.replace(/[$,]/g, '')) * (currentElement.revPercent / 100)) / currentElement.saleValue ) / quarterlyRevDivisor);
            thisRevenue = salesNeeded * currentElement.saleValue * quarterlyRevDivisor;
            // Set the text content of the new cell (modify as needed)
            newCell.textContent = thisRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            newCell.setAttribute('data-bs-toggle', 'tooltip');
            newCell.setAttribute('data-bs-placement', 'left')
            newCell.setAttribute('title', salesNeeded + ' ' + saleText); 

        }

        // Add a new header cell to the table header
        const tableHead = document.getElementById('growthRateTable').getElementsByTagName('thead')[0];
        const newHeaderCell = document.createElement('th');
        //const newHeaderCell = tableHead.rows[0].insertCell(-1);
        newHeaderCell.setAttribute('scope', 'col');
        newHeaderCell.textContent = currentElement.revSource + ' Revenue'; 
        tableHead.rows[0].appendChild(newHeaderCell);
    })
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')) 
    tooltipTriggerList.map(function (tooltipTriggerEl) { return new bootstrap.Tooltip(tooltipTriggerEl) })
}


function getRandomColorAndRemove() {
    if(colorScheme.length === 0) {
        return null; // or any other fallback behavior
    }
    const randomIndex = Math.floor(Math.random() * colorScheme.length);
    const selectedColor = colorScheme[randomIndex];
    colorScheme.splice(randomIndex, 1);
    return selectedColor;
}


function arrayToCSV(arr) {
    if (arr.length === 0) return '';

    const columnDelimiter = ',';
    const lineDelimiter = '\n';

    const csv = arr.map(row => keys.map(key => `"${row[key]}"`).join(columnDelimiter));
    return csv.join(lineDelimiter);
}


document.addEventListener('DOMContentLoaded', function() {
    const currentState = decodeDataFromUrlParameter();
    if(currentState){
        otherData = currentState.pop();
        document.getElementById('mscRange').value = otherData[0].msc;
        document.getElementById('growthRate').value = otherData[0].growthRate;
        revenueSources = currentState;
    }else{
        // load from localstorage
        fromLocal = loadFromLocalStorage();
        if(fromLocal){
            otherData = fromLocal.pop();
            document.getElementById('mscRange').value = otherData[0].msc;
            document.getElementById('growthRate').value = otherData[0].growthRate;
            revenueSources = fromLocal;
        }
    }
    let revenueSourceIdCounter = 0;
    let chartData;
    const chart = document.getElementById('revchart');
    var ctx = chart.getContext('2d');

    barChart = new Chart(chart, {
        type: 'bar',
        data: {
            datasets: chartData
        },
        options: {
            plugins: { 
                title: { 
                    display: true, 
                    text: 'Revenue' 
                }, 
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';

                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }, 
            responsive: true,
            maintainAspectRatio: false,
            scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value, index, ticks) {
                        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });;
                    }
                }
            }
            }
        }
    });

    updateMSC();
    updateChart();
    updateCards();
    updateTable();
    updateUrlWithEncodedArray(revenueSources);


    // new revenue source
    var form = document.getElementById("revenueSourceForm");
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Retrieve the values from each form element
        const revSource = document.getElementById('revSourceSelect').value;
        const saleValue = document.getElementById('saleValue').value;
        const saleFreq = document.getElementById('saleFreq').value;
        const revPercent = document.getElementById('revPercent').value;   
        const conversionRate = document.getElementById('conversionRate').value;    
        const randomColor = getRandomColorAndRemove();
        // Calculate sales needed per freq
        let salesFreqFactor;
        if (saleFreq === 'yearly' || saleFreq === 'one-time') {
            salesFreqFactor = 1;
        } else if (saleFreq === 'quarterly') {
            salesFreqFactor = 4;
        } else if (saleFreq === 'monthly') {
            salesFreqFactor = 12;
        } else {
        
            return; // Skip this revenue source
        }
        backgroundColor = randomColor;
        // Create the object
        const revData = {
            id: revenueSourceIdCounter++,
            revSource: revSource,
            saleValue: parseFloat(saleValue), // Convert to number
            saleFreq: saleFreq,
            revPercent: parseFloat(revPercent), // Convert to number
            backgroundColor: backgroundColor,
            salesFreqFactor: salesFreqFactor,
            conversionRate: conversionRate
        };
        revenueSources.push(revData);
        
        
        updateChart();
        updateCards();
        updateTable();

        
        var successMessage = document.getElementById('successMessage');
        successMessage.style.display = 'inline';

        // Hide the success message after 3 seconds (3000 milliseconds)
        setTimeout(function() {
            successMessage.style.display = 'none';
        }, 3000);

        // clear form
        form.reset();

        
        updateUrlWithEncodedArray(revenueSources);
    }, false);
    document.getElementById('growthRate').addEventListener('change', function(event) {
        updateMSC();
        updateChart();
        updateCards();
        updateTable();
        updateUrlWithEncodedArray(revenueSources);
    });
    document.getElementById('mscRange').addEventListener('input', function(event) {
        updateMSC();
        updateChart();
        updateCards();
        updateTable();
        updateUrlWithEncodedArray(revenueSources);
    });
    document.getElementById('copyCSV').addEventListener('click', function(event) {
        let csv = prepareCSV(); 
        copyToClipboard(csv);
        var successMessage = document.getElementById('successMessageCopyCSV');
        successMessage.style.display = 'inline';
    
        // Hide the success message after 3 seconds (3000 milliseconds)
        setTimeout(function() {
            successMessage.style.display = 'none';
        }, 3000);
    
    });
    document.getElementById('copyLink').addEventListener('click', function(event) {
        copyToClipboard(window.location.href);
        var successMessage = document.getElementById('successMessageCopyURL');
        successMessage.style.display = 'inline';

        // Hide the success message after 3 seconds (3000 milliseconds)
        setTimeout(function() {
            successMessage.style.display = 'none';
        }, 3000);
    });
    document.getElementById('resetPage').addEventListener('click', function(event) {
        resetPage(); 
        updateMSC();
        updateChart();
        updateCards();
        updateTable();
        updateUrlWithEncodedArray(revenueSources);
        // close modal
        var resetPageModal = document.getElementById('resetModal');
        var modal = bootstrap.Modal.getInstance(resetPageModal); // Returns a Bootstrap modal instance
        modal.hide();
    });
});
function prepareCSV() {
    
    // build the csv
    let csv = "";

    csv += "MSC:,"+document.getElementById('mscRange').value + '\n';
    csv +='\n';
      
    csv+="Revenue Sources"+'\n';
    
    // Add the values as subsequent rows

    csv +="Source,% of Total Revenue,Value of Sale, Conversion Rate %,Sales Frequency,Customers/Sales,Events Needed"+'\n';

    revenueSources.forEach((source) => {

        csv+= source.revSource +','+ source.revPercent+','+source.saleValue+','+source.conversionRate+','+source.saleFreq+','+source.salesNeeded+','+source.eventsNeeded+'\n';
    });

    csv +='\n';

    csv+="Quarterly Revenue"+'\n';
    csv+="Quarterly Growth Rate: "+','+ document.getElementById('growthRate').value +'\n';
    const table = document.getElementById('growthRateTable');
    const rows = table.rows;

    for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < rows[i].cells.length; j++) {
            csv += '"'+ rows[i].cells[j].textContent.trim() + '"'+',';
        }
        if (i < rows.length - 1) {
            csv += '\n';
        }
    }
    return csv;
    
}

function updateUrlWithEncodedArray(revObject) {
    // Convert the array of objects to a JSON string
    // first push the current msc and growth rate
    const msc = document.getElementById('mscRange').value;
    const growthRate = document.getElementById('growthRate').value;
    const otherData = [{
            msc: msc,
            growthRate: growthRate,
    }];
    revStored = [...revObject];
    revStored.push(otherData);

    const jsonString = JSON.stringify(revStored);

    // save to local storage
    saveToLocalStorage(jsonString);
    
    // URI-encode the string to escape characters that are not URL-safe
    const encodedUriComponent = encodeURIComponent(jsonString);
    
    // Base64 encode the URI-encoded string
    const base64Encoded = btoa(encodedUriComponent);
    
    // Construct the new URL with the Base64 encoded string as a query parameter
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?data=${base64Encoded}`;

    // Update the URL without reloading the page using the history API
    window.history.pushState({ path: newUrl }, '', newUrl);
}

function decodeDataFromUrlParameter() {
    const queryParams = new URLSearchParams(window.location.search);
    const encodedData = queryParams.get('data');
    if (encodedData) {
        // Decode from Base64 then JSON parse the result
        try {
        const jsonString = decodeURIComponent(atob(encodedData));
        return JSON.parse(jsonString);
        } catch (e) {
        console.error('Decoding failed', e);
        return null;
        }
    }
    return null;
}
function saveToLocalStorage(object){
    localStorage.setItem('data', object);

}

function resetPage(){
    revenueSources = [];
    console.log(revenueSources);
    document.getElementById('mscRange').value = 50000;
    document.getElementById('growthRate').value = 20;

}

function loadFromLocalStorage(){
    var storedObjectString = localStorage.getItem('data');

    // Convert the string back to an object using JSON.parse()
    return JSON.parse(storedObjectString);
}

function copyToClipboardFallback() {
    // Create a temporary hidden text element
    const tempInput = document.createElement('input');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    tempInput.value = window.location.href;
    
    // Append it to the body, select the text, and copy it
    document.body.appendChild(tempInput);
    tempInput.select();
    
    // Attempt to copy to the clipboard
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
    } catch (err) {
        console.error('unable to copy', err);
    }
    
        // Remove the temporary input from the document
        document.body.removeChild(tempInput);
    }

function copyToClipboard(data) {
    if (navigator.clipboard) {
            navigator.clipboard.writeText(data).then(function() {
        }).catch(function(error) {
            console.error('Copy failed', error);
            // Fallback if Clipboard API fails
            copyToClipboardFallback();
        });
    } else {
        // Fallback for older browsers
        copyToClipboardFallback();
    }
}
})();
