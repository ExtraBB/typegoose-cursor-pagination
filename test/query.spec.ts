import { generateCursorQuery, generateSort } from "../src/query";
import { encode } from "../src/utils/bsonUrlEncoding";
import { assert } from "chai";

describe("generateCursorQuery", () => {

    it("should return empty object upon no previous next", () => {
        const result = generateCursorQuery({});
        assert.deepEqual(result, {});
    });

    it("should return _id query upon no sortField", () => {
        const result = generateCursorQuery({ next: encode(["test"]) });
        assert.deepEqual(result, { _id: { $lt: "test" } });
    });

    it("should return _id query upon no sortField ascending", () => {
        const result = generateCursorQuery({ next: encode(["test"]), sortAscending: true });
        assert.deepEqual(result, { _id: { $gt: "test" } });
    });

    it("should return _id query upon sortField", () => {
        const result = generateCursorQuery({ next: encode(["title", "id"]), sortField: "title" });
        assert.deepEqual(result, {
            $or: [
                { title: { $lt: "title" } },
                { title: "title", _id: { $lt: "id" } }
            ]
        });
    });

    it("should return _id query upon sortField ascending", () => {
        const result = generateCursorQuery({ next: encode(["title", "id"]), sortField: "title", sortAscending: true });
        assert.deepEqual(result, {
            $or: [
                { title: { $gt: "title" } },
                { title: "title", _id: { $gt: "id" } }
            ]
        });
    });
});

describe("generateSort", () => {
    it("should return _id query upon no sortField", () => {
        const result = generateSort({});
        assert.deepEqual(result, { _id: -1 });
    });

    it("should return _id query upon no sortField ascending", () => {
        const result = generateSort({ sortAscending: true });
        assert.deepEqual(result, { _id: 1 });
    });

    it("should return _id query upon sortField", () => {
        const result = generateSort({ sortField: "title" });
        assert.deepEqual(result, { title: -1, _id: -1 });
    });

    it("should return _id query upon sortField ascending", () => {
        const result = generateSort({ sortField: "title", sortAscending: true });
        assert.deepEqual(result, { title: 1, _id: 1 });
    });
});