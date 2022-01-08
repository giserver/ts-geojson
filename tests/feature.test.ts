import { Feature, FeatureCollection } from '../lib/gis/Feature';
import { Coordinate, Point, LineString, LinearRing, Polygon } from '../lib/gis/Geometry';

describe('feature', () => {
    let featrue1 = new Feature();
    let featrue2 = new Feature();
    let featrue3 = new Feature();

    let coord = new Coordinate(1, 2, 3);
    let point = new Point(coord);
    let lineString = new LineString([new Coordinate(1, 2, 3), new Coordinate(4, 5, 6)]);
    let linearString = new LinearRing([new Coordinate(0, 0, 0), new Coordinate(0, 5, 0), new Coordinate(5, 5, 0), new Coordinate(5, 0, 0), new Coordinate(0, 0, 0)]);
    let polygon1 = new Polygon(linearString);

    featrue1.geometry = point;
    featrue1.props.push("name", 'tracy');
    featrue1.props.push("age", '12');

    featrue2.geometry = lineString;
    featrue2.props.push("name", 'carte');
    featrue2.props.push("age", '23');

    featrue3.geometry = polygon1;
    featrue3.props.push("name", 'zard');
    featrue3.props.push("age", '45');

    test('FeatureCollection', () => {
        let featureCollection = new FeatureCollection(featrue1, featrue2, featrue3);
        expect(JSON.stringify(featureCollection)).toBe('{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"tracy","age":"12"},"geometry":{"type":"Point","coordinates":[1,2]}},{"type":"Feature","properties":{"name":"carte","age":"23"},"geometry":{"type":"LineString","coordinates":[[1,2],[4,5]]}},{"type":"Feature","properties":{"name":"zard","age":"45"},"geometry":{"type":"Polygon","coordinates":[[[0,0],[0,5],[5,5],[5,0],[0,0]]]}}]}');
    })
})