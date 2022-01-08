import IComparable from "../generic/IComparable";
import IEqual from "../generic/IEqual";

export class Coordinate implements IComparable<Coordinate>, IEqual<Coordinate>{

    x: number;
    y: number;
    z: number;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static fromArray(values: number[]): Coordinate {
        let x = 0, y = 0, z = 0;
        let arrayLength = values.length;

        if (arrayLength > 0)
            x = values[0];

        if (arrayLength > 1)
            y = values[1];

        if (arrayLength > 2)
            z = values[2];

        return new Coordinate(x, y, z);
    }

    toJSON() {
        return [this.x, this.y];
    }

    /**
     * 坐标转换为WKT格式
     *
     * @param {boolean} [includeZ=false] 是否包含z轴 默认：false
     * @return {*} 
     * @memberof Coordinate
     */
    toWTK(includeZ: boolean = false): string {

        return `${this.toArray(includeZ).join(' ')}`;
    }

    /**
     * 计算连个坐标的距离 默认：计算该点到原点的距离(平面)
     *
     * @param {*} [coordinate=new Coordinate()]
     * @param {boolean} [includeZ=false] 是否包括z轴 默认：false(平面)
     * @return {*} 
     * @memberof Coordinate
     */
    distance(coordinate: Coordinate = new Coordinate(), includeZ: boolean = false): any {
        let { x, y, z } = coordinate;
        return Math.sqrt(
            Math.pow(this.x - x, 2) +
            Math.pow(this.y - y, 2) +
            Math.pow(this.z - z, 2));
    }

    equals2D(other: Coordinate): boolean {
        return other && this.x === other.x && this.y === other.y;
    }

    equals(other: Coordinate): boolean {
        return other && this.equals2D(other) && this.z === other.z;
    }

    compareTo(other: Coordinate): number {
        if (other) {
            if (this.x < other.x)
                return -1;

            if (this.x > other.x)
                return 1;

            if (this.y < other.y)
                return -1

            if (this.y > other.y)
                return 1;

            return 0;
        }
        else
            throw new Error(`argument 'other' can not be null`);
    }

    /**
     * 将所有坐标数据转为数组
     *
     * @private
     * @param {boolean} [includeZ=false]
     * @return {*}  {number[]}
     * @memberof Coordinate
     */
    private toArray(includeZ: boolean = false): number[] {
        let values = [this.x, this.y];
        if (includeZ) values.push(this.z);

        return values;
    }
}

type GeometryType = 'Point' | 'MultiPoint' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon';

export abstract class Geometry {

    readonly type: GeometryType;
    readonly coordinates = new Array<Array<Array<Coordinate>>>();

    constructor(type: GeometryType, ...coordinates: Coordinate[][][]) {
        this.type = type;
        this.coordinates = coordinates;
    }

    toWKT(includeZ = false): string {
        let wkt = this.type.toUpperCase() + ' ';
        if (includeZ) wkt += 'Z';

        switch (this.type) {
            case 'Point':
                wkt += `(${this.coordinates[0][0][0].toWTK(includeZ)})`;
                break;
            case 'MultiPoint':
            case 'LineString':
                wkt += `(${this.coordinates[0][0].map(coord => coord.toWTK(includeZ)).join(', ')})`;
                break;
            case 'MultiLineString':
            case 'Polygon':
                wkt += `(${this.coordinates[0].map(coords => `(${coords.map(coord => coord.toWTK(includeZ)).join(', ')})`).join(', ')})`
                break;
            default:
                wkt += `(${this.coordinates.map(coordsArray => `(${coordsArray.map(coords => `(${coords.map(coord => coord.toWTK(includeZ)).join(', ')})`).join(', ')})`).join(', ')})`;
                break;
        }

        return wkt;
    }

    static parseWKT(wkt: string): Geometry {
        wkt = wkt.trim();
        //匹配括号中的数据(包括括号)
        let temp = wkt.match(/\((.+?)\)/g);

        let string2Coordinate = (str: string) =>
            Coordinate.fromArray(
                str.trim()
                    .replace(/\(|\)/g, '')
                    .split(' ')
                    .map(value => parseFloat(value))
            );


        if (wkt.startsWith("POINT")) {

            let coord = string2Coordinate(temp[0]);
            return new Point(coord);

        } else if (wkt.startsWith("MULTIPOINT") || wkt.startsWith("LINESTRING")) {

            if (temp.length === 1)
                temp = temp[0].split(',');

            let coords = temp.map(v => string2Coordinate(v));

            return wkt.startsWith("MULTIPOINT") ?
                new MultiPoint(coords) :
                new LineString(coords);

        } else if (wkt.startsWith("MULTILINESTRING") || wkt.startsWith("POLYGON")) {

            let coordsArray = temp.map(v =>
                v.split(',').map(coord => string2Coordinate(coord))
            )

            if (wkt.startsWith("POLYGON")) {
                let shell = new LinearRing(coordsArray[0]);
                let holes = new Array<LinearRing>();
                for (let i = 1; i < coordsArray.length; i++) {
                    holes.push(new LinearRing(coordsArray[i]));
                }

                return new Polygon(shell, ...holes);
            }

            return new MultiLineString(coordsArray.map(coords => new LineString(coords)));
        } else if (wkt.startsWith("MULTIPOLYGON")) {
            let shell: LinearRing | undefined;
            let holes = new Array<LinearRing>();
            let polygons = new Array<Polygon>();

            temp.forEach(v => {
                //new polygon
                if (v.lastIndexOf('(') > 0) {
                    if (shell)
                        polygons.push(new Polygon(shell, ...holes));
                    shell = new LinearRing(v.split(',').map(coord => string2Coordinate(coord)));
                    holes = new Array<LinearRing>();
                }
                //add holes 
                else {
                    holes.push(new LinearRing(v.split(',').map(coord => string2Coordinate(coord))));
                }
            })

            if(shell) polygons.push(new Polygon(shell, ...holes));

            return new MultiPolygon(polygons);
        }

        console.warn(`not support this type : ${wkt}`);
    }

    toJSON() {
        let geo = { type: this.type, coordinates: {} };

        switch (this.type) {
            case 'Point':
                geo.coordinates = this.coordinates[0][0][0];
                break;
            case 'MultiPoint':
            case 'LineString':
                geo.coordinates = this.coordinates[0][0];
                break;
            case 'MultiLineString':
            case 'Polygon':
                geo.coordinates = this.coordinates[0];
                break;
            default:
                geo.coordinates = this.coordinates;
        }

        return geo;
    }
}

export class Point extends Geometry {

    constructor(coordinate = new Coordinate()) {
        super('Point', [[coordinate]]);
    }

    distance(point = new Point()) {
        return this.getCoordinate().distance(point.getCoordinate());
    }

    getCoordinate() {
        return this.coordinates[0][0][0];
    }
}

export class MultiPoint extends Geometry {

    constructor(coordinates: Coordinate[]) {
        super('MultiPoint', [coordinates]);
    }

    getCoordinates() {
        return this.coordinates[0][0];
    }
}

export class LineString extends Geometry {

    constructor(coordinates: Coordinate[]) {

        if (coordinates.length < 2)
            throw new Error("LineString needs 2 coordinates at least !");

        super('LineString', [coordinates]);
    }

    getCoordinates() {
        return this.coordinates[0][0];
    }
}

export class LinearRing extends LineString {

    constructor(coordinates: Coordinate[]) {

        if (coordinates.length < 4)
            throw new Error('LinearRing needs 4 points at least');

        if (!coordinates[0].equals(coordinates[coordinates.length - 1]))
            throw new Error('coordinates for init is not closed');

        super(coordinates);
    }
}

export class MultiLineString extends Geometry {

    constructor(lineStrings: LineString[]) {
        super('MultiLineString', lineStrings.map(line => line.getCoordinates()));
    }

    getCoordinates() {
        return this.coordinates[0];
    }
}

export class Polygon extends Geometry {

    constructor(shell: LinearRing, ...holes: LinearRing[]) {

        let lrs = [shell];
        if (holes)
            lrs = lrs.concat(holes);

        super('Polygon', lrs.map(x => x.getCoordinates()));
    }

    getCoordinates() {
        return this.coordinates[0];
    }
}

export class MultiPolygon extends Geometry {
    constructor(polygons: Polygon[]) {
        super('MultiPolygon', ...polygons.map(x => x.getCoordinates()));
    }
}