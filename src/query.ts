import * as bsonUrlEncoding from "./utils/bsonUrlEncoding";
import { IPaginateOptions } from "./types";

/**
 * Generate a query object for the next/previous page
 * @param options The pagination options
 */
export function generateCursorQuery(options: IPaginateOptions) {
    // Return an empty query upon no cursor string
    const query: any = {};
    if (!options.next && !options.previous) {
        return query;
    }

    // Decode cursor string
    const decoded = bsonUrlEncoding.decode(options.previous || options.next);

    // Determine sort direction (reversed for previous page)
    const sortAscending = (!options.sortAscending && options.previous) || (options.sortAscending && !options.previous);
    const sortComparer = sortAscending ? "$gt" : "$lt";

    // Secondary sort on _id
    if (options.sortField && options.sortField !== "_id") {
        query.$or = [
            { [options.sortField]: { [sortComparer]: decoded[0] } },
            { [options.sortField]: decoded[0], _id: { [sortComparer]: decoded[1] } }
        ];
    } else {
        query._id = { [sortComparer]: decoded[0] };
    }
    return query;
}

/**
 * Generate a sort object to sort the find() in the correct order
 * @param options The pagination options
 */
export function generateSort(options: IPaginateOptions) {
    // Determine sort direction (reversed for previous page)
    const sortAscending = (!options.sortAscending && options.previous) || (options.sortAscending && !options.previous);
    const sortDirection = sortAscending ? 1 : -1;

    // Secondary sort on _id
    if (options.sortField) {
        return {
            [options.sortField]: sortDirection,
            _id: sortDirection
        };
    } else {
        return {
            _id: sortDirection
        };
    }
}