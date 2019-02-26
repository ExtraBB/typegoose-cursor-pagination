import { IPaginateResult, IPaginateOptions } from "./types";
import * as bsonUrlEncoding from "./utils/bsonUrlEncoding";

/**
 * Prepare a response to send back to the client
 * @param _docs The documents that are returned by the find() query
 * @param options The pagination options
 * @param totalDocs The total amount of documents (without limit)
 */
export function prepareResponse<T>(_docs: T[], options: IPaginateOptions, totalDocs: number) {
    // Check if there is a next/previous page
    const hasMore = options.limit && _docs.length > options.limit;
    if (hasMore) {
        _docs.pop(); // Remove extra doc used to check for a next/previous page
    }

    // Reverse docs in case of previous page
    const docs = options.previous ? _docs.reverse() : _docs;

    // Next/previous page data
    const hasPrevious = options.next || (options.previous && hasMore) ? true : false;
    const hasNext = options.previous || hasMore ? true : false;
    const next = hasNext ? prepareCursor(docs[docs.length - 1], options.sortField) : undefined;
    const previous = hasPrevious ? prepareCursor(docs[0], options.sortField) : undefined;

    // Build result
    const result: IPaginateResult<T> = {
        docs,
        hasPrevious,
        hasNext,
        next,
        previous,
        totalDocs
    };

    return result;
}

/**
 * Generate an encoded next/previous cursor string
 * @param doc The document from which to start the next/previous page
 * @param sortField The field on which was sorted
 */
function prepareCursor(doc: InstanceType<any>, sortField: string): string {
    // Always save _id for secondary sorting.
    if (sortField && sortField !== "_id") {
        return bsonUrlEncoding.encode([doc[sortField], doc._id]);
    } else {
        return bsonUrlEncoding.encode([doc._id]);
    }
}