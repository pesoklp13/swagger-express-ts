'use strict';

import gulp from 'gulp';
import gulp_clean from 'gulp-clean';
import ts from 'gulp-typescript';
import sourcemaps from 'gulp-sourcemaps';
import gulp_tslint from 'gulp-tslint';
import tslintReporter from 'gulp-tslint-jenkins-reporter';
import PrettierTransform from 'gulp-prettier-plugin';
import typescript from 'typescript';
import mocha from 'gulp-mocha';
import istanbul from 'gulp-istanbul';
import nodemon from 'gulp-nodemon';

const path = {
    built: "built",
    dist: "dist",
    src: "src",
    reports: "reports",
    app: {
        src: "src/**/*.ts",
        built: "built/**/*.ts"
    }
};

export const clean = () => {
    return gulp
        .src([path.built, path.dist, path.src.concat("/**/*.js"), path.src.concat("/**/*.js.map")], {allowEmpty: true})
        .pipe(gulp_clean({force: true}));
};

const copySrcScript = () => {
    return gulp.src([path.app.src]).pipe(gulp.dest(path.built));
};

const prettier = () => {
    return (
        gulp
            .src([path.app.src])
            .pipe(new PrettierTransform(undefined, { filter: true }))
            // passing a function that returns base will write the files in-place
            .pipe(
                gulp.dest(function(file) {
                    return file.base;
                })
            )
    );
};

const copySrc = gulp.series(clean, prettier, copySrcScript);

const tsProject = ts.createProject("tsconfig.json", {typescript});
const buildTs = () => {
    console.info("Compiling files .ts...");
    return (
        gulp
            .src([path.app.src])
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(tsProject())
            .js.pipe(sourcemaps.write("../".concat(path.built)))
            .pipe(gulp.dest(path.built))
    );
};

const tslintClean = () => {
    return gulp.src(path.reports, {allowEmpty: true}).pipe(gulp_clean({force: true}))
};

const tslintScript = (emmitError) => {
    return gulp
        .src(path.app.src)
        .pipe(
            gulp_tslint({
                formatter: "verbose"
            })
        )
        .pipe(gulp_tslint.report({
            emitError: emmitError
        }))
        .pipe(
            tslintReporter({
                sort: true,
                filename: "reports/checkstyle/results.xml",
                severity: "error"
            })
        );
};

const tslintScriptError = () => {
    return tslintScript(true);
};

const tslintScriptNoError = () => {
    return tslintScript(false);
};

export const tslint = gulp.series(tslintClean, tslintScriptError);
const tslintWarn = gulp.series(tslintClean, tslintScriptNoError);

const setNodeEnv = () => {
    return new Promise((resolve) => {
        process.env.NODE_ENV = "test";
        resolve();
    });
};

const testScript = () => {
    return (
        gulp
            .src(path.built + "/**/*.spec.js", { read: false })
            // gulp-mocha needs filepaths so you can't have any plugins before it
            .pipe(
                mocha({
                    // reporter: "mocha-jenkins-reporter",
                    reporterOptions: {
                        junit_report_name: "Tests",
                        junit_report_path: "reports/junit/results.xml",
                        junit_report_stack: 1
                    }
                })
            )
    );
};

const preTest = gulp.series(setNodeEnv, buildTs);

export const test = gulp.series(preTest, testScript);

const preTestCoverageScript = () => {
    return (
        gulp
            .src([path.built + "/**/*.js", "!" + path.built + "/**/*.spec.js"], { base: path.built })
            // Covering files
            .pipe(istanbul())
            // Force `require` to return covered files
            .pipe(istanbul.hookRequire())
    );
};

const preTestCoverage = gulp.series(preTest, preTestCoverageScript);

const testCoverageScript = () => {
    return (
        gulp
            .src([path.built + "/**/*.spec.js"])
            .pipe(
                mocha({
                    // reporter: "mocha-jenkins-reporter",
                    reporterOptions: {
                        junit_report_name: "Tests",
                        junit_report_path: "reports/junit/results.xml",
                        junit_report_stack: 1
                    }
                })
            )
            // Creating the reports after tests ran
            .pipe(
                istanbul.writeReports({
                    dir: "./coverage",
                    reporters: ["text", "text-summary", "cobertura", "html"],
                    reportOpts: { dir: "./reports/coverage" }
                })
            )
            // Enforce a coverage of at least 90%
            .pipe(
                istanbul.enforceThresholds({ thresholds: { global: { lines: 80 }, each: { lines: 80 } } })
            )
    );
};

export const testCoverage = gulp.series(preTestCoverage, testCoverageScript);

const watch = () => {
  gulp.watch(path.app.src, gulp.series(copySrc, tslintWarn, buildTs));
};

const devScript = () => {
    nodemon({
        script: "built/main.js",
        ext: "js",
        ignore: ["node_modules/", "config/", "src"]
    })
        .on("start", function() {
            console.info("nodemon has started app");
        })
        .on("quit", function() {
            console.info("nodedmon has quit");
            process.exit();
        })
        .on("restart", function(files) {
            console.info("App restarted due to: ", files);
        });
};

export const dev = gulp.parallel(gulp.series(copySrc, buildTs, devScript), watch);

export const build = gulp.series(copySrc, tslint, test, buildTs);


