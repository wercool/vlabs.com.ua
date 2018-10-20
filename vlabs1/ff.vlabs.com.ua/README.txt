Front Face VLabs




sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm

## Use n module from npm in order to upgrade node

sudo npm cache clean -f
sudo npm install -g n
sudo n stable

sudo ln -sf /usr/local/n/versions/node/<VERSION>/bin/node /usr/bin/nodejs
(NOTICE that the default installation for nodejs is in the /usr/bin/nodejs and not /usr/bin/node)

To upgrade to latest version (and not current stable) version, you can use

sudo n latest

##To undo:

sudo apt-get install --reinstall nodejs-legacy     # fix /usr/bin/node
sudo n rm 6.0.0     # replace number with version of Node that was installed
sudo npm uninstall -g n

## or 

#update npm
npm install npm@latest -g

------------------
Gulp Installation

For global use with slush
Install gulp-install as a dependency:

npm install --save gulp-install
For local use with gulp
Install gulp-install as a development dependency:

npm install --save-dev gulp-install



----------
##detect gulp command into drupal

npm install gulp-cli -g

https://www.drupal.org/docs/8/theming/creating-automation-tools-for-custom-themes-gulpjs