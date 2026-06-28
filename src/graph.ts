
export class DirectedGraph {
    adjacencyList: Map<string, string[]>;
    // Declare nodes as optional in the base class so TypeScript allows access in children
    protected nodes?: Map<string, NodePhysics>;

    constructor() {
        this.adjacencyList = new Map();
    }

    addNode(node: string) {
        if (!this.adjacencyList.has(node)) {
            this.adjacencyList.set(node, []);
        }
    }

    addEdge(source: string, dest: string) {
        this.addNode(source);
        this.addNode(dest);
        this.adjacencyList.get(source)!.push(dest);
    }

    getNeighbours(node: string): string[] {
        return this.adjacencyList.get(node) || [];
    }

    hasEdge(source: string, dest: string) {
        const neighbors = this.adjacencyList.get(source);
        return neighbors ? neighbors.includes(dest) : false;
    }

    removeEdge(source: string, dest: string) {
        if (this.adjacencyList.has(source)) {
            this.adjacencyList.set(
                source,
                this.adjacencyList.get(source)!.filter((n) => n !== dest)
            );
        }
    }

    removeNode(node: string) {
        if (this.adjacencyList.has(node)) {
            for (const [key, values] of this.adjacencyList.entries()) {
                this.adjacencyList.set(
                    key,
                    values.filter((n) => n !== node)
                );
            }
            this.adjacencyList.delete(node);
        }
    }

    getNodes(): string[]{
        return Array.from(this.adjacencyList.keys());
    }

    getNeighbors(source: string){
        return this.adjacencyList.get(source) || [];
    }

    clearGraph(){
        this.adjacencyList.clear();
    }

    newRandomGraph(n: number): Map<string, string[]>{
        this.clearGraph();      
        const edgeProb = Math.random()/2; //0 to -.0: 0 means no edges, 0.5 means half edges, to keep the graph sparse

        const list: Map<string, string[]> = new Map();
        const nodes: string[] = [];
        for (let i = 0; i<n; i++){
            const nodeID =  String.fromCharCode(65 + i);
            nodes.push(nodeID);
            list.set(nodeID, []);
        }

        for(const source of nodes){
            for (const dest of nodes){
                if(source === dest) continue;//no self loops for now
                if(Math.random() <edgeProb){
                    list.get(source)!.push(dest);
                }
            }
        }
        this.adjacencyList = list;
        return list;
    }

}

interface NodePhysics {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
}

export const PhysicsConfig = {
    repulsion: 5000,
    spring: 0.01,
    springLength: 200,
    damping: 0.99
};





export class ForceLayout {
    private graph: DirectedGraph;
    private nodes: Map<string, NodePhysics> = new Map();

    constructor(graph: DirectedGraph) {
        this.graph = graph;
    }

    initialize(width: number, height: number) {
        this.nodes.clear();
        for (const id of this.graph.getNodes()) {
            this.nodes.set(id, {
                id,
                x: Math.random() * (width - 100) + 50,
                y: Math.random() * (height - 100) + 50,
                vx: 0,
                vy: 0
            });
        }
    }

    update(width: number, height: number) {
        const nodeArray = Array.from(this.nodes.values());

        // 1. Repulsion
        for (let i = 0; i < nodeArray.length; i++) {
            for (let j = i + 1; j < nodeArray.length; j++) {
                const a = nodeArray[i];
                const b = nodeArray[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distSq = dx * dx + dy * dy || 1;
                const dist = Math.sqrt(distSq);
                const force = PhysicsConfig.repulsion / distSq;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                a.vx += fx; a.vy += fy;
                b.vx -= fx; b.vy -= fy;
            }
        }

        // 2. Attraction
        for (const source of this.graph.getNodes()) {
            const sourceNode = this.nodes.get(source);
            if (!sourceNode) continue;
            for (const dest of this.graph.getNeighbors(source)) {
                const destNode = this.nodes.get(dest);
                if (!destNode) continue;
                const dx = destNode.x - sourceNode.x;
                const dy = destNode.y - sourceNode.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = PhysicsConfig.spring * (dist - PhysicsConfig.springLength);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                sourceNode.vx += fx; sourceNode.vy += fy;
                destNode.vx -= fx; destNode.vy -= fy;
            }
        }

        // 3. Integration & Bounds
        for (const node of nodeArray) {
            node.vx *= PhysicsConfig.damping;
            node.vy *= PhysicsConfig.damping;
            node.x += node.vx;
            node.y += node.vy;
            
            if (node.x < 25) { node.x = 25; node.vx *= -0.5; }
            if (node.x > width - 25) { node.x = width - 25; node.vx *= -0.5; }
            if (node.y < 25) { node.y = 25; node.vy *= -0.5; }
            if (node.y > height - 25) { node.y = height - 25; node.vy *= -0.5; }
        }
    }

    getNode(id: string): NodePhysics | undefined {
        return this.nodes.get(id);
    }

    getAllNodes(): Map<string, NodePhysics> {
        return this.nodes;
    }
}   

export class GraphRenderer {
    private graph: DirectedGraph;
    private layout: ForceLayout;

    constructor(graph: DirectedGraph, layout: ForceLayout) {
        this.graph = graph;
        this.layout = layout;
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        // 1. Update Physics first
        this.layout.update(width, height);

        // 2. Draw Wall
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, width, height);

        // 3. Draw Edges
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        for (const source of this.graph.getNodes()) {
            const sNode = this.layout.getNode(source);
            if (!sNode) continue;
            for (const dest of this.graph.getNeighbors(source)) {
                const dNode = this.layout.getNode(dest);
                if (!dNode) continue;
                this.drawEdge(ctx, sNode, dNode);
            }
        }

        // 4. Draw Nodes
        for (const node of this.layout.getAllNodes().values()) {
            this.drawNode(ctx, node);
        }
    }

    private drawEdge(ctx: CanvasRenderingContext2D, a: NodePhysics, b: NodePhysics) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }

    private drawNode(ctx: CanvasRenderingContext2D, node: NodePhysics) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
        
        ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');   
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.stroke();
        
        ctx.font = '14px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id, node.x, node.y);
    }
}   