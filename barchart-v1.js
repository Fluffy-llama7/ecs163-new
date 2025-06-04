export async function drawWomenAndMenBarCharts() {
    const data = await d3.csv("women-stem.csv", d3.autoType);
  
    // Prepare all the data
    const topWomenMajors = [...data].sort((a, b) => b.Women - a.Women).slice(0, 10);
    const topMenMajors = [...data].sort((a, b) => b.Men - a.Men).slice(0, 10);
  
    const womenLabels = topWomenMajors.map(d => d.Major);
    const womenValues = topWomenMajors.map(d => d.Women);
    const menLabels = topMenMajors.map(d => d.Major);
    const menValues = topMenMajors.map(d => d.Men);
  
    // Define chart functions that we will call
    const createWomenChart = () => {
      new Chart(document.getElementById('barChartWomen').getContext('2d'), {
        type: 'bar',
        data: {
          labels: womenLabels,
          datasets: [{
            label: 'Number of Women',
            data: womenValues,
            backgroundColor: '#e0bbe4',  // muted lavender
            borderColor: '#e0bbe4',
            borderWidth: 1
          }]
        },
        options: {
          animation: {
            duration: 1200,
            easing: 'easeOutQuart'
          },
          plugins: {
            title: {
              display: true,
              text: 'Top 10 Majors by Number of Women',
              color: '#fff',
              font: {size : 16}
            },
            legend: { display: false }
          },
          scales: {
            x: { 
              beginAtZero: true,
              ticks: { color: '#fff' }, // <-- color of x-axis tick labels
              title: {
              display: true,
              text: 'Major',
              color: '#fff',            // x-axis title color
              font: { size: 16 }
              }

             },
              y: {
              ticks: { color: '#fff' },   // y-axis tick label color
              title: {
              display: true,
              text: 'Number of Women',
              color: '#fff',           // y-axis title color
              font: { size: 16 }
            }
            }
          },
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
            backgroundColor: '#b5ead7',  // pale seafoam
            borderColor: '#b5ead7',
            borderWidth: 1
          }]
        },
        options: {
          animation: {
            duration: 1200,
            easing: 'easeOutQuart'
          },
          plugins: {
            title: {
              display: true,
              text: 'Top 10 Majors by Number of Men',
              color: '#fff',
              font: { size: 16}
            },
            legend: { display: false }
          },
          scales: {
            x: { 
              beginAtZero: true,
              ticks: { color: '#fff' }, // <-- color of x-axis tick labels
              title: {
              display: true,
              text: 'Major',
              color: '#fff',            // x-axis title color
              font: { size: 16 }
              }

             },
              y: {
              ticks: { color: '#fff' },   // y-axis tick label color
              title: {
              display: true,
              text: 'Number of Men',
              color: '#fff',           // y-axis title color
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
            callback();       // Draw chart
            obs.unobserve(entry.target); // Stop watching once triggered
          }
        });
      }, { threshold: 0.3 });
  
      observer.observe(el);
    };
  
    createObserver("barChartWomen", createWomenChart);
    createObserver("barChartMen", createMenChart);
  }
  