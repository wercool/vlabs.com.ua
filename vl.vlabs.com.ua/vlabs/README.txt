Building ES6 Javascript for the Browser with Gulp, Babel, and More
https://thesocietea.org/2016/01/building-es6-javascript-for-the-browser-with-gulp-babel-and-more/

Blender fixing opacity export
https://github.com/mrdoob/three.js/pull/11167/commits/6cb9db1878e6a442c78e7bd66dab43adb02cf93a

[exporters/blender/addons/io_three/exporter/material.py]
----------------
         if api.material.transparent(self.node):
              self[constants.TRANSPARENT] = True
 +            self[constants.OPACITY] = api.material.opacity(self.node)
  
          if api.material.double_sided(self.node):
              self[constants.SIDE] = constants.SIDE_DOUBLE
----------------
