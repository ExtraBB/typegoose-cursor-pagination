const EJSON = require("mongodb-extended-json");
import * as base64url from "base64-url";

/**
 * Encode a BSON object to a URL-safe string format
 * @param obj The BSON object to encode
 */
export function encode(obj: any): string {
    return base64url.encode(EJSON.stringify(obj));
}

/**
 * Decode a BSON object from a URL-safe string format
 * @param str The URL-safe string to decode
 */
export function decode(str: string): any {
    return EJSON.parse(base64url.decode(str));
}