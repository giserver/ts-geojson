import { Coordinate, Point, MultiPoint, LineString,LinearRing, MultiLineString, Polygon, MultiPolygon, Geometry } from '../lib/gis/Geometry'

describe('Geometry', () => {
    let coord = new Coordinate(1, 2, 3);
    let point = new Point(coord);
    let points = new MultiPoint([coord, coord])
    let lineString = new LineString([new Coordinate(1, 2, 3), new Coordinate(4, 5, 6)]);
    let multiLineString = new MultiLineString([lineString, lineString])
    let linearString = new LinearRing([new Coordinate(0, 0, 0), new Coordinate(0, 5, 0), new Coordinate(5, 5, 0), new Coordinate(5, 0, 0), new Coordinate(0, 0, 0)]);
    let polygon1 = new Polygon(linearString);
    let polygon2 = new Polygon(linearString, new LinearRing([new Coordinate(1, 1, 0), new Coordinate(1, 4, 0), new Coordinate(4, 4, 0), new Coordinate(4, 1, 0), new Coordinate(1, 1, 0)]));
    let multiPolygon = new MultiPolygon([polygon1, polygon2]);

    test('Coordinate', () => {
        expect(coord.toWTK()).toBe('1 2');
        expect(coord.toWTK(true)).toBe('1 2 3');
    });

    test('Point', () => {
        expect(point.toWKT()).toBe('POINT (1 2)');
        expect(point.toWKT(true)).toBe('POINT Z(1 2 3)');

        expect(JSON.stringify(point)).toBe(`{"type":"Point","coordinates":[1,2]}`);
    })

    test('MultiPoint', () => {
        expect(points.toWKT()).toBe('MULTIPOINT (1 2, 1 2)');
        expect(points.toWKT(true)).toBe('MULTIPOINT Z(1 2 3, 1 2 3)');

        expect(JSON.stringify(points)).toBe(`{"type":"MultiPoint","coordinates":[[1,2],[1,2]]}`);
    })

    test('LineString', () => {
        expect(lineString.toWKT()).toBe('LINESTRING (1 2, 4 5)');
        expect(lineString.toWKT(true)).toBe('LINESTRING Z(1 2 3, 4 5 6)');

        expect(JSON.stringify(lineString)).toBe(`{"type":"LineString","coordinates":[[1,2],[4,5]]}`);
    });

    test('MultiLineString', () => {
        expect(multiLineString.toWKT()).toBe('MULTILINESTRING ((1 2, 4 5), (1 2, 4 5))');
        expect(multiLineString.toWKT(true)).toBe('MULTILINESTRING Z((1 2 3, 4 5 6), (1 2 3, 4 5 6))');

        expect(JSON.stringify(multiLineString)).toBe(`{"type":"MultiLineString","coordinates":[[[1,2],[4,5]],[[1,2],[4,5]]]}`);
    });

    test('Polygon', () => {
        expect(polygon1.toWKT()).toBe('POLYGON ((0 0, 0 5, 5 5, 5 0, 0 0))');
        expect(polygon1.toWKT(true)).toBe('POLYGON Z((0 0 0, 0 5 0, 5 5 0, 5 0 0, 0 0 0))');

        expect(polygon2.toWKT()).toBe('POLYGON ((0 0, 0 5, 5 5, 5 0, 0 0), (1 1, 1 4, 4 4, 4 1, 1 1))');
        expect(polygon2.toWKT(true)).toBe('POLYGON Z((0 0 0, 0 5 0, 5 5 0, 5 0 0, 0 0 0), (1 1 0, 1 4 0, 4 4 0, 4 1 0, 1 1 0))');

        expect(JSON.stringify(polygon1)).toBe(`{"type":"Polygon","coordinates":[[[0,0],[0,5],[5,5],[5,0],[0,0]]]}`);
        expect(JSON.stringify(polygon2)).toBe(`{"type":"Polygon","coordinates":[[[0,0],[0,5],[5,5],[5,0],[0,0]],[[1,1],[1,4],[4,4],[4,1],[1,1]]]}`);
    });

    test('MultiPolygon', () => {
        expect(multiPolygon.toWKT()).toBe('MULTIPOLYGON (((0 0, 0 5, 5 5, 5 0, 0 0)), ((0 0, 0 5, 5 5, 5 0, 0 0), (1 1, 1 4, 4 4, 4 1, 1 1)))');
        expect(multiPolygon.toWKT(true)).toBe('MULTIPOLYGON Z(((0 0 0, 0 5 0, 5 5 0, 5 0 0, 0 0 0)), ((0 0 0, 0 5 0, 5 5 0, 5 0 0, 0 0 0), (1 1 0, 1 4 0, 4 4 0, 4 1 0, 1 1 0)))');

        expect(JSON.stringify(multiPolygon)).toBe(`{"type":"MultiPolygon","coordinates":[[[[0,0],[0,5],[5,5],[5,0],[0,0]]],[[[0,0],[0,5],[5,5],[5,0],[0,0]],[[1,1],[1,4],[4,4],[4,1],[1,1]]]]}`);
    });

    test('wkt parse to geometry then to geojson',()=>{
        expect(JSON.stringify(Geometry.parseWKT('POINT (1 2)'))).toBe(`{"type":"Point","coordinates":[1,2]}`);
        expect(JSON.stringify(Geometry.parseWKT('MULTIPOINT (1 2, 1 2)'))).toBe(`{"type":"MultiPoint","coordinates":[[1,2],[1,2]]}`);
        expect(JSON.stringify(Geometry.parseWKT('LINESTRING (1 2, 4 5)'))).toBe(`{"type":"LineString","coordinates":[[1,2],[4,5]]}`);
        expect(JSON.stringify(Geometry.parseWKT('MULTILINESTRING ((1 2, 4 5), (1 2, 4 5))'))).toBe(`{"type":"MultiLineString","coordinates":[[[1,2],[4,5]],[[1,2],[4,5]]]}`);
        expect(JSON.stringify(Geometry.parseWKT('POLYGON ((0 0, 0 5, 5 5, 5 0, 0 0))'))).toBe(`{"type":"Polygon","coordinates":[[[0,0],[0,5],[5,5],[5,0],[0,0]]]}`);
        expect(JSON.stringify(Geometry.parseWKT('POLYGON ((0 0, 0 5, 5 5, 5 0, 0 0), (1 1, 1 4, 4 4, 4 1, 1 1))'))).toBe(`{"type":"Polygon","coordinates":[[[0,0],[0,5],[5,5],[5,0],[0,0]],[[1,1],[1,4],[4,4],[4,1],[1,1]]]}`);
        expect(JSON.stringify(Geometry.parseWKT('MULTIPOLYGON (((0 0, 0 5, 5 5, 5 0, 0 0)), ((0 0, 0 5, 5 5, 5 0, 0 0), (1 1, 1 4, 4 4, 4 1, 1 1)))'))).toBe(`{"type":"MultiPolygon","coordinates":[[[[0,0],[0,5],[5,5],[5,0],[0,0]]],[[[0,0],[0,5],[5,5],[5,0],[0,0]],[[1,1],[1,4],[4,4],[4,1],[1,1]]]]}`);
    })
})