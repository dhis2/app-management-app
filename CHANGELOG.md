## [100.1.2](https://github.com/dhis2/app-management-app/compare/v100.1.1...v100.1.2) (2021-07-21)


### Bug Fixes

* use '-:-' instead of null as i18n namespace separator ([8f9389b](https://github.com/dhis2/app-management-app/commit/8f9389b84e7edd122fb1d84ec35cff2a32245f48))

## [100.1.1](https://github.com/dhis2/app-management-app/compare/v100.1.0...v100.1.1) (2021-07-02)


### Bug Fixes

* **translations:** sync translations from transifex (master) ([8492c89](https://github.com/dhis2/app-management-app/commit/8492c89a6018a75ace37f9ce3f4cfd8a4ff41bb4))

# [100.1.0](https://github.com/dhis2/app-management-app/compare/v100.0.1...v100.1.0) (2021-07-02)


### Features

* get app description from manifest for non App Hub apps ([05b1f49](https://github.com/dhis2/app-management-app/commit/05b1f49cd4c76eede4e01c268bab180f6026f24a))

## [100.0.1](https://github.com/dhis2/app-management-app/compare/v100.0.0...v100.0.1) (2021-06-24)


### Bug Fixes

* **translations:** sync translations from transifex (master) ([dfa9d10](https://github.com/dhis2/app-management-app/commit/dfa9d10a5ef1baaceab82688e5e0174cd5c12a2a))

# [100.0.0](https://github.com/dhis2/app-management-app/compare/v99.9.9...v100.0.0) (2021-06-23)


### chore

* **release:** migrate to new app version scheme ([#265](https://github.com/dhis2/app-management-app/issues/265)) ([7af89ce](https://github.com/dhis2/app-management-app/commit/7af89cef575fe3f0306561db3400c58ab64ee354)), closes [dhis2/notes#293](https://github.com/dhis2/notes/issues/293)


### BREAKING CHANGES

* **release:** App version becomes decoupled from DHIS2 versions, see
the d2.config.js or App Hub for DHIS2 version compatibility.

## [28.3.1](https://github.com/dhis2/app-management-app/compare/v28.3.0...v28.3.1) (2021-06-22)


### Bug Fixes

* **translations:** sync translations from transifex (master) ([8502968](https://github.com/dhis2/app-management-app/commit/8502968f04cf60bb7ced853f1ee8217cb8eea2da))

# [28.3.0](https://github.com/dhis2/app-management-app/compare/v28.2.13...v28.3.0) (2021-06-22)


### Bug Fixes

* add href to Sidebar MenuItem components ([0110d3a](https://github.com/dhis2/app-management-app/commit/0110d3a594ba0cce668a02e9762ccb09653042da))
* add prop types ([69acabf](https://github.com/dhis2/app-management-app/commit/69acabf9e75dfb9e10ec7723e2140963b9d061ba))
* allow uninstalling overriden core apps ([8cd2a62](https://github.com/dhis2/app-management-app/commit/8cd2a620a45754b1ce81f9d81ee6de667904af2f))
* build before linting ([55b0247](https://github.com/dhis2/app-management-app/commit/55b0247cc548ed95cc0fbb5f46e7dcfa14a23a33))
* don't show install app button if already have latest version ([5ad2a17](https://github.com/dhis2/app-management-app/commit/5ad2a171887c863b565ed36aa48fcac319f82f5b))
* don't show uninstall button for bundled apps ([29a4cad](https://github.com/dhis2/app-management-app/commit/29a4cadb24d27dee907ebb93c1a1e5be06894995))
* don't show uninstall button for bundled apps ([a2d3037](https://github.com/dhis2/app-management-app/commit/a2d303763a0465af8cb3602f63f36ff82d3909e0))
* ensure proposed update is for later version ([398d149](https://github.com/dhis2/app-management-app/commit/398d1499fc8a9fae984d4496c0667679cc5fba38))
* include current app version in uninstall button ([06d00dd](https://github.com/dhis2/app-management-app/commit/06d00dd0964a895ed2f75df976d4ed9604521c42))
* make app screenshots keyboard accessible ([6dfadf1](https://github.com/dhis2/app-management-app/commit/6dfadf1358ec414a61566a0f3805aac25597a211))
* make AppList keyboard accessible ([50cebfb](https://github.com/dhis2/app-management-app/commit/50cebfb6436fc283b009a9f7cab9894eb8077660))
* make EmptyApps component ([b0f41e1](https://github.com/dhis2/app-management-app/commit/b0f41e1b591266aa352341317666e77dd03f0e33))
* only show bundled apps tab if version >= 2.35.2 ([70a3bfa](https://github.com/dhis2/app-management-app/commit/70a3bfa92b54536be0b414242cb3ee278eece6ca))
* only show channels checkboxes filter if more than one channel available ([465d037](https://github.com/dhis2/app-management-app/commit/465d037cf6952063dad3d159442a0543aa9b7c76))
* pass dhis_version to App Hub apps API ([ae2d60e](https://github.com/dhis2/app-management-app/commit/ae2d60e32f13d1f67b70fcae51b325cd3ab4527f))
* redirect to custom apps page after uninstalling app ([28211ce](https://github.com/dhis2/app-management-app/commit/28211cedd8f7c405186a00de04ada9c035d29e57))
* remove bundled apps fallback ([5f5dc3f](https://github.com/dhis2/app-management-app/commit/5f5dc3fc38bd6da5e1e06c1ef5731143b9c88363))
* remove unused prop ([604f309](https://github.com/dhis2/app-management-app/commit/604f3094dd0c53db17690fb2addb3cd63e28414d))
* rename 'Preinstalled core apps' to 'Core apps' ([3c6f697](https://github.com/dhis2/app-management-app/commit/3c6f697da2b6e191a7d698b530f2761db6d2e652))
* render App Hub metadata for installed apps ([b10f887](https://github.com/dhis2/app-management-app/commit/b10f887840dc0b968c661f7d915e886140b49840))
* set app list search input type to search ([ab22135](https://github.com/dhis2/app-management-app/commit/ab2213501f8d8225ac3905cdf685a67ce0e5616c))
* set nsSeparator to null instead of a placeholder ([520c906](https://github.com/dhis2/app-management-app/commit/520c90610c3d40ab4b50a3841f09f96a1226f9a7))
* show 'update to latest version' button for bundled apps ([1692911](https://github.com/dhis2/app-management-app/commit/16929113221e3a1db42e219a613278002d16c581))
* show when current screenshot is focused element ([1c6d249](https://github.com/dhis2/app-management-app/commit/1c6d24961905c7fee56a4e15ce2499c1e2d42797))
* simplify debouncing ([8ddee00](https://github.com/dhis2/app-management-app/commit/8ddee0091bd2f7b306b735e5b524a65085c4b7d0))
* translate 'no apps match your criteria' error ([e3c3d4a](https://github.com/dhis2/app-management-app/commit/e3c3d4a838f3aef71979d62dc43b5ddd0b7faeac))
* translate bundled application names ([57ba7a3](https://github.com/dhis2/app-management-app/commit/57ba7a3d7562f6ecbc606e5c37babc5398cd1c8a))
* typo ([6512c17](https://github.com/dhis2/app-management-app/commit/6512c177ae89d0c2b7b7e09a0116ceb08840b0a2))
* use correct alert messages for updating apps ([f212260](https://github.com/dhis2/app-management-app/commit/f2122607ba47bb6d076b035105cf3d34e58b8384))
* use correct alert messages for updating apps ([eb01bf7](https://github.com/dhis2/app-management-app/commit/eb01bf7de13e42fae5adc75c12d9b8f9b1abbf06))
* use correct bundled apps filter ([771bbf9](https://github.com/dhis2/app-management-app/commit/771bbf9171867847617415b772e226a4d58dedb1))
* use kebab case for all routes ([60ce805](https://github.com/dhis2/app-management-app/commit/60ce8053190e47bdb5b5921617c2bc1c2cf91d5f))
* use short_name instead of name for core apps ([acfe7ce](https://github.com/dhis2/app-management-app/commit/acfe7ce58fca7d707bdd9695ffa2a71409653fcc))


### Features

* add App Hub filtering ([3517972](https://github.com/dhis2/app-management-app/commit/3517972fecac7a472d8a76826041e0bd51088720))
* add App Hub page ([41f9b71](https://github.com/dhis2/app-management-app/commit/41f9b7186c8b1182a2cd258f2a37ac9b88b472c2))
* add app metadata view ([be7bd04](https://github.com/dhis2/app-management-app/commit/be7bd042481b39a228bbd2eb9366dd688cf1c110))
* add fallback icon ([343d36b](https://github.com/dhis2/app-management-app/commit/343d36bdac3ca2195d11043315cce77e80e3ebe3))
* add LICENSE.md ([a130cc3](https://github.com/dhis2/app-management-app/commit/a130cc338daafca08c3f7624c02b3e8ef3980126))
* add page for App Hub app ([e9610d5](https://github.com/dhis2/app-management-app/commit/e9610d5116b0a56e7197f0523c693f3729c97659))
* add pagination to App Hub apps list ([1fe70cd](https://github.com/dhis2/app-management-app/commit/1fe70cd86efc128901ac080aeabe2bf5fd5a6136))
* app cards ([4a19c54](https://github.com/dhis2/app-management-app/commit/4a19c54cf13279d59ac2f94e9bd5d3d2f1ac579b))
* implement router ([1befb7f](https://github.com/dhis2/app-management-app/commit/1befb7f91070eaacba936c3a7e464d52739fe552))
* load core apps from App Hub ([db8646f](https://github.com/dhis2/app-management-app/commit/db8646f086508c4b13aa7bf91882f9111909d31e))
* manual install ([7836858](https://github.com/dhis2/app-management-app/commit/7836858c362f68a54b5d5ffeae53565a7f01d187))
* render circular loader in manual install button while installing ([131621d](https://github.com/dhis2/app-management-app/commit/131621debb78f22255bf2f56bc998aaee3fb8606))
* show apps with available updates ([4db7dfb](https://github.com/dhis2/app-management-app/commit/4db7dfb3ce7fc33228c54c2f44b96876a6569b50))
* start work on app versions ([49e8280](https://github.com/dhis2/app-management-app/commit/49e8280bf86ae25f84d0ad24fbfec3a6d512731b))
* start work on custom app info page ([f9360e4](https://github.com/dhis2/app-management-app/commit/f9360e40dc6aaad50a3936728722ef5e83768bb1))
* update package.json scripts ([3a0cac1](https://github.com/dhis2/app-management-app/commit/3a0cac185bfca2058114dcd0a57c1e00517c0fc9))
* upgrade to @dhis2/ui v6 and bump other dependency versions ([3d2544a](https://github.com/dhis2/app-management-app/commit/3d2544abec821302191ce7e5434c71d8d1cbff5e))
* use app_hub_id field ([43d6ddf](https://github.com/dhis2/app-management-app/commit/43d6ddf00cde81095cd64c837bfb6df92587c8d9))
* versions table ([d594b05](https://github.com/dhis2/app-management-app/commit/d594b052b485c0efacac6e283ee0bdcf8198466f))

## [28.2.13](https://github.com/dhis2/app-management-app/compare/v28.2.12...v28.2.13) (2021-04-18)


### Bug Fixes

* **translations:** sync translations from transifex (master) ([1b949c5](https://github.com/dhis2/app-management-app/commit/1b949c5f273af6b991a1e695d7b07271e5fb2bca))

## [28.2.12](https://github.com/dhis2/app-management-app/compare/v28.2.11...v28.2.12) (2021-04-16)


### Bug Fixes

* **translations:** sync translations from transifex (master) ([6988b57](https://github.com/dhis2/app-management-app/commit/6988b57364ac66eaca2a6fe94279e698e1cd3e48))

## [28.2.11](https://github.com/dhis2/app-management-app/compare/v28.2.10...v28.2.11) (2021-04-12)


### Bug Fixes

* **translations:** sync translations from transifex (master) ([dfeb8ab](https://github.com/dhis2/app-management-app/commit/dfeb8ab8a5d8e0e8702a2dabace1d3ce90a8e220))

## [28.2.10](https://github.com/dhis2/app-management-app/compare/v28.2.9...v28.2.10) (2021-04-11)


### Bug Fixes

* use app hub id instead of name and org for update matching [DHIS2-10859] ([#218](https://github.com/dhis2/app-management-app/issues/218)) ([1417a84](https://github.com/dhis2/app-management-app/commit/1417a84f2b8c981a8f527be5184245cb9823afe0))

## [28.2.9](https://github.com/dhis2/app-management-app/compare/v28.2.8...v28.2.9) (2021-04-08)


### Bug Fixes

* correctly compare versions to find the latest version on app hub [DHIS2-10859] ([#127](https://github.com/dhis2/app-management-app/issues/127)) ([411d813](https://github.com/dhis2/app-management-app/commit/411d8132e6534f6998f35ca203f6c6a79cb11cac))

## [28.2.8](https://github.com/dhis2/app-management-app/compare/v28.2.7...v28.2.8) (2021-04-02)


### Bug Fixes

* **translations:** sync translations from transifex (master) ([00ef7ac](https://github.com/dhis2/app-management-app/commit/00ef7ac80688d42a47faf3256db90bbcc6d5a657))

## [28.2.7](https://github.com/dhis2/app-management-app/compare/v28.2.6...v28.2.7) (2021-04-01)


### Bug Fixes

* **translations:** sync translations from transifex (master) ([301867a](https://github.com/dhis2/app-management-app/commit/301867aaa7e19b54a99a77e147308419f421c73a))

## [28.2.6](https://github.com/dhis2/app-management-app/compare/v28.2.5...v28.2.6) (2021-04-01)


### Bug Fixes

* translate headers, menu actions, searchbar, and 'missing' messages ([#199](https://github.com/dhis2/app-management-app/issues/199)) ([bc58ad2](https://github.com/dhis2/app-management-app/commit/bc58ad2580965635e352d06b8bedc8202f13e37b))

## [28.2.5](https://github.com/dhis2/app-management-app/compare/v28.2.4...v28.2.5) (2021-03-11)


### Bug Fixes

* upgrade cli-app-scripts to enable modern headerbar and tree-shaking (DHIS2-9893) ([#192](https://github.com/dhis2/app-management-app/issues/192)) ([67bd72c](https://github.com/dhis2/app-management-app/commit/67bd72c075fad3ffd33bf7e712ed60686455cdc3))

## [28.2.4](https://github.com/dhis2/app-management-app/compare/v28.2.3...v28.2.4) (2021-02-15)


### Bug Fixes

* **translations:** sync translations from transifex (master) ([a061b61](https://github.com/dhis2/app-management-app/commit/a061b616ab83d6ff05051ecb3c6ee30fc24ab981))

## [28.2.3](https://github.com/dhis2/app-management-app/compare/v28.2.2...v28.2.3) (2021-02-01)


### Bug Fixes

* **translations:** sync translations from transifex (master) ([0525151](https://github.com/dhis2/app-management-app/commit/0525151eac637aab0df879c0889d551325ad3f86))

## [28.2.2](https://github.com/dhis2/app-management-app/compare/v28.2.1...v28.2.2) (2021-01-18)


### Bug Fixes

* **translations:** sync translations from transifex (master) ([5605666](https://github.com/dhis2/app-management-app/commit/560566628182bd93545a170c678886c3f5aa7cd8))

## [28.2.1](https://github.com/dhis2/app-management-app/compare/v28.2.0...v28.2.1) (2020-12-24)


### Bug Fixes

* **translations:** sync translations from transifex (master) ([14ebfdb](https://github.com/dhis2/app-management-app/commit/14ebfdb470b8060df258724ed06beb297fefc331))

# [28.2.0](https://github.com/dhis2/app-management-app/compare/v28.1.4...v28.2.0) (2020-11-30)


### Bug Fixes

* **translations:** sync translations from transifex (master) ([9f02cbd](https://github.com/dhis2/app-management-app/commit/9f02cbdb4e23f2e771e9648a10e61c2627a0014b))
* **translations:** sync translations from transifex (master) ([4e66e91](https://github.com/dhis2/app-management-app/commit/4e66e916b889c8e84c7d8e0b181613b52304831d))
* **translations:** sync translations from transifex (master) ([70f17c1](https://github.com/dhis2/app-management-app/commit/70f17c108b42ec860781a3cf34c1b60d4db872a9))
* **translations:** sync translations from transifex (master) ([bc54a78](https://github.com/dhis2/app-management-app/commit/bc54a78ba5115545ee289a3f7d823b17e1205565))
* **translations:** sync translations from transifex (master) ([61ea206](https://github.com/dhis2/app-management-app/commit/61ea206fd10bc42bdf9d3e1cf71ad3a41c3c27f0))
* **translations:** sync translations from transifex (master) ([6d665a1](https://github.com/dhis2/app-management-app/commit/6d665a164971340657e7a44c0f7082c561ccf928))
* **translations:** sync translations from transifex (master) ([1435171](https://github.com/dhis2/app-management-app/commit/1435171c6663b88ea38573b4b34034d5e196551f))
* remove deploy-build dep ([83919ff](https://github.com/dhis2/app-management-app/commit/83919ffc6e69f32b33069534b1e1c86c0cc3d784))
* update travis.yaml ([60fdc4b](https://github.com/dhis2/app-management-app/commit/60fdc4bbc97be6413e79fba03cbcd5c73c24c6fd))
* use core AppHub proxy instead of apps.dhis2.org ([#137](https://github.com/dhis2/app-management-app/issues/137)) ([#138](https://github.com/dhis2/app-management-app/issues/138)) ([3eee6c6](https://github.com/dhis2/app-management-app/commit/3eee6c60a42004d04decdc2c385e6787e021c430))
* **translations:** sync translations from transifex (master) ([ee159fa](https://github.com/dhis2/app-management-app/commit/ee159fa3051f827d273a0b1918fba31f05dd0e34))
* **translations:** sync translations from transifex (master) ([7e5574b](https://github.com/dhis2/app-management-app/commit/7e5574b7eb813fc7bde884c039f8bd236e7615e6))
* **translations:** sync translations from transifex (master) ([6e6aee1](https://github.com/dhis2/app-management-app/commit/6e6aee1947457563ddde3957574d244066664eec))
* add favicon path to avoid 404 error ([8da3f98](https://github.com/dhis2/app-management-app/commit/8da3f98068ffb3ddaa239d6fb9690e8989bd850f))
* remove trailing slash on baseUrl before /api ([9065fd5](https://github.com/dhis2/app-management-app/commit/9065fd5690e8277931533717ee6f4bcacd861192))
* use unversioned endpoint for backwards compat ([358a92a](https://github.com/dhis2/app-management-app/commit/358a92a8cfcd2af249186c00f71a3f08f67b40e2))
* **DHIS2-4788:** replaced folderName with key to fix icon URL. ([#38](https://github.com/dhis2/app-management-app/issues/38)) ([3ecfa8a](https://github.com/dhis2/app-management-app/commit/3ecfa8ad8829a98560c65c958706ea1d69ddec89))


### Features

* support self-updates and label core apps in list ([#122](https://github.com/dhis2/app-management-app/issues/122)) ([2868355](https://github.com/dhis2/app-management-app/commit/28683550b60487457acaa9b6647242333f64ee82))
* **app-hub:** use the app-hub directly ([#88](https://github.com/dhis2/app-management-app/issues/88)) ([18d2154](https://github.com/dhis2/app-management-app/commit/18d2154d24be90cf66d0a3caad6825e0c3fe2602))
* load apps directly from app store backend ([74192b5](https://github.com/dhis2/app-management-app/commit/74192b52a8ae6a33751ca208944b56f172e8df23))
