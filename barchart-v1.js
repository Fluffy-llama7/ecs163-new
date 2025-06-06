export async function drawWomenAndMenBarCharts() {
    const data = await d3.csv("women-stem.csv", d3.autoType);
  
    // Top 10 majors by women and men separately
    const topWomenMajors = [...data].sort((a, b) => b.Women - a.Women).slice(0, 10);
    const topMenMajors = [...data].sort((a, b) => b.Men - a.Men).slice(0, 10);
  
    //Define all the labels & values to be used by each gender
    const womenLabels = topWomenMajors.map(d => d.Major);
    const womenValues = topWomenMajors.map(d => d.Women);
    const menLabels = topMenMajors.map(d => d.Major);
    const menValues = topMenMajors.map(d => d.Men);
  
    // Top 10 majors by total students (for combined chart)
    const topCombinedMajors = [...data].sort((a, b) => b.Total - a.Total).slice(0, 10);
    const combinedLabels = topCombinedMajors.map(d => d.Major);
    const combinedWomenValues = topCombinedMajors.map(d => d.Women);
    const combinedMenValues = topCombinedMajors.map(d => d.Men);
  
    // This will track the currently active Chart.js instance 
    let currentChart = null;
  
    const destroyChart = () => {
      if (currentChart) {
        currentChart.destroy();
        currentChart = null;
      }
    };
  
    // Create the bar chart for top 10 majors by number of women
    const createWomenChart = () => {
      new Chart(document.getElementById('barChartWomen').getContext('2d'), {
        type: 'bar',
        data: {
          labels: womenLabels,
          datasets: [{
            label: 'Number of Women',
            data: womenValues,
            backgroundColor: '#e0bbe4',
            borderColor: '#e0bbe4',
            borderWidth: 1
          }]
        },
        options: {
          animation: { duration: 1200, easing: 'easeOutQuart' },
          plugins: {
            title: {
              display: true,
              text: 'Top 10 Stem Majors by Number of Women',
              color: '#fff',
              font: { size: 16 }
            },
            legend: { display: false }
          },
          scales: {
            x: {
              ticks: { color: '#fff' },
              title: {
                display: true,
                text: 'Major',
                color: '#fff',
                font: { size: 16 }
              }
            },
            y: {
              beginAtZero: true,
              ticks: { color: '#fff' },
              title: {
                display: true,
                text: 'Number of Women',
                color: '#fff',
                font: { size: 16 }
              }
            }
          }
        }
      });
    };
  
    // Create the bar chart for top 10 majors by number of men
    const createMenChart = () => {
      new Chart(document.getElementById('barChartMen').getContext('2d'), {
        type: 'bar',
        data: {
          labels: menLabels,
          datasets: [{
            label: 'Number of Men',
            data: menValues,
            backgroundColor: '#b5ead7',
            borderColor: '#b5ead7',
            borderWidth: 1
          }]
        },
        options: {
          animation: { duration: 1200, easing: 'easeOutQuart' },
          plugins: {
            title: {
              display: true,
              text: 'Top 10 Stem Majors by Number of Men',
              color: '#fff',
              font: { size: 16 }
            },
            legend: { display: false }
          },
          scales: {
            x: {
              ticks: { color: '#fff' },
              title: {
                display: true,
                text: 'Major',
                color: '#fff',
                font: { size: 16 }
              }
            },
            y: {
              beginAtZero: true,
              ticks: { color: '#fff' },
              title: {
                display: true,
                text: 'Number of Men',
                color: '#fff',
                font: { size: 16 }
              }
            }
          }
        }
      });
    };
  
    // Create a grouped bar chart combining women and men values by major (this is what we siwtch to in the toggle)
    const createCombinedChart = () => {
    // Ensure only one chart is active
      destroyChart();
      const ctx = document.getElementById('combinedChart').getContext('2d');
      currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: combinedLabels,
          datasets: [
            {
              label: 'Women',
              data: combinedWomenValues,
              backgroundColor: '#e0bbe4'
            },
            {
              label: 'Men',
              data: combinedMenValues,
              backgroundColor: '#b5ead7'
            }
          ]
        },
        options: {
          animation: { duration: 1200, easing: 'easeOutQuart' },
          plugins: {
            title: {
              display: true,
              text: 'Top 10 Stem Majors by Total Students (Grouped by Gender)',
              color: '#fff',
              font: { size: 16 }
            },
            legend: {
              labels: { color: '#fff' }
            }
          },
          scales: {
            x: {
              ticks: { color: '#fff' },
              title: {
                display: true,
                text: 'Major',
                color: '#fff',
                font: { size: 16 }
              }
            },
            y: {
              beginAtZero: true,
              ticks: { color: '#fff' },
              title: {
                display: true,
                text: 'Number of Students',
                color: '#fff',
                font: { size: 16 }
              }
            }
          }
        }
      });
    };
  
    //Observe when an element enters the viewport, then call its callback once
    const createObserver = (elementId, callback) => {
      const el = document.getElementById(elementId);
      if (!el) return;
  
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Call chart only when visible
            callback();
            // Stop observing once chart is rendered
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
  
      observer.observe(el);
    };
  
    // To show the separate charts (men and women)
    const drawSeparateCharts = () => {
      destroyChart();
      document.getElementById("barChartWomen").style.display = "block";
      document.getElementById("barChartMen").style.display = "block";
      document.getElementById("combinedChartContainer").style.display = "none";
      createObserver("barChartWomen", createWomenChart);
      createObserver("barChartMen", createMenChart);
    };
  
    // To show the combined grouped chart
    const drawCombinedChart = () => {
      document.getElementById("barChartWomen").style.display = "none";
      document.getElementById("barChartMen").style.display = "none";
      document.getElementById("combinedChartContainer").style.display = "block";
      createCombinedChart();
    };
  
    // Initial state: separate charts
    drawSeparateCharts();
  
    // Toggle button
    const toggleBtn = document.getElementById("toggleChartView");
    let isCombinedView = false;
  
    // Add a click event listener to the toggle button  
    toggleBtn.addEventListener("click", () => {
        // Toggle the view state ->  if currently combined, switch to separate
        //if separate -> switch to combined
      isCombinedView = !isCombinedView;

      // Update the button's label
      toggleBtn.textContent = isCombinedView
        ? "Switch to Separate Charts"
        : "Switch to Combined View";

        // Based on the updated view state, render the appropriate chart(s)
      if (isCombinedView) {
        drawCombinedChart();
      } else {
        drawSeparateCharts();
      }

      // Re-select the toggle switch and label by ID every time the button is clicked.
      const toggleSwitch = document.getElementById('toggleChartView');
      const toggleLabel = document.getElementById('toggleLabel');
      
      toggleSwitch.addEventListener('change', () => {
        // If the checkbox is checked, show combined chart and update label
        if (toggleSwitch.checked) {
          toggleLabel.textContent = 'Combined View';
          drawCombinedChart();
        } else {
        // Otherwise, show separate charts and update label
          toggleLabel.textContent = 'Separate View';
          drawSeparateCharts();
        }
      });
      
    });
  }
  