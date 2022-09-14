from pydub import AudioSegment
import os, shutil
with open ("./tmp/rest.txt", "r", encoding="utf-8") as f:
    data  = f.read().split(",")
for i in range(len(data)):
    fs = os.listdir("./tmp/" + data[i])
    for j in range(len(fs)):
        try:
            f = os.listdir("./tmp/" + data[i] + "/" + fs[j])
            if len(f) == 1:
                oke = AudioSegment.from_file("./tmp/" + data[i] + "/" + data[i] + ".wav")
                chr = AudioSegment.from_file("./tmp/" + data[i] + "/" + fs[j] + "/" + f[0])
                oke.overlay(chr).export("曲" + "/" + data[i] + "/" + data[i] + "_" + fs[j] + ".mp3", format="mp3", bitrate="128k")
        except:
            pass
    if len(os.listdir("./曲/" + data[i])) == 0:
        os.rmdir("./曲/" + data[i])

shutil.rmtree("./tmp")