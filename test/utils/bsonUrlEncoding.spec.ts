import { describe } from "ava-spec";
import { encode, decode } from '../../src/utils/bsonUrlEncoding';

describe('encode', (it) => {
    it('should encode single values', function (t: any) {
        const encoded1 = encode("test");
        const encoded2 = encode(123);
        const encoded3 = encode(new Date("2019-02-26T09:28:42.885Z"));

        t.is(encoded1, "InRlc3Qi");
        t.is(encoded2, "MTIz");
        t.is(encoded3, "eyIkZGF0ZSI6IjIwMTktMDItMjZUMDk6Mjg6NDIuODg1WiJ9");
    });

    it('should encode arrays values', function (t: any) {
        const encoded1 = encode(["test", "test2"]);
        const encoded2 = encode([123, 456]);
        const encoded3 = encode([new Date("2019-02-26T09:28:42.885Z"), new Date("2019-02-27T09:28:42.885Z")]);

        t.is(encoded1, "WyJ0ZXN0IiwidGVzdDIiXQ");
        t.is(encoded2, "WzEyMyw0NTZd");
        t.is(encoded3, "W3siJGRhdGUiOiIyMDE5LTAyLTI2VDA5OjI4OjQyLjg4NVoifSx7IiRkYXRlIjoiMjAxOS0wMi0yN1QwOToyODo0Mi44ODVaIn1d");
    });
});

describe('decode', (it) => {
    it('should decode single values', function (t: any) {
        const decoded1 = decode("InRlc3Qi");
        const decoded2 = decode("MTIz");
        const decoded3 = decode("eyIkZGF0ZSI6IjIwMTktMDItMjZUMDk6Mjg6NDIuODg1WiJ9");

        t.is(decoded1, "test");
        t.is(decoded2, 123);
        t.is(decoded3.toISOString(), "2019-02-26T09:28:42.885Z");
    });

    it('should decode arrays values', function (t: any) {
        const decoded1 = decode("WyJ0ZXN0IiwidGVzdDIiXQ");
        const decoded2 = decode("WzEyMyw0NTZd");
        const decoded3 = decode("W3siJGRhdGUiOiIyMDE5LTAyLTI2VDA5OjI4OjQyLjg4NVoifSx7IiRkYXRlIjoiMjAxOS0wMi0yN1QwOToyODo0Mi44ODVaIn1d");

        t.is(decoded1[0], "test");
        t.is(decoded1[1], "test2");
        t.is(decoded2[0], 123);
        t.is(decoded2[1], 456);
        t.is(decoded3[0].toISOString(), "2019-02-26T09:28:42.885Z");
        t.is(decoded3[1].toISOString(), "2019-02-27T09:28:42.885Z");
    });
});