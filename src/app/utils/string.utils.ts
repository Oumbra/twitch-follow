export class StringUtils {

    static compareBy(property: string): (a: any, b: any) => number {
        return (a, b) => a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
    }

}