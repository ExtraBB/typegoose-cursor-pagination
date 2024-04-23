import * as bsonUrlEncoding from "./utils/bsonUrlEncoding";
import { IPaginateOptions } from "./types";
import { PipelineStage } from "mongoose";

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
 * Generate aggregation pipeline stages for cursor-based pagination
 * @param options The pagination options
 */
export function generateAggregatePipeline(options: IPaginateOptions): PipelineStage[] {
    const pipeline: PipelineStage[] = [];

    if (!options.next && !options.previous) {
        return pipeline;
    }

    // Determine the cursor value
    const cursorValue = options.next ? options.next : options.previous;

    // Decode cursor string
    const decoded = bsonUrlEncoding.decode(cursorValue);

    const sortAscending = (!options.sortAscending && options.previous) || (options.sortAscending && !options.previous);
    const sortComparer = sortAscending ? "$gt" : "$lt";

    // Add match stage based on cursor
    if (options.sortField && options.sortField !== "_id") {
        pipeline.push({
            $match: {
                $or: [
                    { [options.sortField]: { [sortComparer]: decoded[0] } },
                    { [options.sortField]: decoded[0], _id: { [sortComparer]: decoded[1] } }
                ]
            }
        });
    } else {
        pipeline.push({
            $match: {
                _id: { [sortComparer]: decoded[0] }
            }
        });
    }

    return pipeline;
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