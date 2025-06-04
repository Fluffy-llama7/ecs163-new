export function drawSankeyChart() {
    d3.csv("recent-grads.csv", d3.autoType).then(data => {
      const categoryName = "Agriculture & Natural Resources";
      const agMajors = data.filter(d => d.Major_category === categoryName);
  
      const select = d3.select("#major-select");
      select.selectAll("option").remove();
  
      select.append("option")
        .attr("value", "all")
        .text("All Majors");
  
      agMajors.forEach(d => {
        select.append("option")
          .attr("value", d.Major)
          .text(d.Major);
      });
  
      drawSankey("all");
  
      select.on("change", function() {
        drawSankey(this.value);
      });
  
      function drawSankey(selectedMajor) {
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
  
        getNodeIndex(categoryName);
        statusNodes.forEach(getNodeIndex);
  
        agMajors.forEach(d => {
          const major = d.Major;
          const majorIdx = getNodeIndex(major);
  
          links.push({ source: getNodeIndex(categoryName), target: majorIdx, value: d.Total });
  
          const emp = d.Employed ?? 0;
          const unemp = d.Unemployed ?? 0;
  
          const empIdx = getNodeIndex("Employed");
          const unempIdx = getNodeIndex("Unemployed");
  
          links.push({ source: majorIdx, target: empIdx, value: emp });
          links.push({ source: majorIdx, target: unempIdx, value: unemp });
  
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
  
        function isLinkHighlighted(link) {
          if (selectedMajor === "all") return true;
          if (link.source.name === selectedMajor || link.target.name === selectedMajor) return true;
          if (link.source.name === categoryName && link.target.name === selectedMajor) return true;
          if (link.source.name === selectedMajor && (link.target.name === "Employed" || link.target.name === "Unemployed")) return true;
          if (link.source.name === "Employed") return true;
          return false;
        }
  
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
            if ([categoryName, "Employed", "Unemployed", "College Job", "Non-college Job"].includes(d.name)) return 1;
            return d.name === selectedMajor ? 1 : 0.1;
          });
  
        const label = node.append("g")
          .attr("transform", d => `translate(${d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6}, ${(d.y1 + d.y0) / 2})`)
          .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end");
  
        label.append("rect")
          .attr("x", d => d.x0 < width / 2 ? 0 : -getTextWidth(d.name, "14px sans-serif") - 6)
          .attr("y", -10)
          .attr("width", d => getTextWidth(d.name, "14px sans-serif") + 6)
          .attr("height", 20)
          .attr("fill", "rgba(30,30,30,0.7)")
          .attr("rx", 3)
          .attr("ry", 3)
          .attr("opacity", d => {
            if (selectedMajor === "all") return 1;
            if ([categoryName, "Employed", "Unemployed", "College Job", "Non-college Job"].includes(d.name)) return 1;
            return d.name === selectedMajor ? 1 : 0.1;
          });
  
        label.append("text")
          .text(d => d.name)
          .attr("dy", "0.35em")
          .style("fill", "#fff")
          .style("font-size", "14px")
          .style("font-weight", "500")
          .attr("opacity", d => {
            if (selectedMajor === "all") return 1;
            if ([categoryName, "Employed", "Unemployed", "College Job", "Non-college Job"].includes(d.name)) return 1;
            return d.name === selectedMajor ? 1 : 0.1;
          });
      }
  
      // Helper to measure text width for background boxes
      function getTextWidth(text, font) {
        const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
        const context = canvas.getContext("2d");
        context.font = font;
        const metrics = context.measureText(text);
        return metrics.width;
      }
    });
  }
  