export class CanvasHelper {

    public static optimizeCoordinate(coordinate: number): number {
        coordinate = +coordinate.toFixed(0);
        coordinate += 0.5;

        return coordinate;
    }

}
