import mongoose, { Schema } from "mongoose";
import plugin, { IPaginateModel } from "../src/index";
import { MongoMemoryServer } from "mongodb-memory-server";
import { assert } from "chai";

// Author
const AuthorSchema = new mongoose.Schema({ name: String });
AuthorSchema.plugin(plugin);
const Author = mongoose.model("Author", AuthorSchema) as IPaginateModel<any>;

// Post
const PostSchema = new mongoose.Schema({
    title: String,
    date: Date,
    body: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "Author"
    }
});
PostSchema.plugin(plugin);
const Post = mongoose.model("Post", PostSchema) as IPaginateModel<any>;

// Setup Database
before("start mongoose connection and add data into collection", async () => {
    const mongod = await MongoMemoryServer.create();

    await mongoose.connect(await mongod.getUri());
    await mongoose.connection.db.dropDatabase();
    const author = await Author.create({ name: "Pawan Pandey" });

    let post;
    const posts: typeof Post[] = [];
    const date = new Date("2019-02-26T09:28:42.885Z");

    for (let i = 1; i <= 100; i++) {
        post = new Post({
            title: "Post #" + i,
            date: new Date(date.getTime() + i),
            author: author._id,
            body: "Post Body #" + i
        });
        posts.push(post);
    }

    await Post.create(posts);
});

describe("general functionality", () => {
    it("return promise", () => {
        const promise = Post.findPaged({});
        assert.equal(promise.then instanceof Function, true);
    });

    it("should return data in expected format", async () => {
        const result = await Post.findPaged({});
        assert.equal(Object.prototype.hasOwnProperty.call(result, "docs"), true);
        assert.equal(Object.prototype.hasOwnProperty.call(result, "totalDocs"), true);
        assert.equal(Object.prototype.hasOwnProperty.call(result, "previous"), true);
        assert.equal(Object.prototype.hasOwnProperty.call(result, "hasPrevious"), true);
        assert.equal(Object.prototype.hasOwnProperty.call(result, "next"), true);
        assert.equal(Object.prototype.hasOwnProperty.call(result, "hasNext"), true);
    });
});

describe("limit", () => {
    it("should use a default limit of 10 when none is specified", async () => {
        const result = await Post.findPaged({});
        assert.equal(result.docs.length, 10);
    });

    it("should use no limit when set to 0", async () => {
        const result = await Post.findPaged({ limit: 0 });
        assert.equal(result.docs.length, 100);
    });
    ``;

    it("should use a limit when set", async () => {
        const result = await Post.findPaged({ limit: 20 });
        assert.equal(result.docs.length, 20);
        ``;
    });
});

describe("sort", () => {
    it("should sort descending on _id when no sort is specified", async () => {
        const result = await Post.findPaged({});
        for (let i = 0; i < result.docs.length; i++) {
            if (i !== result.docs.length - 1) {
                assert.equal(result.docs[i]._id > result.docs[i + 1]._id, true);
            }
        }
    });

    it("should sort ascending on _id with sortAscending", async () => {
        const result = await Post.findPaged({ sortAscending: true });
        for (let i = 0; i < result.docs.length; i++) {
            if (i !== result.docs.length - 1) {
                assert.equal(result.docs[i]._id < result.docs[i + 1]._id, true);
            }
        }
    });

    it("should sort descending on title when sortField is title", async () => {
        const result = await Post.findPaged({ sortField: "title" });
        for (let i = 0; i < result.docs.length; i++) {
            if (i !== result.docs.length - 1) {
                assert.equal(result.docs[i].title > result.docs[i + 1].title, true);
            }
        }
    });

    it("should sort ascending on title when sortField is title", async () => {
        const result = await Post.findPaged({ sortField: "title", sortAscending: true });
        for (let i = 0; i < result.docs.length; i++) {
            if (i !== result.docs.length - 1) {
                assert.equal(result.docs[i].title < result.docs[i + 1].title, true);
            }
        }
    });
});

describe("next/previous", () => {
    const baseOptions = { limit: 2, sortField: "title", sortAscending: true };
    const query = { title: { $in: ["Post #1", "Post #2", "Post #3", "Post #4", "Post #5"] } };

    it("should return correct first page", async () => {
        const page1 = await Post.findPaged(baseOptions, query);

        assert.equal(typeof page1.next, "string");
        assert.equal(page1.previous, undefined);
        assert.equal(page1.hasNext, true);
        assert.equal(page1.hasPrevious, false);
        assert.equal(page1.docs.length, 2);
        assert.equal(page1.docs[0].title, "Post #1");
        assert.equal(page1.docs[1].title, "Post #2");
    });

    it("should return correct second page (on next)", async () => {
        const page1 = await Post.findPaged(baseOptions, query);
        const page2 = await Post.findPaged({ ...baseOptions, next: page1.next }, query);

        assert.equal(typeof page2.next, "string");
        assert.equal(typeof page2.previous, "string");
        assert.equal(page2.hasNext, true);
        assert.equal(page2.hasPrevious, true);
        assert.equal(page2.docs.length, 2);
        assert.equal(page2.docs[0].title, "Post #3");
        assert.equal(page2.docs[1].title, "Post #4");
    });

    it("should return correct third page (on next)", async () => {
        const page1 = await Post.findPaged(baseOptions, query);
        const page2 = await Post.findPaged({ ...baseOptions, next: page1.next }, query);
        const page3 = await Post.findPaged({ ...baseOptions, next: page2.next }, query);

        assert.equal(typeof page2.next, "string");
        assert.equal(typeof page2.previous, "string");
        assert.equal(page3.hasNext, false);
        assert.equal(page3.hasPrevious, true);
        assert.equal(page3.docs.length, 1);
        assert.equal(page3.docs[0].title, "Post #5");
    });

    it("should return correct second page (on previous)", async () => {
        const page1 = await Post.findPaged(baseOptions, query);
        const page2 = await Post.findPaged({ ...baseOptions, next: page1.next }, query);
        const page3 = await Post.findPaged({ ...baseOptions, next: page2.next }, query);
        const previousPage2 = await Post.findPaged({ ...baseOptions, previous: page3.previous }, query);

        assert.equal(previousPage2.hasNext, true);
        assert.equal(previousPage2.hasPrevious, true);
        assert.equal(previousPage2.docs.length, 2);
        assert.equal(previousPage2.docs[0].title, "Post #3");
        assert.equal(previousPage2.docs[1].title, "Post #4");
    });

    it("should return correct first page (on previous)", async () => {
        const page1 = await Post.findPaged(baseOptions, query);
        const page2 = await Post.findPaged({ ...baseOptions, next: page1.next }, query);
        const page3 = await Post.findPaged({ ...baseOptions, next: page2.next }, query);
        const previousPage2 = await Post.findPaged({ ...baseOptions, previous: page3.previous }, query);
        const previousPage1 = await Post.findPaged({ ...baseOptions, previous: previousPage2.previous }, query);

        assert.equal(previousPage1.hasNext, true);
        assert.equal(previousPage1.hasPrevious, false);
        assert.equal(previousPage1.docs.length, 2);
        assert.equal(previousPage1.docs[0].title, "Post #1");
        assert.equal(previousPage1.docs[1].title, "Post #2");
    });
});

describe("query", () => {
    it("should allow queries", async () => {
        const result = await Post.findPaged({}, { title: { $in: ["Post #3", "Post #27"] } });
        assert.equal(result.docs.length, 2);
        assert.equal(result.docs[0].title, "Post #27");
        assert.equal(result.docs[1].title, "Post #3");
    });
});

describe("projection", () => {
    it("should allow projections", async () => {
        const result = await Post.findPaged({ limit: 1 }, {}, { title: 1 });
        assert.equal(result.docs.length, 1);

        assert.equal(result.docs[0].title, "Post #100");
        assert.equal(result.docs[0].date, undefined);
        assert.equal(result.docs[0].author, undefined);
        assert.equal(result.docs[0].body, undefined);
    });
});

describe("population", () => {
    it("should allow populates", async () => {
        const result = await Post.findPaged({ limit: 1 }, {}, {}, ["author"]);
        assert.equal(result.docs.length, 1);
        assert.equal(result.docs[0].author.name, "Pawan Pandey");
    });

    it("should allow populates with object", async () => {
        const result = await Post.findPaged({ limit: 1 }, {}, {}, [{ path: "author", model: Author }]);
        assert.equal(result.docs.length, 1);
        assert.equal(result.docs[0].author.name, "Pawan Pandey");
    });
});

describe("Plugin Options", () => {
    it("should not show totalDocs when dontReturnTotalDocs is set", async () => {
        // Create new collection
        const GenreSchema = new mongoose.Schema({ name: String });
        GenreSchema.plugin(plugin, { dontReturnTotalDocs: true });
        const Genre = mongoose.model("Genre", GenreSchema) as IPaginateModel<any>;

        // Create document
        const doc = new Genre({
            name: "Fiction"
        });
        await doc.save();

        // query result
        const result = await Genre.findPaged({ limit: 1 });
        assert.equal(result.docs.length, 1);
        assert.equal(result.totalDocs, undefined);
    });

    it("should not allow unlimited results when option is set", async () => {
        // Create new collection
        const ISBNSchema = new mongoose.Schema({ name: String });
        ISBNSchema.plugin(plugin, { dontAllowUnlimitedResults: true });
        const ISBN = mongoose.model("ISBN", ISBNSchema) as IPaginateModel<any>;

        // Create document
        let isbn;
        const isbns: typeof ISBN[] = [];
        for (let i = 0; i < 20; i++) {
            isbn = new ISBN({
                code: 987028226181 + i
            });
            isbns.push(isbn);
        }
        await ISBN.create(isbns);

        // negative limit defaults to default limit
        const result = await ISBN.findPaged({ limit: 0 });
        assert.equal(result.docs.length, 10);

        const result2 = await ISBN.findPaged({ limit: -2 });
        assert.equal(result2.docs.length, 10);
    });

    it("should set default limit when set", async () => {
        // Create new collection
        const ISBNShortSchema = new mongoose.Schema({ name: String });
        ISBNShortSchema.plugin(plugin, { defaultLimit: 12 });
        const ISBNShort = mongoose.model("ISBNShort", ISBNShortSchema) as IPaginateModel<any>;

        // Create document
        let isbnShort;
        const isbnShorts: typeof ISBNShort[] = [];
        for (let i = 0; i < 20; i++) {
            isbnShort = new ISBNShort({
                code: 9870282 + i
            });
            isbnShorts.push(isbnShort);
        }
        await ISBNShort.create(isbnShorts);

        // negative limit defaults to default limit
        const result = await ISBNShort.findPaged({});
        assert.equal(result.docs.length, 12);
    });
});
