const extendedPastelBrightPalette = [
    "#bae87a", "#f18fc1", "#9d6d49", "#92ba5f", "#efaac5",
    "#f7c59f", // soft peach
    "#b5ead7", // pastel mint
    "#fbc4ab", // dusty coral
    "#ffd6e0", // very light pink
    "#c5deff", // powder blue
    "#dab894", // warm sand
    "#f6eac2", // creamy beige
    "#a3c4f3", // faded sky blue
    "#e0bbe4", // muted lavender
    "#d5f4e6"  // pale seafoam
  ];
  
  export function drawTreemap(){
    d3.csv("all-ages.csv").then(data => {
      // Convert "Total" and "Median" to numbers
      data.forEach(d => {
        d.Total = +d.Total;
        d.Median = +d.Median;
      });
  
      // Find min and max median for color scaling
      const medianExtent = d3.extent(data, d => d.Median);
  
      // Nest data by Major_category
      const nested = d3.group(data, d => d.Major_category);
      const categoryNames = Array.from(nested.keys());
  
      // Use your extended pastel bright palette here
      const categoryColorScale = d3.scaleOrdinal()
        .domain(categoryNames)
        .range(extendedPastelBrightPalette);
  
      // Lightness scale for heat aspect
      const lightness = d3.scalePow()
        .domain(medianExtent)
        .range([0.7 , 0.05])
        .exponent(0.25);
  
      // Convert to hierarchy format for treemap
      const root = {
        name: "Majors",
        children: Array.from(nested, ([key, values]) => ({
          name: key,
          children: values.map(d => ({
            name: d.Major,
            value: d.Total,
            median: d.Median,
            employed: +d.Employed,
            unemployed: +d.Unemployed,
            p25: +d.P25th,
            p75: +d.P75th
          }))
        }))
      };
  
      // Create hierarchy and sum values (treemap uses the sum to size the rectangles)
      const hierarchy = d3.hierarchy(root)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
  
      // Treemap layout
      const width = 1400, height = 1300; //changing height can cause cutoff
  
      // Custom tiling to make space for labels
      const labelHeight = 20;
      function treemapWithLabelSpace(node, x0, y0, x1, y1) {
        if (node.depth === 1) {
          y0 += labelHeight;
        }
        d3.treemapBinary(node, x0, y0, x1, y1);
      }
  
      d3.treemap()
        .tile(treemapWithLabelSpace)
        .size([width, height])
        .padding(2)
        (hierarchy);
  
      // Select the treemap container
      const svg = d3.select("#treemap").append("svg")
        .attr("width", width)
        .attr("height", height);
  
      // Draw category labels above each category
      svg.selectAll(".category-label")
        .data(hierarchy.children)
        .enter()
        .append("text")
        .attr("class", "category-label")
        .attr("x", d => (d.x0 + d.x1) / 2)
        .attr("y", d => d.y0 + labelHeight / 2 + 8)
        .attr("text-anchor", "middle")
        .attr("font-size", "15px")
        .attr("font-weight", "bold")
        .attr("fill", "#fff")
        .text(function(d) {
          const maxWidth = d.x1 - d.x0 - 10;
          return truncateText(d.data.name, maxWidth, 15);
        });
  
      let selectedRect = null;
  
      // Draw rectangles for each major
      const nodes = svg.selectAll("g")
        .data(hierarchy.leaves())
        .enter().append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);
  
      nodes.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => {
          const base = d3.hsl(categoryColorScale(d.parent.data.name));
          return d3.hsl(base.h, base.s, lightness(d.data.median)).formatHsl();
        })
        .attr("stroke", "#888")
        .attr("stroke-width", 0)
        .style("cursor", "pointer")
        .on("click", function(event, d) {
          if (selectedRect === this) {
            d3.select("#tooltip").style("display", "none");
            d3.select(this).attr("stroke-width", 0);
            selectedRect = null;
            return;
          }
          d3.selectAll("rect").attr("stroke-width", 0);
          d3.select(this)
            .attr("stroke", d => {
              const base = d3.hsl(categoryColorScale(d.parent.data.name));
              return d3.hsl(base.h, base.s, lightness(d.data.median) + 0.25).formatHsl();
            })
            .attr("stroke-width", 4);
  
          d3.select("#tooltip")
            .style("display", "block")
            .html(`<strong>${d.data.name}</strong><br><br>
                  <div><strong>Category:</strong> ${d.parent.data.name}</div><br><br>
                  <div><strong>Total:</strong> ${d.value.toLocaleString()} people</div><br><br>
                  <div><strong>Median:</strong> $${d.data.median.toLocaleString()}</div><br><br>
                  <div><strong>25th Percentile:</strong> $${d.data.p25.toLocaleString()}</div><br><br>
                  <div><strong>75th Percentile:</strong> $${d.data.p75.toLocaleString()}</div><br><br>
                  <div id="piechart"></div>
            `);
  
          d3.select("#piechart").selectAll("*").remove();
  
          const pieData = [
            {label: "Employed", value: d.data.employed || 1},
            {label: "Unemployed", value: d.data.unemployed || 1}
          ];
  
          const total_employ = d.data.employed + d.data.unemployed;
          const pieDataStr = [
            {label: "Employed", value: ((d.data.employed / total_employ) * 100).toFixed(2) + "%" || 1},
            {label: "Unemployed", value: ((d.data.unemployed / total_employ) * 100).toFixed(2) + "%" || 1}
          ];
  
          const w = 120, h = 120, r = 50;
          const pieSvg = d3.select("#tooltip #piechart")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform", `translate(${w/2},${h/2})`);
  
          const pie = d3.pie().value(d => d.value);
          const arc = d3.arc().innerRadius(0).outerRadius(r);
  
          pieSvg.selectAll("path")
            .data(pie(pieData))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => d3.schemeCategory10[i]);
  
          const legend = d3.select("#tooltip #piechart")
            .selectAll("div")
            .data(pieDataStr)
            .enter()
            .append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "6px");
  
          legend.append("span")
            .style("display", "inline-block")
            .style("width", "16px")
            .style("height", "16px")
            .style("margin-right", "8px")
            .style("background", (d, i) => d3.schemeCategory10[i]);
  
          legend.append("span")
            .text(d => `${d.label}: ${d.value}`);
  
          selectedRect = this;
        });
  
      // Add tooltips for major labels
      nodes.append("title")
        .text(d => `${d.data.name}\n${d.value}`);
  
      // Text shadow filter for readability
      svg.append("defs").append("filter")
        .attr("id", "text-shadow")
        .html(`
          <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="#222" flood-opacity="0.9"/>
        `);
  
      nodes.append("text")
        .attr("x", 4)
        .attr("y", 16)
        .text(function(d) {
          const fontSize = 12;
          if ((d.y1 - d.y0) < fontSize + 5 || d.x1 - d.x0 < fontSize + 5) return "";
          const maxWidth = d.x1 - d.x0 - 8;
          return truncateText(d.data.name, maxWidth, 12);
        })
        .attr("font-size", "12px")
        .attr("fill", "#fff")
        .attr("filter", "url(#text-shadow)");
    });
  }
  
  // Make sure your truncateText function is also included in your code scope:
  function truncateText(text, maxWidth, fontSize = 15, fontFamily = "sans-serif") {
    const tempText = d3.select("body").append("svg")
        .attr("width", 0).attr("height", 0)
        .append("text")
        .attr("font-size", fontSize)
        .attr("font-family", fontFamily)
        .text(text);
  
    let textLength = tempText.node().getComputedTextLength();
    let str = text;
  
    while (textLength > maxWidth && str.length > 0) {
      str = str.slice(0, -1);
      tempText.text(str + "…");
      textLength = tempText.node().getComputedTextLength();
    }
    tempText.remove();
    return (str.length < text.length) ? str + "…" : str;
  }
  