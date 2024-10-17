
var updating = false;

//define the buttons for the range selection in plotly
var selectorOptions = { //plot options definitions
   buttons: [{
      step: 'minute',
      stepmode: 'backward',
      count: 1,
      label: '1min'
   }, {
      step: 'hour',
      stepmode: 'backward',
      count: 1,
      label: '1hr'
   }, {
      step: 'hour',
      stepmode: 'backward',
      count: 3,
      label: '3hr'
   }, {
      step: 'hour',
      stepmode: 'backward',
      count: 8,
      label: '8hr'
   }, {
      step: 'day',
      stepmode: 'backward',
      count: 1,
      label: '1d'
   }, {
      step: 'day',
      stepmode: 'backward',
      count: 3,
      label: '3d'
   }, {
      step: 'week',
      stepmode: 'backward',
      count: 1,
      label: '1w'
   }, {
      step: 'all'
   }],
};


var deviceName = "Detector_Filling_Temp_2";

//to define a new plot for the same device add it to the vector 
let plots = [
   {
      graphDiv: document.getElementById("graph_1"), // The div element for the first plot
      keys: ['PT1_Pressure', 'PT2_Pressure', 'FT1_Flow'], // List of keys related to the plot
      y2keys: ['FT1_Flow'],
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "Pressure/Flow",
            font: { size: 16 },
            yanchor: 'top',
            xanchor: 'center',
            y: 0.95, // Adjust this value to move the title down
            x: 0.5, // Center the title horizontally
         },
         xaxis: {
            title: "Time/ UTC",
            rangeselector: selectorOptions
         },
         yaxis: {
            title: "Pressure [bar]",
            range: [0, 4]
         },
         //remove this if we don't have a second y axis 
         yaxis2: {
            title: "Flow [t/hr]", // Use the title from y2_plot1
            overlaying: 'y', // Overlay on the primary y-axis
            side: 'right', // Position the y2 axis on the right side
            range: [3, 4] // Set the range from y2_plot1
         }
      }
   },
   {
      graphDiv: document.getElementById("graph_2"), // The div element for the first plot
      keys: ['UT1_Depth', 'LT1_Level', 'PT6_Depth', 'PT5_Depth'], // List of keys related to the plot
      selectedRange: 8 * 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "Detector Level",
            font: { size: 16 },
            yanchor: 'top',
            xanchor: 'center',
            y: 0.95, // Adjust this value to move the title down
            x: 0.5, // Center the title horizontally
         },
         xaxis: {
            title: "Time/ UTC",
            rangeselector: selectorOptions
         },
         yaxis: {
            title: "Detector Level [m]",
            range: [3.2, 3.4]
         }
      }
   },
   {
      graphDiv: document.getElementById("graph_3"), // The div element for the first plot
      keys: ['QC1_Conductivity', 'QC2_Conductivity', 'UT1_Conductivity'], // List of keys related to the plot
      y2keys: ['UT1_Conductivity'],
      selectedRange: 12 * 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "Water Quality",
            font: { size: 16 },
            yanchor: 'top',
            xanchor: 'center',
            y: 0.95, // Adjust this value to move the title down
            x: 0.5, // Center the title horizontally
         },
         xaxis: {
            title: "Time/ UTC",
            rangeselector: selectorOptions
         },
         yaxis: {
            title: "Water Quality [μS/cm]",
            range: [0, 0.5]
         },
         //remove this if we don't have a second y axis 
         yaxis2: {
            title: "'Water Quality [μS/cm]", // Use the title from y2_plot1
            overlaying: 'y', // Overlay on the primary y-axis
            side: 'right', // Position the y2 axis on the right side
            range: [3, 8] // Set the range from y2_plot1
         }
      }
   },
   {
      graphDiv: document.getElementById("graph_4"), // The div element for the first plot
      keys: ['UT1_Temperature'], // List of keys related to the plot
      selectedRange: 24 * 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "Water Temperature",
            font: { size: 16 },
            yanchor: 'top',
            xanchor: 'center',
            y: 0.95, // Adjust this value to move the title down
            x: 0.5, // Center the title horizontally
         },
         xaxis: {
            title: "Time/ UTC",
            rangeselector: selectorOptions
         },
         yaxis: {
            title: "Water temp [°C]",
            range: [20, 26]
         },
      }
   },
   {
      graphDiv: document.getElementById("graph_5"), // The div element for the first plot
      keys: ['PT3_Level', 'MixTank_Low', 'MixTank_High'], // List of keys related to the plot
      y2keys: ['MixTank_Low', 'MixTank_High'],
      selectedRange: 60 * 60 * 1000,
      data: [], // Initially an empty array for data
      layout: {
         title: {
            text: "Retention Tank",
            font: { size: 16 },
            yanchor: 'top',
            xanchor: 'center',
            y: 0.95, // Adjust this value to move the title down
            x: 0.5, // Center the title horizontally
         },
         xaxis: {
            title: "Time/ UTC",
            rangeselector: selectorOptions
         },
         yaxis: {
            title: "Retention Tank PT3 [m]",
            range: [0.3, 1.5]
         },
         //remove this if we don't have a second y axis 
         yaxis2: {
            title: "'On/Off", // Use the title from y2_plot1
            overlaying: 'y', // Overlay on the primary y-axis
            side: 'right', // Position the y2 axis on the right side
            range: [-0.5, 1.5] // Set the range from y2_plot1
         }
      }
   }

];

//copied from Ben's code in monitoring.js this queries the SQL and returns the table
function gettable(command) { //generic funcion for returning SQL table

   return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      var url = "/cgi-bin/sqlquery.cgi";
      var user = "root";
      var db = "daq";
      // Set the request method to POST
      xhr.open("POST", url);
      // Set the request header to indicate that the request body contains form data
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      var dataString = "user=" + user + "&db=" + db + "&command=" + command;
      // Send the request
      xhr.send(dataString);
      xhr.onreadystatechange = function () {
         if (this.readyState == 4 && this.status == 200) {
            resolve(xhr.responseText);
         }
         //	    else reject(new Error('error loading'));
      }
   });
}

async function getTimeDataForDevice(deviceName, time_option) {
   const selectedDevice = deviceName; // Fixed device value
   // console.log("Selected Device: ", selectedDevice); // Log the selected device

   if (time_option === null) {
      var command = "select * from monitoring where device='" + selectedDevice + "' order by time asc";
   } else {
      //time option needs to be a string to specify only get data after the last available data
      //this command is used to update and append
      var command = "select * from monitoring where device='" + selectedDevice + "' and time>'" + time_option + "' order by time asc;  ";
   }

   // Call gettable command asynchronously
   try {
      const result = await gettable(command);

      var tempDiv = document.createElement("div");
      tempDiv.innerHTML = result;

      // Get the table from the temporary div
      var table = tempDiv.querySelector("#table");

      if (!table) {
         console.error("Table not found in result.");
         return [new Map(), new Map()];
      }

      var xdata = new Map();
      var ydata = new Map();

      for (var i = 1; i < table.rows.length; i++) {
         var jsondata = JSON.parse(table.rows[i].cells[2].innerText);

         for (let key in jsondata) {
            if (!xdata.has(key)) {
               xdata.set(key, [table.rows[i].cells[0].innerText.slice(0, -3)]);
               ydata.set(key, [jsondata[key]]);
            } else {
               xdata.get(key).push(table.rows[i].cells[0].innerText.slice(0, -3));
               ydata.get(key).push(jsondata[key]);
            }
         }
      }
      // console.log("returning xdata ")
      return [xdata, ydata];
   } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data. Please try again.");
      return [new Map(), new Map()]; // Return empty maps on error
   }
}

function createSinglePlot(plot, xdata, ydata, now) {
   //creates the data object in the plot
   plot.data = plot.keys.map(key => {
      if (xdata.has(key)) {
         //remove the first n elements which used a different format
         const x_data_to_plot = xdata.get(key);
         const y_data_to_plot = ydata.get(key);
         //decide whether to use a second y axis 
         const data_trace = {
            //the name must be the key for the update function to work
            name: key,
            mode: 'lines',
            x: x_data_to_plot,
            y: y_data_to_plot
         };

         //if this is a key we want to put on the y2 axis put this in the data 
         if ('y2keys' in plot) {
            if (plot.y2keys.includes(key)) {
               data_trace.yaxis = 'y2';
            }
         }
         return data_trace;
      }
      return null; // If key doesn't exist, return null
   }).filter(Boolean); // Filter out null values

   var lowerLimit = new Date(now.getTime() - (plot.selectedRange));  // Subtract 1 hour

   //add the range using the selected range 
   plot.layout.xaxis.range = [lowerLimit.toISOString(), now.toISOString()];

   console.log("graphdiv", plot.graphDiv)
   Plotly.purge(plot.graphDiv); // Clear any existing plot
   Plotly.newPlot(plot.graphDiv, plot.data, plot.layout); // Plot the data

   return;
}

function updateSinglePlot(plot, xdata_new, ydata_new, now) {
   console.log("Calling redrawplot")

   var lowerLimit = new Date(now.getTime() - plot.selectedRange);  // Subtract 1 hour

   //loop through new data and add into the plot if the key is the same
   for (let [key, value] of xdata_new) {
      for (var i = 0; i < plot.data.length; i++) {
         if (plot.data[i].name == key) {
            //this data[i] is the same key as this xdata_new entry
            //so add it 
            plot.data[i].x = plot.data[i].x.concat(value);
            plot.data[i].y = plot.data[i].y.concat(ydata_new.get(key));
         }
      }
   }

   //change the axis limits to reflect current time and previous choice
   plot.layout.xaxis.range = [lowerLimit.toISOString(), now.toISOString()];

   Plotly.update(plot.graphDiv, plot.data, plot.layout);
}

async function makeplot(plotsVector) {

   var time_option = null;

   //set the range automatically
   var now = new Date();  // Get current time

   const [xdata, ydata] = await getTimeDataForDevice(deviceName, time_option);
   for (iPlot = 0; iPlot < plotsVector.length; iPlot++) {
      console.log("graphdiv1", plotsVector[iPlot].graphDiv)
      createSinglePlot(plotsVector[iPlot], xdata, ydata, now);
   }

}


async function updateplot(plotVector) { //fucntion to update plot
   console.log("updateplot vector")
   if (updating) return;
   updating = true;

   var now = new Date();  // Get current time

   // Get the last time of the last entry in the data
   const plot_0_data = plotVector[0].data[0];
   last = plot_0_data.x[plot_0_data.x.length - 1];
   time_option = last.valueOf();

   //get only the new data by looking for data that arrived after the last data
   const [xdata_new, ydata_new] = await getTimeDataForDevice(deviceName, time_option);

   for (iPlot = 0; iPlot < plots.length; iPlot++) {
      updateSinglePlot(plots[iPlot], xdata_new, ydata_new, now);
   }
   updating = false;


};

// Function to initialize event listeners on each plot
function setupPlotListeners() {
   plots.forEach((plot, plotIndex) => {
      const plotDiv = plot.graphDiv;
      // Check if the plotDiv exists
      if (plotDiv) {
         plotDiv.on('plotly_relayout', function (eventData) {
            // Capture the selected range
            if (eventData['xaxis.range[0]'] !== undefined && eventData['xaxis.range[1]'] !== undefined) {
               const selectedRange = [
                  eventData['xaxis.range[0]'],
                  eventData['xaxis.range[1]']
               ];
               // Convert date strings to Date objects
               const startDate = new Date(selectedRange[0] + "Z");
               const endDate = new Date(selectedRange[1]);

               // Calculate the difference in milliseconds and then convert to days (or any other unit)
               const rangeDifference = (endDate - startDate); // Difference in days                       
               // Set the range difference directly in the plot object
               plot.selectedRange = rangeDifference;
               console.log("Selected Range for, Plot " + plot.layout.title + ":", selectedRange);
            }
         });
      } else {
         console.warn(`Plot div not found for Plot ${plotIndex + 1}.`);
      }
   });
}

//this is the code which is executed when make waterplots is called
document.addEventListener("DOMContentLoaded", async function () {
   await makeplot(plots);
   setupPlotListeners();
   let updateinterval = setInterval(() => updateplot(plots), 2000);
});

