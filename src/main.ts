import "./style.css"
import { DirectedGraph } from "./graph"
import { CanvasEngine } from "./engine"
import { ForceLayout } from "./graph";
import { GraphRenderer } from "./graph";

import { PhysicsConfig } from "./graph";

const graph = new DirectedGraph();

graph.addNode("A");
graph.addNode("B");
graph.addNode("C");

graph.addEdge("A", "B");
graph.addEdge("A", "C");
graph.addEdge("B", "C");    








//the UI logic

const addNodeBtn = document.getElementById("add-node-btn") as HTMLButtonElement;
const removeNodeBtn = document.getElementById("remove-node-btn") as HTMLButtonElement;
const nodeInput = document.getElementById("node-name") as HTMLInputElement;

addNodeBtn.addEventListener("click", () => {

    const nodeName = nodeInput.value;

    graph.addNode(nodeName);
    build();
});
removeNodeBtn.addEventListener("click", () => {

    const nodeName = nodeInput.value;

    graph.removeNode(nodeName);
    build();
});


const edgeSourceInput = document.getElementById("source-node") as HTMLInputElement;
const edgeDestinationInput = document.getElementById("target-node") as HTMLInputElement;
const addEdgeBtn = document.getElementById("add-edge-btn") as HTMLButtonElement;
const removeEdgeBtn = document.getElementById("remove-edge-btn") as HTMLButtonElement;

addEdgeBtn.addEventListener("click", ()=>{
    const source = edgeSourceInput.value.trim();
    const dest = edgeDestinationInput.value.trim();
    graph.addEdge(source, dest);
    build();
})
removeEdgeBtn.addEventListener("click", ()=>{
    const source = edgeSourceInput.value.trim();
    const dest = edgeDestinationInput.value.trim();
    graph.removeEdge(source, dest);
    build();
})

const rebuildGraphBtn = document.getElementById("start-rebuild-btn") as HTMLButtonElement;
rebuildGraphBtn.addEventListener("click", ()=>{
    build();
})


const clearBtn = document.getElementById("clear-btn") as HTMLButtonElement;
clearBtn.addEventListener("click", ()=>{
    graph.clearGraph();
    build();
})

const randomGraphBtn = document.getElementById("generate-random-graph-btn") as HTMLButtonElement;
const randomGraphInput = document.getElementById("random-node-count") as HTMLInputElement;
randomGraphBtn.addEventListener("click", ()=>{
    const randomNodeCount = parseInt(randomGraphInput.value.trim(), 10);
    graph.clearGraph();
    graph.newRandomGraph(randomNodeCount);
    build();
})


//config



function setupControls() {

    const repulsion =
        document.getElementById("repulsion") as HTMLInputElement;

    const spring =
        document.getElementById("spring") as HTMLInputElement;

    const springLength =
        document.getElementById("springLength") as HTMLInputElement;

    const damping =
        document.getElementById("damping") as HTMLInputElement;

    repulsion.oninput = () => {
        PhysicsConfig.repulsion = Number(repulsion.value);
        document.getElementById("repulsionValue")!.textContent =
            repulsion.value;
    };

    spring.oninput = () => {
        PhysicsConfig.spring = Number(spring.value);
        document.getElementById("springValue")!.textContent =
            spring.value;
    };

    springLength.oninput = () => {
        PhysicsConfig.springLength = Number(springLength.value);
        document.getElementById("springLengthValue")!.textContent =
            springLength.value;
    };

    damping.oninput = () => {
        PhysicsConfig.damping = Number(damping.value);
        document.getElementById("dampingValue")!.textContent =
            damping.value;
    };
}
setupControls();



//Build

function build(){
    const layout = new ForceLayout(graph);
    layout.initialize(window.innerWidth, window.innerHeight);

    const renderer = new GraphRenderer(graph, layout);

    const engine = new CanvasEngine("canvas");
    engine.start(renderer);
}

build();