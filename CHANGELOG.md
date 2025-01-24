# Changelog

## [1.1.0](https://github.com/City-of-Helsinki/linkedregistrations-ui/compare/linkedregistrations-ui-v1.0.6...linkedregistrations-ui-v1.1.0) (2025-01-24)


### Features

* Partifipant selector text and styling changes LINK-2212 ([a790555](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/a790555b3cfa9a6eeb54159ca8184dacce91256a))


### Dependencies

* Upgrade @sentry/nextjs to 7.120.3 LINK-2191 ([b6958c9](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/b6958c902e776757818fb648a31fb00fe819593b))

## [1.0.6](https://github.com/City-of-Helsinki/linkedregistrations-ui/compare/linkedregistrations-ui-v1.0.5...linkedregistrations-ui-v1.0.6) (2025-01-21)


### Bug Fixes

* Sort attendees by id (from oldest to newest) instead of name ([bc54a08](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/bc54a082e0d70a2c8521bda367befd4d54a5cfd8))


### Dependencies

* Bump next from 14.2.10 to 14.2.21 ([a3e43b8](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/a3e43b81dbcef1158ab7f94157ee14e4f708734c))

## [1.0.5](https://github.com/City-of-Helsinki/linkedregistrations-ui/compare/linkedregistrations-ui-v1.0.4...linkedregistrations-ui-v1.0.5) (2024-12-13)


### Bug Fixes

* Added addendum for participant amount selector ([4ff3dd2](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/4ff3dd2dd55b185df7689ec3924576b955570ab8))
* Added screen capture suggestion after registration ([#200](https://github.com/City-of-Helsinki/linkedregistrations-ui/issues/200)) ([49f20ab](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/49f20ab00c57d56c1c994781d81e123e43ab2e04))


### Dependencies

* Bump axios from 1.6.8 to 1.7.4 ([#173](https://github.com/City-of-Helsinki/linkedregistrations-ui/issues/173)) ([cfcc6f1](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/cfcc6f1a692dc064c2ece439d715e076ff771555))
* Bump next from 14.1.3 to 14.2.10 ([#174](https://github.com/City-of-Helsinki/linkedregistrations-ui/issues/174)) ([042efd1](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/042efd14b29329579d5dc0f1900476d4f2d36c91))

## [1.0.4](https://github.com/City-of-Helsinki/linkedregistrations-ui/compare/linkedregistrations-ui-v1.0.3...linkedregistrations-ui-v1.0.4) (2024-10-30)


### Bug Fixes

* Signup error handling enhancements LINK-2158 ([2b0e1d9](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/2b0e1d95bd9359c7c6a32c5a527645bc86dfe5e8))
* Signup summary focus on heading LINK-2156 ([3fbaa8c](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/3fbaa8c73c0828654f28e7e792f10ac754cc7aaa))


### Dependencies

* Upgrade hds to 3.10.1 LINK-1755 ([e6a3aa0](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/e6a3aa020e4bbf592da4930c508921e9759e8bb2))

## [1.0.3](https://github.com/City-of-Helsinki/linkedregistrations-ui/compare/linkedregistrations-ui-v1.0.2...linkedregistrations-ui-v1.0.3) (2024-10-29)


### Bug Fixes

* A11y checkboxField error message LINK-2155 ([0ed786d](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/0ed786dd82d62e1f7c2c2913baca44e191676ad6))
* A11y heading levels LINK-2150 LINK-2157 ([638a0da](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/638a0da5ac78ae433af728342f9e2a7f69ca35fb))
* Normalize font sizes LINK-2149 ([4ebbf81](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/4ebbf8149adbce52103e1005076af7ff19a420b5))
* Set meta viewport LINK-2149 ([8b4e4b6](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/8b4e4b606ee517ba3af02b3cf7ce7739dcace4c5))
* SingleSelect remove deprecated selection status LINK-2153 ([c1a3fbe](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/c1a3fbe9732fe5b328d738cfa934499580e45221))

## [1.0.2](https://github.com/City-of-Helsinki/linkedregistrations-ui/compare/linkedregistrations-ui-v1.0.1...linkedregistrations-ui-v1.0.2) (2024-10-29)


### Bug Fixes

* A11y make buttonPanel non sticky LINK-2148 ([613de17](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/613de175277c23f46563fbd2a6e817065e37e221))
* A11y signup language aria-label LINK-2154 ([20389e2](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/20389e284944f689224a50d53abcac4a3681530d))

## [1.0.1](https://github.com/City-of-Helsinki/linkedregistrations-ui/compare/linkedregistrations-ui-v1.0.0...linkedregistrations-ui-v1.0.1) (2024-10-08)


### Bug Fixes

* Sentry clean normalized data LINK-2186 ([34a96d8](https://github.com/City-of-Helsinki/linkedregistrations-ui/commit/34a96d88dfd60c0cd95f7a735c2cce7cda4a2039))

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
