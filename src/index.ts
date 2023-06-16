import { Schema, PopulateOptions } from "mongoose";
import { generateCursorQuery, generateSort } from "./query";
import { prepareResponse } from "./response";
import { IPaginateOptions, IPaginateResult, VerboseMode } from "./types";

export interface IPluginOptions {
    dontReturnTotalDocs?: boolean;
    dontAllowUnlimitedResults?: boolean;
    defaultLimit?: number;
}

/**
 * A mongoose plugin to perform paginated find() requests.
 * @param schema the schema for the plugin
 */
export default function (schema: Schema, pluginOptions?: IPluginOptions) {

    function createFindPromise(mongoObject: any, options: IPaginateOptions, _query?: Object, _projection?: Object) {
        // Determine sort
        const sort = generateSort(options);

        // Determine limit
        const defaultLimit = (pluginOptions && pluginOptions.defaultLimit ? pluginOptions.defaultLimit : 10);
        const useDefaultLimit = isNaN(options.limit) || options.limit < 0 || options.limit === 0 && pluginOptions && pluginOptions.dontAllowUnlimitedResults;
        const unlimited = options.limit === 0 && (!pluginOptions || !pluginOptions.dontAllowUnlimitedResults);
        options.limit = useDefaultLimit ? defaultLimit : options.limit;

        // Query documents
        const query = { $and: [generateCursorQuery(options), _query || {}] };

        // Request one extra result to check for a next/previous
        const promise = mongoObject.find(query, _projection).sort(sort).limit(unlimited ? 0 : options.limit + 1);

        return promise;
    }

    /**
     * Peform a paginated find() request
     * @param {IPaginateOptions} options the pagination options
     * @param {Object} [_query] the mongo query
     * @param {Object} [_projection] the mongo projection
     * @param {string | PopulateOptions | (string | PopulateOptions)[]} [_populate] the mongo populate
     */
    async function findPaged<T>(options: IPaginateOptions, _query?: Object, _projection?: Object, _populate?: string | PopulateOptions | (string | PopulateOptions)[]): Promise<IPaginateResult<T>> {
        // Find and populate docs
        const docs = await createFindPromise(this, options, _query, _projection).populate(_populate || []);

        if (pluginOptions && pluginOptions.dontReturnTotalDocs) {
            return prepareResponse<T>(docs, options);
        } else {
            const totalDocs = await this.countDocuments(_query).exec();
            return prepareResponse<T>(docs, options, totalDocs);
        }
    }

    /**
     * Explains a paginated find() request
     * @param {IPaginateOptions} options the pagination options
     * @param {VerboseMode} verbose the verbosity mode for explain()
     * @param {Object} [_query] the mongo query
     * @param {Object} [_projection] the mongo projection
     */
    async function findPagedExplain(options: IPaginateOptions,  verbose?: VerboseMode, _query?: Object, _projection?: Object): Promise<any> {
        return await createFindPromise(this, options, _query, _projection).explain(verbose);
    }

    schema.statics.findPaged = findPaged;
    schema.statics.findPagedExplain = findPagedExplain;
}

export * from "./types";