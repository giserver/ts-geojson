export default class Dictionary<TKey, TVal>{

    private dictionary: any = {};

    /**
     * Creates an instance of Dictionary.
     * @param {Array<{ key: TKey, val: TVal }>} [range]
     * @memberof Dictionary
     */
    constructor(range?: Array<{ key: TKey, val: TVal }>) {
        this.addRange(range);
    }

    /**
     * add key & value to dictionary. 
     * if dictionary already had this key,the value will be relaced
     *
     * @param {TKey} key
     * @param {TVal} val
     * @memberof Dictionary
     */
    set(key: TKey, val: TVal) {
        this.dictionary[key] = val;
    }

    /**
     * set range of (key,value) to dictionary. 
     * if dictionary already had this key, will throw error !!! 
     *
     * @param {Array<{ key: TKey, val: TVal }>} [range]
     * @memberof Dictionary
     */
    addRange(range?: Array<{ key: TKey, val: TVal }>) {
        if (range)
            range.forEach(kv => this.push(kv.key, kv.val));
    }

    /**
     * add key & value to dictionary. 
     * if dictionary already had this key, will throw error !!! 
     * 
     * @param {TKey} key
     * @param {TVal} val
     * @memberof Dictionary
     */
    push(key: TKey, val: TVal) {
        if (this.containsKey(key))
            throw new Error(`dictionary has already this key : ${key}`);
        this.dictionary[key] = val;
    }

    /**
     * get value from dictionary by key. 
     * if the key not existed , will return undefined. 
     *
     * @param {TKey} key
     * @return {*}  {(TVal | undefined)}
     * @memberof Dictionary
     */
    get(key: TKey): TVal | undefined {
        return this.containsKey(key) ? this.dictionary[key] as TVal : undefined;;
    }

    /**
     * check the dictionary contains the key
     *
     * @param {TKey} key
     * @return {*}  {boolean}
     * @memberof Dictionary
     */
    containsKey(key: TKey): boolean {
        return key in this.dictionary;
    }


    getKeys(): Array<string> {
        return Object.keys(this.dictionary);
    }

    getValues(): Array<TVal> {
        return Object.keys(this.dictionary).map(key=>this.dictionary[key] as TVal);
    }

    count():number {
        return Object.keys(this.dictionary).length;
    }

    remove(key: TKey): boolean {
        if(this.containsKey(key)){
            delete this.dictionary[key];
            return true;
        }

        return false;
    }

    clear(){
        this.dictionary = {};
    }

    getOrigin(){
        return this.dictionary;
    }
}