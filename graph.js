const treeDims = { height: 500, width: 1100 };

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", treeDims.width + 100)
  .attr("height", treeDims.height + 100);

const graph = svg.append("g").attr("transform", `translate(50, 50)`);

// data strat
const stratify = d3
  .stratify()
  .id((d) => d.name)
  .parentId((d) => d.parent);

const tree = d3.tree().size([treeDims.width, treeDims.height]);

// create ordinal scales
const color = d3.scaleOrdinal(["#f7f4ea", "#ded9e2", "#c0b9dd", "#80a1d4", "#75c9c8"]);

// update function
const update = (data) => {
  // // remove current nodes(dirty, alternative way)
  // graph.selectAll(".node").remove();
  // graph.selectAll(".link").remove();

  // update ordinal scale domain
  color.domain(data.map((item) => item.department));

  // get updated root node data
  const rootNode = stratify(data);
  const treeData = tree(rootNode);

  // get nodes selection adn join data
  const nodes = graph.selectAll(".node").data(treeData.descendants());

  // get link selection and join data (source -> target coordinates)
  const links = graph.selectAll(".link").data(treeData.links());

  // enter new links
  links
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    // update current links
    .merge(links)
    .transition()
    .duration(300)
    .attr("stroke", "#aaa")
    .attr("stroke-width", 2)
    .attr(
      "d",
      d3
        .linkVertical()
        .x((d) => d.x)
        .y((d) => d.y)
    );

  // create enter node groups
  const enterNodes = nodes
    .enter()
    .append("g")
    .attr("class", "node")
    // update current nodes
    .merge(nodes)
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

  // append rects to enter nodes
  enterNodes
    .merge(nodes)
    .append("rect")
    .attr("fill", (d) => color(d.data.department))
    .attr("stroke", "#555")
    .attr("stroke-width", 2)
    .attr("height", 50)
    .attr("width", (d) => d.data.name.length * 20)
    .attr("transform", (d) => {
      const x = d.data.name.length * 10;
      return `translate(-${x}, -25)`;
    });

  // append name text
  enterNodes
    .append("text")
    .attr("text-anchor", "middle")
    .attr("fill", "#D5896F")
    .text((d) => d.data.name);
};

// data & firebase hook-up
let data = [];
db.collection("employees").onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case "added": {
        data.push(doc);
        break;
      }
      case "modified": {
        const index = data.findIndex((item) => item.id === doc.id);
        data[index] = doc;
        break;
      }
      case "removed": {
        data = data.filter((item) => item.id !== doc.id);
        break;
      }
      default:
        break;
    }
  });

  update(data);
});
