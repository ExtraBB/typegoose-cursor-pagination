import { prepareResponse } from "../src/response";
import { assert } from "chai";

describe("prepareResponse", () => {
    it("should return empty response", () => {
        const docs: any[] = [];

        const response = prepareResponse(docs, {}, 0);

        assert.deepEqual(response.docs, []);
        assert.equal(response.hasNext, false);
        assert.equal(response.hasPrevious, false);
        assert.equal(response.next, undefined);
        assert.equal(response.previous, undefined);
        assert.equal(response.totalDocs, 0);
    });

    it("should return single page response", () => {
        const docs: any[] = [{ _id: "a"}, {_id: "b"}];

        const response = prepareResponse(docs, { limit: 5 }, 2);

        assert.deepEqual(response.docs, docs);
        assert.equal(response.hasNext, false);
        assert.equal(response.hasPrevious, false);
        assert.equal(response.next, undefined);
        assert.equal(response.previous, undefined);
        assert.equal(response.totalDocs, 2);
    });

    it("should not return totaldocs when the parameter is undefined", () => {
        const docs: any[] = [{ _id: "a"}, {_id: "b"}];

        const response = prepareResponse(docs, { limit: 5 });

        assert.deepEqual(response.docs, docs);
        assert.equal(response.hasNext, false);
        assert.equal(response.hasPrevious, false);
        assert.equal(response.next, undefined);
        assert.equal(response.previous, undefined);
        assert.equal(response.totalDocs, undefined);
    });

    it("should return multi page response", () => {
        const docs: any[] = [{ _id: "a"}, {_id: "b"}, {_id: "c"}, {_id: "d"}];

        const response = prepareResponse(docs, { limit: 2 }, 4);

        assert.deepEqual(response.docs, docs);
        assert.equal(response.hasNext, true);
        assert.equal(response.hasPrevious, false);
        assert.equal(response.next, "WyJjIl0");
        assert.equal(response.previous, undefined);
        assert.equal(response.totalDocs, 4);
    });
});