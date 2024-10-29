import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Cookie, getSetCookies } from "@std/http/";

const port = 3000;
const domain = 'defender.local';
const schemeWithAuthority = `https://${domain}:${port}`;

describe("Integration test", () => {
    describe("GET /", () => {
        it("should return 200 and set a cookie", async () => {
            // Arrange
            const url = new URL(`${schemeWithAuthority}`);
            
            // Act
            const res = await fetch(url);

            // Assert
            expect(res.ok).toBe(true);
            expect(res.status).toBe(200);

            const body = await res.text();
            expect(body).toBe('Cookie set!')
            
            const setCookies = getSetCookies(res.headers);
            expect(setCookies).toHaveLength(1);
            
            const setCookie = setCookies[0];
            expect(setCookie.name).toBe('secure-cookie');
            expect(setCookie.value).toBe('secure-cookie-value');
            expect(setCookie.path).toBe('/');
            expect(setCookie.expires).toBeDefined(); // Can't check the date exactly.
            expect(setCookie.domain).toBe(`.${domain}`);
            expect(setCookie.sameSite).toBe('none');
            expect(setCookie.secure).toBe(true);
        });
    });

    describe("GET /get", () => {
        it("should return query params and cookie values in body", async () => {
            // Arrange
            const url = new URL(`${schemeWithAuthority}/get`);

            url.searchParams.append("get_content", "get_content_value");
            
            const cookie: Cookie = {
                name: "secure-cookie",
                value: "secure-cookie-value",
            }
            
            const headers = new Headers();
            headers.append('Cookie', `${cookie.name}=${cookie.value}`);
            
            // Act
            const res = await fetch(url, {
                headers
            });

            // Assert
            expect(res.ok).toBe(true);
            expect(res.status).toBe(200);

            const json = await res.json();
            expect(json).toEqual({
                cookies: {
                    [cookie.name]: cookie.value
                },
                requestQuery: {
                    get_content: 'get_content_value'
                }
            });
        });
    });
});
