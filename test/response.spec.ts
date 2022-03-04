import { describe } from "ava-spec";
import { prepareResponse } from "../src/response";

describe("prepareResponse", (it) => {
    it("should return empty response", function (t: any) {
        const docs: any[] = [];

        const response = prepareResponse(docs, {}, 0);

        t.deepEqual(response.docs, []);
        t.is(response.hasNext, false);
        t.is(response.hasPrevious, false);
        t.is(response.next, undefined);
        t.is(response.previous, undefined);
        t.is(response.totalDocs, 0);
    });

    it("should return single page response", function (t: any) {
        const docs: any[] = [{ _id: "a"}, {_id: "b"}];

        const response = prepareResponse(docs, { limit: 5 }, 2);

        t.deepEqual(response.docs, docs);
        t.is(response.hasNext, false);
        t.is(response.hasPrevious, false);
        t.is(response.next, undefined);
        t.is(response.previous, undefined);
        t.is(response.totalDocs, 2);
    });

    it("should not return totaldocs when the parameter is undefined", function (t: any) {
        const docs: any[] = [{ _id: "a"}, {_id: "b"}];

        const response = prepareResponse(docs, { limit: 5 });

        t.deepEqual(response.docs, docs);
        t.is(response.hasNext, false);
        t.is(response.hasPrevious, false);
        t.is(response.next, undefined);
        t.is(response.previous, undefined);
        t.is(response.totalDocs, undefined);
    });

    it("should return multi page response", function (t: any) {
        const docs: any[] = [{ _id: "a"}, {_id: "b"}, {_id: "c"}, {_id: "d"}];

        const response = prepareResponse(docs, { limit: 2 }, 4);

        t.deepEqual(response.docs, docs);
        t.is(response.hasNext, true);
        t.is(response.hasPrevious, false);
        t.is(response.next, "WyJjIl0");
        t.is(response.previous, undefined);
        t.is(response.totalDocs, 4);
    });
});