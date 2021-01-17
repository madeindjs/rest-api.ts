<h1 align="center">
  <img src="rest-api.ts/fr/img/logo.svg" alt="REST.api.ts" />
</h1>

Learn **best practices** to build an **API** using **Node.js** and **Typescript**. The intention of this book it’s not only to teach you how to build an API. The purpose is also to teach you how to build **scalable** and **maintainable** API which means **improve** your current Node.js knowledge. In this book you will learn to:

- Build JSON responses following [JSON:API standard](https://jsonapi.org/)
- Use Git for versioning
- Use Test Driven Development to add unit and functional tests
- Set up authentication with JSON Web Tokens (JWT)
- Optimize and cache the API

All the source code of this book is available in [Asciidoctor](https://asciidoctor.org/) format on this repository. So don’t hesitate to [fork the project](https://github.com/madeindjs/api_on_rails/fork) if you want to improve it or fix a mistake that I didn’t notice.

## Support the project

As you may know this project take me some times. So if you want to support me you can buy a version on Leanpub:

- [English version](https://leanpub.com/rest-api-ts/)
- French version _(in progress)_

Or you can support me with Liberapay: <noscript><a href="https://liberapay.com/alexandre_rousseau/donate"><img alt="Donate using Liberapay" src="https://liberapay.com/assets/widgets/donate.svg"></a></noscript>

## Build book

```bash
$ git clone https://github.com/madeindjs/rest-api.ts
$ cd rest-api.ts
$ bundle install
$ rake "build:pdf[6,fr]"
```

You can see all build available with `rake -T`

```bash
$ rake -T
rake "build:all[version,lang]"   # Build all versions
rake "build:epub[version,lang]"  # Build an EPUB version
rake "build:html[version,lang]"  # Build an HTML version
rake "build:mobi[version,lang]"  # Build a MOBI version
rake "build:pdf[version,lang]"   # Build a PDF version
```

## License

This book is under [MIT license](https://opensource.org/licenses/MIT) and [Creative Common BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
