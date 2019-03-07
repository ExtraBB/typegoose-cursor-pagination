import { describe } from "ava-spec";
import { generateCursorQuery, generateSort } from "../src/query";
import { encode } from "../src/utils/bsonUrlEncoding";

describe("generateCursorQuery", (it) => {

    it("should return empty object upon no previous next", function (t: any) {
        const result = generateCursorQuery({});
        t.deepEqual(result, {});
    });

    it("should return _id query upon no sortField", function (t: any) {
        const result = generateCursorQuery({ next: encode(["test"]) });
        t.deepEqual(result, { _id: { $lt: "test" } });
    });

    it("should return _id query upon no sortField ascending", function (t: any) {
        const result = generateCursorQuery({ next: encode(["test"]), sortAscending: true });
        t.deepEqual(result, { _id: { $gt: "test" } });
    });

    it("should return _id query upon sortField", function (t: any) {
        const result = generateCursorQuery({ next: encode(["title", "id"]), sortField: "title" });
        t.deepEqual(result, {
            $or: [
                { title: { $lt: "title" } },
                { title: "title", _id: { $lt: "id" } }
            ]
        });
    });

    it("should return _id query upon sortField ascending", function (t: any) {
        const result = generateCursorQuery({ next: encode(["title", "id"]), sortField: "title", sortAscending: true });
        t.deepEqual(result, {
            $or: [
                { title: { $gt: "title" } },
                { title: "title", _id: { $gt: "id" } }
            ]
        });
    });
});

describe("generateSort", (it) => {
    it("should return _id query upon no sortField", function (t: any) {
        const result = generateSort({});
        t.deepEqual(result, { _id: -1 });
    });

    it("should return _id query upon no sortField ascending", function (t: any) {
        const result = generateSort({ sortAscending: true });
        t.deepEqual(result, { _id: 1 });
    });

    it("should return _id query upon sortField", function (t: any) {
        const result = generateSort({ sortField: "title" });
        t.deepEqual(result, { title: -1, _id: -1 });
    });

    it("should return _id query upon sortField ascending", function (t: any) {
        const result = generateSort({ sortField: "title", sortAscending: true });
        t.deepEqual(result, { title: 1, _id: 1 });
    });
});