type Coordinate = [number, number];

interface NodePhysics {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
}

export class DirectedGraph{
    adjacencyList: Map<string, string[]>

    constructor(){
        this.adjacencyList = new Map()
    }

    addNode(node: string){
        if(!this.adjacencyList.has(node)){
            this.adjacencyList.set(node, [])
        }
    }

    addEdge(source: string, dest: string){
        this.addNode(source)
        this.addNode(dest)
        this.adjacencyList.get(source)!.push(dest)
    }

    getNeighbours(node: string): string[]{
        return this.adjacencyList.get(node) || []
    }

    hasEdge(source: string, dest: string){
        const neighbors = this.adjacencyList.get(source)
        return neighbors ? neighbors.includes(dest) : false;
    }

    removeEdge(source: string, dest: string){
        if(this.adjacencyList.has(source)){
            this.adjacencyList.set(
                source,
                this.adjacencyList.get(source)!.filter((node) => {
                    node !== dest
                })
            )
        }
    }

    removeNode(node: string){
        if(this.adjacencyList.has(node)){
            //first we remove all the edge linking to it
            for (const [key, values] of this.adjacencyList.entries() ){
                this.adjacencyList.set(
                    key, 
                    values.filter((n) => {
                        n !== node
                    })
                )
            }

            //then finally delete the node itself
            this.adjacencyList.delete(node)
        }
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number){
        //TODO: implementing this function
        console.log("Drawing graph...", this.adjacencyList);
        ctx.strokeStyle = "white";
        type Coordinate = [number, number];

        const drawNode = (coord: Coordinate, node: string) => {
            const [x, y] = coord;

            // 1. Draw the Circle FIRST (so it's behind the text)
            ctx.beginPath();
            ctx.arc(x, y, 50, 0, 2 * Math.PI);
            ctx.strokeStyle = "white";
            ctx.stroke();

            // 2. Configure Text Alignment for perfect centering
            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";      // Centers text horizontally on x
            ctx.textBaseline = "middle";   // Centers text vertically on y

            // 3. Draw the Text SECOND (so it appears on top)
            ctx.fillText(node, x, y);
        };   
        let center: Coordinate = [100, 75];

        for(const [key, values] of this.adjacencyList.entries()){
            drawNode(center, key)
            center[0] +=200;
        }
    }
    
}

/*

electron charge repulsion method: 
1. Initialize nodes in bounding box.
2. For each node, compute:
   a. Repulsive force from all other nodes.
   b. Attractive spring force from connected neighbors.
3. Apply boundary constraints.
4. Update positions via physics integration.
5. Repeat until stable or max iterations.




*/

