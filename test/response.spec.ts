import { describe } from "ava-spec";
import { prepareResponse } from "../src/response";

describe('generateCursorQuery', (it) => {
    it('should return empty response', function (t: any) {
        const docs: String[] = [];

        const response = prepareResponse(docs, {}, 0);

        t.deepEqual(response.docs, []);
        t.is(response.hasNext, false);
        t.is(response.hasPrevious, false);
        t.is(response.next, undefined);
        t.is(response.previous, undefined);
        t.is(response.totalDocs, 0);
    });

    it('should return single page response', function (t: any) {
        const docs: String[] = ["a", "b"];

        const response = prepareResponse(docs, { limit: 5 }, 2);

        t.deepEqual(response.docs, docs);
        t.is(response.hasNext, false);
        t.is(response.hasPrevious, false);
        t.is(response.next, undefined);
        t.is(response.previous, undefined);
        t.is(response.totalDocs, 2);
    });

    it('should return multi page response', function (t: any) {
        const docs: String[] = ["a", "b", "c", "d"];

        const response = prepareResponse(docs, { limit: 2 }, 4);

        t.deepEqual(response.docs, docs);
        t.is(response.hasNext, true);
        t.is(response.hasPrevious, false);
        t.is(response.next, 'W3siJHVuZGVmaW5lZCI6dHJ1ZX1d');
        t.is(response.previous, undefined);
        t.is(response.totalDocs, 4);
    });
});