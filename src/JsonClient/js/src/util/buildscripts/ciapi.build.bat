java -classpath ../shrinksafe/js.jar;../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main build.js profileFile=profiles/ciapi.profile2.js action=clean,release version=0.9.1 releaseName=0.9.1 releaseDir=..\..\..\tmp\

pushd ..
cd ..
cd ..
cd tmp
cd 0.9.1

copy .\dojo\dojo.js.uncompressed.js ..\..\dojo\dojo.js.uncompressed.js /y
copy .\dojo\dojo.js ..\..\dojo\dojo.js /y

cd ..
cd ..
rd tmp /s /q

popd
