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
(npm config set strict-ssl false)
sudo npm install npm@latest -g
2.4) Gulp install https://gulpjs.com/
sudo npm install gulp-cli -g
npm install gulp -D
gulp --help
gulp -v

3) Install VLabs' npm modules
cd /home/maska/git/vlabs.com.ua/vl.vlabs.com.ua/vlabs
npm install

4) Build VLab
gulp --vlab vlabs.hvac/vlab.hvac.base --mode dev --noauth

5) Install vscode
Download from https://code.visualstudio.com/
sudo dpkg -i code.....
If 
[dpkg: dependency problems prevent configuration of code:
 code depends on libgconf-2-4; however:
  Package libgconf-2-4 is not installed.]

sudo apt --fix-broken install
