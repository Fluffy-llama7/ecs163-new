export async function drawWomenAndMenBarCharts() {
    const data = await d3.csv("women-stem.csv", d3.autoType);
  
    // Top 10 majors by women and men separately
    const topWomenMajors = [...data].sort((a, b) => b.Women - a.Women).slice(0, 10);
    const topMenMajors = [...data].sort((a, b) => b.Men - a.Men).slice(0, 10);
  
    const womenLabels = topWomenMajors.map(d => d.Major);
    const womenValues = topWomenMajors.map(d => d.Women);
    const menLabels = topMenMajors.map(d => d.Major);
    const menValues = topMenMajors.map(d => d.Men);
  
    // Top 10 majors by total students (for combined chart)
    const topCombinedMajors = [...data].sort((a, b) => b.Total - a.Total).slice(0, 10);
    const combinedLabels = topCombinedMajors.map(d => d.Major);
    const combinedWomenValues = topCombinedMajors.map(d => d.Women);
    const combinedMenValues = topCombinedMajors.map(d => d.Men);
  
    let currentChart = null;
  
    const destroyChart = () => {
      if (currentChart) {
        currentChart.destroy();
        currentChart = null;
      }
    };
  
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
  
    const createCombinedChart = () => {
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
  
    const createObserver = (elementId, callback) => {
      const el = document.getElementById(elementId);
      if (!el) return;
  
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            callback();
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
  
      observer.observe(el);
    };
  
    const drawSeparateCharts = () => {
      destroyChart();
      document.getElementById("barChartWomen").style.display = "block";
      document.getElementById("barChartMen").style.display = "block";
      document.getElementById("combinedChartContainer").style.display = "none";
      createObserver("barChartWomen", createWomenChart);
      createObserver("barChartMen", createMenChart);
    };
  
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
  
    toggleBtn.addEventListener("click", () => {
      isCombinedView = !isCombinedView;
      toggleBtn.textContent = isCombinedView
        ? "Switch to Separate Charts"
        : "Switch to Combined View";
      if (isCombinedView) {
        drawCombinedChart();
      } else {
        drawSeparateCharts();
      }

      const toggleSwitch = document.getElementById('toggleChartView');
      const toggleLabel = document.getElementById('toggleLabel');
      
      toggleSwitch.addEventListener('change', () => {
        if (toggleSwitch.checked) {
          toggleLabel.textContent = 'Combined View';
          drawCombinedChart();
        } else {
          toggleLabel.textContent = 'Separate View';
          drawSeparateCharts();
        }
      });
      
    });
  }
  