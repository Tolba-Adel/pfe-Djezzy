//Helper functions
function parseCSV(csvData) {
  return csvData.split("\n").map((row) => row.split(","));
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

//gets the top packages depending on 'topCount'
function getTopPackages(data, topCount, labelIndex) {
  const packageCounts = {};
  data.forEach((row) => {
    const label = row[labelIndex];
    packageCounts[label] = (packageCounts[label] || 0) + 1;
  });
  return Object.keys(packageCounts)
    .sort((a, b) => packageCounts[b] - packageCounts[a])
    .slice(0, topCount);
}

//gets the amount of activation of each package
function getCounts(data, labels, labelIndex) {
  const counts = new Array(labels.length).fill(0);
  data.forEach((row) => {
    const labelIndexInLabels = labels.indexOf(row[labelIndex]);
    if (labelIndexInLabels !== -1) {
      counts[labelIndexInLabels]++;
    }
  });
  return counts;
}

//caluclate the average of an array of numbers
function calculateAverage(userSums) {
  const sums = Object.values(userSums).flat();
  const totalSum = sums.reduce((acc, sum) => acc + sum, 0);
  return totalSum / sums.length;
}

//calculate the median of an array of numbers
function median(values) {
  values.sort((a, b) => a - b);

  const length = values.length;

  if (length % 2 === 0) {
    const mid = length / 2;
    return (values[mid - 1] + values[mid]) / 2;
  } else {
    const mid = Math.floor(length / 2);
    return values[mid];
  }
}

//extract data consumption for the top users
function getUsersDataConsumption(
  data,
  clientIdIndex,
  consumptionIndex,
  packageTypeIndex,
  topCount
) {
  const userConsumptions = {};
  data.forEach((row) => {
    const clientId = row[clientIdIndex];
    const packageType = row[packageTypeIndex];
    if (packageType === "GPRS") {
      const consumption = parseFloat(row[consumptionIndex]);
      userConsumptions[clientId] =
        (userConsumptions[clientId] || 0) + consumption;
    }
  });

  return Object.entries(userConsumptions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topCount);
}

//calculate median data consumption for the top users
function calculateMedianDataConsumption(
  data,
  clientIdIndex,
  consumptionIndex,
  packageTypeIndex,
  topCount
) {
  const topUsersData = getUsersDataConsumption(
    data,
    clientIdIndex,
    consumptionIndex,
    packageTypeIndex,
    topCount
  );
  const dataConsumptionlabels = [];
  const dataConsumptionCounts = [];

  topUsersData.forEach((user) => {
    const clientId = user[0];
    const dataConsumptionValues = data
      .filter(
        (row) =>
          row[clientIdIndex] === clientId && row[packageTypeIndex] === "GPRS"
      )
      .map((row) => parseFloat(row[consumptionIndex])/1e9);//convert from bytes to gigabytes
    const userMedianConsumption = median(dataConsumptionValues);
    dataConsumptionlabels.push(clientId);
    dataConsumptionCounts.push(userMedianConsumption);
  });

  return { dataConsumptionlabels, dataConsumptionCounts };
}

// Function to count consumption for each user where package type is "VOICE" and consumption index is the highest
function getUsersConsumption(
  data,
  clientIdIndex,
  packageTypeIndex,
  consumptionIndex
) {
  const consumptionCounts = {};
  data.forEach((row) => {
    const clientId = row[clientIdIndex];
    const packageType = row[packageTypeIndex];
    const consumption = parseFloat(row[consumptionIndex]);
    if (packageType === "VOICE") {
      if (
        !(clientId in consumptionCounts) ||
        consumption > consumptionCounts[clientId]
      ) {
        consumptionCounts[clientId] = consumption;
      }
    }
  });
  return consumptionCounts;
}

// Function to get top users with the highest consumption
function getTopUsersConsumption(consumptionCounts, topCount) {
  return Object.entries(consumptionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topCount);
}

// Function to calculate median consumption for the top users
function calculateMedianConsumption(
  data,
  clientIdIndex,
  packageTypeIndex,
  consumptionIndex,
  topCount
) {
  const consumptionCounts = getUsersConsumption(
    data,
    clientIdIndex,
    packageTypeIndex,
    consumptionIndex
  );
  const topUsers = getTopUsersConsumption(consumptionCounts, topCount);
  const consumptionLabels = [];
  const consumptionData = [];

  topUsers.forEach((user) => {
    const clientId = user[0];
    const consumption = parseFloat(user[1]);
    consumptionLabels.push("Client ID " + clientId);
    consumptionData.push(consumption);
  });

  return { consumptionLabels, consumptionData };
}

//--------------------------
// - Most 20 Used Packages -
//--------------------------
function createPackagesChart(labels, counts) {
  var ctx = document.getElementById("packagesChart").getContext("2d");
  var packagesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Nombre d'activation",
          data: counts,
          borderColor: "rgba(44, 62, 80, 1)",
          backgroundColor: "rgba(231, 76, 60, 1)",
          borderWidth: 2,
          hoverBorderWidth: 3.5,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: false,
      },
    },
  });
}

//--------------------------------
// - Most Used Internet Packages -
//--------------------------------
function createInternetPackagesChart(labels, counts) {
  var ctx = document.getElementById("internetPackagesChart").getContext("2d");
  var internetPackagesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Nombre d'activation",
          data: counts,
          borderColor: "rgba(44, 62, 80, 1)",
          backgroundColor: [
            "rgba(231, 76, 60, 1)", //no
            "rgba(241, 196, 15, 1)", //yellow
            "rgba(46, 204, 113, 1)", // green
            "rgba(52, 152, 219, 1)", //no
            "rgba(155, 89, 182, 1)", //purple
            "rgba(230, 126, 34, 1)", //orange
            "rgba(236, 240, 241, 1)", //white
            "rgba(149, 165, 166, 1)", //gray
            "rgba(192, 57, 43, 1)", //dark red
            "rgba(189, 195, 199, 1)", // light gray
          ],
          borderWidth: 2,
          hoverBorderWidth: 3.5,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: false,
      },
    },
  });
}

//----------------------------------------
// - Most Used Calls For Djezzy Packages -
//----------------------------------------
function createVoiceOTAPackagesChart(labels, counts) {
  var ctx = document
    .getElementById("djezzyCallsPackagesChart")
    .getContext("2d");
  var djezzyCallsPackagesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Nombre d'activation",
          data: counts,
          borderColor: "rgba(44, 62, 80, 1)",
          backgroundColor: [
            "rgba(231, 76, 60, 1)",
            "rgba(52, 152, 219, 1)",
            "rgba(46, 204, 113, 1)",
            "rgba(155, 89, 182, 1)",
            "rgba(241, 196, 15, 1)",
            "rgba(230, 126, 34, 1)",
          ],
          borderWidth: 1.4,
          hoverBorderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: false,
      },
    },
  });
}

//----------------------------------------
// - Most Used Calls For Others Packages -
//----------------------------------------
function createVoiceOthersPackagesChart(labels, counts) {
  var ctx = document
    .getElementById("othersCallsPackagesChart")
    .getContext("2d");
  var othersCallsPackagesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Nombre d'activation",
          data: counts,
          borderColor: "rgba(44, 62, 80, 1)",
          backgroundColor: [
            "rgba(231, 76, 60, 1)",
            "rgba(52, 152, 219, 1)",
            "rgba(46, 204, 113, 1)",
            "rgba(155, 89, 182, 1)",
            "rgba(241, 196, 15, 1)",
            "rgba(230, 126, 34, 1)",
          ],
          borderWidth: 1.4,
          hoverBorderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: false,
      },
    },
  });
}

//-------------------------------------
// - Data Consumption Median Per User -
//-------------------------------------
function createDataConsumptionChart(labels, counts) {
  var ctx = document.getElementById("dataConsumptionChart").getContext("2d");
  var dataConsumptionChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Données Consommées",
          data: counts,
          backgroundColor: [
            "#D2691E", //dark orange
            "#B22222", // Fire Brick
            "#A0522D", //brown
            "#8B6969", // Rosy Brown
            "rgba(52, 152, 219, 1)",//blue
            "rgba(231, 76, 60, 1)",//red
            "rgba(46, 204, 113, 1)",//green
            "rgba(155, 89, 182, 1)",//purple
            "rgba(241, 196, 15, 1)",//yellow
            "rgba(149, 165, 166, 1)",//gray
            "rgba(52, 73, 94, 1)",//dark blue
            "rgba(243, 156, 18, 1)",//dark yellow
            "rgba(142, 68, 173, 1)",//dark purple
            "rgba(39, 174, 96, 1)",//dark green
            "rgba(44, 62, 80, 1)",//darker blue
          ],
          borderWidth: 1.5,
          hoverBorderWidth: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: false,
      },
    },
  });
}

//--------------------------------------
// - Calls Consumption Median Per User -
//--------------------------------------
function createCallsConsumptionChart(labels, sums) {
  var ctx = document.getElementById("callsConsumptionChart").getContext("2d");
  var callsConsumptionChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Appels Consommés",
          data: sums,
          backgroundColor: [
            "#D2691E", // Chocolate
            "#B22222", // Fire Brick
            "#A0522D", // Sienna
            "#8B6969", // Rosy Brown
            "rgba(52, 152, 219, 1)",
            "rgba(231, 76, 60, 1)",
            "rgba(46, 204, 113, 1)",
            "rgba(155, 89, 182, 1)",
            "rgba(241, 196, 15, 1)",
            "rgba(149, 165, 166, 1)",
            "rgba(52, 73, 94, 1)",
            "rgba(243, 156, 18, 1)",
            "rgba(142, 68, 173, 1)",
            "rgba(39, 174, 96, 1)",
            "rgba(44, 62, 80, 1)",
          ],
          borderWidth: 1.5,
          hoverBorderWidth: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: false,
      },
    },
  });
}

//--------------------------------------
// - Limited/Unlimited Djezzy packages -
//--------------------------------------
function createDjezzyPackagesChart(labels, counts) {
  var ctx = document.getElementById("offresDjezzyChart").getContext("2d");
  var offresDjezzyChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Nombre d'offres",
          data: counts,
          backgroundColor: [
          "#B22222", // Fire Brick
          "rgba(44, 62, 80, 1)",//the darkest blue
        ],
          borderWidth: 1.5,
          hoverBorderWidth: 4,
        },
      ],
    },
  });
}

//--------------------------------------
// - Limited/Unlimited Others packages -
//--------------------------------------
function createOthersPackagesChart(labels, counts) {
  var ctx = document.getElementById("offresAutreChart").getContext("2d");
  var offresAutreChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Nombre d'offres",
          data: counts,
          backgroundColor: [
            "#009688",//teal
            "#EB984E",//light orange
          ],
          borderWidth: 1.5,
          hoverBorderWidth: 4,
        },
      ],
    },
  });
}

//-----------------------------------
// - Limited/Unlimited All packages -
//-----------------------------------
function createAllPackagesChart(labels, counts) {
  var ctx = document.getElementById("offresTousChart").getContext("2d");
  var offresTousChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Nombre d'offres",
          data: counts,
          backgroundColor: [
            "#8B6969", // Rosy Brown
            "#A0522D", //brown
          ],
          borderWidth: 1.5,
          hoverBorderWidth: 4,
        },
      ],
    },
  });
}

//----------------------------
// - Most Users Making Calls -
//----------------------------
// function createCallsChart(labels, counts) {
//   var ctx = document.getElementById("userCallsChart").getContext("2d");
//   var userCallsChart = new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels: labels,
//       datasets: [
//         {
//           label: "Nombre d'appels",
//           data: counts,
//           borderColor: "rgba(44, 62, 80, 1)",
//           backgroundColor: [
//             "rgba(231, 76, 60, 1)",
//             "rgba(52, 152, 219, 1)",
//             "rgba(46, 204, 113, 1)",
//             "rgba(155, 89, 182, 1)",
//             "rgba(241, 196, 15, 1)",
//             "rgba(230, 126, 34, 1)",
//           ],
//           borderWidth: 1.4,
//           hoverBorderWidth: 3,
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: false,
//       },
//     },
//   });
// }

//-----------------------------------
// - Most Users Activating Packages -
//-----------------------------------
// function createUsersActivatingPackagesChart(labels, counts) {
//   var ctx = document.getElementById("userPackagesChart").getContext("2d");
//   var userPackagesChart = new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels: labels,
//       datasets: [
//         {
//           label: "Nombre d'activation",
//           data: counts,
//           borderColor: "rgba(44, 62, 80, 1)",
//           backgroundColor: [
//             "rgba(231, 76, 60, 1)",
//             "rgba(241, 196, 15, 1)",
//             "rgba(46, 204, 113, 1)",
//             "rgba(52, 152, 219, 1)",
//             "rgba(155, 89, 182, 1)",
//             "rgba(230, 126, 34, 1)",
//             "rgba(236, 240, 241, 1)",
//             "rgba(149, 165, 166, 1)",
//             "rgba(192, 57, 43, 1)",
//             "rgba(189, 195, 199, 1)",
//           ],
//           borderWidth: 2,
//           hoverBorderWidth: 3.5,
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: false,
//       },
//     },
//   });
// }

const csvFilePath = "data/ConsF_Copy.csv";
const labelIndex = 16;
const packageTypeIndex = 8;
const operatorIndex = 5;
const clientIdIndex = 2;
const remainingCreditIndex = 15;
const consumptionIndex = 11;

const offresDjezzyLabels = ["Illimité", "Limité"];
const offresDjezzyCounts = [73, 92];
const offresOthersLabels = ["Illimité", "Limité"];
const offresOthersCounts = [39, 126];
const offresAllLabels = ["Illimité", "Limité"];
const offresAllCounts = [112, 218];

fetch(csvFilePath)
  .then((response) => response.text())
  .then((csvData) => {
    const data = parseCSV(csvData);

    //Most 20 Used Packages
    const labels = getTopPackages(data, 20, labelIndex);
    // const shuffledLabels = shuffleArray(labels);
    const counts = getCounts(data, labels, labelIndex);
    createPackagesChart(labels, counts);

    //Most Used Internet Packages
    const internetData = data.filter((row) => row[packageTypeIndex] === "GPRS");
    const internetLabels = getTopPackages(internetData, 12, labelIndex);
    // const shuffledInternetLabels = shuffleArray(internetLabels);
    const internetCounts = getCounts(internetData, internetLabels, labelIndex);
    createInternetPackagesChart(internetLabels, internetCounts);

    //Most Used Calls For Djezzy Packages
    const voiceOTAData = data.filter(
      (row) => row[packageTypeIndex] === "VOICE" && row[operatorIndex] == "OTA"
    );
    const voiceOTALabels = getTopPackages(voiceOTAData, 6, labelIndex);
    // const shuffledVoiceOTALabels = shuffleArray(voiceOTALabels);
    const voiceOTACounts = getCounts(voiceOTAData, voiceOTALabels, labelIndex);
    createVoiceOTAPackagesChart(voiceOTALabels, voiceOTACounts);

    //Most Used Calls For Others Packages
    const voiceOthersData = data.filter(
      (row) => row[packageTypeIndex] === "VOICE" && row[operatorIndex] !== "OTA"
    );
    const voiceOthersLabels = getTopPackages(voiceOthersData, 6, labelIndex);
    // const shuffledVoiceOthersLabels = shuffleArray(voiceOthersLabels);
    const voiceOthersCounts = getCounts(
      voiceOthersData,
      voiceOthersLabels,
      labelIndex
    );
    createVoiceOthersPackagesChart(voiceOthersLabels, voiceOthersCounts);

    //Data Consumption Median Per User
    const { dataConsumptionlabels, dataConsumptionCounts } =
      calculateMedianDataConsumption(
        data,
        clientIdIndex,
        consumptionIndex,
        packageTypeIndex,
        15
      );
    const newDataConsumptionlabels = dataConsumptionlabels.map(function (
      label
    ) {
      return "Client ID " + label;
    });
    createDataConsumptionChart(newDataConsumptionlabels, dataConsumptionCounts);

    //Call Consumption Median Per User
    const { consumptionLabels, consumptionData } = calculateMedianConsumption(
      data,
      clientIdIndex,
      packageTypeIndex,
      consumptionIndex,
      15
    );
    createCallsConsumptionChart(consumptionLabels, consumptionData);

    //Limited/Unlimited Djezzy packages
    createDjezzyPackagesChart(offresDjezzyLabels, offresDjezzyCounts);

    //Limited/Unlimited Others packages
    createOthersPackagesChart(offresOthersLabels, offresOthersCounts);

    //Limited/Unlimited all packages
    createAllPackagesChart(offresAllLabels, offresAllCounts);
  });
