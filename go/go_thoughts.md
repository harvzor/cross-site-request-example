# Thoughts

- Feels like Go developers don't want a heavy framework for handling HTTP, but I think once they start to experience legacy projects with old code, they'll want a standard way of structuring
- There doesn't appear to be decorators like in Typescript or C#, but you can decorate structs with tags, which looks quite neat 
  - However, anything can read the struct tag, so there's some clashing going on: https://go.dev/wiki/Well-known-struct-tags
  - Seems like defining decorators is better, as I can't see a way to define that a tag is available in Go
- Public and private fields are implicit, if the field begins with a capital, it's public
- There's the `const` keyword, but everyone uses the `:=` syntax to define a variable, so the shorthand is preferred though costs are better...
- No ternary?? https://go.dev/doc/faq#Does_Go_have_a_ternary_form
- It doesn't let you create a nested anonymous object, maybe a good thing to avoid crazy objects
- net/http has no built in way of handling CORS, but doing it myself isn't that bad