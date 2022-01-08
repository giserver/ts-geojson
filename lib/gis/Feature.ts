import Dictionary from '../generic/Dictionary';
import IEnumerator from '../generic/IEnumerator';
import { Geometry } from "./Geometry";

type PropType = number | string | boolean | object;

export class Feature {
    geometry: Geometry;
    props = new Dictionary<string, PropType>()

    toJSON() {
        return {
            type: 'Feature',
            properties: this.props.getOrigin(),
            geometry: this.geometry
        }
    }
}

export class FeatureCollection implements IEnumerator<Feature>{
    readonly features = new Array<Feature>();
    private pointer = -1;
    isEND = false;

    constructor(...features: Array<Feature>) {
        this.features = features;
    }

    add(feature: Feature) {
        this.features.push(feature);
    }

    addRange(features: Feature[]) {
        features.forEach(feature => this.features.push(feature));
    }

    where(func: (feature: Feature) => boolean) {
        let features = this.features.filter(func);
        return new FeatureCollection(...features);
    }

    first(func: (feature: Feature) => boolean): Feature {
        this.features.forEach(feature => {
            if (func(feature))
                return feature;
        })

        return undefined;
    }

    groupBy<T>(func: (feature: Feature) => T): Dictionary<T, Feature[]> {
        let ret = new Dictionary<T, Feature[]>();

        this.features.forEach(feature => {
            let key = func(feature);
            if (!ret.containsKey(key))
                ret.push(key, new Array<Feature>());
            let values = ret.get(key);
            values.push(feature);
        });

        return ret;
    }

    toJSON() {
        return {
            type: 'FeatureCollection',
            features: this.features
        }
    }

    moveNext() {

        if (this.pointer === this.features.length - 1)
            return undefined;

        this.pointer += 1;

        if (this.pointer === this.features.length - 1)
            this.isEND = true;

        return this.current();
    }

    moveBack(count?: number) {
        count = count || 1;
        this.pointer -= count;
        if (this.pointer < 0)
            this.reset();

        return this.current();
    }
    reset() {
        this.pointer = -1;
        this.isEND = false;
    }

    current() {
        return this.pointer < 0 ? undefined : this.features[this.pointer];
    }
}