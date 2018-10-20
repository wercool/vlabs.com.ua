1) Download Blender and unzip it to /home/maska/blender-server
2) THREE.js Blender exporter

Unzip io_three.zip ato /home/[maska]/.config/blender/[2.78]/scripts/addons

3) Add Blender icon

Make a new text-file named something.desktop and write this in there:

#!/usr/bin/env xdg-open

[Desktop Entry]
Version=1.0
Type=Application
Terminal=false
Exec=command to run here
Name=visible name here
Comment=comment here
Icon=icon path here
