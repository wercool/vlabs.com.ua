VLabs infrastructure and development environment deployment

1) GIT
https://github.com/
wercool / dbrn........
git clone https://github.com/wercool/vlabs.com.ua.git

2) JS build essentials
2.1)
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm
2.2) Use n module from npm in order to upgrade node
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
2.3) Update npm
npm install npm@latest -g
2.4) Gulp install https://gulpjs.com/
npm install gulp-cli -g
npm install gulp -D
gulp --help
gulp -v

3) Install VLabs' npm modules
cd /home/maska/git/vlabs.com.ua/vl.vlabs.com.ua/vlabs
npm install

4) Build VLab
gulp --vlab vlabs.hvac/vlab.hvac.base --mode dev --noauth
