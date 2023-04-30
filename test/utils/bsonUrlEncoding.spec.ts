import { encode, decode } from '../../src/utils/bsonUrlEncoding';
import { assert } from "chai";

describe('encode', () => {
    it('should encode single values', () => {
        const encoded1 = encode("test");
        const encoded2 = encode(123);
        const encoded3 = encode(new Date("2019-02-26T09:28:42.885Z"));

        assert.equal(encoded1, "InRlc3Qi");
        assert.equal(encoded2, "MTIz");
        assert.equal(encoded3, "eyIkZGF0ZSI6IjIwMTktMDItMjZUMDk6Mjg6NDIuODg1WiJ9");
    });

    it('should encode arrays values', () => {
        const encoded1 = encode(["test", "test2"]);
        const encoded2 = encode([123, 456]);
        const encoded3 = encode([new Date("2019-02-26T09:28:42.885Z"), new Date("2019-02-27T09:28:42.885Z")]);

        assert.equal(encoded1, "WyJ0ZXN0IiwidGVzdDIiXQ");
        assert.equal(encoded2, "WzEyMyw0NTZd");
        assert.equal(encoded3, "W3siJGRhdGUiOiIyMDE5LTAyLTI2VDA5OjI4OjQyLjg4NVoifSx7IiRkYXRlIjoiMjAxOS0wMi0yN1QwOToyODo0Mi44ODVaIn1d");
    });
});

describe('decode', () => {
    it('should decode single values', () => {
        const decoded1 = decode("InRlc3Qi");
        const decoded2 = decode("MTIz");
        const decoded3 = decode("eyIkZGF0ZSI6IjIwMTktMDItMjZUMDk6Mjg6NDIuODg1WiJ9");

        assert.equal(decoded1, "test");
        assert.equal(decoded2, 123);
        assert.equal(decoded3.toISOString(), "2019-02-26T09:28:42.885Z");
    });

    it('should decode arrays values', () => {
        const decoded1 = decode("WyJ0ZXN0IiwidGVzdDIiXQ");
        const decoded2 = decode("WzEyMyw0NTZd");
        const decoded3 = decode("W3siJGRhdGUiOiIyMDE5LTAyLTI2VDA5OjI4OjQyLjg4NVoifSx7IiRkYXRlIjoiMjAxOS0wMi0yN1QwOToyODo0Mi44ODVaIn1d");

        assert.equal(decoded1[0], "test");
        assert.equal(decoded1[1], "test2");
        assert.equal(decoded2[0], 123);
        assert.equal(decoded2[1], 456);
        assert.equal(decoded3[0].toISOString(), "2019-02-26T09:28:42.885Z");
        assert.equal(decoded3[1].toISOString(), "2019-02-27T09:28:42.885Z");
    });
});