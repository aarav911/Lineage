import "./style.css"
import { DirectedGraph } from "./graph"
import { CanvasEngine } from "./engine"

const graph = new DirectedGraph();
graph.addNode("A");
graph.addNode("B");
graph.addEdge("A", "B");


const engine = new CanvasEngine("canvas");
engine.start(graph)