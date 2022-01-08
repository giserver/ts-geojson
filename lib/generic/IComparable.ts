export default interface IComparable<T> {
    compareTo(other: T): number;
}