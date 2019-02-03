#!/bin/bash

sizes=( 48 96 144 196 384 )

for i in "${sizes[@]}"
do
   ffmpeg -i ./icon.png -vf scale=$i:$i ./public/img/icons/icon-$i.png
done

ffmpeg -i ./icon.png -vf scale=200:200 ./public/img/icons/logo.png
ffmpeg -i ./icon.png -vf scale=192:192 ./public/img/icons/android-chrome-192x192.png
ffmpeg -i ./icon.png -vf scale=512:512 ./public/img/icons/android-chrome-512x512.png
ffmpeg -i ./icon.png -vf scale=16:16 ./public/img/icons/favicon-16x16.png
ffmpeg -i ./icon.png -vf scale=32:32 ./public/img/icons/favicon-32x32.png
ffmpeg -i ./icon.png -vf scale=48:48 ./public/img/icons/favicon.ico
ffmpeg -i ./icon.png -vf scale=48:48 ./public/img/icons/favicon.png