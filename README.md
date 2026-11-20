# Dorios-Site
Dorios Studios Web Site

## Atelier custom downloads

The Atelier project page includes a custom `.mcaddon` builder after its official download links. The compiler lives in the Atelier repository; the website provides the family, finish, shape, color and tool selection interface in English, Portuguese and Spanish.

Website `npm start` and `prebuild` generate the required static resources. Locally, keep the Atelier checkout beside the `Dorios Site` directory and run `npm ci` in Atelier, or set `ATELIER_PROJECT_PATH` to that checkout. Generated files go into the ignored `website/static/atelier-builder/` directory. The development launcher acquires a local guard before running `prepare:dev`; a second `npm start` reports the existing URL instead of preparing or compiling another instance.

The Pages workflow checks out `DoriosStudios/Dorios-Atelier` at `main`, installs its compiler dependencies and prepares the resources before building the site. Push the Atelier compiler changes before deploying this website revision. The compiler documentation is `content/CUSTOM_INSTALLATION.md` in that repository.
