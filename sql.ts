import { DB } from "https://deno.land/x/sqlite@v3.4.1/mod.ts";

const path = Deno.cwd().replace("test", "") + "\\AppData\\LocalLow\\Cygames\\umamusume\\"
const meta = new DB(path + "meta")
const master = new DB(path + "master\\master.mdb")

const soundSrcQ = meta.query("SELECT  n ,h FROM a where n like 'sound/l/%chara%awb'") as string[][];
const okeSrcQ = meta.query("SELECT  n ,h FROM a where n like 'sound/l/%oke_01.awb'") as string[][];

const charQ = master.query('SELECT "index", text FROM text_data WHERE category = 170') as string[][];
const songQ = master.query('SELECT "index", text FROM text_data WHERE category = 16') as string[][];

const key0List : string[] = [];
const key1List : string[] = [];

for (let i = 0; i < songQ.length; i++) {
    if (songQ[i][0] == "1029") {
        songQ[i][1] = songQ[i][1] + "(Game size)"
    }
}

for (let i = 0; i < soundSrcQ.length; i++) {
    soundSrcQ[i][0] = soundSrcQ[i][0].split("/")[2] + "/" +
                    soundSrcQ[i][0]
                    .split("_chara_")[1]
                    .replace("_01.awb", "");
    for (let j = 0; j < songQ.length; j++){
        if (soundSrcQ[i][0].split("/")[0] == songQ[j][0]) {
            key0List.push(songQ[j][1]);
        }
    }

    for (let j = 0; j < charQ.length; j++) {
        if (soundSrcQ[i][0].split("/")[1] == charQ[j][0]) {
            key1List.push(charQ[j][1]);
        }
    }
    soundSrcQ[i][0] = key0List[i] + "_" + key1List[i];
}

for (let i = 0; i < okeSrcQ.length; i++) {
    okeSrcQ[i][0] = okeSrcQ[i][0].split("/")[2];
    for (let j = 0; j < songQ.length; j++) {
        if (okeSrcQ[i][0] == songQ[j][0]) {
            okeSrcQ[i][0] = songQ[j][1];
        }
    }
}

export {soundSrcQ, okeSrcQ, charQ, songQ, path};