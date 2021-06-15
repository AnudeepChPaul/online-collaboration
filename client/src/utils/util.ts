export function getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
    y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
  };
}

export function setupCanvas(ctx: CanvasRenderingContext2D, canvasConfig: { color: string }) {
  console.log('[] SetupCanvas' )
  ctx.canvas.width = ctx.canvas.offsetWidth;
  ctx.canvas.height = ctx.canvas.offsetHeight;

  ctx.beginPath()
  ctx.scale( 1, 1 )

  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = canvasConfig.color;
}