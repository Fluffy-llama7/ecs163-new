export function drawSankeyChart() {
    d3.csv("recent-grads.csv", d3.autoType).then(data => {
      // Filter only Agriculture & Natural Resources majors
      const categoryName = "Agriculture & Natural Resources";
      const agMajors = data.filter(d => d.Major_category === categoryName);
  
      // Create dropdown for majors inside #major-select container
      const select = d3.select("#major-select");
      select.selectAll("option").remove(); // clear existing options
  
      select.append("option")
        .attr("value", "all")
        .text("All Majors");
  
      agMajors.forEach(d => {
        select.append("option")
          .attr("value", d.Major)
          .text(d.Major);
      });
  
      // Initial draw with all majors highlighted
      drawSankey("all");
  
      // On dropdown change, redraw the Sankey with selected major
      select.on("change", function() {
        drawSankey(this.value);
      });
  
      function drawSankey(selectedMajor) {
        // Clear previous svg
        d3.select("#sankey-chart").select("svg").remove();
  
        const nodes = [];
        const nodeMap = new Map();
        const links = [];
  
        function getNodeIndex(name) {
          if (!nodeMap.has(name)) {
            nodeMap.set(name, nodes.length);
            nodes.push({ name });
          }
          return nodeMap.get(name);
        }
  
        const statusNodes = ["Employed", "Unemployed", "College Job", "Non-college Job"];
  
        // Add fixed nodes
        getNodeIndex(categoryName);
        statusNodes.forEach(getNodeIndex);
  
        // Add majors and links for all majors
        agMajors.forEach(d => {
          const major = d.Major;
          const majorIdx = getNodeIndex(major);
  
          // Category -> Major
          links.push({ source: getNodeIndex(categoryName), target: majorIdx, value: d.Total });
  
          // Major -> Employment Status
          const emp = d.Employed ?? 0;
          const unemp = d.Unemployed ?? 0;
  
          const empIdx = getNodeIndex("Employed");
          const unempIdx = getNodeIndex("Unemployed");
  
          links.push({ source: majorIdx, target: empIdx, value: emp });
          links.push({ source: majorIdx, target: unempIdx, value: unemp });
  
          // Employed -> College/Non-college Job
          const collegeJobIdx = getNodeIndex("College Job");
          const nonCollegeJobIdx = getNodeIndex("Non-college Job");
  
          links.push({ source: empIdx, target: collegeJobIdx, value: d.College_jobs ?? 0 });
          links.push({ source: empIdx, target: nonCollegeJobIdx, value: d.Non_college_jobs ?? 0 });
        });
  
        const container = d3.select("#sankey-chart");
        const width = container.node().clientWidth;
        const height = 600;
  
        const svg = container.append("svg")
          .attr("width", width)
          .attr("height", height);
  
        const { sankey, sankeyLinkHorizontal } = d3;
  
        const sankeyGen = sankey()
          .nodeWidth(20)
          .nodePadding(14)
          .extent([[1, 1], [width - 1, height - 6]]);
  
        const sankeyData = sankeyGen({
          nodes: nodes.map(d => Object.assign({}, d)),
          links: links.map(d => Object.assign({}, d))
        });
  
        const extendedPastelBrightPalette = [
          "#bae87a", "#f18fc1", "#9d6d49", "#92ba5f", "#efaac5",
          "#f7c59f", "#b5ead7", "#fbc4ab", "#ffd6e0", "#c5deff",
          "#dab894", "#f6eac2", "#a3c4f3", "#e0bbe4", "#d5f4e6"
        ];
  
        const colorScale = d3.scaleOrdinal()
          .domain(nodes.map(d => d.name))
          .range(extendedPastelBrightPalette);
  
        d3.select("svg").style("background-color", "#1e1e1e");
  
        // The Highlight logic here: links & nodes connected to selected major will have opacity 1
        function isLinkHighlighted(link) {
          if (selectedMajor === "all") return true;
  
          // Highlight if source or target is the selected major 
          if (link.source.name === selectedMajor || link.target.name === selectedMajor) return true;
  
          // Also highlight category!!
          if (link.source.name === categoryName && link.target.name === selectedMajor) return true;
  
          // Highlight links connecting the employment status to the selected major
          if (link.source.name === selectedMajor && (link.target.name === "Employed" || link.target.name === "Unemployed")) return true;
  
          // Highlight employed → college/non-college job for selected major
          if (link.source.name === "Employed") {
            // Check if major's employed count > 0 and this link is college/non-college job
            return true;
          }
  
          return false;
        }
  
        // Draw links
        svg.append("g")
          .attr("fill", "none")
          .attr("stroke-opacity", 0.9)
          .selectAll("path")
          .data(sankeyData.links)
          .join("path")
          .attr("d", sankeyLinkHorizontal())
          .attr("stroke", d => colorScale(d.source.name))
          .attr("stroke-width", d => Math.max(1, d.width))
          .attr("opacity", d => isLinkHighlighted(d) ? 1 : 0.1);
  
        // Draw nodes
        const node = svg.append("g")
          .selectAll("g")
          .data(sankeyData.nodes)
          .join("g");
  
        node.append("rect")
          .attr("x", d => d.x0)
          .attr("y", d => d.y0)
          .attr("height", d => d.y1 - d.y0)
          .attr("width", d => d.x1 - d.x0)
          .attr("fill", d => colorScale(d.name))
          .attr("stroke", "#333")
          .attr("fill-opacity", d => {
            if (selectedMajor === "all") return 1;
            // Highlight category, status nodes always
            if ([categoryName, "Employed", "Unemployed", "College Job", "Non-college Job"].includes(d.name)) return 1;
            // Highlight selected major node
            return d.name === selectedMajor ? 1 : 0.1;
          });
  
        node.append("text")
          .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
          .attr("y", d => (d.y1 + d.y0) / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
          .text(d => d.name)
          .style("fill", "#f0f0f0")
          .style("font-size", "12px")
          .attr("opacity", d => {
            if (selectedMajor === "all") return 1;
            if ([categoryName, "Employed", "Unemployed", "College Job", "Non-college Job"].includes(d.name)) return 1;
            return d.name === selectedMajor ? 1 : 0.1;
          });
      }
    });
  }
  