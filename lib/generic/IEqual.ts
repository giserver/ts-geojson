/**
 * 判断相等
 *
 * @export
 * @interface IEqual
 * @template T
 */
export default interface IEqual<T>{
    equals(other:T):boolean;
}