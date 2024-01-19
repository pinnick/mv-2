export const invMel = (m: number): number => 700 * (Math.exp(m / 1127) - 1);

export function fillRoundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.arcTo(x + width, y, x + width, y + radius, radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
	ctx.lineTo(x + radius, y + height);
	ctx.arcTo(x, y + height, x, y + height - radius, radius);
	ctx.lineTo(x, y + radius);
	ctx.arcTo(x, y, x + radius, y, radius);
	ctx.closePath();
	ctx.fill();
}
export const findDynamicScalingExponent = (max:number, lower:number, upper:number, lowerIndex:number):number => {
	const diff = upper - lower;

	const change = (lowerIndex / max) * (diff);
	const dynamic = upper - change;

	if(dynamic < lower) return lower;

	return dynamic;
}
export const stepper = (scaledValue: number, lowerIndex:number, divisor: number) => {
	const stepped = scaledValue + (lowerIndex / divisor) * scaledValue;

	if(stepped > 1) return 1
	
	return stepped
}