# Changelog

## [1.0.0](https://github.com/City-of-Helsinki/linkedregistrations-ui/compare/linkedregistrations-ui-v0.10.0...linkedregistrations-ui-v1.0.0) (2024-10-08)


### ⚠ BREAKING CHANGES

* move readiness and healthz endpoints under api path

### Features

* Improve test coverage ([5b926aa](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/5b926aaa5fd0d1032750d34a617a1d7312d22124))
* Prevent to delete signup after event start_time ([b3fa4db](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/b3fa4dbdb6c30acf2766e02535f6fb87118fa27c))
* Scrub sensitive data from Sentry requests ([9500b7b](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/9500b7ba8528b494efd3dbc4b000758b955445ab))
* Simplify getFocusableFieldId function ([5576d16](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/5576d1633edaf6f314ac18b577db33bb53ce6dc5))


### Bug Fixes

* Add MAX_CLEAN_DEPTH=3 to cleanSensitiveData ([b862edb](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/b862edb6322e48d13eda60bb09e2e19610004906))
* Move readiness and healthz endpoints under api path ([eb75019](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/eb75019ac3fdd22b47c8fc52a568f5a32b2d8cf0))
* Sentry add extra error data integration LINK-2186 ([8888357](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/8888357ae7f89e16d051c800d8ab4d697de9f893))
* Sentry max clean depth must return an object ([98ddf4f](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/98ddf4fae37c2e1695f4510c9bc9354a2ef53ee5))

## [0.10.0](https://github.com/City-of-Helsinki/linkedregistrations-ui/compare/linkedregistrations-ui-v0.9.0...linkedregistrations-ui-v0.10.0) (2024-06-24)


### Features

* Prevent to edit/delete if there is payment cancellation/refund ([4e17f6a](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/4e17f6a66940a9935dc1d9becaa14bd76a031158))
* Remind user to log out ([6f5fe53](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/6f5fe53447a75bc305415b059bb1ff4545e77ea4))


### Bug Fixes

* Include only published and scheduled events in ics file ([16b81b1](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/16b81b1d3eca4f31e038b9fd0154ff1676b134bf))
* Move registration warning to the above of event info ([f6abe04](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/f6abe046c791f7b22a9f4ea096b7cf13f3ebaea3))

## [0.9.0](https://github.com/City-of-Helsinki/linkedregistrations-ui/compare/linkedregistrations-ui-v0.8.0...linkedregistrations-ui-v0.9.0) (2024-06-12)


### Features

* Add all sub events to the ics file ([5fa95fe](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/5fa95fed7f50e679182a1c89bc683856373e428f))
* Check order and payment from tapla api ([ef389cc](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/ef389cc8b4e4278eaa24c5215db3aef8c2b73330))


### Bug Fixes

* Avoid renewing session every second ([0790f15](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/0790f15660b09e21a03ff63477e601b8678dbd05))
* Clear session storage before moving to Talpa ([2f12707](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/2f1270765f0cec92636a5e17654bdaf641729dd9))
* Create payment if any of the chargeable signups is attending ([2d67dab](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/2d67dabe93d6cb52a164ae12fe44c8edd88844ff))
* Replace undefined with null in user data ([dabd64a](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/dabd64aced65cc08ec9fefbbc04b2f6c8a9c4226))

## [0.8.0](https://github.com/City-of-Helsinki/linkedregistrations-ui/compare/linkedregistrations-ui-v0.7.1...linkedregistrations-ui-v0.8.0) (2024-05-06)


### Features

* Add commit lint to the project ([fd39cae](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/fd39caeaf33c668b2378a8d7ee6ea98abf36bb4c))


### Bug Fixes

* Validate max lengths of signup fields ([45356b0](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/45356b0211c43d394d84d7c087934773d6a82b87))

## [0.7.1](https://github.com/City-of-Helsinki/linkedregistrations-ui/compare/linkedregistrations-ui-v0.7.0...linkedregistrations-ui-v0.7.1) (2024-04-29)


### Bug Fixes

* Fix node version in dockerfile production stage ([ea9426f](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/ea9426f5a857cf1e579a8d6e0277a83942fe38b1))

## [0.7.0](https://github.com/City-of-Helsinki/linkedregistrations-ui/compare/linkedregistrations-ui-v0.6.0...linkedregistrations-ui-v0.7.0) (2024-04-26)


### Features

* Add accessibility texts to checkbox group ([bb0e6f9](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/bb0e6f9de34789f0bb8d97c33fb2efe889b5e431))
* Display modal if registration time is expiring soon ([723de00](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/723de00c0f3922fb490522401818499f7b2c7a62))
* Generic payment cancelled page ([9954f37](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/9954f376f087f3d043d629c7c26703cf488b8282))
* Generic payment completed page ([88ec9ad](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/88ec9ad3bfa6b284ddc18e2465e805ebfcd83e32))


### Bug Fixes

* Change the native language field to optional ([58234ef](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/58234efbc0d268d4f6c1c806f3db03e68ae5d435))
* Fix invalid import ([686f002](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/686f0026f7eb5da4405cb40724273adfd482207f))
* Remove duplicated code from modals ([91ada19](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/91ada1949366bd87d590e667a654e07b61fecffb))
* Replace HDS SearchInput with TextInput ([7b506e4](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/7b506e473e2a7b8eba50a72c14c27d3fb406956e))
* Show status div when table results changes ([cc89c5b](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/cc89c5b350d0d311467c4d89d7477cb9b8d6c532))
* Simplify clearDataIfReservationExpired function ([8bb7a1b](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/8bb7a1b296d53475e02e3d435bcd0573e3e62853))
* Use checkout url with user info ([721cb94](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/721cb94190ec10164f54719bf31c0df8636d4a2e))
