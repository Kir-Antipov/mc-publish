import { IGNORE_CASE_COMPARER } from "@/utils/comparison/string-comparer";
import { IGNORE_CASE_EQUALITY_COMPARER } from "@/utils/comparison/string-equality-comparer";
import * as Iterable from "@/utils/collections/iterable";

describe("isIterable", () => {
    test("returns true for iterable objects", () => {
        expect(Iterable.isIterable([1, 2, 3])).toBe(true);
        expect(Iterable.isIterable(new Set())).toBe(true);
        expect(Iterable.isIterable(new Map())).toBe(true);
        expect(Iterable.isIterable("test")).toBe(true);
    });

    test("returns false for non-iterable objects", () => {
        expect(Iterable.isIterable(123)).toBe(false);
        expect(Iterable.isIterable({ key: "value" })).toBe(false);
        expect(Iterable.isIterable(undefined)).toBe(false);
        expect(Iterable.isIterable(null)).toBe(false);
    });
});

describe("filter", () => {
    test("filters out elements not matching the predicate", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Array.from(Iterable.filter(iterable, x => x > 3));

        expect(result).toEqual([4, 5]);
    });

    test("binds thisArg to the predicate", () => {
        const iterable = [1, 2, 3, 4, 5];
        const thisArg = { threshold: 3 };

        const result = Array.from(Iterable.filter(iterable, function(x) {
            return x > this.threshold;
        }, thisArg));

        expect(result).toEqual([4, 5]);
    });
});

describe("distinct", () => {
    test("removes duplicate elements", () => {
        const iterable = [1, 2, 3, 2, 1];

        const result = Array.from(Iterable.distinct(iterable));

        expect(result).toEqual([1, 2, 3]);
    });

    test("uses provided comparer for equality check", () => {
        const iterable = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 2 }];

        const result = Array.from(Iterable.distinct(iterable, (a, b) => a.id === b.id));

        expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
});

describe("distinctBy", () => {
    test("removes elements with duplicate selected property", () => {
        const iterable = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 2 }];

        const result = Array.from(Iterable.distinctBy(iterable, x => x.id));

        expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test("uses provided comparer for equality check of selected property", () => {
        const iterable = [{ id: "a" }, { id: "b" }, { id: "A" }, { id: "B" }];

        const result = Array.from(Iterable.distinctBy(iterable, x => x.id, IGNORE_CASE_EQUALITY_COMPARER));

        expect(result).toEqual([{ id: "A" }, { id: "B" }]);
    });
});

describe("map", () => {
    test("applies callback function to each element", () => {
        const iterable = [1, 2, 3];

        const result = Array.from(Iterable.map(iterable, x => x * 2));

        expect(result).toEqual([2, 4, 6]);
    });

    test("binds thisArg to the callback function", () => {
        const iterable = [1, 2, 3];
        const thisArg = { factor: 2 };

        const result = Array.from(Iterable.map(iterable, function(x) {
            return x * this.factor;
        }, thisArg));

        expect(result).toEqual([2, 4, 6]);
    });
});

describe("flatMap", () => {
    test("applies callback function to each element and flattens the result", () => {
        const iterable = [1, 2, 3];

        const result = Array.from(Iterable.flatMap(iterable, x => [x, x * 2]));

        expect(result).toEqual([1, 2, 2, 4, 3, 6]);
    });

    test("binds thisArg to the callback function", () => {
        const iterable = [1, 2, 3];
        const thisArg = { factor: 2 };

        const result = Array.from(Iterable.flatMap(iterable, function(x) {
            return [x, x * this.factor];
        }, thisArg));

        expect(result).toEqual([1, 2, 2, 4, 3, 6]);
    });
});

describe("reduce", () => {
    test("reduces iterable to a single value", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Iterable.reduce(iterable, (acc, curr) => acc + curr, 0);

        expect(result).toBe(15);
    });

    test("uses the first value as a seed when one was not provided", () => {
        const callback = jest.fn().mockImplementation((acc, cur) => acc + cur);
        const iterable = [1, 2, 3, 4, 5];

        const result = Iterable.reduce(iterable, callback);

        expect(result).toBe(15);
        expect(callback).toHaveBeenCalledTimes(4);
        // 1st (ie 0th) call - 1 as accumulator, 2 as value, 1 as current index
        expect(callback).toHaveBeenNthCalledWith(1, 1, 2, 1, iterable);
    });

    test("binds thisArg to the callback function", () => {
        const iterable = [1, 2, 3, 4, 5];
        const thisArg = { factor: 2 };

        const result = Iterable.reduce(iterable, function(acc, curr) {
            return acc + curr * this.factor;
        }, 0, thisArg);

        expect(result).toBe(30);
    });
});

describe("skip", () => {
    test("skips the first n elements", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Array.from(Iterable.skip(iterable, 2));

        expect(result).toEqual([3, 4, 5]);
    });

    test("does not skip elements if n <= 0", () => {
        expect(Array.from(Iterable.skip([1, 2], 0))).toEqual([1, 2]);
        expect(Array.from(Iterable.skip([1, 2], -1))).toEqual([1, 2]);
    });
});

describe("take", () => {
    test("takes the first n elements", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Array.from(Iterable.take(iterable, 3));

        expect(result).toEqual([1, 2, 3]);
    });

    test("returns an empty iterable if n <= 0", () => {
        expect(Array.from(Iterable.take([1, 2], 0))).toEqual([]);
        expect(Array.from(Iterable.take([1, 2], -1))).toEqual([]);
    });
});

describe("takeLast", () => {
    test("takes the last n elements", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Array.from(Iterable.takeLast(iterable, 2));

        expect(result).toEqual([4, 5]);
    });

    test("returns an empty iterable if n <= 0", () => {
        expect(Array.from(Iterable.takeLast([1, 2], 0))).toEqual([]);
        expect(Array.from(Iterable.takeLast([1, 2], -1))).toEqual([]);
    });
});

describe("slice", () => {
    test("slices the elements between start and end", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Array.from(Iterable.slice(iterable, 1, 4));

        expect(result).toEqual([2, 3, 4]);
    });

    test("slices the elements using relative indices", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Array.from(Iterable.slice(iterable, -3, -1));

        expect(result).toEqual([3, 4]);
    });
});

describe("reverse", () => {
    test("reverses the order of elements", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Array.from(Iterable.reverse(iterable));

        expect(result).toEqual([5, 4, 3, 2, 1]);
    });

    test("returns an empty iterable if the input is already empty", () => {
        expect(Array.from(Iterable.reverse([]))).toEqual([]);
    });
});

describe("sort", () => {
    test("sorts elements in ascending order by default", () => {
        const iterable = [5, 3, 1, 4, 2];

        const result = Array.from(Iterable.sort(iterable));

        expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    test("sorts elements according to comparer function", () => {
        const iterable = ["Apple", "Pear", "banana", "mango", "Cherry"];

        const result = Array.from(Iterable.sort(iterable, IGNORE_CASE_COMPARER));

        expect(result).toEqual(["Apple", "banana", "Cherry", "mango", "Pear"]);
    });
});

describe("every", () => {
    test("returns true if all elements meet the condition", () => {
        const iterable = [2, 4, 6, 8];

        const result = Iterable.every(iterable, value => value % 2 === 0);

        expect(result).toBe(true);
    });

    test("returns false if any element does not meet the condition", () => {
        const iterable = [2, 4, 5, 8];

        const result = Iterable.every(iterable, value => value % 2 === 0);

        expect(result).toBe(false);
    });

    test("binds thisArg to the callback function", () => {
        const iterable = [2, 4, 6, 8];
        const thisArg = { factor: 2 };

        const result = Iterable.every(iterable, function(x) {
            return x % this.factor === 0;
        }, thisArg);

        expect(result).toBe(true);
    });
});

describe("some", () => {
    test("returns true if any element meets the condition", () => {
        const iterable = [1, 3, 4, 7];

        const result = Iterable.some(iterable, value => value % 2 === 0);

        expect(result).toBe(true);
    });

    test("returns false if no element meets the condition", () => {
        const iterable = [1, 3, 5, 7];

        const result = Iterable.some(iterable, value => value % 2 === 0);

        expect(result).toBe(false);
    });

    test("binds thisArg to the callback function", () => {
        const iterable = [1, 3, 4, 7];
        const thisArg = { factor: 2 };

        const result = Iterable.some(iterable, function(x) {
            return x % this.factor === 0;
        }, thisArg);

        expect(result).toBe(true);
    });
});

describe("min", () => {
    test("returns the minimum value in an iterable", () => {
        const iterable = [3, 1, 4, 2];

        const result = Iterable.min(iterable);

        expect(result).toBe(1);
    });

    test("returns the minimum value in an iterable with custom comparer", () => {
        const iterable = ["apple", "banana", "cherry"];

        const result = Iterable.min(iterable, (a, b) => a.length - b.length);

        expect(result).toBe("apple");
    });

    test("returns undefined for an empty iterable", () => {
        const iterable = [];

        const result = Iterable.min(iterable);

        expect(result).toBeUndefined();
    });

    test("binds thisArg to the callback function", () => {
        const iterable = [3, 1, 4, 2];
        const thisArg = { sign: -1 };

        const result = Iterable.min(iterable, function(a, b) {
            return (a - b) * this.sign;
        }, thisArg);

        expect(result).toBe(4);
    });
});

describe("max", () => {
    test("returns the maximum value in an iterable", () => {
        const iterable = [3, 1, 4, 2];
        const result = Iterable.max(iterable);
        expect(result).toBe(4);
    });

    test("returns the maximum value in an iterable with custom comparer", () => {
        const iterable = ["apple", "banana", "cherry"];
        const result = Iterable.max(iterable, (a, b) => a.length - b.length);
        expect(result).toBe("banana");
    });

    test("returns undefined for an empty iterable", () => {
        const iterable = [];
        const result = Iterable.max(iterable);
        expect(result).toBeUndefined();
    });

    test("binds thisArg to the callback function", () => {
        const iterable = [3, 1, 4, 2];
        const thisArg = { sign: -1 };

        const result = Iterable.max(iterable, function(a, b) {
            return (a - b) * this.sign;
        }, thisArg);

        expect(result).toBe(1);
    });
});

describe("count", () => {
    test("returns the count of elements that meet the condition", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Iterable.count(iterable, x => x > 2);

        expect(result).toBe(3);
    });

    test("returns the length of the iterable if no predicate is provided", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Iterable.count(iterable);

        expect(result).toBe(5);
    });

    test("returns 0 for empty iterables", () => {
        expect(Iterable.count([])).toBe(0);
        expect(Iterable.count(new Set())).toBe(0);
        expect(Iterable.count(new Map(), x => x)).toBe(0);
    });

    test("binds thisArg to the callback function", () => {
        const iterable = [1, 2, 3, 4, 5];
        const thisArg = { min: 2 };

        const result = Iterable.count(iterable, function(x) {
            return x > this.min;
        }, thisArg);

        expect(result).toBe(3);
    });
});

describe("indexOf", () => {
    test("returns the index of the first occurrence of a specified value", () => {
        const iterable = [1, 2, 3, 2, 4];

        const result = Iterable.indexOf(iterable, 2);

        expect(result).toBe(1);
    });

    test("returns -1 if the iterable does not include a certain element", () => {
        const iterable = [1, 2, 3, 2, 4];

        const result = Iterable.indexOf(iterable, 5);

        expect(result).toBe(-1);
    });

    test("returns the index of the first occurrence from the given index", () => {
        const iterable = [1, 2, 3, 2, 4];

        const result = Iterable.indexOf(iterable, 2, 2);

        expect(result).toBe(3);
    });

    test("returns the index of the first occurrence with custom comparer", () => {
        const iterable = ["a", "b", "c", "B", "A"];

        const result = Iterable.indexOf(iterable, "B", IGNORE_CASE_EQUALITY_COMPARER);

        expect(result).toBe(1);
    });

    test("returns the index of the first occurrence with custom comparer from the given index", () => {
        const iterable = ["a", "b", "c", "B", "A"];

        const result = Iterable.indexOf(iterable, "b", 2, IGNORE_CASE_EQUALITY_COMPARER);

        expect(result).toBe(3);
    });
});

describe("lastIndexOf", () => {
    test("returns the index of the last occurrence of a specified value", () => {
        const iterable = [1, 2, 3, 2, 4];

        const result = Iterable.lastIndexOf(iterable, 2);

        expect(result).toBe(3);
    });

    test("returns -1 if the iterable does not include a certain element", () => {
        const iterable = [1, 2, 3, 2, 4];

        const result = Iterable.lastIndexOf(iterable, 5);

        expect(result).toBe(-1);
    });

    test("returns the index of the last occurrence with custom comparer", () => {
        const iterable = ["a", "b", "c", "B", "A"];

        const result = Iterable.lastIndexOf(iterable, "b", IGNORE_CASE_EQUALITY_COMPARER);

        expect(result).toBe(3);
    });

    test("returns the index of the last occurrence with custom comparer from the given index", () => {
        const iterable = ["a", "b", "c", "B", "A"];

        const result = Iterable.lastIndexOf(iterable, "B", 2, IGNORE_CASE_EQUALITY_COMPARER);

        expect(result).toBe(1);
    });
});

describe("includes", () => {
    test("returns true if the iterable includes a certain element", () => {
        const iterable = [1, 2, 3, 4];

        const result = Iterable.includes(iterable, 2);

        expect(result).toBe(true);
    });

    test("returns false if the iterable does not include a certain element", () => {
        const iterable = [1, 2, 3, 4];

        const result = Iterable.includes(iterable, 5);

        expect(result).toBe(false);
    });

    test("returns true if the iterable includes a certain element from the given index", () => {
        const iterable = ["a", "b", "c", "B"];

        const result = Iterable.includes(iterable, "B", 2);

        expect(result).toBe(true);
    });

    test("returns true if the iterable includes a certain element with custom comparer", () => {
        const iterable = ["a", "b", "c"];

        const result = Iterable.includes(iterable, "B", IGNORE_CASE_EQUALITY_COMPARER);

        expect(result).toBe(true);
    });

    test("returns true if the iterable includes a certain element with custom comparer from the given index", () => {
        const iterable = ["a", "b", "c", "B"];

        const result = Iterable.includes(iterable, "b", 2, IGNORE_CASE_EQUALITY_COMPARER);

        expect(result).toBe(true);
    });
});

describe("sequenceEqual", () => {
    test("returns true if two iterables are equal", () => {
        const first = [1, 2, 3, 4];
        const second = [1, 2, 3, 4];

        const result = Iterable.sequenceEqual(first, second);

        expect(result).toBe(true);
    });

    test("returns false if two iterables are not equal", () => {
        const first = [1, 2, 3, 4];
        const second = [1, 2, 3, 5];

        const result = Iterable.sequenceEqual(first, second);

        expect(result).toBe(false);
    });

    test("returns true if two iterables are equal using custom comparer", () => {
        const first = ["a", "b", "c"];
        const second = ["A", "B", "C"];

        const result = Iterable.sequenceEqual(first, second, IGNORE_CASE_EQUALITY_COMPARER);

        expect(result).toBe(true);
    });

    test("returns false if two iterables are not equal using custom comparer", () => {
        const first = ["a", "b", "c"];
        const second = ["a", "b", "d"];

        const result = Iterable.sequenceEqual(first, second, IGNORE_CASE_EQUALITY_COMPARER);

        expect(result).toBe(false);
    });
});

describe("startsWith", () => {
    test("returns true if an iterable starts with the specified search elements", () => {
        const iterable = [1, 2, 3, 4];
        const searchElements = [1, 2];

        const result = Iterable.startsWith(iterable, searchElements);

        expect(result).toBe(true);
    });

    test("returns false if an iterable does not start with the specified search elements", () => {
        const iterable = [1, 2, 3, 4];
        const searchElements = [2, 3];

        const result = Iterable.startsWith(iterable, searchElements);

        expect(result).toBe(false);
    });

    test("returns true if an iterable starts with the specified search elements from a specific index", () => {
        const iterable = [1, 2, 3, 4];
        const searchElements = [3, 4];

        const result = Iterable.startsWith(iterable, searchElements, 2);

        expect(result).toBe(true);
    });

    test("returns true if an iterable starts with the specified search elements using custom comparer", () => {
        const iterable = ["a", "b", "c", "d"];
        const searchElements = ["A", "B"];

        const result = Iterable.startsWith(iterable, searchElements, IGNORE_CASE_EQUALITY_COMPARER);

        expect(result).toBe(true);
    });

    test("returns true if an iterable starts with the specified search elements using custom comparer from the given index", () => {
        const iterable = ["a", "b", "c", "d"];
        const searchElements = ["C", "D"];

        const result = Iterable.startsWith(iterable, searchElements, 2, IGNORE_CASE_EQUALITY_COMPARER);

        expect(result).toBe(true);
    });
});

describe("endsWith", () => {
    test("returns true if an iterable ends with the specified search elements", () => {
        const iterable = [1, 2, 3, 4];
        const searchElements = [3, 4];

        const result = Iterable.endsWith(iterable, searchElements);

        expect(result).toBe(true);
    });

    test("returns true if an iterable does not end with the specified search elements", () => {
        const iterable = [1, 2, 3, 4];
        const searchElements = [2, 3];

        const result = Iterable.endsWith(iterable, searchElements);

        expect(result).toBe(false);
    });


    test("returns true if an iterable ends with the specified search elements up to a specific index", () => {
        const iterable = [1, 2, 3, 4];
        const searchElements = [2, 3];

        const result = Iterable.endsWith(iterable, searchElements, 3);

        expect(result).toBe(true);
    });

    test("returns true if an iterable ends with the specified search elements using custom comparer", () => {
        const iterable = ["a", "b", "c", "d"];
        const searchElements = ["C", "D"];

        const result = Iterable.endsWith(iterable, searchElements, IGNORE_CASE_EQUALITY_COMPARER);

        expect(result).toBe(true);
    });

    test("returns true if an iterable ends with the specified search elements using custom comparer up to a specific index", () => {
        const iterable = ["a", "b", "c", "d"];
        const searchElements = ["B", "C"];

        const result = Iterable.endsWith(iterable, searchElements, 3, IGNORE_CASE_EQUALITY_COMPARER);

        expect(result).toBe(true);
    });
});

describe("findIndex", () => {
    test("returns the index of the first element that satisfies the predicate", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Iterable.findIndex(iterable, value => value > 3);

        expect(result).toBe(3);
    });

    test("returns -1 if no elements satisfy the predicate", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Iterable.findIndex(iterable, value => value > 5);

        expect(result).toBe(-1);
    });

    test("binds thisArg to the callback function", () => {
        const iterable = [1, 2, 3, 4, 5];
        const thisArg = { target: 3 };

        const result = Iterable.findIndex(iterable, function(x) {
            return x === this.target;
        }, thisArg);

        expect(result).toBe(2);
    });
});

describe("first", () => {
    test("returns the first element that satisfies the predicate", () => {
        const iterable = [{ id: 1, value: "a" }, { id: 2, value: "b" }, { id: 3, value: "a" }, { id: 4, value: "b" }];

        const result = Iterable.first(iterable, x => x.value === "b");

        expect(result).toEqual({ id: 2, value: "b" });
    });

    test("returns undefined if no elements satisfy the predicate", () => {
        const iterable = [{ id: 1, value: "a" }, { id: 2, value: "b" }, { id: 3, value: "a" }, { id: 4, value: "b" }];

        const result = Iterable.first(iterable, x => x.value === "c");

        expect(result).toBeUndefined();
    });

    test("returns the first element if no predicate is provided", () => {
        const iterable = [{ id: 1, value: "a" }, { id: 2, value: "b" }, { id: 3, value: "a" }, { id: 4, value: "b" }];

        const result = Iterable.first(iterable);

        expect(result).toEqual({ id: 1, value: "a" });
    });

    test("returns undefined if iterable is empty", () => {
        expect(Iterable.first([])).toBeUndefined();
    });

    test("binds thisArg to the callback function", () => {
        const iterable = [{ id: 1, value: "a" }, { id: 2, value: "b" }, { id: 3, value: "a" }, { id: 4, value: "b" }];
        const thisArg = { target: "b" };

        const result = Iterable.first(iterable, function(x) {
            return x.value === this.target;
        }, thisArg);

        expect(result).toEqual({ id: 2, value: "b" });
    });
});

describe("last", () => {
    test("returns the last element that satisfies the predicate", () => {
        const iterable = [{ id: 1, value: "a" }, { id: 2, value: "b" }, { id: 3, value: "a" }, { id: 4, value: "b" }];

        const result = Iterable.last(iterable, x => x.value === "a");

        expect(result).toEqual({ id: 3, value: "a" });
    });

    test("returns undefined if no elements satisfy the predicate", () => {
        const iterable = [{ id: 1, value: "a" }, { id: 2, value: "b" }, { id: 3, value: "a" }, { id: 4, value: "b" }];

        const result = Iterable.last(iterable, x => x.value === "c");

        expect(result).toBeUndefined();
    });

    test("returns the last element if no predicate is provided", () => {
        const iterable = [{ id: 1, value: "a" }, { id: 2, value: "b" }, { id: 3, value: "a" }, { id: 4, value: "b" }];

        const result = Iterable.last(iterable);

        expect(result).toEqual({ id: 4, value: "b" });
    });

    test("returns undefined if iterable is empty", () => {
        expect(Iterable.last([])).toBeUndefined();
    });

    test("binds thisArg to the callback function", () => {
        const iterable = [{ id: 1, value: "a" }, { id: 2, value: "b" }, { id: 3, value: "a" }, { id: 4, value: "b" }];
        const thisArg = { target: "a" };

        const result = Iterable.last(iterable, function(x) {
            return x.value === this.target;
        }, thisArg);

        expect(result).toEqual({ id: 3, value: "a" });
    });
});

describe("at", () => {
    test("returns the element at the specified index", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Iterable.at(iterable, 2);

        expect(result).toBe(3);
    });

    test("returns undefined if the index is out of range", () => {
        const iterable = [1, 2, 3, 4, 5];

        const result = Iterable.at(iterable, 5);

        expect(result).toBeUndefined();
    });

    test("returns undefined if the iterable is empty", () => {
        const iterable = [];

        const result = Iterable.at(iterable, 1);

        expect(result).toBeUndefined();
    });

    test("handles relative indices", () => {
        const iterable = [1, 2, 3, 4, 5];

        expect(Iterable.at(iterable, -1)).toBe(5);
        expect(Iterable.at(iterable, -2)).toBe(4);
        expect(Iterable.at(iterable, -3)).toBe(3);
        expect(Iterable.at(iterable, -4)).toBe(2);
        expect(Iterable.at(iterable, -5)).toBe(1);
        expect(Iterable.at(iterable, -6)).toBeUndefined();
    });
});

describe("join", () => {
    test("joins elements with the specified separator", () => {
        const iterable = [1, 2, 3];

        const result = Iterable.join(iterable, "-");

        expect(result).toBe("1-2-3");
    });

    test("joins elements with a comma if no separator is provided", () => {
        const iterable = [1, 2, 3];

        const result = Iterable.join(iterable);

        expect(result).toBe("1,2,3");
    });
});

describe("concat", () => {
    test("concatenates multiple iterables", () => {
        const iterable1 = [1, 2, 3];
        const iterable2 = [4, 5, 6];
        const iterable3 = [7, 8, 9];

        const result = Array.from(Iterable.concat(iterable1, iterable2, iterable3));

        expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
});

describe("prepend", () => {
    test("prepends a value to an iterable", () => {
        const iterable = [1, 2, 3];

        const result = Array.from(Iterable.prepend(iterable, 0));

        expect(result).toEqual([0, 1, 2, 3]);
    });
});

describe("append", () => {
    test("appends a value to an iterable", () => {
        const iterable = [1, 2, 3];

        const result = Array.from(Iterable.append(iterable, 4));

        expect(result).toEqual([1, 2, 3, 4]);
    });
});

describe("pop", () => {
    test("removes the last element from an iterable", () => {
        const iterable = [1, 2, 3];

        const [value, rest] = Iterable.pop(iterable);

        expect(value).toBe(3);
        expect(Array.from(rest)).toEqual([1, 2]);
    });

    test("returns undefined and empty iterable when the input iterable is empty", () => {
        const iterable = [];

        const [value, rest] = Iterable.pop(iterable);

        expect(value).toBeUndefined();
        expect(Array.from(rest)).toEqual([]);
    });
});

describe("shift", () => {
    test("removes the first element from an iterable", () => {
        const iterable = [1, 2, 3];

        const [value, rest] = Iterable.shift(iterable);

        expect(value).toBe(1);
        expect(Array.from(rest)).toEqual([2, 3]);
    });

    test("returns undefined and empty iterable when the input iterable is empty", () => {
        const iterable = [];
        const [value, rest] = Iterable.shift(iterable);

        expect(value).toBeUndefined();
        expect(Array.from(rest)).toEqual([]);
    });
});

describe("forEach", () => {
    test("executes a function for each element in an iterable", () => {
        const iterable = [1, 2, 3];
        const mockFn = jest.fn();

        Iterable.forEach(iterable, mockFn);

        expect(mockFn).toHaveBeenCalledTimes(3);
        expect(mockFn).toHaveBeenNthCalledWith(1, 1, 0, iterable);
        expect(mockFn).toHaveBeenNthCalledWith(2, 2, 1, iterable);
        expect(mockFn).toHaveBeenNthCalledWith(3, 3, 2, iterable);
    });
});

describe("asArray", () => {
    test("converts an iterable to an array", () => {
        const iterable = new Set([1, 2, 3]);

        const result = Iterable.asArray(iterable);

        expect(result).toEqual([1, 2, 3]);
    });

    test("returns the same array if the iterable is already an array", () => {
        const iterable = [1, 2, 3];

        const result = Iterable.asArray(iterable);

        expect(result).toBe(iterable);
    });
});

describe("asArrayLike", () => {
    test("converts an iterable to an array-like", () => {
        const iterable = new Set([1, 2, 3]);

        const result = Iterable.asArrayLike(iterable);

        expect(result).toBeInstanceOf(Iterable.ArrayLikeIterable);
        expect(Array.from(result)).toEqual([1, 2, 3]);
    });

    test("returns the same array if the iterable is already an array", () => {
        const iterable = [1, 2, 3];

        const result = Iterable.asArrayLike(iterable);

        expect(result).toBe(iterable);
    });

    test("returns the same array-like if the iterable is already an array-like", () => {
        const iterable = Iterable.ArrayLikeIterable.from([1, 2, 3]);

        const result = Iterable.asArrayLike(iterable);

        expect(result).toBe(iterable);
    });
});

describe("$i", () => {
    test("converts an iterable to an ArrayLikeIterable", () => {
        const iterable = new Set([1, 2, 3]);

        const result = Iterable.$i(iterable);

        expect(result).toBeInstanceOf(Iterable.ArrayLikeIterable);
        expect(Array.from(result)).toEqual([1, 2, 3]);
    });

    test("returns the same ArrayLikeIterable if the iterable is already an ArrayLikeIterable", () => {
        const iterable = Iterable.ArrayLikeIterable.from([1, 2, 3]);

        const result = Iterable.$i(iterable);

        expect(result).toBe(iterable);
    });
});

describe("ArrayLikeIterable", () => {
    describe("from", () => {
        test("creates a new instance from an iterable", () => {
            const array = [1, 2, 3];
            const iterable = Iterable.ArrayLikeIterable.from(array);

            const values = Array.from(iterable.values());

            expect(values).toEqual(array);
        });
    });

    describe("of", () => {
        test("creates a new instance from an iterator", () => {
            const array = [1, 2, 3];
            const arrayIterator = array[Symbol.iterator]();
            const iterable = Iterable.ArrayLikeIterable.of(arrayIterator);

            const values = Array.from(iterable.values());

            expect(values).toEqual(array);
        });
    });

    describe("length", () => {
        test("returns the number of elements in the iterable", () => {
            const array = [1, 2, 3];
            const iterable = Iterable.ArrayLikeIterable.from(array);

            expect(iterable.length).toBe(array.length);
        });
    });

    describe("toArray", () => {
        test("returns an array containing all elements of the iterable", () => {
            const array = [1, 2, 3];
            const iterable = Iterable.ArrayLikeIterable.from(array);

            const newArray = iterable.toArray();

            expect(newArray).toEqual(array);
        });

        test("new array is not the same as one used to create ArrayLikeIterable", () => {
            const array = [1, 2, 3];
            const iterable = Iterable.ArrayLikeIterable.from(array);

            const newArray = iterable.toArray();

            expect(newArray).not.toBe(array);
        });
    });

    describe("toMap", () => {
        test("converts the iterable of key-value pairs into a map", () => {
            const entries = [["zero", 0], ["one", 1], ["two", 2]] as const;
            const iterable = Iterable.ArrayLikeIterable.from(entries);

            const map = iterable.toMap();

            expect(Array.from(map.entries())).toEqual(entries);
        });

        test("converts the iterable of key-value pairs into a map with custom comparer", () => {
            const entries = [["zero", 0], ["one", 1], ["two", 2], ["ONE", -1]] as const;
            const iterable = Iterable.ArrayLikeIterable.from(entries);

            const map = iterable.toMap(IGNORE_CASE_EQUALITY_COMPARER);

            expect(Array.from(map.entries())).toEqual([["zero", 0], ["ONE", -1], ["two", 2]]);
        });
    });

    describe("toSet", () => {
        test("converts the iterable into a set", () => {
            const array = ["zero", "one", "two"];
            const iterable = Iterable.ArrayLikeIterable.from(array);

            const set = iterable.toSet();

            expect(Array.from(set)).toEqual(array);
        });

        test("converts the iterable into a set with custom comparer", () => {
            const array = ["zero", "one", "two", "ONE"];
            const iterable = Iterable.ArrayLikeIterable.from(array);

            const set = iterable.toSet(IGNORE_CASE_EQUALITY_COMPARER);

            expect(Array.from(set)).toEqual(["zero", "ONE", "two"]);
        });
    });

    describe("toRecord", () => {
        test("converts the iterable of key-value pairs into a record", () => {
            const entries = [["zero", 0], ["one", 1], ["two", 2]] as const;
            const iterable = Iterable.ArrayLikeIterable.from(entries);

            const record = iterable.toRecord();

            expect(record).toEqual({ zero: 0, one: 1, two: 2 });
        });
    });

    describe("keys", () => {
        test("returns an iterable of indices in the iterable", () => {
            const array = ["zero", "one", "two"];
            const iterable = Iterable.ArrayLikeIterable.from(array);

            const keys = Array.from(iterable.keys());

            expect(keys).toEqual([0, 1, 2]);
        });
    });

    describe("values", () => {
        test("returns an iterable of values in the iterable", () => {
            const array = [1, 2, 3];
            const iterable = Iterable.ArrayLikeIterable.from(array);

            const values = Array.from(iterable.values());

            expect(values).toEqual(array);
        });
    });

    describe("entries", () => {
        test("returns an iterable of index-value pairs for every entry in the iterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from(["zero", "one", "two"]);

            const entries = Array.from(iterable.entries());

            expect(entries).toEqual([[0, "zero"], [1, "one"], [2, "two"]]);
        });
    });

    describe("[Symbol.iterator]", () => {
        test("returns an iterator over the values", () => {
            const array = ["zero", "one", "two"];
            const iterable = Iterable.ArrayLikeIterable.from(array);

            const values = [...iterable];

            expect(values).toEqual(array);
        });
    });

    describe("[Symbol.toStringTag]", () => {
        test("returns 'Iterable'", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable[Symbol.toStringTag]).toBe("Iterable");
        });
    });

    describe("filter", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.filter(x => x)).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'filter'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.filter.toString()).toMatch(/\Wfilter\W/);
            expect(Iterable.ArrayLikeIterable.prototype.filter.toString()).not.toMatch(/\wfilter\w/);
        });
    });

    describe("map", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.map(x => x)).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'map'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.map.toString()).toMatch(/\Wmap\W/);
            expect(Iterable.ArrayLikeIterable.prototype.map.toString()).not.toMatch(/\wmap\w/);
        });
    });

    describe("flatMap", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.flatMap(x => x)).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'flatMap'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.flatMap.toString()).toMatch(/\WflatMap\W/);
            expect(Iterable.ArrayLikeIterable.prototype.flatMap.toString()).not.toMatch(/\wflatMap\w/);
        });
    });

    describe("reduce", () => {
        test("returns a value", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.reduce(x => x)).toBeUndefined();
        });

        test("redirects the call to 'reduce'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.reduce.toString()).toMatch(/\Wreduce\W/);
            expect(Iterable.ArrayLikeIterable.prototype.reduce.toString()).not.toMatch(/\wreduce\w/);
        });
    });

    describe("skip", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.skip(0)).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'skip'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.skip.toString()).toMatch(/\Wskip\W/);
            expect(Iterable.ArrayLikeIterable.prototype.skip.toString()).not.toMatch(/\wskip\w/);
        });
    });

    describe("take", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.take(0)).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'take'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.take.toString()).toMatch(/\Wtake\W/);
            expect(Iterable.ArrayLikeIterable.prototype.take.toString()).not.toMatch(/\wtake\w/);
        });
    });

    describe("takeLast", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.takeLast(0)).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'takeLast'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.takeLast.toString()).toMatch(/\WtakeLast\W/);
            expect(Iterable.ArrayLikeIterable.prototype.takeLast.toString()).not.toMatch(/\wtakeLast\w/);
        });
    });

    describe("slice", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.slice(0)).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'slice'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.slice.toString()).toMatch(/\Wslice\W/);
            expect(Iterable.ArrayLikeIterable.prototype.slice.toString()).not.toMatch(/\wslice\w/);
        });
    });

    describe("reverse", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.reverse()).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'reverse'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.reverse.toString()).toMatch(/\Wreverse\W/);
            expect(Iterable.ArrayLikeIterable.prototype.reverse.toString()).not.toMatch(/\wreverse\w/);
        });
    });

    describe("sort", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.sort()).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'sort'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.sort.toString()).toMatch(/\Wsort\W/);
            expect(Iterable.ArrayLikeIterable.prototype.sort.toString()).not.toMatch(/\wsort\w/);
        });
    });

    describe("every", () => {
        test("returns boolean", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(typeof iterable.every(x => x)).toBe("boolean");
        });

        test("redirects the call to 'every'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.every.toString()).toMatch(/\Wevery\W/);
            expect(Iterable.ArrayLikeIterable.prototype.every.toString()).not.toMatch(/\wevery\w/);
        });
    });

    describe("some", () => {
        test("returns boolean", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(typeof iterable.some(x => x)).toBe("boolean");
        });

        test("redirects the call to 'some'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.some.toString()).toMatch(/\Wsome\W/);
            expect(Iterable.ArrayLikeIterable.prototype.some.toString()).not.toMatch(/\wsome\w/);
        });
    });

    describe("min", () => {
        test("returns a value", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.min()).toBeUndefined();
        });

        test("redirects the call to 'min'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.min.toString()).toMatch(/\Wmin\W/);
            expect(Iterable.ArrayLikeIterable.prototype.min.toString()).not.toMatch(/\wmin\w/);
        });
    });

    describe("max", () => {
        test("returns a value", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.max()).toBeUndefined();
        });

        test("redirects the call to 'max'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.max.toString()).toMatch(/\Wmax\W/);
            expect(Iterable.ArrayLikeIterable.prototype.max.toString()).not.toMatch(/\wmax\w/);
        });
    });

    describe("count", () => {
        test("returns number", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(typeof iterable.count()).toBe("number");
        });

        test("redirects the call to 'count'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.count.toString()).toMatch(/\Wcount\W/);
            expect(Iterable.ArrayLikeIterable.prototype.count.toString()).not.toMatch(/\wcount\w/);
        });
    });

    describe("indexOf", () => {
        test("returns number", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(typeof iterable.indexOf({})).toBe("number");
        });

        test("redirects the call to 'indexOf'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.indexOf.toString()).toMatch(/\WindexOf\W/);
            expect(Iterable.ArrayLikeIterable.prototype.indexOf.toString()).not.toMatch(/\windexOf\w/);
        });
    });

    describe("lastIndexOf", () => {
        test("returns number", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(typeof iterable.lastIndexOf({})).toBe("number");
        });

        test("redirects the call to 'lastIndexOf'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.lastIndexOf.toString()).toMatch(/\WlastIndexOf\W/);
            expect(Iterable.ArrayLikeIterable.prototype.lastIndexOf.toString()).not.toMatch(/\wlastIndexOf\w/);
        });
    });

    describe("includes", () => {
        test("returns boolean", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(typeof iterable.includes({})).toBe("boolean");
        });

        test("redirects the call to 'includes'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.includes.toString()).toMatch(/\Wincludes\W/);
            expect(Iterable.ArrayLikeIterable.prototype.includes.toString()).not.toMatch(/\wincludes\w/);
        });
    });

    describe("sequenceEqual", () => {
        test("returns boolean", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(typeof iterable.sequenceEqual([])).toBe("boolean");
        });

        test("redirects the call to 'sequenceEqual'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.sequenceEqual.toString()).toMatch(/\WsequenceEqual\W/);
            expect(Iterable.ArrayLikeIterable.prototype.sequenceEqual.toString()).not.toMatch(/\wsequenceEqual\w/);
        });
    });

    describe("startsWith", () => {
        test("returns boolean", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(typeof iterable.startsWith([])).toBe("boolean");
        });

        test("redirects the call to 'startsWith'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.startsWith.toString()).toMatch(/\WstartsWith\W/);
            expect(Iterable.ArrayLikeIterable.prototype.startsWith.toString()).not.toMatch(/\wstartsWith\w/);
        });
    });

    describe("endsWith", () => {
        test("returns boolean", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(typeof iterable.endsWith([])).toBe("boolean");
        });

        test("redirects the call to 'endsWith'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.endsWith.toString()).toMatch(/\WendsWith\W/);
            expect(Iterable.ArrayLikeIterable.prototype.endsWith.toString()).not.toMatch(/\wendsWith\w/);
        });
    });

    describe("findIndex", () => {
        test("returns number", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(typeof iterable.findIndex(x => x)).toBe("number");
        });

        test("redirects the call to 'findIndex'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.findIndex.toString()).toMatch(/\WfindIndex\W/);
            expect(Iterable.ArrayLikeIterable.prototype.findIndex.toString()).not.toMatch(/\wfindIndex\w/);
        });
    });

    describe("find", () => {
        test("returns a value", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.find(x => x)).toBeUndefined();
        });

        test("redirects the call to 'first'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.find.toString()).toMatch(/\Wfirst\W/);
            expect(Iterable.ArrayLikeIterable.prototype.find.toString()).not.toMatch(/\wfirst\w/);
        });
    });

    describe("first", () => {
        test("returns a value", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.first(x => x)).toBeUndefined();
        });

        test("redirects the call to 'first'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.first.toString()).toMatch(/\Wfirst\W/);
            expect(Iterable.ArrayLikeIterable.prototype.first.toString()).not.toMatch(/\wfirst\w/);
        });
    });

    describe("last", () => {
        test("returns a value", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.last(x => x)).toBeUndefined();
        });

        test("redirects the call to 'last'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.last.toString()).toMatch(/\Wlast\W/);
            expect(Iterable.ArrayLikeIterable.prototype.last.toString()).not.toMatch(/\wlast\w/);
        });
    });

    describe("at", () => {
        test("returns a value", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.at(0)).toBeUndefined();
        });

        test("redirects the call to 'at'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.at.toString()).toMatch(/\Wat\W/);
            expect(Iterable.ArrayLikeIterable.prototype.at.toString()).not.toMatch(/\wat\w/);
        });
    });

    describe("join", () => {
        test("returns string", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(typeof iterable.join()).toBe("string");
        });

        test("redirects the call to 'join'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.join.toString()).toMatch(/\Wjoin\W/);
            expect(Iterable.ArrayLikeIterable.prototype.join.toString()).not.toMatch(/\wjoin\w/);
        });
    });

    describe("concat", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.concat([])).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'concat'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.concat.toString()).toMatch(/\Wconcat\W/);
            expect(Iterable.ArrayLikeIterable.prototype.concat.toString()).not.toMatch(/\wconcat\w/);
        });
    });

    describe("prepend", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.prepend([])).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'prepend'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.prepend.toString()).toMatch(/\Wprepend\W/);
            expect(Iterable.ArrayLikeIterable.prototype.prepend.toString()).not.toMatch(/\wprepend\w/);
        });
    });

    describe("append", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.append([])).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'append'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.append.toString()).toMatch(/\Wappend\W/);
            expect(Iterable.ArrayLikeIterable.prototype.append.toString()).not.toMatch(/\wappend\w/);
        });
    });

    describe("shift", () => {
        test("returns [value, ArrayLikeIterable]", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            const [value, newIterable] = iterable.shift();

            expect(value).toBeUndefined();
            expect(newIterable).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'shift'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.shift.toString()).toMatch(/\Wshift\W/);
            expect(Iterable.ArrayLikeIterable.prototype.shift.toString()).not.toMatch(/\wshift\w/);
        });
    });

    describe("unshift", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.unshift({})).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'prepend'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.unshift.toString()).toMatch(/\Wprepend\W/);
            expect(Iterable.ArrayLikeIterable.prototype.unshift.toString()).not.toMatch(/\wprepend\w/);
        });
    });

    describe("push", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.push({})).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'append'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.push.toString()).toMatch(/\Wappend\W/);
            expect(Iterable.ArrayLikeIterable.prototype.push.toString()).not.toMatch(/\wappend\w/);
        });
    });

    describe("pop", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            const [value, newIterable] = iterable.pop();

            expect(value).toBeUndefined();
            expect(newIterable).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'pop'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.pop.toString()).toMatch(/\Wpop\W/);
            expect(Iterable.ArrayLikeIterable.prototype.pop.toString()).not.toMatch(/\wpop\w/);
        });
    });

    describe("forEach", () => {
        test("returns nothing", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.forEach(x => x)).toBeUndefined();
        });

        test("redirects the call to 'forEach'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.forEach.toString()).toMatch(/\WforEach\W/);
            expect(Iterable.ArrayLikeIterable.prototype.forEach.toString()).not.toMatch(/\wforEach\w/);
        });
    });

    describe("asArray", () => {
        test("returns Array", () => {
            const array = [];
            const iterable = Iterable.ArrayLikeIterable.from(array);

            expect(iterable.asArray()).toBe(array);
        });

        test("redirects the call to 'asArray'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.asArray.toString()).toMatch(/\WasArray\W/);
            expect(Iterable.ArrayLikeIterable.prototype.asArray.toString()).not.toMatch(/\wasArray\w/);
        });
    });

    describe("distinct", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.distinct()).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'distinct'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.distinct.toString()).toMatch(/\Wdistinct\W/);
            expect(Iterable.ArrayLikeIterable.prototype.distinct.toString()).not.toMatch(/\wdistinct\w/);
        });
    });

    describe("distinctBy", () => {
        test("returns ArrayLikeIterable", () => {
            const iterable = Iterable.ArrayLikeIterable.from([]);

            expect(iterable.distinctBy(x => x)).toBeInstanceOf(Iterable.ArrayLikeIterable);
        });

        test("redirects the call to 'distinctBy'", () => {
            expect(Iterable.ArrayLikeIterable.prototype.distinctBy.toString()).toMatch(/\WdistinctBy\W/);
            expect(Iterable.ArrayLikeIterable.prototype.distinctBy.toString()).not.toMatch(/\wdistinctBy\w/);
        });
    });
});
