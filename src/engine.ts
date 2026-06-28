

export class CanvasEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) throw new Error("Canvas not found");
        
        this.canvas = canvas;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Context not found");
        this.ctx = context;

        this.resize();
        window.addEventListener("resize", () => this.resize());
    }

    private resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    

    // The loop accepts a "renderable" object with a draw method
    public start(renderable: { draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void }) {
        const loop = () => {
            // Clear screen
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Call the external draw logic
            renderable.draw(this.ctx, this.canvas.width, this.canvas.height);
            
            requestAnimationFrame(loop);
        };
        loop();
    }
}   