import "./style.css"
import { DirectedGraph } from "./graph"
import { CanvasEngine } from "./engine"

const graph = new DirectedGraph();
graph.addNode("A");
graph.addNode("B");
graph.addNode("C");
graph.addEdge("A", "B");
graph.addEdge("A", "C");


const engine = new CanvasEngine("canvas");
engine.start(graph)