# Typegoose Cursor-based Pagination

[![Build Status](https://travis-ci.com/ExtraBB/typegoose-cursor-pagination.svg?branch=master)](https://travis-ci.com/ExtraBB/typegoose-cursor-pagination)

This module aids in implementing "cursor-based" pagination using Mongo range queries or relevancy-based search results. It is based on the [mongo-cursor-pagination](https://www.npmjs.com/package/mongo-cursor-pagination) package but has a dedicated mongoose plugin (which keeps instance methods etc.) and support for **Typegoose** out of the box.

## Background

See this [blog post](https://mixmax.com/blog/api-paging-built-the-right-way) for background on why this library was built.

API Pagination is typically implemented one of two different ways:

1. Offset-based paging. This is traditional paging where `skip` and `limit` parameters are passed on the url (or some variation such as `page_num` and `count`). The API would return the results and some indication of whether there is a next page, such as `has_more` on the response. An issue with this approach is that it assumes a static data set; if collection changes while querying, then results in pages will shift and the response will be wrong.

2. Cursor-based paging. An improved way of paging where an API passes back a "cursor" (an opaque string) to tell the caller where to query the next or previous pages. The cursor is usually passed using query parameters `next` and `previous`. It's implementation is typically more performant that skip/limit because it can jump to any page without traversing all the records. It also handles records being added or removed because it doesn't use fixed offsets.

This module helps in implementing #2 - cursor based paging - by providing a method that make it easy to query within a Mongo collection. It also helps by returning a url-safe string that you can return with your HTTP response (see example below).

Here are some examples of cursor-based APIs:

* [Twitter](https://dev.twitter.com/overview/api/cursoring)
* [Stripe](https://stripe.com/docs/api#pagination-starting_after)
* [Facebook](https://developers.facebook.com/docs/graph-api/using-graph-api/#cursors)

## Install

`npm install typegoose-cursor-pagination --save`

## Usage

### findPaged()

`findPaged()` will return ordered and paged results based on a field (`sortField`) that you pass in.

### Parameters 

Call `findPaged()` with the following parameters:
-  params {IPaginateOptions} (The paginate options)
-  _query {Object} (A mongo query)
-  _projection {Object} (A mongo projection)
-  _populate {ModelPopulateOptions | ModelPopulateOptions[]} (A mongoose population object or array)

```typescript
interface IPaginateOptions {
  limit: Number; // The page size. Set 0 for no limit.
  sortField: String; // The field name to query the range for. The field must be:
  /*
      1. Orderable. We must sort by this value. If duplicate values for paginatedField field
        exist, the results will be secondarily ordered by the _id.
      2. Indexed. For large collections, this should be indexed for query performance.
      3. Immutable. If the value changes between paged queries, it could appear twice.
      4. Complete. A value must exist for all documents.
    The default is to use the Mongo built-in '_id' field, which satisfies the above criteria.
    The only reason to NOT use the Mongo _id field is if you chose to implement your own ids.
  */
  sortAscending: Boolean; // True to sort using paginatedField ascending (default is false - descending).
  next: String; // The value to start querying the page.
  previous: String; // The value to start querying previous page.
}
```

### Response
The response object of `findPaged()` is as follows:

```typescript
interface IPaginateResult<T> {
  hasNext: Boolean // hasNext is true if there is a next page
  hasPrevious: Boolean // hasPrevious is true if there is a previous page
  next: String // next is the cursor for the next page
  previous: String // previous is the cursor for the previous page
  totalDocs: Number // totalDocs is the total amount of docs for the query
  docs: T[] // docs are the resulting documents for this page
}
```

### Typegoose Model
Create your typegoose model as follows:

```js
import paginationPlugin, { PaginateModel } from 'typegoose-cursor-pagination';
import { Typegoose, prop, plugin, index } from "typegoose";

@plugin(paginatePlugin)
@index({ email: 1 })
export default class User extends Typegoose {

  @prop({ required: true })
  email: string;

});

export const UserModel = new User().getModelForClass(User) as PaginateModel<User, typeof User>;
```

### Example
Use the `findPaged()` method as follows:

```js
import { Request, Response, NextFunction } from "express";
import { IPaginateOptions } from "typegoose-cursor-pagination";
import UserModel from "./User";

export async function getUsers(req: Request, res: Response, next: NextFunction) {
    const options: IPaginateOptions = {
        sortField: "email",
        sortAscending: true,
        limit: 10,
        next: "WyJuZXdAdG9rYXMubmwiLHsiJG9pZCI6IjVjNGYxY2U1ODAwYzNjNmIwOGVkZGY3ZCJ9XQ"
    };

    const query = {}; // Your specific query
    const projection = {}; // Your desired projection
    const populate = [] // Your needed population


    const users = await UserModel.findPaged(options, query, projection, populate);
    res.send(users)
}
```
