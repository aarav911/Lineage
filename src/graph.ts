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

    hadEdge(source: string, dest: string){
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
    }
    
}

