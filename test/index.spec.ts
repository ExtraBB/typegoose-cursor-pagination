import test from "ava";
import mongoose, { Schema } from "mongoose";
import { describe } from "ava-spec";
import plugin, { IPaginateModel } from "../src/index";
import { MongoMemoryServer } from "mongodb-memory-server";

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
test.before("start mongoose connection and add data into collection", async () => {
    const mongod = new MongoMemoryServer({
        binary: { version: "4.2.1" }
    });

    await mongoose.connect(await mongod.getUri(), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await mongoose.connection.db.dropDatabase();
    const author = await Author.create({ name: "Pawan Pandey" });

    let post;
    const posts = [];
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

describe("general functionality", it => {
    it("return promise", function (t: any) {
        const promise = Post.findPaged({});
        t.is(promise.then instanceof Function, true);
    });

    it("should return data in expected format", async function (t: any) {
        const result = await Post.findPaged({});

        t.is(result.hasOwnProperty("docs"), true);
        t.is(result.hasOwnProperty("totalDocs"), true);
        t.is(result.hasOwnProperty("previous"), true);
        t.is(result.hasOwnProperty("hasPrevious"), true);
        t.is(result.hasOwnProperty("next"), true);
        t.is(result.hasOwnProperty("hasNext"), true);
    });
});

describe("limit", it => {
    it("should use a default limit of 10 when none is specified", async function (t: any) {
        const result = await Post.findPaged({});
        t.is(result.docs.length, 10);
    });

    it("should use no limit when set to 0", async function (t: any) {
        const result = await Post.findPaged({ limit: 0 });
        t.is(result.docs.length, 100);
    });
    ``;

    it("should use a limit when set", async function (t: any) {
        const result = await Post.findPaged({ limit: 20 });
        t.is(result.docs.length, 20);
        ``;
    });
});

describe("sort", it => {
    it("should sort descending on _id when no sort is specified", async function (t: any) {
        const result = await Post.findPaged({});
        for (let i = 0; i < result.docs.length; i++) {
            if (i !== result.docs.length - 1) {
                t.is(result.docs[i]._id > result.docs[i + 1]._id, true);
            }
        }
    });

    it("should sort ascending on _id with sortAscending", async function (t: any) {
        const result = await Post.findPaged({ sortAscending: true });
        for (let i = 0; i < result.docs.length; i++) {
            if (i !== result.docs.length - 1) {
                t.is(result.docs[i]._id < result.docs[i + 1]._id, true);
            }
        }
    });

    it("should sort descending on title when sortField is title", async function (t: any) {
        const result = await Post.findPaged({ sortField: "title" });
        for (let i = 0; i < result.docs.length; i++) {
            if (i !== result.docs.length - 1) {
                t.is(result.docs[i].title > result.docs[i + 1].title, true);
            }
        }
    });

    it("should sort ascending on title when sortField is title", async function (t: any) {
        const result = await Post.findPaged({ sortField: "title", sortAscending: true });
        for (let i = 0; i < result.docs.length; i++) {
            if (i !== result.docs.length - 1) {
                t.is(result.docs[i].title < result.docs[i + 1].title, true);
            }
        }
    });
});

describe("next/previous", it => {
    const baseOptions = { limit: 2, sortField: "title", sortAscending: true };
    const query = { title: { $in: ["Post #1", "Post #2", "Post #3", "Post #4", "Post #5"] } };

    it("should return correct first page", async function (t: any) {
        const page1 = await Post.findPaged(baseOptions, query);

        t.is(typeof page1.next, "string");
        t.is(page1.previous, undefined);
        t.is(page1.hasNext, true);
        t.is(page1.hasPrevious, false);
        t.is(page1.docs.length, 2);
        t.is(page1.docs[0].title, "Post #1");
        t.is(page1.docs[1].title, "Post #2");
    });

    it("should return correct second page (on next)", async function (t: any) {
        const page1 = await Post.findPaged(baseOptions, query);
        const page2 = await Post.findPaged({ ...baseOptions, next: page1.next }, query);

        t.is(typeof page2.next, "string");
        t.is(typeof page2.previous, "string");
        t.is(page2.hasNext, true);
        t.is(page2.hasPrevious, true);
        t.is(page2.docs.length, 2);
        t.is(page2.docs[0].title, "Post #3");
        t.is(page2.docs[1].title, "Post #4");
    });

    it("should return correct third page (on next)", async function (t: any) {
        const page1 = await Post.findPaged(baseOptions, query);
        const page2 = await Post.findPaged({ ...baseOptions, next: page1.next }, query);
        const page3 = await Post.findPaged({ ...baseOptions, next: page2.next }, query);

        t.is(typeof page2.next, "string");
        t.is(typeof page2.previous, "string");
        t.is(page3.hasNext, false);
        t.is(page3.hasPrevious, true);
        t.is(page3.docs.length, 1);
        t.is(page3.docs[0].title, "Post #5");
    });

    it("should return correct second page (on previous)", async function (t: any) {
        const page1 = await Post.findPaged(baseOptions, query);
        const page2 = await Post.findPaged({ ...baseOptions, next: page1.next }, query);
        const page3 = await Post.findPaged({ ...baseOptions, next: page2.next }, query);
        const previousPage2 = await Post.findPaged({ ...baseOptions, previous: page3.previous }, query);

        t.is(previousPage2.hasNext, true);
        t.is(previousPage2.hasPrevious, true);
        t.is(previousPage2.docs.length, 2);
        t.is(previousPage2.docs[0].title, "Post #3");
        t.is(previousPage2.docs[1].title, "Post #4");
    });

    it("should return correct first page (on previous)", async function (t: any) {
        const page1 = await Post.findPaged(baseOptions, query);
        const page2 = await Post.findPaged({ ...baseOptions, next: page1.next }, query);
        const page3 = await Post.findPaged({ ...baseOptions, next: page2.next }, query);
        const previousPage2 = await Post.findPaged({ ...baseOptions, previous: page3.previous }, query);
        const previousPage1 = await Post.findPaged({ ...baseOptions, previous: previousPage2.previous }, query);

        t.is(previousPage1.hasNext, true);
        t.is(previousPage1.hasPrevious, false);
        t.is(previousPage1.docs.length, 2);
        t.is(previousPage1.docs[0].title, "Post #1");
        t.is(previousPage1.docs[1].title, "Post #2");
    });
});

describe("query", it => {
    it("should allow queries", async function (t: any) {
        const result = await Post.findPaged({}, { title: { $in: ["Post #3", "Post #27"] } });
        t.is(result.docs.length, 2);
        t.is(result.docs[0].title, "Post #27");
        t.is(result.docs[1].title, "Post #3");
    });
});

describe("projection", it => {
    it("should allow projections", async function (t: any) {
        const result = await Post.findPaged({ limit: 1 }, {}, { title: 1 });
        t.is(result.docs.length, 1);

        t.is(result.docs[0].title, "Post #100");
        t.is(result.docs[0].date, undefined);
        t.is(result.docs[0].author, undefined);
        t.is(result.docs[0].body, undefined);
    });
});

describe("population", it => {
    it("should allow populates", async function (t: any) {
        const result = await Post.findPaged({ limit: 1 }, {}, {}, ["author"]);
        t.is(result.docs.length, 1);
        t.is(result.docs[0].author.name, "Pawan Pandey");
    });

    it("should allow populates with object", async function (t: any) {
        const result = await Post.findPaged({ limit: 1 }, {}, {}, [{ path: "author", model: Author }]);
        t.is(result.docs.length, 1);
        t.is(result.docs[0].author.name, "Pawan Pandey");
    });
});

describe("Plugin Options", it => {
    it("should not show totalDocs when dontReturnTotalDocs is set", async function (t: any) {
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
        t.is(result.docs.length, 1);
        t.is(result.totalDocs, undefined);
    });

    it("should not allow unlimited results when option is set", async function (t: any) {
        // Create new collection
        const ISBNSchema = new mongoose.Schema({ name: String });
        ISBNSchema.plugin(plugin, { dontAllowUnlimitedResults: true });
        const ISBN = mongoose.model("ISBN", ISBNSchema) as IPaginateModel<any>;

        // Create document
        let isbn;
        const isbns = [];
        for (let i = 0; i < 20; i++) {
            isbn = new ISBN({
                code: 987028226181 + i
            });
            isbns.push(isbn);
        }
        await ISBN.create(isbns);

        // negative limit defaults to default limit
        const result = await ISBN.findPaged({ limit: 0 });
        t.is(result.docs.length, 10);

        const result2 = await ISBN.findPaged({ limit: -2 });
        t.is(result2.docs.length, 10);
    });

    it("should set default limit when set", async function (t: any) {
        // Create new collection
        const ISBNShortSchema = new mongoose.Schema({ name: String });
        ISBNShortSchema.plugin(plugin, { defaultLimit: 12 });
        const ISBNShort = mongoose.model("ISBNShort", ISBNShortSchema) as IPaginateModel<any>;

        // Create document
        let isbnShort;
        const isbnShorts = [];
        for (let i = 0; i < 20; i++) {
            isbnShort = new ISBNShort({
                code: 9870282 + i
            });
            isbnShorts.push(isbnShort);
        }
        await ISBNShort.create(isbnShorts);

        // negative limit defaults to default limit
        const result = await ISBNShort.findPaged({});
        t.is(result.docs.length, 12);
    });
});
