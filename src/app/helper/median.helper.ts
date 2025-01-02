
export class MedianHelper {

    public static calculateMedian(array: number[]): number
    {
        array.sort((a: number, b: number) => (a > b) ? 1 : ((b > a) ? -1 : 0));
        const middleIndex = array.length / 2;
        if (middleIndex !== +middleIndex.toFixed(0)) {

            return array[Math.floor(middleIndex)];
        }

        return (array[middleIndex] + array[middleIndex - 1]) / 2;
    }

}
