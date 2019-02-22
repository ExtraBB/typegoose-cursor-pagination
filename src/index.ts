import { Schema } from "mongoose";
import { generateCursorQuery, generateSort } from "./query";
import { prepareResponse } from "./response";
import { IPaginateOptions, IPaginateResult } from "./types";

/**
 * A mongoose plugin to perform paginated find() requests.
 * @param schema the schema for the plugin
 */
export default function (schema: Schema) {

    /**
     * Peform a paginated find() request
     * @param {IPaginateOptions} options the pagination options
     * @param {Object} [_query] the mongo query
     * @param {Object} [_projection] the mongo projection
     * @param {Object} [_populate] the mongo populate
     */
    async function findPaged<T>(options: IPaginateOptions, _query?: Object, _projection?: Object, _populate?: (Object | string)[]): Promise<IPaginateResult<T>> {
        // Determine sort
        const sort = generateSort(options);

        // Determine limit
        const unlimited = options.limit === 0;
        options.limit = isNaN(options.limit) ? 10 : options.limit;

        // Query documents
        const query = { $and: [generateCursorQuery(options), _query] };

        // Request one extra result to check for a next/previous
        const docs = await this.find(query, _projection).sort(sort).limit(unlimited ? 0 : options.limit + 1).populate(_populate || []);
        const totalDocs = await this.countDocuments(_query).exec();

        return prepareResponse<T>(docs, options, totalDocs);
    }

    schema.statics.findPaged = findPaged;
}